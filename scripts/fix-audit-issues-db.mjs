import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/**
 * Audit Remediation Script:
 * 1. Removes `rel="nofollow"` from all internal links in database posts.
 * 2. Replaces broken / hallucinated internal links with valid canonical targets.
 * 3. Cleans malformed external URLs containing trailing HTML artifacts (e.g., </a, </code).
 * 4. Replaces unresolvable placeholder domains (e.g., your-worker-service-url.run.app) with code styling.
 */

// 1. Read MongoDB URI
let uri = process.env.MONGODB_URI;
if (!uri) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            const match = envContent.match(/MONGODB_URI=([^\r\n]+)/);
            if (match) uri = match[1].trim().replace(/^["']|["']$/g, "");
        }
    } catch (e) {
        // ignore
    }
}

if (!uri) {
    console.error("❌ Error: MONGODB_URI not found in .env.local");
    process.exit(1);
}

const PostSchema = new mongoose.Schema({
    slug: String,
    title: String,
    content: String,
    status: String
}, { strict: false });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

const INTERNAL_REPLACEMENTS = [
    { from: /\/ai-software-development/g, to: "/ai-chatbot-development" },
    { from: /\/blog\/minimal-fastapi-deployment-on-digitalocean-a-developer-s-guide/g, to: "/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work" },
    { from: /\/blog\/deploying-a-minimal-fastapi-app-on-digitalocean-a-hands-on-guide/g, to: "/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work" },
    { from: /\/blog\/ktor-fastapi-backend-comparison/g, to: "/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work" },
    { from: /\/blog\/building-discord-ticket-bot-python/g, to: "/blog/mastering-discord-py-building-resilient-scalable-discord-bots" },
    { from: /\/blog\/best-hosting-for-discord-bots-keep-your-bots-online-24-7/g, to: "/blog/mastering-discord-py-building-resilient-scalable-discord-bots" },
    { from: /\/blog\/building-scaling-discord-bots-a-practical-guide-for-founders/g, to: "/blog/building-custom-discord-bots-a-deep-dive-into-development-architecture" },
    { from: /\/blog\/demystifying-android-os-internals/g, to: "/blog/mastering-modern-android-architecture-a-practical-guide-for-robust-apps" },
    { from: /\/blog\/demystifying-android-os-a-deep-dive-for-web-software-engineers/g, to: "/blog/mastering-modern-android-architecture-a-practical-guide-for-robust-apps" },
    { from: /\/blog\/kotlin-multiplatform-mobile-guide/g, to: "/blog/kotlin-news-your-practical-guide-to-the-latest-updates-in-web-mobile-engineering" },
    { from: /\/blog\/unmasking-native-crashes-a-deep-dive-into-seamless-mobile-app-protection/g, to: "/blog/fixing-android-native-crashes-in-react-native-app" },
    { from: /\/blog\/kotlin-unchained-beyond-mobile-powering-backends-bots/g, to: "/blog/kotlin-news-your-practical-guide-to-the-latest-updates-in-web-mobile-engineering" },
    { from: /\/blog\/debunking-llm-output-assumptions-em-dashes-local-model-quirks/g, to: "/blog/five-bugs-in-my-llm-app-that-never-threw-an-error" },
    { from: /\/blog\/local-llm-output-why-my-em-dash-preprocessing-was-flawed/g, to: "/blog/five-bugs-in-my-llm-app-that-never-threw-an-error" },
    { from: /\/blog\/beyond-keywords-building-smart-job-agents-with-fastapi-mongodb/g, to: "/blog/beyond-keyword-matching-the-semantic-gap-in-developer-job-search" },
    { from: /\/blog\/automating-cs-exams-my-8-month-journey-to-an-ai-powered-study-app/g, to: "/blog/the-eval-harness-that-saved-my-rag-pipeline-from-production-failure" },
    { from: /\/blog\/active-inference-in-practice-building-self-curious-ai-agents/g, to: "/blog/architecting-autonomous-systems-from-edge-devices-to-sovereign-ai" },
    { from: /\/blog\/python-benchmarks-the-4300-digit-limit-8-bugs-that-derail-scalability/g, to: "/blog/troubleshooting-misleading-health-checks-in-python-with-launchd" }
];

function cleanPostContent(content) {
    if (!content) return content;
    let md = content;

    // 1. Remap broken internal links
    for (const rep of INTERNAL_REPLACEMENTS) {
        md = md.replace(rep.from, rep.to);
    }

    // 2. Remove nofollow from internal links
    // Handles <a ... rel="noopener noreferrer nofollow" ... href="/..."> or href="https://relayworks.dev/..."
    md = md.replace(/<a([^>]*?)rel=["']([^"']*)["']([^>]*?)href=["'](\/[^"']*|https:\/\/relayworks\.dev[^"']*)["']([^>]*?)>/gi, (match, p1, relVal, p3, hrefVal, p5) => {
        const cleanRel = relVal
            .replace(/\bnofollow\b/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        const relAttr = cleanRel ? `rel="${cleanRel}"` : "";
        return `<a${p1}${relAttr}${p3}href="${hrefVal}"${p5}>`.replace(/\s+/g, " ").replace(/>/g, ">");
    });

    // Also handles when href comes before rel
    md = md.replace(/<a([^>]*?)href=["'](\/[^"']*|https:\/\/relayworks\.dev[^"']*)["']([^>]*?)rel=["']([^"']*)["']([^>]*?)>/gi, (match, p1, hrefVal, p3, relVal, p5) => {
        const cleanRel = relVal
            .replace(/\bnofollow\b/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        const relAttr = cleanRel ? `rel="${cleanRel}"` : "";
        return `<a${p1}href="${hrefVal}"${p3}${relAttr}${p5}>`.replace(/\s+/g, " ").replace(/>/g, ">");
    });

    // 3. Fix malformed external URLs with trailing HTML artifacts
    md = md.replace(/https?:\/\/[^\s\)\"'>]+<\/(?:a|code)>/gi, (match) => {
        return match.replace(/<\/(?:a|code)>$/i, "");
    });

    // 4. Fix non-existent placeholder URLs in markdown links so crawlers don't attempt DNS resolution
    // e.g. [https://your-worker-service-url.run.app/process-task](https://your-worker-service-url.run.app/process-task)
    md = md.replace(/\[([^\]]*your-worker-service-url\.run\.app[^\]]*)\]\(https?:\/\/your-worker-service-url\.run\.app[^)]*\)/gi, "`$1`");
    md = md.replace(/<a[^>]*href=["']https?:\/\/your-worker-service-url\.run\.app[^"']*["'][^>]*>(.*?)<\/a>/gi, "`$1`");

    // Placeholder api.example.com
    md = md.replace(/\[([^\]]*api\.example\.com[^\]]*)\]\(https?:\/\/api\.example\.com[^)]*\)/gi, "`$1`");
    md = md.replace(/<a[^>]*href=["']https?:\/\/api\.example\.com[^"']*["'][^>]*>(.*?)<\/a>/gi, "`$1`");
    
    // Placeholder example.com/api/{i}
    md = md.replace(/\[([^\]]*example\.com\/api\/[^\]]*)\]\(http:\/\/example\.com\/api\/[^)]*\)/gi, "`$1`");
    md = md.replace(/<a[^>]*href=["']http:\/\/example\.com\/api\/[^"']*["'][^>]*>(.*?)<\/a>/gi, "`$1`");

    // Localhost 127.0.0.1 in clickable links
    md = md.replace(/\[([^\]]*127\.0\.0\.1[^\]]*)\]\(http:\/\/127\.0\.0\.1[^)]*\)/gi, "`$1`");
    md = md.replace(/<a[^>]*href=["']http:\/\/127\.0\.0\.1[^"']*["'][^>]*>(.*?)<\/a>/gi, "`$1`");

    return md;
}

async function run() {
    console.log("🔌 Connecting to MongoDB (db: myfolio)...");
    await mongoose.connect(uri, { dbName: "myfolio" });

    const posts = await Post.find({});
    console.log(`📋 Found ${posts.length} total posts in database.\n`);

    let updatedCount = 0;

    for (const post of posts) {
        const originalContent = post.content || "";
        const cleaned = cleanPostContent(originalContent);

        if (cleaned !== originalContent) {
            post.content = cleaned;
            await post.save();
            updatedCount++;
            console.log(`✅ Cleaned post: "${post.slug}"`);
        }
    }

    console.log(`\n🎉 Remediation complete! Successfully updated ${updatedCount} posts in MongoDB.`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
