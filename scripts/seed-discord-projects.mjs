// Using fetch against running local Next.js dev server

const newProjects = [
  {
    id: 5,
    title: "ClutchBot — Valorant Squad Assistant & AI Match Roaster",
    category: "Discord Bots",
    tags: ["Python 3.12", "discord.py", "Claude 3.5 Haiku", "HenrikDev API", "SQLite WAL", "Components V2"],
    images: ["/images/projects/clutchbot.jpg"],
    image: "/images/projects/clutchbot.jpg",
    githubUrl: "",
    liveUrl: "https://relayworks.dev/discord-bot",
    description: "An enterprise-grade, high-concurrency Discord bot tailored for Valorant friend groups and esports teams. Built with clean architecture, strict non-blocking concurrency, and modern Discord Components V2.\n\nKey Capabilities & Architecture:\n• Post-Game Squad Roasts (/recap): Automated background match detection across squad members using HenrikDev Valorant API, analyzing MVP, bottom-frag, K/D, headshot %, and ACS. Generates contextual, humorous AI roasts powered by Anthropic Claude 3.5 Haiku.\n• Valorant Wrapped (/wrapped): Monthly squad recap celebrating top carry, win rates, clutch statistics, and favorite agents/maps with Spotify-Wrapped style narrative headlines.\n• Squad-Up Queue Coordination (/queue): Dual-timezone synchronization across Oslo (CET/CEST) and Saigon (ICT) with interactive RSVP buttons and automated Discord Scheduled Events.\n• AI Performance Coach (/coach): Deep statistical audit across the player's last 20 competitive matches, pinpointing primary gameplay leaks and actionable mechanical tips.\n• Solid Engineering: Repository pattern with thread-safe SQLite in WAL mode, async in-memory TTLCache, dynamic asset synchronization via valorant-api.com, and zero legacy embeds."
  },
  {
    id: 6,
    title: "Clipping Club — Creator Campaign & Bounty Platform",
    category: "Discord Bots",
    tags: ["Python 3.12", "Discord Components V2", "PostgreSQL", "Supabase", "TikTok API", "YouTube Data API", "USDT Webhooks"],
    images: ["/images/projects/clippingclub.jpg"],
    image: "/images/projects/clippingclub.jpg",
    githubUrl: "",
    liveUrl: "https://relayworks.dev/discord-bot",
    description: "Enterprise-grade Discord clipping campaign platform (ClipGG alternative) engineered for creator marketing agencies and esports brands. Built with Python 3.12, Discord Components V2 (LayoutView), and async PostgreSQL storage.\n\nKey Capabilities & Architecture:\n• Multi-Platform Video Crawlers: Seamless tracking across TikTok (including mobile short links and photo carousels), YouTube Shorts, Instagram Reels, and X (Twitter) video tweets.\n• Zero-Password Bio Verification: Automated public profile bio crawlers verify creator ownership tokens without requiring intrusive OAuth logins or account credentials.\n• Anti-Fraud & Monotonic Ledger: URL normalization and creator ownership validation prevent clip theft and duplicate bounty claims. Accrued earnings dynamically scale using exact CPM formulas.\n• Auto-Capping & Budget Control: Background worker synchronizes views every 60 minutes. Automatically pauses campaigns when remaining budget hits zero.\n• Crypto Payroll CSV Export: Validates TRC-20, ERC-20, and BEP-20 USDT addresses, exporting clean payroll batches for automated treasury payouts."
  },
  {
    id: 7,
    title: "Veridex — Dynamic RPG & Faction Warfare Bot",
    category: "Discord Bots",
    tags: ["Python 3.11", "discord.py", "MongoDB Motor", "APScheduler", "Loguru", "AsyncIO", "Pydantic"],
    images: ["/images/projects/veridex.jpg"],
    image: "/images/projects/veridex.jpg",
    githubUrl: "",
    liveUrl: "https://relayworks.dev/discord-bot",
    description: "A massive, 54-module dynamic Discord bot that transforms high-volume servers into a living RPG ecosystem where user engagement directly fuels character progression.\n\nKey Capabilities & Architecture:\n• Dynamic 100-Rank Progression: Users passively and actively accumulate XP, Power Points (PP), and Health Points (HP) through voice and text engagement, unlocking automated Discord hierarchy roles.\n• Voice Room Specialization: Automated listener tracking in specialized voice channels—including the Healing Room (HP/PP regeneration), Meditation Room (accelerated XP gain), and Idle Plains (AFK farm prevention).\n• Faction Warfare (Everdoom vs. Utopia): Dynamic territory control engine where server members pledge allegiance, duel opposing faction members, and battle for server-wide multipliers.\n• Asynchronous Architecture: Non-blocking MongoDB Motor drivers, APScheduler cron jobs for tick-rate state updates, and Loguru telemetry for production diagnostics."
  },
  {
    id: 8,
    title: "Clock In N Out — Employee Shift & Attendance Bot",
    category: "Discord Bots",
    tags: ["Python", "discord.py", "MongoDB Motor", "PyTZ", "AsyncIO", "CSV Reporting"],
    images: ["/images/projects/clock_in_n_out.jpg"],
    image: "/images/projects/clock_in_n_out.jpg",
    githubUrl: "",
    liveUrl: "https://relayworks.dev/discord-bot",
    description: "A high-reliability Discord bot designed for distributed remote companies, gaming studios, and agency teams to track employee work hours, shifts, and attendance directly inside Discord.\n\nKey Capabilities & Architecture:\n• Interactive Shift Clock-In/Out: One-tap buttons for Clock In, Clock Out, and Meal/Rest Breaks with automated timezone translation via PyTZ.\n• Attendance Logging & Audit Trail: Real-time manager notifications for late check-ins, overtime alerts, and incomplete shifts.\n• Automated Timesheet & Payroll Export: Generates end-of-month CSV timesheet ledgers formatted for direct payroll accounting.\n• Multi-Role Permission Gates: Separate interfaces for staff, supervisors, and executive administrators with audit logs stored in async MongoDB."
  }
];

async function run() {
  console.log("Adding new Discord Bot projects to API...");
  for (const p of newProjects) {
    try {
      const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      console.log(`[Status ${res.status}] ${p.title} -> ID: ${data._id}`);
    } catch (e) {
      console.error(`Failed to add ${p.title}:`, e.message);
    }
  }
}

run();
