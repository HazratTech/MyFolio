import fs from "fs";
import path from "path";

let apiKey = process.argv[2] || process.env.DEVTO_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            const match = envContent.match(/DEVTO_API_KEY=([^\r\n]+)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) {}
}

if (!apiKey) {
    console.error("❌ DEVTO_API_KEY not found.");
    process.exit(1);
}

function convertRelativeLinksToAbsolute(markdown) {
    if (!markdown) return markdown;
    let md = markdown;

    // 1. Convert markdown links: [text](/path) -> [text](https://relayworks.dev/path)
    md = md.replace(/\[([^\]]+)\]\(\/(?!\/)([^\)\s]+)\)/g, "[$1](https://relayworks.dev/$2)");

    // 2. Convert HTML hrefs: href="/path" or href='/path' -> href="https://relayworks.dev/path"
    md = md.replace(/href=["']\/(?!\/)([^"'\s>]+)["']/g, 'href="https://relayworks.dev/$1"');

    // 3. Convert HTML srcs: src="/path" or src='/path' -> src="https://relayworks.dev/path"
    md = md.replace(/src=["']\/(?!\/)([^"'\s>]+)["']/g, 'src="https://relayworks.dev/$1"');

    return md;
}

async function fixAllLinks() {
    console.log("🔍 Fetching all published articles from Dev.to...");
    const res = await fetch("https://dev.to/api/articles/me/published?per_page=100", {
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch articles: ${res.status}`);
    }

    const articles = await res.json();
    console.log(`📋 Found ${articles.length} published articles.`);

    let updatedCount = 0;

    for (const art of articles) {
        const originalMd = art.body_markdown || "";
        const fixedMd = convertRelativeLinksToAbsolute(originalMd);

        if (fixedMd !== originalMd) {
            process.stdout.write(`Fixing links in "${art.title.substring(0, 45)}..." [ID: ${art.id}]... `);

            const updateRes = await fetch(`https://dev.to/api/articles/${art.id}`, {
                method: "PUT",
                headers: {
                    "api-key": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    article: {
                        body_markdown: fixedMd
                    }
                })
            });

            if (updateRes.ok) {
                updatedCount++;
                console.log("✅ Fixed!");
            } else {
                console.log(`⚠️ Error ${updateRes.status}`);
            }

            await new Promise(r => setTimeout(r, 1100));
        }
    }

    console.log(`\n🎉 Completed! Successfully updated ${updatedCount} articles with absolute relayworks.dev links!`);
}

fixAllLinks();
