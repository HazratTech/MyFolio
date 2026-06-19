// Quick standalone test for the auto-blog pipeline
// Run: node --env-file=.env.local test-autoblog.mjs

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const STORAGE_API_KEY = process.env.STORAGE_API_KEY;
const BUCKET = "myfolio";

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
}
if (!STORAGE_API_KEY) {
    console.error("❌ STORAGE_API_KEY not set");
    process.exit(1);
}

console.log("✅ Keys loaded");

// ─── Step 1: Fetch trending topic ──────────────────────────────────────────
console.log("\n📡 Fetching trending topics from Dev.to...");
const devToRes = await fetch("https://dev.to/api/articles?top=1&per_page=10");
const articles = await devToRes.json();
const techKeywords = ["react", "next.js", "javascript", "typescript", "ai", "css", "web", "node"];
const selected = articles.find(a =>
    a.tag_list?.some(t => techKeywords.includes(t.toLowerCase()))
);

if (!selected) {
    console.log("⚠️  No relevant topic found today");
    process.exit(0);
}
console.log(`✅ Topic: "${selected.title}"`);

// ─── Step 2: Generate content with Gemini ──────────────────────────────────
console.log("\n🤖 Calling Gemini for content...");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const prompt = `Write a short test blog post (300 words) about: "${selected.title}".
Return JSON with: title, excerpt, coverImagePrompt, content (HTML), imageSlots (array of {placeholder, prompt}), tags, readingTime.
Include exactly 1 image slot: [IMAGE: a specific visual prompt]
Keep it brief — this is just a pipeline test.`;

const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                excerpt: { type: Type.STRING },
                coverImagePrompt: { type: Type.STRING },
                content: { type: Type.STRING },
                imageSlots: {
                    type: Type.ARRAY,
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
            required: ["title", "excerpt", "coverImagePrompt", "content", "imageSlots", "tags", "readingTime"],
        },
    },
});

const data = JSON.parse(res.text);
console.log(`✅ Title: "${data.title}"`);
console.log(`✅ Tags: ${data.tags.join(", ")}`);
console.log(`✅ Image slots: ${data.imageSlots.length}`);
console.log(`✅ Cover prompt: "${data.coverImagePrompt.slice(0, 80)}..."`);

// ─── Step 3: Generate cover image via Pollinations ──────────────────────────
console.log("\n🖼️  Fetching cover image from Pollinations...");
const coverUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(data.coverImagePrompt)}?width=1200&height=630&nologo=true`;
const coverRes = await fetch(coverUrl);
if (!coverRes.ok) {
    console.error(`❌ Pollinations failed: ${coverRes.status} ${coverRes.statusText}`);
} else {
    const buf = Buffer.from(await coverRes.arrayBuffer());
    console.log(`✅ Cover image fetched: ${(buf.length / 1024).toFixed(1)} KB`);

    // ─── Step 4: Upload to MinIO ─────────────────────────────────────────────
    console.log("\n⬆️  Uploading to MinIO...");
    
    // Init
    const initRes = await fetch(`${STORAGE_API_URL}/upload/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: STORAGE_API_KEY },
        body: JSON.stringify({
            filename: `test-cover-${Date.now()}`,
            file_type: "image/jpeg",
            file_size: buf.length,
            bucket: BUCKET,
        }),
    });
    
    if (!initRes.ok) {
        console.error(`❌ MinIO init failed: ${await initRes.text()}`);
    } else {
        const { upload_url, object_key } = await initRes.json();
        console.log(`✅ Got presigned URL, object_key: ${object_key}`);
        
        // PUT
        const putRes = await fetch(upload_url, {
            method: "PUT",
            headers: { "Content-Type": "image/jpeg" },
            body: buf,
        });
        
        if (!putRes.ok) {
            console.error(`❌ MinIO PUT failed: ${putRes.status}`);
        } else {
            // Complete
            const completeRes = await fetch(`${STORAGE_API_URL}/upload/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: STORAGE_API_KEY },
                body: JSON.stringify({
                    object_key,
                    file_size: buf.length,
                    file_type: "image/jpeg",
                    bucket: BUCKET,
                }),
            });
            
            if (!completeRes.ok) {
                console.error(`❌ MinIO complete failed: ${await completeRes.text()}`);
            } else {
                const publicUrl = `${STORAGE_API_URL}/${BUCKET}/${object_key}`;
                console.log(`✅ Cover image stored: ${publicUrl}`);
            }
        }
    }
}

console.log("\n✅ Pipeline test DONE — all steps completed!");
console.log("\n📄 Sample content preview:");
console.log(data.content.slice(0, 500));
