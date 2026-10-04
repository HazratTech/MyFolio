import fs from "fs";
import path from "path";

/**
 * Bulk Publish All Dev.to Drafts & Clean Metadata
 * 
 * Usage:
 *   node scripts/publish-all-devto.mjs <YOUR_DEVTO_API_KEY>
 * 
 * Or reads DEVTO_API_KEY from .env.local
 */

let apiKey = process.argv[2] || process.env.DEVTO_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            const match = envContent.match(/DEVTO_API_KEY=([^\r\n]+)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) {
        // ignore
    }
}

if (!apiKey) {
    console.error("❌ Error: Please provide your Dev.to API key.");
    console.log("Usage: node scripts/publish-all-devto.mjs <YOUR_DEVTO_API_KEY>");
    console.log("Get your key at: https://dev.to/settings/extensions");
    process.exit(1);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanAndPrepareMarkdown(rawMarkdown) {
    if (!rawMarkdown) return { cleanMd: rawMarkdown, coverImage: null };

    let md = rawMarkdown;

    // 1. Extract cover_image if present
    const coverMatch = md.match(/cover_image:\s*"(https?:\/\/[^"]+)"/) || md.match(/cover_image:\s*(https?:\/\/\S+)/);
    const coverImage = coverMatch ? coverMatch[1].replace(/"/g, '') : null;

    // 2. Ensure top frontmatter block flips published: false -> published: true
    let cleanMd = md.replace(/^published:\s*false/m, "published: true");

    // 3. If cover_image exists and top block doesn't have it, insert it
    if (coverImage && !cleanMd.includes(`cover_image:`)) {
        cleanMd = cleanMd.replace(/^(---\ntitle:[^\n]+\npublished: true\n)/m, `$1cover_image: ${coverImage}\n`);
    }

    // 4. Remove the secondary/duplicate frontmatter block that was rendered inside the post content
    cleanMd = cleanMd.replace(/\n*---\s*\ntitle:\s*"[^"]+"\npublished:\s*(true|false)[\s\S]*?---\s*\n*/m, "\n\n");

    return { cleanMd: cleanMd.trim(), coverImage };
}

async function bulkPublish() {
    console.log("🔍 Fetching all articles from Dev.to...");

    try {
        const res = await fetch("https://dev.to/api/articles/me/all?per_page=100", {
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch articles: ${res.status} ${res.statusText}`);
        }

        const articles = await res.json();
        const drafts = articles.filter(a => !a.published);

        console.log(`📋 Total articles found: ${articles.length}`);
        console.log(`📝 Unpublished drafts found: ${drafts.length}`);

        if (drafts.length === 0) {
            console.log("✅ All drafts are published! Checking already published articles for cleanup...");
        } else {
            console.log(`🚀 Starting bulk publishing & cleanup of ${drafts.length} drafts...\n`);
        }

        let publishedCount = 0;

        for (const draft of drafts) {
            try {
                process.stdout.write(`Publishing "${draft.title.substring(0, 45)}..." [ID: ${draft.id}]... `);

                const { cleanMd } = cleanAndPrepareMarkdown(draft.body_markdown);

                const updateRes = await fetch(`https://dev.to/api/articles/${draft.id}`, {
                    method: "PUT",
                    headers: {
                        "api-key": apiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        article: {
                            body_markdown: cleanMd,
                            published: true
                        }
                    })
                });

                if (updateRes.ok) {
                    publishedCount++;
                    console.log("✅ Published & Cleaned!");
                } else {
                    const errText = await updateRes.text();
                    console.log(`❌ Failed: ${updateRes.status} (${errText})`);
                }

                // Sleep 1.2 seconds to safely respect Dev.to rate limits
                await sleep(1200);
            } catch (err) {
                console.log(`❌ Error: ${err.message}`);
            }
        }

        console.log(`\n🎉 Processed ${publishedCount} / ${drafts.length} drafts.`);

        // Now clean up any already-published articles that still have the duplicate frontmatter block
        console.log("\n🧹 Checking already published articles for any leftover raw metadata sections...");
        const pubRes = await fetch("https://dev.to/api/articles/me/published?per_page=100", {
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json"
            }
        });

        if (pubRes.ok) {
            const publishedArticles = await pubRes.json();
            for (const art of publishedArticles) {
                if (art.body_markdown && art.body_markdown.match(/\n*---\s*\ntitle:\s*"[^"]+"\npublished:/m)) {
                    process.stdout.write(`Cleaning metadata from "${art.title.substring(0, 45)}..." [ID: ${art.id}]... `);
                    const { cleanMd } = cleanAndPrepareMarkdown(art.body_markdown);
                    const updateRes = await fetch(`https://dev.to/api/articles/${art.id}`, {
                        method: "PUT",
                        headers: {
                            "api-key": apiKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            article: {
                                body_markdown: cleanMd,
                                published: true
                            }
                        })
                    });
                    if (updateRes.ok) {
                        console.log("✨ Cleaned!");
                    } else {
                        console.log(`⚠️ Skip: ${updateRes.status}`);
                    }
                    await sleep(1200);
                }
            }
        }

        console.log("\n🚀 All done! All articles are live on Dev.to with clean styling and canonical links pointing back to relayworks.dev!");
    } catch (err) {
        console.error("❌ Fatal error:", err);
    }
}

bulkPublish();
