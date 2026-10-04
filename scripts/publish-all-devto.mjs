/**
 * Bulk Publish All Dev.to Drafts
 * 
 * Usage:
 *   node scripts/publish-all-devto.mjs <YOUR_DEVTO_API_KEY>
 * 
 * To get your Dev.to API key:
 *   1. Visit https://dev.to/settings/extensions
 *   2. Scroll to "DEV Community API Keys"
 *   3. Generate a key with description "Bulk Publish"
 */

const apiKey = process.argv[2] || process.env.DEVTO_API_KEY;

if (!apiKey) {
    console.error("❌ Error: Please provide your Dev.to API key.");
    console.log("Usage: node scripts/publish-all-devto.mjs <YOUR_DEVTO_API_KEY>");
    console.log("Get your key at: https://dev.to/settings/extensions");
    process.exit(1);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            console.log("✅ All articles are already published!");
            return;
        }

        console.log(`🚀 Starting bulk publishing of ${drafts.length} drafts...\n`);

        let publishedCount = 0;

        for (const draft of drafts) {
            try {
                process.stdout.write(`Publishing "${draft.title.substring(0, 50)}..." [ID: ${draft.id}]... `);

                const updateRes = await fetch(`https://dev.to/api/articles/${draft.id}`, {
                    method: "PUT",
                    headers: {
                        "api-key": apiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        article: {
                            published: true
                        }
                    })
                });

                if (updateRes.ok) {
                    publishedCount++;
                    console.log("✅ Published!");
                } else {
                    const errText = await updateRes.text();
                    console.log(`❌ Failed: ${updateRes.status} (${errText})`);
                }

                // Sleep 1 second to respect Dev.to rate limits
                await sleep(1000);
            } catch (err) {
                console.log(`❌ Error: ${err.message}`);
            }
        }

        console.log(`\n🎉 Successfully published ${publishedCount} / ${drafts.length} articles on Dev.to!`);
        console.log("Your articles are now live with canonical URLs pointing back to relayworks.dev!");
    } catch (err) {
        console.error("❌ Fatal error:", err);
    }
}

bulkPublish();
