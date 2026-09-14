import fs from 'fs';
import mongoose from 'mongoose';

const envContent = fs.readFileSync('/Volumes/SSD/Coding/website/myfolio/.env.local', 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const idx = l.indexOf('=');
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
  })
);

const slugsToDelete = [
  // Pure sales pitch / affiliate marketing slop
  "ai-chatbot-development-services-boost-conversions-cx",
  "unlock-business-growth-custom-ai-chatbots-agents-deliver-real-roi",
  "why-hiring-an-android-app-developer-saves-months-of-time",
  "boost-engagement-custom-discord-bot-development-solutions",
  "best-hosting-for-discord-bots-keep-your-bots-online-24-7",

  // Truncated mid-sentence / broken endings
  "python-benchmarks-the-4300-digit-limit-8-bugs-that-derail-scalability",
  "integrating-webrtc-into-py-libp2p-a-practical-guide-for-p2p",
  "building-scaling-discord-bots-a-practical-guide-for-founders",
  "unmasking-native-crashes-a-deep-dive-into-seamless-mobile-app-protection",
  "automating-cs-exams-my-8-month-journey-to-an-ai-powered-study-app",
  "active-inference-in-practice-building-self-curious-ai-agents",
  "kotlin-unchained-beyond-mobile-powering-backends-bots",
  "minimal-fastapi-deployment-on-digitalocean-a-developer-s-guide",
  "deploying-a-minimal-fastapi-app-on-digitalocean-a-hands-on-guide",
  "local-llm-output-why-my-em-dash-preprocessing-was-flawed",
  "debunking-llm-output-assumptions-em-dashes-local-model-quirks",
  "beyond-keywords-building-smart-job-agents-with-fastapi-mongodb",
  "mastering-python-for-high-performance-backends-smarter-discord-bots",

  // Redundant duplicates / cannibalized topics
  "python-automation-saving-209-itr-hours-for-a-ca-firm",
  "build-a-python-mcp-server-github-api-context-management",
  "mastering-python-mcp-servers-a-practical-github-api-integration-guide",
  "building-a-production-ready-python-mcp-server-with-fastapi-and-github-api",
  "beyond-the-headlines-practical-insights-from-the-latest-android-dev-news-for-kotlin-and-compose-developers",

  // Thin generic AI filler (<1000 words & generic overview)
  "demystifying-android-os-a-deep-dive-for-web-software-engineers",
  "demystifying-ios-development-a-practical-guide-for-web-software-engineers",
  "deep-dive-into-ios-development-practical-strategies-for-web-software-engineers",
  "mastering-python-for-web-and-software-engineering-a-practical-deep-dive"
];

async function run() {
  await mongoose.connect(envVars.MONGODB_URI, { dbName: 'myfolio' });
  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));

  console.log(`Starting deletion of ${slugsToDelete.length} low-quality/thin/truncated posts...`);
  
  const result = await Post.deleteMany({ slug: { $in: slugsToDelete } });
  console.log(`Successfully deleted ${result.deletedCount} posts from MongoDB.`);

  const remaining = await Post.countDocuments();
  console.log(`Remaining high-quality posts in DB: ${remaining}`);

  await mongoose.disconnect();
}

run();
