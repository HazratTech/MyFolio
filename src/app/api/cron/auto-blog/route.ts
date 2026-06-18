import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";

export const maxDuration = 60; // Increase serverless timeout for AI generation

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

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
        
        // 3. Source Image from Unsplash
        let coverImageUrl = "";
        if (process.env.UNSPLASH_ACCESS_KEY) {
            try {
                // Use the first tag as a search keyword, fallback to tech
                const keyword = selectedArticle.tag_list?.[0] || 'technology';
                const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&orientation=landscape&per_page=1`);
                const unsplashData = await unsplashRes.json();
                if (unsplashData.results && unsplashData.results.length > 0) {
                    coverImageUrl = unsplashData.results[0].urls.regular;
                }
            } catch (e) {
                console.error("Unsplash error", e);
            }
        }
        
        // 4. Generate Content with Gemini
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `You are an expert senior web developer and technical writer. 
Your task is to write a highly valuable, SEO-optimized blog post inspired by the trending topic: "${selectedArticle.title}".
Original article description: "${selectedArticle.description}"
Tags: ${selectedArticle.tag_list?.join(', ') || ''}

Instructions:
1. Write a unique, original article. DO NOT copy the original article, use the topic as inspiration to provide fresh insights.
2. Provide real value, deep technical insights, and code examples if relevant. Your goal is to pass Google's E-E-A-T guidelines for high-quality content.
3. Write in an engaging, authoritative, yet accessible tone.
4. The content MUST be formatted in raw HTML (suitable for a Tiptap editor). Use <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, and <pre><code> tags where appropriate. Do NOT wrap the entire response in a markdown code block.
5. Provide a catchy SEO title.
6. Provide a short 2-sentence excerpt.
7. Provide up to 4 relevant tags.
8. Return the response as JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use flash for speed and reliability in serverless
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        excerpt: { type: Type.STRING },
                        content: { type: Type.STRING, description: "Raw HTML string of the post content" },
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
