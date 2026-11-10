// Seed script for initial high-quality leads across Discord Bots, Mobile Apps, AI & Chatbots, and Backend

const leads = [
  {
    title: "CRUD iOS Companion App with VisionKit & REST API",
    company: "T. Jacob (Independent Project)",
    category: "Mobile Apps",
    decisionMaker: "T. Jacob",
    email: "tjacob981@gmail.com",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=45802427",
    status: "New",
    score: 95,
    confidence: "High",
    painSignal: "Bootstrapping an iOS app to companion an existing web application: User Login + FaceID, CRUD operations on items, camera photo upload, VisionKit OCR text detection on images, background REST API uploads, and Apple App Store publishing.",
    techStack: ["Swift", "SwiftUI", "VisionKit", "REST API", "FaceID Keychain"],
    personalizedEmail: {
      subject: "re: HN post (iOS VisionKit app for your backend)",
      body: `Hi Jacob,

Saw your post on HN looking for an iOS developer for the CRUD + VisionKit companion app.

I run RelayWorks (https://relayworks.dev) — I build native iOS (Swift / SwiftUI) and Android apps for founders and backend developers.

For the exact features you listed:
• FaceID & Auth: LocalAuthentication framework storing session tokens in iOS Keychain.
• OCR / Vision: On-device VNRecognizeTextRequest to extract text directly from the camera/gallery before payload transmission.
• Background Uploads: Configured background URLSession so image uploads don't drop if users switch apps.
• Store Approval: 100% App Store Acceptance Guarantee — I handle provisioning, privacy manifests, and resolve all Apple review notes until approved.

Timeline & Terms:
• 2 to 3 weeks to a production App Store build.
• Fixed project price ($1,500 – $2,000 depending on final screen count).
• Weekly Apple TestFlight builds delivered to your iPhone so you can test before approving milestones.

If you haven't selected a developer yet, feel free to reply here or reach out directly on Telegram (@hazratummar) or Discord (@ihazratummar).

Best,
Hazrat Ummar
Founder & Lead Engineer, RelayWorks
Portfolio: https://relayworks.dev`
    },
    notes: "Direct founder with allocated budget and clear technical scope."
  },
  {
    title: "AI Agent Builder Network Onboarding",
    company: "Pond AI",
    category: "AI & Chatbots",
    decisionMaker: "Dylan",
    email: "dylan@joinpond.ai",
    source: "Hacker News Who is Hiring Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=50338728",
    status: "New",
    score: 95,
    confidence: "High",
    painSignal: "Most non-tech businesses know exactly which workflows they want AI agents to handle, but have no one to build, connect and run them. Pond delivers custom AI agents to these businesses through a network of 7k AI builders.",
    techStack: ["Python", "FastAPI", "LangGraph", "pgvector", "RAG Guardrails"],
    personalizedEmail: {
      subject: "Pond AI Builder Network / RelayWorks (FastAPI + LangGraph)",
      body: `Hi Dylan,

Saw your note on HN regarding Pond AI's builder network connecting businesses with custom AI agent developers.

I run RelayWorks (https://relayworks.dev). I engineer deterministic AI chatbots, RAG pipelines, and conversational automations using Python FastAPI, LangGraph, pgvector, and strict hallucination guardrails.

Systems I typically deliver for clients:
1. Lead Qualification & Scheduling Agents: Automated meeting booking and CRM syncing across web, WhatsApp, and Telegram.
2. Knowledge-Base RAG: Hybrid BM25 + vector search with exact source attribution for zero hallucinated answers.
3. Multi-Channel Support Bots: Handling 24/7 customer queries with seamless human escalation.

Would love to join the Pond builder roster and take on incoming client agent builds. What does your onboarding process look like?

Best,
Hazrat Ummar
https://relayworks.dev
Telegram: @hazratummar | Discord: @ihazratummar`
    },
    notes: "Platform delivering client deal flow for AI chatbot development."
  },
  {
    title: "Developer Community Integrations & Automation Bot",
    company: "Substrate Labs",
    category: "Discord Bots",
    decisionMaker: "Ben & Rob",
    email: "founders@substratelabs.com",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=50338728",
    status: "New",
    score: 90,
    confidence: "High",
    painSignal: "Ex-Stripe and ex-Substack founders building developer infrastructure; looking for contract engineers for community automation, API webhook pipelines, and bot tooling.",
    techStack: ["Python 3.12", "discord.py", "Discord Components V2", "Stripe API", "AsyncIO"],
    personalizedEmail: {
      subject: "re: HN post (Discord bot & automated integrations for Substrate)",
      body: `Hi Ben & Rob,

Saw your note on HN regarding developer integrations and automation for Substrate Labs.

I run RelayWorks (https://relayworks.dev) — I specialize in building custom Discord bots, developer tooling, and webhook automation engines (Python 3.12, modern Discord Components V2, and async architecture).

A few relevant production builds:
• ClutchBot: Real-time match data parsing, Claude AI roasts, and squad queue coordination.
• Clipping Club: High-throughput creator bounty engine tracking TikTok, YouTube, and X views with automated payout CSVs.
• OP Shop: 55-module Discord economy engine handling escrow and role verification with zero downtime.

I focus heavily on clean architecture, thread safety, and non-blocking concurrency.

Available to take on your integration backlog on a flexible contract basis. Let me know if you'd like to sync on Telegram (@hazratummar) or review past client bots.

Best,
Hazrat Ummar
https://relayworks.dev`
    },
    notes: "Ex-Stripe founders building developer platform."
  },
  {
    title: "Event Registration Infrastructure & Backend Optimization",
    company: "GetRegistered",
    category: "Backend",
    decisionMaker: "Team",
    email: "hn@getregistered.com",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=50338728",
    status: "New",
    score: 88,
    confidence: "High",
    painSignal: "Event registration platform seeking an experienced DevOps/Backend freelancer to help manage and enhance their GCP + Terraform + GitLab stack in a SOC2/PCI environment with zero downtime.",
    techStack: ["Node.js", "TypeScript", "PostgreSQL", "GCP", "Terraform", "Docker"],
    personalizedEmail: {
      subject: "re: HN post (Backend & Infrastructure support for GetRegistered)",
      body: `Hi team,

Reaching out regarding your Hacker News note looking for engineering support on GetRegistered's event platform.

I'm an independent engineer running RelayWorks (https://relayworks.dev), building resilient backend services and high-throughput web systems (TypeScript, Node.js, PostgreSQL, Docker, and GCP).

Because event registration traffic spikes unpredictably during launch drops, my focus is on sub-second query performance, clean database indexing, and fault-tolerant webhook processing.

My portfolio is live at https://relayworks.dev, and I can begin immediately on a flexible contract basis.

Best,
Hazrat Ummar
hazratummar9@gmail.com | Telegram: @hazratummar`
    },
    notes: "High-throughput event infrastructure contract."
  },
  {
    title: "AI Revenue & Hospitality Pricing Agent",
    company: "myDataValue",
    category: "AI & Chatbots",
    decisionMaker: "Martin",
    email: "martin@mydatavalue.com",
    source: "Hacker News Who is Hiring Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=50338728",
    status: "New",
    score: 90,
    confidence: "High",
    painSignal: "Building autonomous AI agents that manage revenue, dynamic pricing, and guest messaging for short-term rental and hotel operators on Booking.com and Airbnb.",
    techStack: ["Python", "FastAPI", "Autonomous Agents", "LangGraph", "PostgreSQL"],
    personalizedEmail: {
      subject: "re: HN post (AI revenue & pricing agents for myDataValue)",
      body: `Hi Martin,

Saw your note on HN regarding myDataValue's autonomous AI agents managing revenue and messaging for hotel and short-term rental operators.

I run RelayWorks (https://relayworks.dev) — I build deterministic AI agents and backend microservices using Python FastAPI, LangGraph, and relational vector pipelines.

For hospitality automation, reliability is critical — an agent can never quote an invalid rate or send hallucinatory check-in instructions. I specialize in strict Pydantic schema validation, tool-calling guardrails, and idempotent booking webhook pipelines.

Would love to discuss how I can help your team ship agent capabilities faster on a fixed sprint or contractor agreement.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    },
    notes: "AI agent engineering in hospitality domain."
  },
  {
    title: "Senior Mobile Application Rebuild for Media Brand",
    company: "Xolvio",
    category: "Mobile Apps",
    decisionMaker: "Kevin Matthews",
    email: "kevin@xolvio.com",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=46858206",
    status: "New",
    score: 85,
    confidence: "High",
    painSignal: "Seeking a senior mobile freelancer to rebuild the mobile app of a well-known media brand. Full-time or flexible contract, coordinating during Eastern Time Zone working hours.",
    techStack: ["Native Android", "Kotlin", "Jetpack Compose", "SwiftUI", "Offline Sync"],
    personalizedEmail: {
      subject: "re: HN post (Senior mobile rebuild for media brand)",
      body: `Hi Kevin,

Reaching out regarding your Hacker News post looking for a senior mobile engineer to help rebuild the mobile app for the media brand.

I run RelayWorks (https://relayworks.dev), an independent software studio. My production background is in native mobile architecture across Android (Kotlin / Jetpack Compose) and multi-platform companion tools.

Key strengths relevant to a high-volume media app:
• High-throughput content feeds with smooth 60fps scrolling and local SQLite/Room caching.
• Reliable background media playback and audio/video streaming resilience.
• Clean modular architecture with strict separation of concerns.

I am used to Eastern Time collaboration and async communication. My portfolio is at https://relayworks.dev and LinkedIn is https://www.linkedin.com/in/hazratummar/.

If the contract is still open, I'd be glad to discuss the existing app's bottlenecks.

Best,
Hazrat Ummar`
    },
    notes: "Media brand rebuild through agency partner."
  },
  {
    title: "WhatsApp & Instagram Commerce Reconciliation Backend",
    company: "Cuanto (YC19)",
    category: "Backend",
    decisionMaker: "Jose",
    email: "founders@cuanto.app",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=40348920",
    status: "New",
    score: 90,
    confidence: "High",
    painSignal: "Latin American merchant platform (YC19) helping entrepreneurs run businesses over WhatsApp and Instagram. Needs developer support for financial reconciliation, payment webhooks, and chat commerce automation.",
    techStack: ["Node.js", "Python FastAPI", "WhatsApp Cloud API", "Stripe", "PostgreSQL"],
    personalizedEmail: {
      subject: "WhatsApp & Chat Commerce Reconciliation — RelayWorks",
      body: `Hi Jose,

Saw your note on HN regarding Cuanto's merchant automation across WhatsApp and social channels.

I build custom conversational bots and webhook engines across the Meta WhatsApp Cloud API, Instagram Webhooks, and payment processors (Node.js and Python FastAPI).

I focus specifically on:
• Idempotent webhook processing to eliminate duplicate charges or missed orders.
• Real-time reconciliation queues syncing payment state with chat sessions.
• Fast shipping without agency layers.

Would love to chat about your current integration backlog and see where I can help Cuanto ship faster.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    },
    notes: "YC19 startup in chat commerce."
  },
  {
    title: "Community Tournament & Verification Discord Bot",
    company: "Web3 PvP Project (Base Chain)",
    category: "Discord Bots",
    decisionMaker: "Project Lead",
    email: "dev@basepvp.xyz",
    source: "Hacker News Freelancer Feed",
    sourceUrl: "https://news.ycombinator.com/item?id=40348920",
    status: "New",
    score: 85,
    confidence: "Medium",
    painSignal: "Web3 gaming project launching on Base chain looking for Discord bot developer to build community onboarding, wallet verification, leaderboard tracking, and match matchmaking queues.",
    techStack: ["Python 3.12", "discord.py", "Components V2", "Ethers.js / Web3", "SQLite"],
    personalizedEmail: {
      subject: "re: Discord tournament & verification bot for your Base project",
      body: `Hi,

Saw your post regarding the Discord community bot for your Web3 PvP project on Base.

I build high-concurrency Discord bots using Python 3.12 and modern Discord Components V2 (https://relayworks.dev). 

I've built similar community engines:
• Veridex RPG: Dynamic faction warfare (Everdoom vs Utopia), automated rank progression, and territory battles.
• ClutchBot: Competitive matchmaking queues, player stat tracking, and post-match event coordination.
• Clipping Club: Non-custodial bio verification and automated crypto payout ledgers.

For your project, I can build wallet verification, automated match queues, and live leaderboard announcements within 2 weeks for a fixed scope ($1,200 – $1,800).

Let me know if you'd like to discuss the mechanics on Telegram (@hazratummar) or Discord (@ihazratummar).

Best,
Hazrat Ummar
https://relayworks.dev`
    },
    notes: "Base chain gaming community bot."
  }
];

async function seed() {
  console.log("Seeding initial verified leads to /api/admin/leads...");
  for (const lead of leads) {
    try {
      const res = await fetch("http://localhost:3000/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      const data = await res.json();
      console.log(`[Status ${res.status}] Added: ${lead.company} (${lead.category}) -> ID: ${data._id}`);
    } catch (e) {
      console.error(`Failed to add lead: ${lead.company}`, e.message);
    }
  }
}

seed();
