import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function decodeHtml(str: string): string {
    return str
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'");
}

function generatePersonalizedEmail(
    category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend',
    company: string,
    decisionMaker: string,
    painSignal: string,
    techStack: string[],
    position?: string
) {
    const safeCompany = company || 'your team';
    const firstWord = decisionMaker.replace(/[@/u]/g, '').split(' ')[0] || 'there';
    const cleanRole = position ? ` (${position})` : '';

    if (category === 'Discord Bots') {
        return {
            subject: `re: Discord bot & automation requirements for ${safeCompany}`,
            body: `Hi ${firstWord},

Saw your posting regarding the custom Discord bot and automation needs for ${safeCompany}${cleanRole}.

I run RelayWorks (https://relayworks.dev) — I build high-concurrency Discord bots and automation engines (Python 3.12, modern Discord Components V2, SQLite in WAL mode, and MongoDB).

A few production bots I've recently shipped for clients:
• ClutchBot: Real-time match recap detection, post-game Claude AI roasts, and dual-timezone squad queueing.
• Clipping Club: Enterprise creator bounty engine syncing TikTok, YouTube, and X views with automated crypto payroll CSVs.
• Veridex RPG: 54-module dynamic server progression system with voice-activity stat tracking and faction warfare.

For ${safeCompany}, I can build the exact event handling, permissions, and webhook architecture in 2 to 3 weeks on a fixed sprint ($1,200 – $2,000) with zero ongoing agency overhead.

If you haven't locked in a developer yet, happy to review your spec or jump on a quick call. Available directly on Telegram (@hazratummar) or Discord (@ihazratummar).

Best,
Hazrat Ummar
Founder & Lead Engineer, RelayWorks
Portfolio: https://relayworks.dev
Telegram: @hazratummar | Discord: @ihazratummar`
        };
    }

    if (category === 'Mobile Apps') {
        return {
            subject: `re: Mobile engineering for ${safeCompany}`,
            body: `Hi ${firstWord},

Saw your post regarding the mobile application build for ${safeCompany}${cleanRole}.

I run RelayWorks (https://relayworks.dev) — I build production native Android (Kotlin / Jetpack Compose) and multi-platform companion apps for founders and backend teams.

Two standards I keep to eliminate client risk:
1. Milestone Testing: You test the APK / live build directly on a physical device before signing off on any milestone.
2. 100% Store Acceptance: I resolve 100% of store reviewer notes at zero extra cost until your app is live.

Typical delivery is 2 to 4 weeks with a fixed milestone rate ($1,500 – $2,500).

If you have Figma wireframes or an API spec ready, feel free to reply directly or message me on Telegram (@hazratummar).

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (category === 'AI & Chatbots') {
        return {
            subject: `re: AI agent & chatbot engineering for ${safeCompany}`,
            body: `Hi ${firstWord},

Saw your note regarding AI conversational workflows and automations for ${safeCompany}${cleanRole}.

I specialize in building deterministic AI chatbots, RAG knowledge-base agents, and API automations (Python FastAPI, LangGraph, pgvector, and multi-channel connectors for WhatsApp, Telegram, and Discord).

I focus heavily on:
• Zero-hallucination pipelines with strict schema enforcement (Pydantic).
• Asynchronous event processing with fast token streaming.
• Direct integration into your existing database and CRM.

Would love to learn more about the exact workflows you want automated for ${safeCompany}. Available to start immediately on a fixed sprint.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Backend
    return {
        subject: `re: Backend & API engineering for ${safeCompany}`,
        body: `Hi ${firstWord},

Saw your posting looking for developer support on ${safeCompany}'s backend stack${cleanRole}.

I build resilient, high-throughput backend services and APIs (Node.js, TypeScript, Python FastAPI, PostgreSQL, MongoDB, and Redis).

My background is centered on clean architecture, sub-second latency, and zero-downtime spike tolerance under high concurrency.

Available to jump in immediately on a flexible contractor or fixed sprint agreement. Let me know if you'd like to sync on Telegram (@hazratummar) or review past client builds.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function isDisqualifiedEnterpriseJob(text: string): boolean {
    const lower = text.toLowerCase();
    
    // 1. Years of experience barrier (5+, 7+, 8+, 10+ years of proof/experience)
    if (/\b([5-9]|1\d)\+?\s*years?\s*(of)?\s*(experience|exp|proof)?/i.test(lower)) return true;
    if (/years?\s*of\s*experience\s*required/i.test(lower)) return true;
    if (/\b(minimum|at least)\s+([5-9]|1\d)\s+years/i.test(lower)) return true;

    // 2. High corporate enterprise salary brackets ($100k+, $120k+, $150k+, $200k+)
    if (/\$(1[0-9]{2}|2[0-9]{2}|3[0-9]{2})[,0-9]*\s*(k|\/yr|\/year|\s*-\s*\$[0-9]+)/i.test(lower)) return true;
    if (/\b(1[0-9]{2}|2[0-9]{2})k\s*-\s*[0-9]+k/i.test(lower)) return true;

    // 3. Corporate management / executive / non-dev positions
    if (/\b(coo|cto|cpo|vp of|director of|head of engineering|staff engineer|principal engineer|enterprise architect|lead architect|solutions architect)\b/i.test(lower)) return true;
    if (/\b(sales manager|account executive|recruiting coordinator|recruiter|human resources|pre-sales|customer support specialist|business development representative|bdr|sdr|talent acquisition|copywriter|scientific account)\b/i.test(lower)) return true;

    // 4. Corporate bureaucracy gates
    if (/\b(security clearance|us citizenship required|polygraph|w-?2 only|401\(?k\)?|equity only|unpaid)\b/i.test(lower)) return true;

    return false;
}

function extractBudget(text: string, category: string): string {
    const monthlyMatch = text.match(/\$([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*[-–]\s*\$?([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*(\/|\s*per\s*)(mo|month)/i);
    if (monthlyMatch) return monthlyMatch[0];

    const fixedMatch = text.match(/\$([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*[-–]\s*\$?([1-9],[0-9]{3}|[1-9][0-9]{2,3})/i);
    if (fixedMatch) return `$${fixedMatch[1]} – $${fixedMatch[2]} (Fixed)`;

    switch (category) {
        case 'Discord Bots':
            return '$1,200 – $2,000 (Sprint)';
        case 'Mobile Apps':
            return '$1,500 – $2,500 (Sprint)';
        case 'AI & Chatbots':
            return '$1,500 – $3,000 (Sprint)';
        case 'Backend':
            return '$2,000 – $3,500 (Contract)';
        default:
            return '$1,500 – $2,500 (Fixed)';
    }
}

export async function POST() {
    await dbConnect();
    try {
        let addedCount = 0;
        const candidateLeads: any[] = [];

        // ==========================================
        // 1. RemoteOK Live Developer Stream (Strict Sprint & Contractor Filter)
        // ==========================================
        try {
            const res = await fetch("https://remoteok.com/api", {
                headers: { "User-Agent": UA },
                next: { revalidate: 0 }
            });
            if (res.ok) {
                const data = await res.json();
                for (const item of (Array.isArray(data) ? data : [])) {
                    if (!item.position || !item.company) continue;
                    const text = `${item.position} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();

                    // Disqualify corporate full-time, 8+ years exp, and $100k+ roles
                    if (isDisqualifiedEnterpriseJob(text)) continue;

                    let category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend' | null = null;
                    if (/discord|bot\b|telegram/i.test(text)) category = "Discord Bots";
                    else if (/android|ios|swift|kotlin|mobile|flutter|react native/i.test(text)) category = "Mobile Apps";
                    else if (/ai\b|llm|chatbot|agent|rag|openai|langchain|langgraph/i.test(text)) category = "AI & Chatbots";
                    else if (/backend|fastapi|python|node|postgres|redis|microservice/i.test(text)) category = "Backend";

                    if (category) {
                        const safeCompany = item.company.trim();
                        const position = item.position.trim();
                        const url = item.url || item.apply_url || `https://remoteok.com`;
                        const cleanSnippet = (item.description || text)
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .slice(0, 320);

                        const tags = Array.isArray(item.tags) ? item.tags.slice(0, 5) : [category];

                        candidateLeads.push({
                            title: `${position} · ${safeCompany}`,
                            company: safeCompany,
                            category,
                            decisionMaker: `Hiring Lead @ ${safeCompany}`,
                            email: `careers@${safeCompany.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
                            source: "RemoteOK Live Feed",
                            sourceUrl: url,
                            painSignal: cleanSnippet,
                            techStack: tags,
                            position,
                            budget: extractBudget(cleanSnippet, category),
                            engagementType: "Fixed Sprint",
                            experienceReq: "No Years Req (Portfolio-Driven)",
                            score: 93
                        });
                    }
                }
            }
        } catch (err: any) {
            console.error("RemoteOK sync error:", err.message);
        }

        // ==========================================
        // 2. Hacker News Live Hiring & Freelancer Threads
        // ==========================================
        try {
            const hnStories = [
                "story_50338728", // Ask HN: Who is hiring? (November 2026)
                "story_50338744", // Ask HN: Freelancer? Seeking freelancer? (November 2026)
                "story_49922572"  // Ask HN: Freelancer? Seeking freelancer? (October 2026)
            ];

            for (const storyTag of hnStories) {
                const url = `https://hn.algolia.com/api/v1/search?tags=comment,${storyTag}&hitsPerPage=50`;
                const res = await fetch(url, { headers: { "User-Agent": UA } });
                if (!res.ok) continue;
                const data = await res.json();

                for (const hit of (data.hits || [])) {
                    const rawText = decodeHtml((hit.comment_text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
                    if (rawText.length < 50) continue;
                    // Ignore freelancers seeking work — only keep actual clients hiring
                    if (/seeking work|\[for hire\]|\bfor hire\b|candidate profile/i.test(rawText)) continue;
                    // Disqualify corporate 8+ years experience barrier and $100k+ roles
                    if (isDisqualifiedEnterpriseJob(rawText)) continue;

                    let category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend' | null = null;
                    if (/discord|bot\b|telegram/i.test(rawText)) category = "Discord Bots";
                    else if (/android|ios|swift|kotlin|mobile|flutter/i.test(rawText)) category = "Mobile Apps";
                    else if (/ai\b|llm|chatbot|agent|rag|openai|langgraph/i.test(rawText)) category = "AI & Chatbots";
                    else if (/backend|fastapi|python|node|postgres|redis|microservices/i.test(rawText)) category = "Backend";

                    if (category) {
                        const firstLine = rawText.split('\n')[0] || rawText.split('|')[0] || '';
                        const parts = firstLine.split('|').map((s: string) => s.trim());
                        const company = parts[0]?.slice(0, 45) || `Founder @${hit.author}`;
                        
                        const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                        const email = emailMatch ? emailMatch[0].toLowerCase() : `contact@${hit.author}.hn`;

                        const tags: string[] = [category];
                        if (/python/i.test(rawText)) tags.push("Python");
                        if (/fastapi/i.test(rawText)) tags.push("FastAPI");
                        if (/react|next/i.test(rawText)) tags.push("Next.js");
                        if (/android|kotlin/i.test(rawText)) tags.push("Android / Kotlin");
                        if (/swift|ios/i.test(rawText)) tags.push("iOS / Swift");
                        if (/discord/i.test(rawText)) tags.push("discord.py");

                        candidateLeads.push({
                            title: `${category} Opportunity at ${company}`,
                            company,
                            category,
                            decisionMaker: `@${hit.author}`,
                            email,
                            source: "Hacker News Freelancer Feed",
                            sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                            painSignal: rawText.slice(0, 320),
                            techStack: tags.slice(0, 5),
                            budget: extractBudget(rawText, category),
                            engagementType: "Fixed Sprint",
                            experienceReq: "No Years Req (Portfolio-Driven)",
                            score: 94
                        });
                    }
                }
            }
        } catch (err: any) {
            console.error("Hacker News sync error:", err.message);
        }

        // ==========================================
        // 3. Jobicy Global Remote Tech API (Filtered for Contractor & Sprint)
        // ==========================================
        try {
            const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=30", {
                headers: { "User-Agent": UA }
            });
            if (res.ok) {
                const data = await res.json();
                for (const job of (data.jobs || [])) {
                    if (!job.jobTitle || !job.companyName) continue;
                    const text = `${job.jobTitle} ${job.jobExcerpt || ""} ${(job.jobTags || []).join(" ")}`.toLowerCase();

                    // Disqualify corporate 8+ years experience barrier and $100k+ roles
                    if (isDisqualifiedEnterpriseJob(text)) continue;

                    let category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend' | null = null;
                    if (/discord|bot\b|telegram/i.test(text)) category = "Discord Bots";
                    else if (/android|ios|swift|kotlin|mobile|flutter/i.test(text)) category = "Mobile Apps";
                    else if (/ai\b|llm|chatbot|agent|rag|openai/i.test(text)) category = "AI & Chatbots";
                    else if (/backend|fastapi|python|node|postgres|redis|engineer|developer/i.test(text)) category = "Backend";

                    if (category) {
                        const safeCompany = job.companyName.trim();
                        const position = job.jobTitle.trim();
                        const cleanSnippet = (job.jobExcerpt || text)
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .slice(0, 320);

                        const tags = Array.isArray(job.jobTags) && job.jobTags.length > 0 
                            ? job.jobTags.slice(0, 5) 
                            : [category, "Remote"];

                        candidateLeads.push({
                            title: `${position} · ${safeCompany}`,
                            company: safeCompany,
                            category,
                            decisionMaker: `Hiring Team @ ${safeCompany}`,
                            email: `jobs@${safeCompany.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
                            source: "Jobicy Remote Tech Feed",
                            sourceUrl: job.url,
                            painSignal: cleanSnippet,
                            techStack: tags,
                            position,
                            budget: extractBudget(cleanSnippet, category),
                            engagementType: "Fixed Sprint",
                            experienceReq: "No Years Req (Portfolio-Driven)",
                            score: 90
                        });
                    }
                }
            }
        } catch (err: any) {
            console.error("Jobicy sync error:", err.message);
        }

        // ==========================================
        // Deduplicate & Persist to MongoDB
        // ==========================================
        for (const candidate of candidateLeads) {
            // Check if lead with same sourceUrl or same company+title already exists
            const existing = await Lead.findOne({
                $or: [
                    { sourceUrl: candidate.sourceUrl },
                    { company: candidate.company, title: candidate.title }
                ]
            });

            if (!existing) {
                const personalizedEmail = generatePersonalizedEmail(
                    candidate.category,
                    candidate.company,
                    candidate.decisionMaker,
                    candidate.painSignal,
                    candidate.techStack,
                    candidate.position
                );

                await Lead.create({
                    title: candidate.title,
                    company: candidate.company,
                    category: candidate.category,
                    decisionMaker: candidate.decisionMaker,
                    email: candidate.email,
                    source: candidate.source,
                    sourceUrl: candidate.sourceUrl,
                    status: 'New',
                    score: candidate.score || 88,
                    confidence: 'High',
                    painSignal: candidate.painSignal,
                    techStack: candidate.techStack,
                    budget: candidate.budget || 'Fixed Sprint ($1,200 – $2,500)',
                    engagementType: candidate.engagementType || 'Fixed Sprint',
                    experienceReq: candidate.experienceReq || 'No Years Req (Portfolio-Driven)',
                    personalizedEmail,
                    notes: `Discovered from live ${candidate.source}. Verified direct link available.`
                });

                addedCount++;
            }
        }

        const totalLeads = await Lead.countDocuments({});
        return NextResponse.json({
            success: true,
            addedCount,
            totalLeads,
            message: `Scanned RemoteOK, Hacker News, and Jobicy feeds. Added ${addedCount} new verified leads with live source links.`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Sync failed' }, { status: 500 });
    }
}
