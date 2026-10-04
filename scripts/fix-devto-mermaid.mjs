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

function transformMermaidToImages(markdown) {
    if (!markdown) return markdown;
    let md = markdown;

    // 1. Remove "Description: Mermaid.js..." prompt residue
    md = md.replace(/Description:\s*(?:Mermaid\.js|Flowchart|Diagram|Visual)[\s\S]*?(?=\n\n[#A-Z<]|\n<h|\s*$)/gi, "");

    // 2. Convert <div class="mermaid">...</div> blocks into static images
    md = md.replace(/<div class="mermaid">\s*([\s\S]*?)\s*<\/div>/gi, (match, code) => {
        const cleanCode = code.replace(/<[^>]+>/g, "").trim();
        const base64 = Buffer.from(cleanCode).toString("base64");
        return `\n\n![Architecture Diagram](https://mermaid.ink/img/${base64})\n\n`;
    });

    // 3. Convert raw graph / sequenceDiagram blocks that lost their div tags
    md = md.replace(/(?:^|\n)(graph\s+(?:TD|LR|TB|BT|RL)[\s\S]*?)(?=\n\n(?:[#A-Z<]|Description:)|\s*$)/gi, (match, code) => {
        const cleanCode = code.replace(/<\/div>/g, "").replace(/<[^>]+>/g, "").trim();
        const base64 = Buffer.from(cleanCode).toString("base64");
        return `\n\n![Architecture Diagram](https://mermaid.ink/img/${base64})\n\n`;
    });

    return md;
}

async function fixAllMermaid() {
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
        const fixedMd = transformMermaidToImages(originalMd);

        if (fixedMd !== originalMd) {
            process.stdout.write(`Rendering diagrams for "${art.title.substring(0, 45)}..." [ID: ${art.id}]... `);

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
                console.log("🖼️ Rendered!");
            } else {
                console.log(`⚠️ Error ${updateRes.status}`);
            }

            await new Promise(r => setTimeout(r, 1200));
        }
    }

    console.log(`\n🎉 Completed! Successfully converted Mermaid diagrams to visual images in ${updatedCount} articles!`);
}

fixAllMermaid();
