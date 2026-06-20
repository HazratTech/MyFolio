import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Media from "@/models/Media";
import AutoBlogConfig from "@/models/AutoBlogConfig";
import { sendCronFailureNotification } from "@/lib/discord";

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
        body: buffer as any,
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

/** Seed default categories if they do not exist */
async function seedDefaultCategories() {
    const defaults = [
        { name: "Android", description: "Native Android App Development tutorials using Kotlin and Jetpack Compose." },
        { name: "iOS", description: "iOS development strategies, Swift, and SwiftUI tutorials." },
        { name: "Backend", description: "Scalable backend APIs built with FastAPI, Ktor, and robust server architectures." },
        { name: "Discord Bots", description: "Custom Discord server automation and bot development tutorials." },
        { name: "Architecture", description: "System design, clean architecture, patterns, and development best practices." }
    ];

    for (const cat of defaults) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
            await Category.create({
                name: cat.name,
                slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
                description: cat.description
            });
            console.log(`Auto-seeded category: ${cat.name}`);
        }
    }
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
    if (!process.env.FAL_KEY) throw new Error("FAL_KEY not configured");

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const falRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
                method: "POST",
                headers: {
                    "Authorization": `Key ${process.env.FAL_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt,
                    image_size: "landscape_16_9",
                    num_inference_steps: 4,
                    num_images: 1,
                    enable_safety_checker: true,
                    sync_mode: true
                })
            });

            if (!falRes.ok) {
                throw new Error(`Fal.ai fetch failed with status ${falRes.status}: ${await falRes.text()}`);
            }

            const falData = await falRes.json();
            const imageUrl = falData.images[0].url;

            // Download image from Fal.ai to upload to MinIO
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) throw new Error("Failed to download image from Fal.ai URL");

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
        await seedDefaultCategories();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // ── 1. Fetch AutoBlogConfig and filter trends ────────────────────────
        let allowedTopics = [
            "android", "kotlin", "compose", "android os", "ios dev", "ios", "swift", "swiftui",
            "fastapi", "ktor", "mongodb", "discord bot", "discord server", "backend", "api",
            "software", "programming", "database", "cloud",
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
                selectedTopic = "mobile app development";
            }
        }

        // ── 3. Generate Content with Gemini ───────────────────────────────────
        const postSubject = selectedArticle
            ? `inspired by this trending topic: "${selectedArticle.title}"\nReference description: "${selectedArticle.description}"\nTags/niche: ${selectedArticle.tag_list?.join(", ") || "mobile development"}`
            : `focused on the following topic: "${selectedTopic}"\nWrite a deep-dive, practical guide about "${selectedTopic}" in mobile app, discord bot, or backend/software architecture.`;

        const contentPrompt = `You are a senior developer specializing in Native Android app development (Kotlin, Jetpack Compose), iOS dev (Swift, SwiftUI), custom Discord bot & server automation, high-performance API backends (FastAPI, Ktor, Node.js), and database systems (MongoDB). You write a highly technical blog for developers.
Your readers are working developers — smart, busy, and allergic to fluff.

Write a blog post ${postSubject}

━━━━━ CONTENT RULES ━━━━━
VOICE & READABILITY (NOT ROBOTIC):
• NEVER write generic, boilerplate transitions, or overuse obvious AI phrases (like "Let's dive in", "Game changer", "Forget the fluff", "Let's talk...", "In conclusion", "As a developer", "In today's fast-paced world").
• Write in first person ("I've seen this...", "When I built...", "In my production experience").
• Start the post with a real-world story, a production incident, or a personal experience. For example: "When I migrated my bot from Node.js to FastAPI, the memory usage dropped by 70%." or "I spent three days debugging a compose memory leak..."
• Avoid academic tone. Write like a senior engineer explaining code to a mid-level engineer during peer reviews: direct, technical, opinionated.

SEO & LENGTH:
• Word count MUST be greater than 1,500 words. Provide rich, detailed, comprehensive coverage.
• Title must be optimized for search intent (between 50-60 characters) and promise a clear, specific technical benefit.
• Meta description MUST be between 140 and 155 characters (including keywords naturally).
• Internal links: You MUST organically mention and link to at least 3 internal posts. Hardcode internal links using absolute paths: \`/blog/demystifying-android-os-internals\`, \`/blog/building-discord-ticket-bot-python\`, \`/blog/kotlin-multiplatform-mobile-guide\`, \`/blog/ktor-fastapi-backend-comparison\`. Place these link references naturally inside sentence structures.
• External sources: Include at least 2 external links to official documentation (e.g., official docs at developer.android.com, fastapi.tiangolo.com, or python.org) using proper anchor text.
• FAQ Section: You MUST include a dedicated H2 FAQ section (containing 3-4 specific technical questions and answers) at the end of the post.
• Data Tables: You MUST include at least one relevant comparison table or benchmark data table (formatted as clean HTML <table>).
• Affiliate Opportunity: You MUST naturally mention and link to an affiliate resource or tool (e.g. an Amazon technical book, Hostinger/Vultr/DigitalOcean hosting VPS, or a developer service) with a clear recommendation.
• Human Review/Trust Score: You MUST include a trust/review box block: \`<div class="bg-primary/5 p-4 rounded-xl border border-primary/20"><p><strong>Author Review Score:</strong> 9.8/10 (Based on production stability and developer experience)</p></div>\` or similar, placed at the VERY TOP of the article content (immediately after the first introduction paragraph, before the first H2 heading). Do NOT place it in the comparison table or FAQ sections.

━━━━━ FORMAT ━━━━━
• Return ONLY valid JSON matching the schema. Content must be HTML (not markdown).
• CRITICAL CODE BLOCK FORMATTING: Inside HTML <pre><code> blocks, you MUST use actual escaped newline characters (\\n) and proper indentation to separate code lines. Do NOT write all code on a single line or collapse spacing. Every single line of code, import, comment, or statement must end with a \\n character so that it parses as a newline. For example, a code block must be returned in the JSON string as: "<pre><code>import os\\n\\ndef main():\\n    print(\\"Hello\\")</code></pre>"
• Use <table>, <thead>, <tbody>, <tr>, <th>, <td> tags for tables.
• Use <p> for paragraphs, <h2> / <h3> for headings, <ul><li> for lists, <strong> for emphasis.
• Place [IMAGE: ...] markers BETWEEN block elements, NEVER nested inside any <p> tag. (e.g., place them immediately before a <h2> tag or between paragraphs)

━━━━━ IMAGE PLACEMENT & STYLE ━━━━━
You MUST insert exactly 3 image markers into the content.
Format: [IMAGE: <highly specific prompt>]
The image prompts must be:
• DO NOT generate abstract geometric shapes (cubes, spheres, boxes). They look generic and out-of-context.
• The prompts MUST describe a highly specific, context-relevant illustration that relates directly to the article's topic.
• Style: "Isometric 3D rendering", "detailed high-tech concept illustration", "cyberpunk workspace aesthetic", "vibrant neon cyan and purple accents", "clean dark mode UI presentation style", "studio lighting", "highly detailed 3D digital art".
- For example, if the article is about Discord bots, describe a stylized futuristic robot wearing headphones, typing on a holographic terminal displaying messages, in a neon-lit server room.
- If it is about Python high-performance, describe a glowing metallic python coiled around a high-speed engine turbine, with binary code flows in the background.
- If it is about Android development, describe a stylized glowing green Android mascot assembly line installing puzzle pieces onto a mobile phone screen in a sleek studio room.
• ABSOLUTELY NO TEXT, LABELS, LETTERS, OR WORDS in the image. The image generator cannot spell.

━━━━━ SCHEMA ━━━━━
{
  "title": "SEO-optimised post title",
  "category": "One of: Android, iOS, Backend, Discord Bots, Architecture",
  "excerpt": "2-sentence excerpt (max 160 chars) that hooks the reader",
  "metaDescription": "155-char meta description with keyword",
  "coverImagePrompt": "Highly specific, thematic cover image prompt (matching Style guidelines, e.g. 'Isometric 3D rendering of...'), no text, high quality, 16:9",
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
                                category: { type: Type.STRING },
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
                                "title", "category", "excerpt", "metaDescription", "coverImagePrompt",
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

        // First, replace any explicit [IMAGE: ...] markers in the content sequentially
        let replacedCount = 0;
        while (true) {
            const markerRegex = /\[IMAGE:[^\]]*\]/i;
            const match = markerRegex.exec(finalContent);
            if (!match) break;

            const marker = match[0];
            const matchIndex = match.index;
            const resultObj = inlineResults[replacedCount];

            let replacement = "";
            if (resultObj && resultObj.result) {
                const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObj.result.url}" alt="${resultObj.slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>\n`;

                // If marker is inside a <p> tag, split the <p> tag to prevent invalid nesting
                const before = finalContent.substring(0, matchIndex);
                const lastOpenP = before.lastIndexOf("<p");
                const lastCloseP = before.lastIndexOf("</p>");
                const insideP = lastOpenP > lastCloseP;

                if (insideP) {
                    replacement = `</p>${figureHtml}<p>`;
                } else {
                    replacement = figureHtml;
                }
            }

            finalContent = finalContent.substring(0, matchIndex) + replacement + finalContent.substring(matchIndex + marker.length);
            replacedCount++;
        }

        // Clean up any remaining [IMAGE: ...] markers just in case
        finalContent = finalContent.replace(/\[IMAGE:[^\]]*\]/g, "");

        // Failsafe Fallback: If Gemini generated fewer markers in the HTML content than the inline images we generated,
        // inject the remaining unused images at logical heading transitions (before h2 or h3 elements)
        const unusedResults = inlineResults.slice(replacedCount);
        if (unusedResults.length > 0) {
            console.log(`Failsafe: Injecting ${unusedResults.length} unused generated inline images...`);
            
            // Find all H2 and H3 tags
            const headingRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
            const headings: Array<{ tag: string; text: string; index: number; length: number }> = [];
            let hMatch;
            while ((hMatch = headingRegex.exec(finalContent)) !== null) {
                headings.push({
                    tag: hMatch[1].toLowerCase(),
                    text: hMatch[2],
                    index: hMatch.index,
                    length: hMatch[0].length
                });
            }

            if (headings.length > 0) {
                // Select heading indices to place the unused images before them
                const targetHeadingIndices: number[] = [];
                if (headings.length <= unusedResults.length) {
                    for (let k = 0; k < headings.length; k++) {
                        targetHeadingIndices.push(k);
                    }
                } else {
                    // Spread the images evenly across headings
                    for (let k = 0; k < unusedResults.length; k++) {
                        const idx = Math.floor(((k + 0.5) / unusedResults.length) * headings.length);
                        targetHeadingIndices.push(idx);
                    }
                }

                // Sort target heading indices descending to insert from right-to-left without shifting indices
                targetHeadingIndices.sort((a, b) => b - a);

                for (let k = 0; k < targetHeadingIndices.length; k++) {
                    const headingIdx = targetHeadingIndices[k];
                    const heading = headings[headingIdx];
                    const resultObjToUse = unusedResults[unusedResults.length - 1 - k];

                    if (resultObjToUse && resultObjToUse.result) {
                        const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObjToUse.result.url}" alt="${resultObjToUse.slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>\n`;
                        finalContent = finalContent.substring(0, heading.index) + figureHtml + finalContent.substring(heading.index);
                    }
                }
            } else {
                // If no headings, fall back to paragraphs
                const pRegex = /<p[^>]*>/gi;
                const paragraphs: Array<{ index: number; length: number }> = [];
                let pMatch;
                while ((pMatch = pRegex.exec(finalContent)) !== null) {
                    paragraphs.push({
                        index: pMatch.index,
                        length: pMatch[0].length
                    });
                }

                if (paragraphs.length > 0) {
                    const targetPIndices: number[] = [];
                    if (paragraphs.length <= unusedResults.length) {
                        for (let k = 0; k < paragraphs.length; k++) {
                            targetPIndices.push(k);
                        }
                    } else {
                        for (let k = 0; k < unusedResults.length; k++) {
                            const idx = Math.floor(((k + 0.5) / unusedResults.length) * paragraphs.length);
                            targetPIndices.push(idx);
                        }
                    }

                    targetPIndices.sort((a, b) => b - a);

                    for (let k = 0; k < targetPIndices.length; k++) {
                        const pIdx = targetPIndices[k];
                        const pTag = paragraphs[pIdx];
                        const resultObjToUse = unusedResults[unusedResults.length - 1 - k];

                        if (resultObjToUse && resultObjToUse.result) {
                            const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObjToUse.result.url}" alt="${resultObjToUse.slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>\n`;
                            finalContent = finalContent.substring(0, pTag.index) + figureHtml + finalContent.substring(pTag.index);
                        }
                    }
                } else {
                    // Append as a last resort
                    for (const resultObjToUse of unusedResults) {
                        if (resultObjToUse && resultObjToUse.result) {
                            const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObjToUse.result.url}" alt="${resultObjToUse.slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>\n`;
                            finalContent += figureHtml;
                        }
                    }
                }
            }
        }

        // Clean up invalid nested elements wrapping headings/pre/figures and empty tags
        finalContent = finalContent.replace(/<p>\s*<(h2|h3)[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi, (match, tag, innerHtml) => {
            return `<${tag}>${innerHtml}</${tag}>`;
        });
        finalContent = finalContent.replace(/<p>\s*<pre[^>]*>([\s\S]*?)<\/pre>\s*<\/p>/gi, (match, innerHtml) => {
            return `<pre>${innerHtml}</pre>`;
        });
        finalContent = finalContent.replace(/<p>\s*<figure[^>]*>([\s\S]*?)<\/figure>\s*<\/p>/gi, (match, innerHtml) => {
            return `<figure class="blog-image">${innerHtml}</figure>`;
        });
        finalContent = finalContent.replace(/<p>\s*<\/p>/gi, "");
        finalContent = finalContent.replace(/<p>&nbsp;<\/p>/gi, "");

        // Failsafe: Clean up squashed code blocks if the AI model outputted them on a single line
        finalContent = finalContent.replace(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
            let clean = code.trim();
            if (!clean.includes('\n') && !clean.includes('\r')) {
                // Restore bash setup newlines
                clean = clean.replace(/(mkdir\s+[^\s]+)\s*(cd\s+[^\s]+)/gi, "$1\n$2");
                clean = clean.replace(/(cd\s+[^\s]+)\s*(pip\s+install\s+|python3\s+|source\s+)/gi, "$1\n$2");
                clean = clean.replace(/(python3\s+-m\s+venv\s+[^\s]+)\s*(source\s+)/gi, "$1\n$2");
                
                // Restore Python imports and startup code
                clean = clean.replace(/(from\s+[^\s]+\s+import\s+[^\s]+)\s*(from\s+|import\s+)/g, "$1\n$2");
                clean = clean.replace(/(import\s+[^\s]+)\s*(from\s+|import\s+)/g, "$1\n$2");
                clean = clean.replace(/(load_dotenv\(\))\s*(app\s*=)/g, "$1\n$2");
                clean = clean.replace(/(GITHUB_TOKEN\s*=\s*[^\s]+)\s*(if\s*not)/g, "$1\n$2");
            }
            // Auto-correct any squashed dependency typos
            clean = clean.replace(/httpxpydantic/g, "httpx pydantic");
            return `<pre><code>${clean}</code></pre>`;
        });

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
        const mainCategory = aiData.category || "Development";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: mainCategory,
                slug: mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
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
            status: "draft",
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
        await sendCronFailureNotification(error);
        return NextResponse.json(
            {
                error: "Failed to run auto-blog cron",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
