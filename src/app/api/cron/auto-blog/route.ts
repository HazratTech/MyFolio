import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import AutoBlogConfig from "@/models/AutoBlogConfig";
import { sendCronFailureNotification, sendSocialMediaWebhook } from "@/lib/discord";
import {
    respectRPM,
    countWords,
    runResearchAgent,
    runStrategistAgent,
    runWriterAgent,
    runEditorAgent,
    runSEOAgent,
    runVisualCreatorAgent
} from "@/lib/blog-engine";

export const maxDuration = 300; // 5 minutes for 6-agent pipeline

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

export async function POST(req: NextRequest) {
    try {
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
        if (!process.env.OPEN_AI_KEY) {
            return NextResponse.json({ error: "OPEN_AI_KEY not configured for Editor/SEO agents" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // ── Find a fresh, relevant topic ──────────────────────────────────────
        let allowedTopics = [
            "android", "kotlin", "compose", "android os", "ios dev", "ios", "swift", "swiftui",
            "fastapi", "ktor", "mongodb", "discord bot", "discord server", "backend", "api",
            "software", "programming", "database", "cloud",
        ];
        let isConfigActive = true;

        const configDoc = await AutoBlogConfig.findOne({ key: "auto-blog" });
        if (configDoc) {
            isConfigActive = configDoc.isActive ?? true;
            if (configDoc.allowedTopics?.length > 0) {
                allowedTopics = configDoc.allowedTopics.map((t: string) => t.toLowerCase());
            }
        }

        if (!isConfigActive) {
            return NextResponse.json({ message: "Auto-blog cron is disabled in settings." });
        }

        const devToRes = await fetch("https://dev.to/api/articles?top=1&per_page=30");
        if (!devToRes.ok) throw new Error("Failed to fetch dev.to trends");
        const articles = await devToRes.json();

        const recentPosts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select("title slug")
            .lean();
        const existingTitles = recentPosts.map((p: any) => p.title.toLowerCase());

        let selectedArticle: any = null;
        let selectedTopic: string = "";

        for (const article of articles) {
            const isCovered = existingTitles.some(
                (t: string) =>
                    t.includes(article.title.toLowerCase()) ||
                    article.title.toLowerCase().includes(t)
            );
            const isOffTopicAllowed = allowedTopics.includes("off topic");
            const isRelevant = isOffTopicAllowed || article.tag_list?.some((tag: string) =>
                allowedTopics.includes(tag.toLowerCase())
            );
            if (!isCovered && isRelevant) {
                selectedArticle = article;
                break;
            }
        }

        if (!selectedArticle) {
            console.log("No matching Dev.to trends. Generating from allowed topics...");
            const topicsToChoose = allowedTopics.filter(t => t !== "off topic");
            selectedTopic = topicsToChoose.length > 0
                ? topicsToChoose[Math.floor(Math.random() * topicsToChoose.length)]
                : "mobile app development";
        }

        const topicString = selectedArticle
            ? `"${selectedArticle.title}" (tags: ${selectedArticle.tag_list?.join(", ") || "technology"})`
            : `"${selectedTopic}"`;

        const articleContext = selectedArticle
            ? `Trending on Dev.to: "${selectedArticle.title}". Description: "${selectedArticle.description}". Tags: ${selectedArticle.tag_list?.join(", ")}.`
            : `Topic: "${selectedTopic}". Write a deep-dive practical guide.`;

        // ══════════════════════════════════════════════════════════════════════
        console.log("═══════════════════════════════════════════════════");
        console.log(`🚀 6-Agent Pipeline for: ${topicString}`);
        console.log("═══════════════════════════════════════════════════");

        // ── AGENT 1: Research (Gemini Flash) ──────────────────────────────
        let research: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                research = await runResearchAgent(ai, topicString, articleContext);
                break;
            } catch (err) {
                console.warn(`Research Agent attempt ${attempt}:`, err instanceof Error ? err.message : String(err));
                if (attempt === 3) throw err;
                await respectRPM(8000);
            }
        }

        await respectRPM();

        // ── AGENT 2: Strategy (Gemini Flash) ──────────────────────────────
        let strategy: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                strategy = await runStrategistAgent(ai, research, topicString, "No affiliate links.");
                break;
            } catch (err) {
                console.warn(`Strategist attempt ${attempt}:`, err instanceof Error ? err.message : String(err));
                if (attempt === 3) throw err;
                await respectRPM(8000);
            }
        }

        await respectRPM();

        // ── AGENT 3: Writer (Gemini Flash) ────────────────────────────────
        let writerContent = "";
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                writerContent = await runWriterAgent(ai, research, strategy);
                break;
            } catch (err) {
                console.warn(`Writer attempt ${attempt}:`, err instanceof Error ? err.message : String(err));
                if (attempt === 3) throw err;
                await respectRPM(8000);
            }
        }

        const writerReadingTime = Math.ceil(countWords(writerContent) / 230);
        const imageSlots = strategy.sections
            .filter((s: any) => s.visualType === "photo")
            .map((s: any) => ({
                placeholder: `[IMAGE: ${s.visualDescription}]`,
                prompt: s.visualDescription
            }));

        // ── AGENT 4: Editor (GPT-4o-mini) ─────────────────────────────────
        let editorOutput: any;
        try {
            editorOutput = await runEditorAgent(writerContent, strategy, research);
            console.log(`   Editor Score: ${editorOutput.editorScore}/100`);
            console.log(`   Changes: ${editorOutput.changesLog?.slice(0, 3).join(", ") || "none"}`);
        } catch (err) {
            console.warn("Editor failed, using raw writer output:", err instanceof Error ? err.message : String(err));
            editorOutput = { content: writerContent, editorScore: 60, changesLog: ["Editor skipped"] };
        }

        // ── AGENT 5: SEO Optimizer (GPT-4o-mini) ─────────────────────────
        let seoOutput: any;
        try {
            seoOutput = await runSEOAgent(editorOutput.content, strategy, research);
            console.log(`   SEO Score: ${seoOutput.seoScore}/100`);
            console.log(`   Optimizations: ${seoOutput.optimizations?.slice(0, 3).join(", ") || "none"}`);
        } catch (err) {
            console.warn("SEO Agent failed, using editor output:", err instanceof Error ? err.message : String(err));
            seoOutput = {
                title: strategy.title,
                metaDescription: strategy.metaDescription,
                content: editorOutput.content,
                faqSchema: [],
                seoScore: 50,
                optimizations: ["SEO skipped"]
            };
        }

        const finalTitle = seoOutput.title || strategy.title;
        const finalMeta = seoOutput.metaDescription || strategy.metaDescription;
        const contentBeforeImages = seoOutput.content || editorOutput.content;

        await respectRPM();

        // ── AGENT 6: Visual Creator (Fal.ai → Validate → OpenAI) ──────────
        const { content: contentWithImages, coverResult } = await runVisualCreatorAgent(
            ai,
            contentBeforeImages,
            strategy.coverImagePrompt,
            imageSlots,
            finalTitle,
            `${finalTitle} - ${strategy.excerpt}`
        );

        // ── Post-Processing: Clean up HTML ────────────────────────────────
        let cleanedContent = contentWithImages;

        cleanedContent = cleanedContent.replace(/<p>\s*<(h2|h3)[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
            (_m, tag, inner) => `<${tag}>${inner}</${tag}>`);
        cleanedContent = cleanedContent.replace(/<p>\s*<pre[^>]*>([\s\S]*?)<\/pre>\s*<\/p>/gi,
            (_m, inner) => `<pre>${inner}</pre>`);
        cleanedContent = cleanedContent.replace(/<p>\s*<figure[^>]*>([\s\S]*?)<\/figure>\s*<\/p>/gi,
            (_m, inner) => `<figure class="blog-image">${inner}</figure>`);
        cleanedContent = cleanedContent.replace(/<p>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/p>/gi,
            (match) => match.replace(/^<p>\s*/, "").replace(/\s*<\/p>$/, ""));
        cleanedContent = cleanedContent.replace(/<p>\s*<\/p>/gi, "");
        cleanedContent = cleanedContent.replace(/<p>&nbsp;<\/p>/gi, "");

        // Fix squashed code blocks
        cleanedContent = cleanedContent.replace(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/gi, (_m, code) => {
            let clean = code.trim();
            if (!clean.includes('\n') && !clean.includes('\r')) {
                clean = clean.replace(/(from\s+[^\s]+\s+import\s+[^\s]+)\s*(from\s+|import\s+)/g, "$1\n$2");
                clean = clean.replace(/(import\s+[^\s]+)\s*(from\s+|import\s+)/g, "$1\n$2");
            }
            clean = clean.replace(/httpxpydantic/g, "httpx pydantic");
            return `<pre><code>${clean}</code></pre>`;
        });

        // ── Calculate reading time ────────────────────────────────────────
        const words = countWords(cleanedContent);
        const readingTime = writerReadingTime || Math.ceil(words / 230);

        // ── Build slug ────────────────────────────────────────────────────
        let baseSlug = finalTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let counter = 1;
        while (await Post.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // ── Get or create category ────────────────────────────────────────
        const mainCategory = strategy.category || "Development";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: mainCategory,
                slug: mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
            });
        }

        // ── Save Post ─────────────────────────────────────────────────────
        const newPost = await Post.create({
            title: finalTitle,
            slug,
            excerpt: strategy.excerpt,
            content: cleanedContent,
            coverImage: coverResult?.url || null,
            coverImageKey: coverResult?.key || null,
            category: mainCategory,
            tags: strategy.tags,
            status: "published",
            publishedAt: new Date(),
            readingTime,
            views: 0,
        });

        // ── Social Media Posts (Gemini Flash) ─────────────────────────────
        await respectRPM();
        try {
            const socialResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `You are a developer sharing a new technical blog post.
Write 3 social media posts (Twitter, LinkedIn, Facebook).

Blog Title: "${finalTitle}"
Blog Excerpt: "${strategy.excerpt}"
Tags: ${strategy.tags.join(", ")}

RULES:
1. NO AI SLOP. No "Delve", "Game-changer", "Unlock", "Crucial", "Vital".
2. Human, developer-to-developer tone.
3. TWITTER: Under 280 chars, 1-2 hashtags max.
4. LINKEDIN: Professional, use line breaks.
5. FACEBOOK: Casual, friendly.

Return JSON: {"twitter": "...", "linkedin": "...", "facebook": "..."}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            twitter: { type: Type.STRING },
                            linkedin: { type: Type.STRING },
                            facebook: { type: Type.STRING },
                        },
                        required: ["twitter", "linkedin", "facebook"],
                    },
                },
            });

            if (socialResponse?.text) {
                const socialData = JSON.parse(socialResponse.text);
                await sendSocialMediaWebhook(
                    socialData,
                    newPost.title,
                    `https://relayworks.dev/blog/${newPost.slug}`,
                    newPost.coverImage
                );
            }
        } catch (socialErr) {
            console.error("Social media generation failed:", socialErr);
        }

        console.log("═══════════════════════════════════════════════════");
        console.log(`✅ 6-Agent Pipeline COMPLETE: "${finalTitle}"`);
        console.log(`   Words: ${words} | Reading: ${readingTime}min`);
        console.log(`   Editor: ${editorOutput.editorScore}/100 | SEO: ${seoOutput.seoScore}/100`);
        console.log(`   Photos: ${imageSlots.length} inline + 1 cover`);
        console.log("═══════════════════════════════════════════════════");

        return NextResponse.json({
            success: true,
            slug: newPost.slug,
            title: newPost.title,
            readingTime,
            wordCount: words,
            editorScore: editorOutput.editorScore,
            seoScore: seoOutput.seoScore,
            inlineImagesGenerated: imageSlots.length,
            coverImage: coverResult?.url || "failed",
            faqSchema: seoOutput.faqSchema || [],
            pipeline: "6-agent-v1",
        });
    } catch (error) {
        console.error("Auto-blog 6-agent pipeline failed:", error);
        await sendCronFailureNotification(error);
        return NextResponse.json(
            {
                error: "Failed to run auto-blog 6-agent pipeline",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
