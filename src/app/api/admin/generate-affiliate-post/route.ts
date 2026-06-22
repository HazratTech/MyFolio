import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Media from "@/models/Media";
import { verifyToken } from "@/lib/session";

export const maxDuration = 120; // Vercel limit for hobby plan

const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const BUCKET = "myfolio";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function checkAuth() {
    const token = cookies().get('admin_session')?.value;
    if (!token) return false;
    if (token === 'true') return true;
    const session = await verifyToken(token);
    return !!session;
}

/** Upload a raw Buffer directly to MinIO via presigned URL */
async function uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    filename: string
): Promise<{ url: string; key: string }> {
    const apiKey = process.env.STORAGE_API_KEY;
    if (!apiKey) throw new Error("STORAGE_API_KEY not configured");

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

    const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: buffer as any,
    });
    if (!putRes.ok) throw new Error(`MinIO PUT failed: ${await putRes.text()}`);

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

/** Generate an image using either OpenAI gpt-image-1 or Fal.ai and upload to MinIO. */
async function generateAndUpload(
    prompt: string,
    filenamePrefix: string,
    altText: string,
    width = 1024,
    height = 1024,
    provider: "openai" | "fal" = "fal",
    retries = 3
): Promise<{ url: string; key: string } | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            let buffer: Buffer;
            let mimeType: string;
            let filename: string;

            if (provider === "openai") {
                if (!process.env.OPEN_AI_KEY) throw new Error("OPEN_AI_KEY not configured");
                const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-image-1",
                        prompt,
                        n: 1,
                        size: "1024x1024"
                    })
                });

                if (!openAiRes.ok) {
                    throw new Error(`OpenAI gpt-image-1 failed: status ${openAiRes.status}: ${await openAiRes.text()}`);
                }

                const openAiData = await openAiRes.json();
                const imageBase64 = openAiData.data[0].b64_json;
                if (!imageBase64) throw new Error("b64_json not found in OpenAI response");

                buffer = Buffer.from(imageBase64, "base64");
                mimeType = "image/png";
                filename = `${filenamePrefix}-${Date.now()}.png`;
            } else {
                if (!process.env.FAL_KEY) throw new Error("FAL_KEY not configured");
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

                const imageRes = await fetch(imageUrl);
                if (!imageRes.ok) throw new Error("Failed to download image from Fal.ai URL");

                const arrayBuffer = await imageRes.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                mimeType = imageRes.headers.get("content-type") || "image/jpeg";
                filename = `${filenamePrefix}-${Date.now()}.jpg`;
            }

            const { url, key } = await uploadBuffer(buffer, mimeType, filename);

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
            console.error(
                `generateAndUpload attempt ${attempt} failed for "${filenamePrefix}" using ${provider}:`,
                err instanceof Error ? err.message : String(err)
            );
            if (attempt === retries) return null;
            await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        }
    }
    return null;
}

function countWords(html: string): number {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        if (!(await checkAuth())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, affiliateLinks } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        await dbConnect();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Parse affiliate links into an array
        const linksList = affiliateLinks
            ? affiliateLinks
                  .split("\n")
                  .map((line: string) => line.trim())
                  .filter(Boolean)
            : [];

        const linksPromptPart = linksList.length > 0 
            ? `\n━━━━━ MANDATORY AFFILIATE LINKS ━━━━━\n` +
              `You MUST naturally and organically include the following exact URLs in the post content:\n` +
              linksList.map((link: string) => `- ${link}`).join("\n") + "\n" +
              `Do NOT change or hallucinate these URLs. Embed them naturally using relevant anchor text in pros/cons, comparison tables, and call-to-actions.\n`
            : "";

        // Fetch recent posts for internal backlinks focus
        const recentPostsForLinks = await Post.find()
            .sort({ createdAt: -1 })
            .limit(15)
            .select("title slug")
            .lean();

        const availableBacklinks = recentPostsForLinks.map((p: any) => ({
            title: p.title,
            link: `/blog/${p.slug}`
        }));

        const backlinksPromptPart = availableBacklinks.length > 0
            ? `\n━━━━━ MANDATORY INTERNAL BACKLINKS (SEO FOCUS) ━━━━━\n` +
              `You MUST naturally and organically link to at least 2 of the following existing blog posts on this site using their exact URLs (using standard HTML anchor tags like <a href="/blog/slug">Anchor Text</a>):\n` +
              availableBacklinks.map((b: any) => `- URL: "${b.link}" (Post Title: "${b.title}")`).join("\n") + "\n" +
              `Ensure the anchor text is highly relevant, flows naturally within the sentence context, and improves SEO backlinks.\n`
            : "";

        // Extract brand name helper
        const extractBrandName = (urlStr: string): string | null => {
            try {
                const url = new URL(urlStr);
                const hostname = url.hostname.replace("www.", "");
                const parts = hostname.split(".");
                if (parts.length > 0) {
                    const name = parts[0];
                    return name.charAt(0).toUpperCase() + name.slice(1);
                }
                return null;
            } catch {
                return null;
            }
        };

        const brands = linksList
            .map((link: string) => extractBrandName(link))
            .filter(Boolean) as string[];
        const uniqueBrands = Array.from(new Set(brands));

        const brandsPromptPart = uniqueBrands.length > 0
            ? `\n━━━━━ AFFILIATE PRODUCTS / BRANDS VISUALS (COVER IMAGE ONLY) ━━━━━\n` +
              `For the cover image prompt (coverImagePrompt), you MUST describe a product visual mockup or brand presentation showing the actual dashboard, website landing page, or product interface of one of these brands: ${uniqueBrands.join(", ")}.\n` +
              `Example prompt format: "A realistic premium product mockup of [BrandName] homepage displayed on a sleek laptop screen, vibrant accents, dark mode workspace, no text."\n`
            : "";

        const contentPrompt = `You are a high-performing affiliate copywriter and senior developer.
Write a deep-dive, practical, and highly persuasive blog post about: "${prompt}"

Your tone should be honest, authoritative, and direct, but completely optimized to drive clicks to the affiliate links. Avoid obvious robotic fluff (e.g. "let's dive in", "forget the fluff").

${linksPromptPart}
${backlinksPromptPart}
${brandsPromptPart}

━━━━━ CONTENT RULES ━━━━━
• Word count MUST be greater than 1,200 words.
• Title must be optimized for search intent (between 50-60 characters) promising a technical/practical benefit.
• Meta description MUST be between 140 and 155 characters.
• Place exactly 2 inline image placeholders: [IMAGE: prompt] and 1 cover image.
• The cover image prompt (coverImagePrompt) MUST describe a realistic product visual/dashboard mockup for a promoted brand (such as ${uniqueBrands.join(", ")}) as detailed above.
• The inline image prompts should be highly related to the product/service and describe a detailed modern isometric or 3D high-tech concept illustration with dark mode UI, vibrant colors, and no text.

━━━━━ FORMAT ━━━━━
• Return ONLY valid JSON matching the schema. Content must be HTML (not markdown).
• Use <table>, <thead>, <tbody>, <tr>, <th>, <td> tags for comparison/benchmark tables.

━━━━━ SCHEMA ━━━━━
{
  "title": "SEO-optimised post title",
  "category": "One of: Android, iOS, Backend, Discord Bots, Architecture",
  "excerpt": "2-sentence excerpt (max 160 chars)",
  "metaDescription": "155-char meta description with keyword",
  "coverImagePrompt": "Highly specific, thematic cover image prompt (isometric 3D style, dark workspace, neon accents, no text)",
  "content": "Full HTML content with exactly 2 [IMAGE: prompt] markers embedded",
  "imageSlots": [
    { "placeholder": "[IMAGE: exact text as in content]", "prompt": "exact same prompt" },
    { "placeholder": "[IMAGE: exact text as in content]", "prompt": "exact same prompt" }
  ],
  "tags": ["tag1", "tag2"],
  "readingTime": 6
}
`;

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
                            minItems: 2,
                            maxItems: 2,
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

        if (!response || !response.text) {
            throw new Error("Failed to generate content from Gemini");
        }

        const aiData = JSON.parse(response.text);
        let finalContent: string = aiData.content;

        // Failsafe affiliate link validation
        if (linksList.length > 0) {
            const missingLinks = linksList.filter((link: string) => !finalContent.includes(link));
            if (missingLinks.length > 0) {
                // Append a beautiful CTA recommendation box at the end of the post
                const ctaHtml = `
<div class="bg-primary/10 border border-primary/20 p-6 rounded-2xl my-8">
  <h3 class="text-xl font-bold mb-2">Recommended Official Resources</h3>
  <p class="mb-4">Get started or buy the products mentioned in this review using the official links below:</p>
  <ul class="list-disc pl-5 space-y-2">
    ${missingLinks
        .map(
            (link: string) =>
                `<li><a href="${link}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">${link}</a></li>`
        )
        .join("")}
  </ul>
</div>`;
                finalContent += ctaHtml;
            }
        }

        // Trigger cover and inline image generation
        const coverPromise = generateAndUpload(
            aiData.coverImagePrompt,
            "cover",
            aiData.title,
            1200,
            630,
            "openai"
        );

        const slots: Array<{ placeholder: string; prompt: string }> = aiData.imageSlots || [];
        const inlinePromises = slots.map((slot, index) => {
            return new Promise<{ slot: typeof slot; result: any }>((resolve) => {
                setTimeout(async () => {
                    const result = await generateAndUpload(
                        slot.prompt,
                        `inline-${index}`,
                        slot.prompt.slice(0, 100),
                        1200,
                        675,
                        "fal"
                    );
                    resolve({ slot, result });
                }, (index + 1) * 5000);
            });
        });

        const [coverResult, ...inlineResults] = await Promise.all([
            coverPromise,
            ...inlinePromises,
        ]);

        // Inject Inline Images
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

        finalContent = finalContent.replace(/\[IMAGE:[^\]]*\]/g, "");

        // Clean up invalid tags
        finalContent = finalContent.replace(/<p>\s*<(h2|h3)[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi, (match, tag, innerHtml) => {
            return `<${tag}>${innerHtml}</${tag}>`;
        });
        finalContent = finalContent.replace(/<p>\s*<pre[^>]*>([\s\S]*?)<\/pre>\s*<\/p>/gi, (match, innerHtml) => {
            return `<pre>${innerHtml}</pre>`;
        });
        finalContent = finalContent.replace(/<p>\s*<\/p>/gi, "");

        const words = countWords(finalContent);
        const readingTime = aiData.readingTime || Math.ceil(words / 230);

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

        const mainCategory = aiData.category || "Backend";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: mainCategory,
                slug: mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
            });
        }

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
            coverImage: coverResult?.url,
        });
    } catch (error) {
        console.error("Custom content generation failed:", error);
        return NextResponse.json(
            {
                error: "Failed to generate custom affiliate content",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
