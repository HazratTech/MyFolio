import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Media from "@/models/Media";
import AutoBlogConfig from "@/models/AutoBlogConfig";

export const maxDuration = 120; // Vercel limit for hobby plan; upgrade for longer

const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const BUCKET = "myfolio";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Upload a raw Buffer directly to MinIO via presigned URL */
async function uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    filename: string
): Promise<{ url: string; key: string }> {
    const apiKey = process.env.STORAGE_API_KEY;
    if (!apiKey) throw new Error("STORAGE_API_KEY not configured");

    // 1. Init — get presigned PUT url + object key
    const initRes = await fetch(`${STORAGE_API_URL}/upload/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({
            filename,
            file_type: mimeType,
            file_size: buffer.length,
            bucket: BUCKET,
        }),
    });
    if (!initRes.ok) throw new Error(`MinIO init failed: ${await initRes.text()}`);
    const { upload_url, object_key } = await initRes.json();

    // 2. PUT to presigned URL
    const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: buffer,
    });
    if (!putRes.ok) throw new Error(`MinIO PUT failed: ${await putRes.text()}`);

    // 3. Complete
    const completeRes = await fetch(`${STORAGE_API_URL}/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({
            object_key,
            file_size: buffer.length,
            file_type: mimeType,
            bucket: BUCKET,
        }),
    });
    if (!completeRes.ok) throw new Error(`MinIO complete failed: ${await completeRes.text()}`);

    const completeData = await completeRes.json();
    return { url: completeData.final_url, key: object_key };
}

/** Generate an image with Pollinations AI (free, no key) and upload to MinIO. */
async function generateAndUpload(
    prompt: string,
    filenamePrefix: string,
    altText: string,
    width = 1200,
    height = 630,
    retries = 5
): Promise<{ url: string; key: string } | null> {
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&enhance=false&model=flux`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) {
                throw new Error(`Pollinations fetch failed with status ${imageRes.status}: ${imageRes.statusText}`);
            }

            const arrayBuffer = await imageRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = imageRes.headers.get("content-type") || "image/jpeg";
            const filename = `${filenamePrefix}-${Date.now()}.jpg`;

            const { url, key } = await uploadBuffer(buffer, mimeType, filename);

            // Register in Media DB
            await Media.create({
                filename,
                url,
                key,
                mimeType,
                size: buffer.length,
                altText,
                dimensions: { width, height },
            });

            return { url, key };
        } catch (err) {
            console.warn(
                `generateAndUpload attempt ${attempt} failed for "${filenamePrefix}":`,
                err instanceof Error ? err.message : String(err)
            );
            if (attempt === retries) {
                console.error(`generateAndUpload: all ${retries} attempts failed for "${filenamePrefix}".`);
                return null;
            }
            // Wait with a small delay before retrying (exponential backoff + random jitter)
            const jitter = Math.random() * 2000;
            await new Promise((resolve) => setTimeout(resolve, attempt * 4000 + jitter));
        }
    }
    return null;
}


/** Count words in an HTML string (strips tags first) */
function countWords(html: string): number {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const authHeader = req.headers.get("authorization");
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return new Response("Unauthorized", { status: 401 });
        }

        await dbConnect();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // ── 1. Fetch AutoBlogConfig and filter trends ────────────────────────
        let allowedTopics = [
            "react", "next.js", "javascript", "typescript", "ai", "css", "html",
            "node", "frontend", "backend", "fullstack", "web", "dev",
            "programming", "software", "api", "database", "cloud",
        ];
        let isConfigActive = true;

        const configDoc = await AutoBlogConfig.findOne({ key: "auto-blog" });
        if (configDoc) {
            isConfigActive = configDoc.isActive ?? true;
            if (configDoc.allowedTopics && configDoc.allowedTopics.length > 0) {
                allowedTopics = configDoc.allowedTopics.map((t: string) => t.toLowerCase());
            }
        }

        if (!isConfigActive) {
            return NextResponse.json({ message: "Auto-blog cron is disabled in settings." });
        }

        // Fetch Trending Topics from Dev.to
        const devToRes = await fetch("https://dev.to/api/articles?top=1&per_page=30");
        if (!devToRes.ok) throw new Error("Failed to fetch dev.to trends");
        const articles = await devToRes.json();

        // ── 2. Find a fresh, relevant topic ───────────────────────────────────
        const recentPosts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select("title")
            .lean();
        const existingTitles = recentPosts.map((p: any) => p.title.toLowerCase());

        let selectedArticle: any = null;
        let selectedTopic: string = "";

        // Try to match a trending Dev.to article
        for (const article of articles) {
            const isCovered = existingTitles.some(
                (t: string) =>
                    t.includes(article.title.toLowerCase()) ||
                    article.title.toLowerCase().includes(t)
            );
            
            // Check relevance. If "off topic" is configured, accept any tech trend
            const isOffTopicAllowed = allowedTopics.includes("off topic");
            const isRelevant = isOffTopicAllowed || article.tag_list?.some((tag: string) =>
                allowedTopics.includes(tag.toLowerCase())
            );

            if (!isCovered && isRelevant) {
                selectedArticle = article;
                break;
            }
        }

        // Fallback: If no trending Dev.to article matched allowed topics, generate one directly
        if (!selectedArticle) {
            console.log("No matching Dev.to trends found. Generating directly from allowed topics...");
            const topicsToChoose = allowedTopics.filter(t => t !== "off topic");
            if (topicsToChoose.length > 0) {
                const randomIndex = Math.floor(Math.random() * topicsToChoose.length);
                selectedTopic = topicsToChoose[randomIndex];
            } else {
                selectedTopic = "software engineering";
            }
        }

        // ── 3. Generate Content with Gemini ───────────────────────────────────
        const postSubject = selectedArticle 
            ? `inspired by this trending topic: "${selectedArticle.title}"\nReference description: "${selectedArticle.description}"\nTags/niche: ${selectedArticle.tag_list?.join(", ") || "web development"}`
            : `focused on the following topic: "${selectedTopic}"\nWrite a deep-dive, practical guide about "${selectedTopic}" in web/software engineering.`;

        const contentPrompt = `You are a senior software engineer who writes a popular tech blog. 
Your readers are working developers — smart, busy, and allergic to fluff.

Write a blog post ${postSubject}

━━━━━ CONTENT RULES ━━━━━
VOICE & READABILITY:
• Write like a smart friend explaining it over coffee — natural, direct, no corporate speak
• Target 8th-10th grade reading level (Flesch-Kincaid): short sentences (avg 15-18 words), active voice, plain words
• Use real analogies to explain complex concepts
• Write in first person occasionally ("I've seen this break production three times")
• Include one or two light, human observations (not forced humour)

AUTHENTIC & SPECIFIC (NO GENERIC POSTS):
• NEVER write generic placeholder text, abstract summaries, or empty transition lists.
• You MUST include actual, concrete code examples/snippets (written in clean HTML <pre><code> tags) demonstrating the patterns or configuration.
• Provide specific tool names, setup files, or config variables where applicable (e.g., actual package.json configs, script blocks, config variables).
• The post must feel highly authentic, technical, and valuable—written by a developer who has actually built this.

SEO (do this naturally, not mechanically):
• Title should be specific and promise a clear benefit (not clickbait)
• Use the main keyword phrase in the first 100 words, then vary it naturally after
• Cover related subtopics so the post satisfies full search intent
• Write a compelling metaDescription (155 chars max, includes keyword, motivates the click)
• Use descriptive H2/H3 headings that could be standalone FAQ answers

LENGTH & STRUCTURE:
• 1,400–1,800 words total
• Intro (hook + why this matters) → Core Sections (3-5 H2s with H3s as needed) → Practical Takeaway / Summary
• Every section must deliver standalone value — no filler transitions

━━━━━ IMAGE PLACEMENT ━━━━━
You MUST insert exactly 3 image markers into the content at natural visual break points (after intro, mid-article, before conclusion).
Format: [IMAGE: <specific image generation prompt>]
The image prompt must be:
• A highly descriptive, standalone visual prompt for an AI image generator (e.g., FLUX).
• Describe the scene, lighting, style, subject, and mood in detail.
• Ensure it is highly relevant to the technical concept of the section.
• NO TEXT, words, or letters should be visible in the image.
• Example: [IMAGE: A detailed 3D isometric illustration of a server rack with glowing blue data streams connecting to a modern laptop, clean technical style, dark mode, high quality, photorealistic]

━━━━━ FORMAT ━━━━━
Return ONLY valid JSON matching the schema. Content must be HTML (not markdown):
• <p> for paragraphs
• <h2> / <h3> for headings
• <ul><li> for lists
• <strong> for emphasis  
• <pre><code> for code blocks
• Place [IMAGE: ...] markers BETWEEN block elements, never inside a <p> tag

━━━━━ SCHEMA ━━━━━
{
  "title": "SEO-optimised post title",
  "excerpt": "2-sentence excerpt (max 160 chars) that hooks the reader",
  "metaDescription": "155-char meta description with keyword",
  "coverImagePrompt": "Highly specific, cinematic image prompt for the cover thumbnail — must visually represent the post topic, no text, high quality, 16:9",
  "content": "Full HTML content with exactly 3 [IMAGE: prompt] markers embedded",
  "imageSlots": [
    { "placeholder": "[IMAGE: exact text as in content]", "prompt": "exact same prompt" },
    { "placeholder": "[IMAGE: exact text as in content]", "prompt": "exact same prompt" },
    { "placeholder": "[IMAGE: exact text as in content]", "prompt": "exact same prompt" }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 8
}`;

        let aiResponse = null;
        let geminiError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: contentPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                excerpt: { type: Type.STRING },
                                metaDescription: { type: Type.STRING },
                                coverImagePrompt: { type: Type.STRING },
                                content: { type: Type.STRING },
                                imageSlots: {
                                    type: Type.ARRAY,
                                    minItems: 3,
                                    maxItems: 3,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            placeholder: { type: Type.STRING },
                                            prompt: { type: Type.STRING },
                                        },
                                        required: ["placeholder", "prompt"],
                                    },
                                },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                readingTime: { type: Type.INTEGER },
                            },
                            required: [
                                "title", "excerpt", "metaDescription", "coverImagePrompt",
                                "content", "imageSlots", "tags", "readingTime",
                            ],
                        },
                    },
                });
                if (response && response.text) {
                    aiResponse = response;
                    break;
                }
            } catch (err) {
                console.warn(`Gemini attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err));
                geminiError = err;
                if (attempt < 3) {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
                    const delay = isRateLimit ? 25000 : attempt * 4000;
                    console.log(`Waiting ${delay}ms before retrying Gemini...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        if (!aiResponse || !aiResponse.text) {
            throw new Error(`Gemini content generation failed after 3 attempts. Last error: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
        }

        const aiData = JSON.parse(aiResponse.text);

        // ── 4. Generate Cover Image & Inline Images in Parallel ───────────────
        console.log("Triggering image generation in parallel...");
        const coverPromise = generateAndUpload(
            aiData.coverImagePrompt,
            "cover",
            aiData.title,
            1200,
            630
        ).then(async (res) => {
            if (!res) {
                console.warn("Cover image failed with original prompt. Trying fallback...");
                const fallbackPrompt = `Abstract software engineering network nodes, coding background, clean vector illustration, dark blue tones, 16:9`;
                return generateAndUpload(
                    fallbackPrompt,
                    "cover-fallback",
                    aiData.title,
                    1200,
                    630,
                    2
                );
            }
            return res;
        });

        const slots: Array<{ placeholder: string; prompt: string }> = aiData.imageSlots || [];
        const inlinePromises = slots.map((slot, index) => {
            console.log(`Triggering inline image: ${slot.prompt.slice(0, 60)}...`);
            // Stagger start delay: index 0 starts in 7s, index 1 in 14s, index 2 in 21s etc.
            const staggerDelay = (index + 1) * 7000;
            return new Promise<{ slot: typeof slot; result: any }>((resolve) => {
                setTimeout(async () => {
                    let result = await generateAndUpload(
                        slot.prompt,
                        `inline-${index}`,
                        slot.prompt.slice(0, 100),
                        1200,
                        675
                    );
                    if (!result) {
                        console.warn(`Inline image ${index} failed with original prompt. Trying fallback...`);
                        const fallbackPrompt = `Abstract developer workstation tech workspace, glowing code on screen, clean vector style, dark blue tones, no text`;
                        result = await generateAndUpload(
                            fallbackPrompt,
                            `inline-${index}-fallback`,
                            "Developer workstation abstract illustration",
                            1200,
                            675,
                            2
                        );
                    }
                    resolve({ slot, result });
                }, staggerDelay);
            });
        });

        const [coverResult, ...inlineResults] = await Promise.all([
            coverPromise,
            ...inlinePromises,
        ]);

        // ── 5. Inject Inline Images ───────────────────────────────────────────
        let finalContent: string = aiData.content;
        for (const { slot, result } of inlineResults) {
            if (result) {
                const figureHtml = `<figure class="blog-image">
  <img src="${result.url}" alt="${slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>`;
                finalContent = finalContent.replace(slot.placeholder, figureHtml);
            } else {
                finalContent = finalContent.replace(slot.placeholder, "");
            }
        }

        // Clean up any remaining [IMAGE: ...] markers that weren't in imageSlots
        finalContent = finalContent.replace(/\[IMAGE:[^\]]*\]/g, "");

        // ── 6. Calculate reading time if not provided ──────────────────────────
        const words = countWords(finalContent);
        const readingTime = aiData.readingTime || Math.ceil(words / 230);

        // ── 7. Build slug ──────────────────────────────────────────────────────
        let baseSlug = aiData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let counter = 1;
        while (await Post.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // ── 8. Get or create category ──────────────────────────────────────────
        const mainCategory = "Development";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: mainCategory,
                slug: mainCategory.toLowerCase(),
            });
        }

        // ── 9. Save Post ───────────────────────────────────────────────────────
        const newPost = await Post.create({
            title: aiData.title,
            slug,
            excerpt: aiData.excerpt,
            content: finalContent,
            coverImage: coverResult?.url || null,
            coverImageKey: coverResult?.key || null,
            category: mainCategory,
            tags: aiData.tags,
            status: "published",
            publishedAt: new Date(),
            readingTime,
            views: 0,
        });

        return NextResponse.json({
            success: true,
            slug: newPost.slug,
            title: newPost.title,
            readingTime,
            wordCount: words,
            inlineImagesGenerated: inlineResults.filter(r => r.result !== null).length,
            coverImage: coverResult?.url || "failed",
        });
    } catch (error) {
        console.error("Auto-blog cron failed:", error);
        return NextResponse.json(
            {
                error: "Failed to run auto-blog cron",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
