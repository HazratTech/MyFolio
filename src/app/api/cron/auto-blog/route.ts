import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";

export const maxDuration = 60; // Increase serverless timeout for AI generation

export async function POST(req: NextRequest) {
    try {
        // Re-enable auth after test
        // const authHeader = req.headers.get('authorization');
        // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        await dbConnect();
        
        // 1. Fetch Trending Topics from Dev.to
        const devToRes = await fetch('https://dev.to/api/articles?top=1&per_page=30');
        if (!devToRes.ok) {
            throw new Error("Failed to fetch dev.to trends");
        }
        const articles = await devToRes.json();
        
        // 2. Fetch existing posts to avoid duplicates
        const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(100).select('title').lean();
        const existingTitles = recentPosts.map((p: any) => p.title.toLowerCase());
        
        // Find a trending article we haven't covered
        let selectedArticle = null;
        for (const article of articles) {
            const isCovered = existingTitles.some((t: string) => 
                t.includes(article.title.toLowerCase()) || article.title.toLowerCase().includes(t)
            );
            
            // Only select if it matches our tech niche (very broadly)
            const techKeywords = ['react', 'next.js', 'javascript', 'typescript', 'ai', 'css', 'html', 'node', 'frontend', 'backend', 'fullstack', 'web', 'dev', 'programming', 'software'];
            const isRelevant = article.tag_list?.some((tag: string) => techKeywords.includes(tag.toLowerCase()));
            
            if (!isCovered && isRelevant) {
                selectedArticle = article;
                break;
            }
        }
        
        if (!selectedArticle) {
            return NextResponse.json({ message: "No suitable new topics found today." });
        }
        
        // 3. Generate Thumbnail Image Prompt & URL
        // We use Pollinations AI for free, high-quality, no-key AI image generation
        const imagePrompt = `A high quality, cinematic, modern, and professional thumbnail image for a tech blog post about ${selectedArticle.title}. No text.`;
        const coverImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1200&height=630&nologo=true`;
        
        // 4. Generate Content with Gemini
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `You are an expert senior web developer and technical writer. 
Your task is to write a highly valuable, in-depth, SEO-optimized blog post inspired by the trending topic: "${selectedArticle.title}".
Original article description: "${selectedArticle.description}"
Tags: ${selectedArticle.tag_list?.join(', ') || ''}

CRITICAL INSTRUCTIONS:
1. Write a LONG, comprehensive article (at least 800 words). Do not write a short summary.
2. The \`content\` field MUST BE STRICTLY FORMATTED AS HTML. Do NOT use Markdown. 
   - You MUST wrap paragraphs in <p> tags.
   - You MUST use <h2> and <h3> tags for all headings.
   - You MUST use <ul> and <li> for lists.
   - You MUST use <pre><code> for any code examples.
   Example: <h2>Introduction</h2><p>This is a paragraph.</p><pre><code>const a = 1;</code></pre>
3. Provide real value, deep technical insights, and actionable advice.
4. Provide a catchy SEO title.
5. Provide a short 2-sentence excerpt.
6. Provide up to 4 relevant tags.
7. Return the response strictly matching the JSON schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        excerpt: { type: Type.STRING },
                        content: { type: Type.STRING, description: "The full blog post content. MUST be raw HTML string with <p>, <h2>, <ul> tags. Do NOT use markdown." },
                        tags: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        }
                    },
                    required: ["title", "excerpt", "content", "tags"]
                }
            }
        });
        
        if (!response.text) {
            throw new Error("AI returned empty response");
        }

        const aiData = JSON.parse(response.text);
        
        // 5. Save to Database
        // We'll create a unique slug
        let baseSlug = aiData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (await Post.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        // Get or create category
        const mainCategory = "Development";
        let categoryDoc = await Category.findOne({ name: mainCategory });
        if (!categoryDoc) {
            categoryDoc = await Category.create({ name: mainCategory, slug: mainCategory.toLowerCase() });
        }
        
        const newPost = await Post.create({
            title: aiData.title,
            slug,
            excerpt: aiData.excerpt,
            content: aiData.content,
            coverImage: coverImageUrl,
            category: mainCategory,
            tags: aiData.tags,
            status: 'published',
            publishedAt: new Date(),
            views: 0
        });

        return NextResponse.json({ success: true, slug: newPost.slug, title: newPost.title });
        
    } catch (error) {
        console.error("Auto-blog cron failed:", error);
        return NextResponse.json({ error: "Failed to run cron job", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
