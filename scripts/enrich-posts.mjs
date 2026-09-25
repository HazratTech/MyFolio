import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;

if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment");
    process.exit(1);
}

if (!OPEN_AI_KEY) {
    console.error("Missing OPEN_AI_KEY in environment");
    process.exit(1);
}

async function callOpenAI(prompt) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPEN_AI_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a Principal Software Architect at RelayWorks (https://relayworks.dev). Return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })
    });

    if (!res.ok) {
        throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
}

async function main() {
    await mongoose.connect(MONGODB_URI, { dbName: "myfolio" });
    console.log("Connected to MongoDB (myfolio)");

    const posts = await mongoose.connection.collection("posts")
        .find({ status: "published" }, { projection: { title: 1, slug: 1, content: 1, category: 1, faq: 1 } })
        .toArray();

    console.log(`Found ${posts.length} published posts to inspect.`);

    let enrichedCount = 0;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const hasTakeaways = post.content.includes("takeaways-box");
        const hasFaq = post.faq && Array.isArray(post.faq) && post.faq.length > 0;

        if (hasTakeaways && hasFaq) {
            console.log(`[${i + 1}/${posts.length}] Skipping "${post.slug}" (already enriched)`);
            continue;
        }

        console.log(`[${i + 1}/${posts.length}] Enriching "${post.title}" (${post.slug})...`);

        try {
            const prompt = `Analyze this technical article excerpt and produce:
1. "takeaways": 3-4 concrete bullet points for an "Executive Summary & Key Takeaways" card (concise, high information gain, zero AI fluff).
2. "faq": 3 authoritative FAQs (practical questions that senior engineers or developers actually search for, with crisp, comprehensive answers).

TITLE: "${post.title}"
CATEGORY: "${post.category || "Engineering"}"
CONTENT EXCERPT:
${post.content.replace(/<[^>]*>/g, " ").slice(0, 3000)}

Return ONLY JSON:
{
  "takeaways": [
    {"bold": "Actionable takeaway title", "detail": "Concrete explanation and engineering outcome"}
  ],
  "faq": [
    {"question": "Practical technical question", "answer": "Clear, direct technical answer"}
  ]
}`;

            const parsed = await callOpenAI(prompt);
            const updateFields = {};

            // 1. Inject Key Takeaways if missing
            if (!hasTakeaways && parsed.takeaways && parsed.takeaways.length > 0) {
                const takeawaysHtml = `\n<div class="takeaways-box">
  <h4 class="takeaways-title">Executive Summary & Key Takeaways</h4>
  <ul>
${parsed.takeaways.map((t) => `    <li><strong>${t.bold}:</strong> ${t.detail}</li>`).join("\n")}
  </ul>
</div>\n`;

                let updatedContent = post.content;
                // Insert after the first <h2> or after the first paragraph
                const firstH2Match = updatedContent.match(/<h2[^>]*>/i);
                if (firstH2Match && firstH2Match.index !== undefined) {
                    const h2End = updatedContent.indexOf("</h2>", firstH2Match.index);
                    if (h2End !== -1) {
                        const insertPos = h2End + 5;
                        updatedContent = updatedContent.slice(0, insertPos) + takeawaysHtml + updatedContent.slice(insertPos);
                    } else {
                        updatedContent = takeawaysHtml + updatedContent;
                    }
                } else {
                    updatedContent = takeawaysHtml + updatedContent;
                }
                updateFields.content = updatedContent;
                console.log(`    ✅ Injected Key Takeaways box`);
            }

            // 2. Set FAQ if missing
            if (!hasFaq && parsed.faq && parsed.faq.length > 0) {
                updateFields.faq = parsed.faq;
                console.log(`    ✅ Stored ${parsed.faq.length} FAQ items for Schema.org FAQPage`);
            }

            if (Object.keys(updateFields).length > 0) {
                await mongoose.connection.collection("posts").updateOne(
                    { _id: post._id },
                    { $set: updateFields }
                );
                enrichedCount++;
            }

            // Short polite delay
            await new Promise((r) => setTimeout(r, 600));
        } catch (err) {
            console.error(`    ❌ Failed to enrich ${post.slug}:`, err instanceof Error ? err.message : String(err));
        }
    }

    console.log(`\n🎉 Enrichment complete! Enriched ${enrichedCount} posts with E-E-A-T Takeaways & FAQ schemas.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
