import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/**
 * Migration Script:
 * Seeds all legacy static redirects from next.config.mjs into the MongoDB Redirects collection.
 * This makes redirection 100% dynamic, self-healing, and database-driven without needing
 * app rebuilds or manual additions to next.config.mjs.
 */

let uri = process.env.MONGODB_URI;
if (!uri) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            const match = envContent.match(/MONGODB_URI=([^\r\n]+)/);
            if (match) uri = match[1].trim().replace(/^["']|["']$/g, "");
        }
    } catch (e) {}
}

if (!uri) {
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
}

const RedirectSchema = new mongoose.Schema({
    source: { type: String, required: true, unique: true, index: true },
    destination: { type: String, required: true },
    permanent: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
    lastAccessedAt: { type: Date }
}, { timestamps: true });

const Redirect = mongoose.models.Redirect || mongoose.model("Redirect", RedirectSchema);

const STATIC_REDIRECTS = [
    { source: '/blog/tag/CI/CD', destination: '/blog' },
    { source: '/blog/unmasking-silent-killers', destination: '/blog' },
    { source: '/blog/avoiding-unintended-side-effects-of-code-optimization', destination: '/blog' },
    { source: '/blog/common-kotlin-performance-anti-patterns', destination: '/blog' },
    { source: '/blog/debugging-performance-related-feature-failures', destination: '/blog' },
    { source: '/blog/defensive-optimization-best-practices', destination: '/blog' },
    { source: '/blog/integrating-performance-tests-into-ci-cd-kotlin', destination: '/blog' },
    { source: '/blog/kotlin-coroutine-flows', destination: '/blog' },
    { source: '/blog/kotlin-performance-optimization-dangers', destination: '/blog' },
    { source: '/blog/performance-regression-testing-strategies', destination: '/blog' },
    { source: '/blog/silent-feature-bugs-from-database-bounding', destination: '/blog' },
    { source: '/blog/ai-chatbot-development-services-boost-conversions-cx', destination: '/ai-chatbot-development' },
    { source: '/blog/unlock-business-growth-custom-ai-chatbots-agents-deliver-real-roi', destination: '/ai-chatbot-development' },
    { source: '/blog/why-hiring-an-android-app-developer-saves-months-of-time', destination: '/mobile-app-development' },
    { source: '/blog/boost-engagement-custom-discord-bot-development-solutions', destination: '/discord-bot' },
    { source: '/blog/best-hosting-for-discord-bots-keep-your-bots-online-24-7', destination: '/discord-bot' },
    { source: '/blog/building-scaling-discord-bots-a-practical-guide-for-founders', destination: '/blog/building-custom-discord-bots-a-deep-dive-into-development-architecture' },
    { source: '/blog/python-automation-saving-209-itr-hours-for-a-ca-firm', destination: '/blog/automating-itr-filings-a-python-script-s-209-hour-efficiency-gain' },
    { source: '/blog/build-a-python-mcp-server-github-api-context-management', destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation' },
    { source: '/blog/mastering-python-mcp-servers-a-practical-github-api-integration-guide', destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation' },
    { source: '/blog/building-a-production-ready-python-mcp-server-with-fastapi-and-github-api', destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation' },
    { source: '/blog/beyond-the-headlines-practical-insights-from-the-latest-android-dev-news-for-kotlin-and-compose-developers', destination: '/blog/mastering-android-dev-news-boost-compose-performance-with-latest-tools' },
    { source: '/blog/beyond-keywords-building-smart-job-agents-with-fastapi-mongodb', destination: '/blog/beyond-keyword-matching-the-semantic-gap-in-developer-job-search' },
    { source: '/blog/deploying-a-minimal-fastapi-app-on-digitalocean-a-hands-on-guide', destination: '/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work' },
    { source: '/blog/minimal-fastapi-deployment-on-digitalocean-a-developer-s-guide', destination: '/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work' },
    { source: '/blog/local-llm-output-why-my-em-dash-preprocessing-was-flawed', destination: '/blog/five-bugs-in-my-llm-app-that-never-threw-an-error' },
    { source: '/blog/debunking-llm-output-assumptions-em-dashes-local-model-quirks', destination: '/blog/five-bugs-in-my-llm-app-that-never-threw-an-error' },
    { source: '/blog/unmasking-native-crashes-a-deep-dive-into-seamless-mobile-app-protection', destination: '/blog/fixing-android-native-crashes-in-react-native-app' },
    { source: '/blog/demystifying-android-os-a-deep-dive-for-web-software-engineers', destination: '/blog/mastering-modern-android-architecture-a-practical-guide-for-robust-apps' },
    { source: '/blog/demystifying-ios-development-a-practical-guide-for-web-software-engineers', destination: '/blog/master-ios-dev-a-comprehensive-guide-for-2024' },
    { source: '/blog/deep-dive-into-ios-development-practical-strategies-for-web-software-engineers', destination: '/blog/master-ios-dev-a-comprehensive-guide-for-2024' },
    { source: '/blog/kotlin-unchained-beyond-mobile-powering-backends-bots', destination: '/blog/kotlin-news-your-practical-guide-to-the-latest-updates-in-web-mobile-engineering' },
    { source: '/blog/python-benchmarks-the-4300-digit-limit-8-bugs-that-derail-scalability', destination: '/blog' },
    { source: '/blog/integrating-webrtc-into-py-libp2p-a-practical-guide-for-p2p', destination: '/blog' },
    { source: '/blog/automating-cs-exams-my-8-month-journey-to-an-ai-powered-study-app', destination: '/blog' },
    { source: '/blog/active-inference-in-practice-building-self-curious-ai-agents', destination: '/blog' },
    { source: '/blog/mastering-python-for-high-performance-backends-smarter-discord-bots', destination: '/blog' },
    { source: '/blog/mastering-python-for-web-and-software-engineering-a-practical-deep-dive', destination: '/blog' },
    { source: '/ai-software-development', destination: '/ai-chatbot-development' },
    { source: '/blog/building-discord-ticket-bot-python', destination: '/discord-bot' },
    { source: '/blog/ktor-fastapi-backend-comparison', destination: '/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work' },
    { source: '/blog/kotlin-multiplatform-mobile-guide', destination: '/mobile-app-development' },
    { source: '/blog/demystifying-android-os-internals', destination: '/blog/mastering-modern-android-architecture-a-practical-guide-for-robust-apps' }
];

async function seed() {
    console.log("🔌 Connecting to MongoDB (myfolio)...");
    await mongoose.connect(uri, { dbName: "myfolio" });

    let upserted = 0;
    for (const r of STATIC_REDIRECTS) {
        await Redirect.findOneAndUpdate(
            { source: r.source },
            { source: r.source, destination: r.destination, permanent: true },
            { upsert: true }
        );
        upserted++;
    }

    console.log(`🎉 Successfully seeded ${upserted} redirects into MongoDB!`);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error("❌ Error seeding redirects:", err);
    process.exit(1);
});
