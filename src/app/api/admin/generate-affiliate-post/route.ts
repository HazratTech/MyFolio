import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { verifyToken } from "@/lib/session";
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

// ─── Auth Helper ─────────────────────────────────────────────────────────────

async function checkAuth() {
    const token = cookies().get('admin_session')?.value;
    if (!token) return false;
    if (token === 'true') return true;
    const session = await verifyToken(token);
    return !!session;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

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
        if (!process.env.OPEN_AI_KEY) {
            return NextResponse.json({ error: "OPEN_AI_KEY not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Parse affiliate links
        const linksList = affiliateLinks
            ? affiliateLinks.split("\n").map((line: string) => line.trim()).filter(Boolean)
            : [];

        const linksContext = linksList.length > 0
            ? `Affiliate links to naturally embed: ${linksList.join(", ")}`
            : "No affiliate links — this is a general informative post.";

        console.log("═══════════════════════════════════════════════════");
        console.log(`🚀 6-Agent Pipeline (Custom) for: "${prompt}"`);
        console.log("═══════════════════════════════════════════════════");

        // ── AGENT 1: Research (Gemini Flash) ──────────────────────────────
        let research: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                research = await runResearchAgent(ai, prompt, linksContext);
                break;
            } catch (err) {
                console.warn(`Research Agent attempt ${attempt}:`, err instanceof Error ? err.message : String(err));
                if (attempt === 3) throw err;
                await respectRPM(8000);
            }
        }

        await respectRPM();

        // ── AGENT 2: Strategist (Gemini Flash) ───────────────────────────
        let strategy: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                strategy = await runStrategistAgent(ai, research, prompt, linksContext, linksList);
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
                writerContent = await runWriterAgent(ai, research, strategy, linksList);
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
        } catch (err) {
            console.warn("Editor failed, using writer output:", err instanceof Error ? err.message : String(err));
            editorOutput = { content: writerContent, editorScore: 60 };
        }

        // ── AGENT 5: SEO Optimizer (GPT-4o-mini) ─────────────────────────
        let seoOutput: any;
        try {
            seoOutput = await runSEOAgent(editorOutput.content, strategy, research);
            console.log(`   SEO Score: ${seoOutput.seoScore}/100`);
        } catch (err) {
            console.warn("SEO Agent failed:", err instanceof Error ? err.message : String(err));
            seoOutput = {
                title: strategy.title,
                metaDescription: strategy.metaDescription,
                content: editorOutput.content,
                faqSchema: [],
                seoScore: 50
            };
        }

        const finalTitle = seoOutput.title || strategy.title;
        let finalContent = seoOutput.content || editorOutput.content;

        // Failsafe: Append missing affiliate links
        if (linksList.length > 0) {
            const missingLinks = linksList.filter((link: string) => !finalContent.includes(link));
            if (missingLinks.length > 0) {
                finalContent += `\n<div class="bg-primary/10 border border-primary/20 p-6 rounded-2xl my-8">
  <h3 class="text-xl font-bold mb-2">Recommended Official Resources</h3>
  <ul class="list-disc pl-5 space-y-2">
    ${missingLinks.map((link: string) => `<li><a href="${link}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">${link}</a></li>`).join("")}
  </ul>
</div>`;
            }
        }

        await respectRPM();

        // ── AGENT 6: Visual Creator (Fal.ai → validate → OpenAI) ──────────
        const { content: contentWithImages, coverResult } = await runVisualCreatorAgent(
            ai,
            finalContent,
            strategy.coverImagePrompt,
            imageSlots,
            finalTitle,
            `${finalTitle} - ${strategy.excerpt}`
        );

        // ── Post-Processing: Clean up HTML ────────────────────────────────
        let cleanedContent = contentWithImages;

        cleanedContent = cleanedContent.replace(/<p>\s*<(h2|h3)[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
            (_m: string, tag: string, inner: string) => `<${tag}>${inner}</${tag}>`);
        cleanedContent = cleanedContent.replace(/<p>\s*<pre[^>]*>([\s\S]*?)<\/pre>\s*<\/p>/gi,
            (_m: string, inner: string) => `<pre>${inner}</pre>`);
        cleanedContent = cleanedContent.replace(/<p>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/p>/gi,
            (match: string) => match.replace(/^<p>\s*/, "").replace(/\s*<\/p>$/, ""));
        cleanedContent = cleanedContent.replace(/<p>\s*<\/p>/gi, "");

        // ── Save Post ─────────────────────────────────────────────────────
        const words = countWords(cleanedContent);
        const readingTime = writerReadingTime || Math.ceil(words / 230);

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

        const mainCategory = strategy.category || "Backend";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: mainCategory,
                slug: mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
            });
        }

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

        console.log("═══════════════════════════════════════════════════");
        console.log(`✅ 6-Agent Custom Pipeline COMPLETE: "${finalTitle}"`);
        console.log(`   Words: ${words} | Editor: ${editorOutput.editorScore}/100 | SEO: ${seoOutput.seoScore}/100`);
        console.log("═══════════════════════════════════════════════════");

        return NextResponse.json({
            success: true,
            slug: newPost.slug,
            title: newPost.title,
            coverImage: coverResult?.url,
            wordCount: words,
            editorScore: editorOutput.editorScore,
            seoScore: seoOutput.seoScore,
            pipeline: "6-agent-v1",
        });
    } catch (error) {
        console.error("Custom content 6-agent pipeline failed:", error);
        return NextResponse.json(
            {
                error: "Failed to generate custom content",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
