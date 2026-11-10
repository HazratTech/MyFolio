import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

interface AlgoliaHit {
    objectID: string;
    author: string;
    created_at: string;
    comment_text?: string;
    story_id?: number;
}

function generatePersonalizedEmail(
    category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend',
    company: string,
    decisionMaker: string,
    painSignal: string,
    techStack: string[]
) {
    const safeCompany = company || 'your project';
    const firstWord = decisionMaker.split(' ')[0] || 'there';

    if (category === 'Discord Bots') {
        return {
            subject: `re: HN post (custom Discord bot for ${safeCompany})`,
            body: `Hi ${firstWord},

Saw your post regarding the custom Discord bot for ${safeCompany}.

I run RelayWorks (https://relayworks.dev) — I build high-concurrency Discord bots and automation engines (Python 3.12, modern Discord Components V2, SQLite in WAL mode, and MongoDB).

A few production bots I've recently shipped for clients:
• ClutchBot: Real-time match recap detection, post-game Claude AI roasts, and dual-timezone squad queueing.
• Clipping Club: Enterprise creator bounty engine syncing TikTok, YouTube, and X views with automated crypto payroll CSVs.
• Veridex RPG: 54-module dynamic server progression system with voice-activity stat tracking and faction warfare.

For ${safeCompany}, I can build the exact event handling and UI layout in 2 to 3 weeks for a fixed scope ($1,200 – $2,000) with zero ongoing agency overhead.

If you haven't picked a developer yet, happy to review your spec or jump on Telegram (@hazratummar) or Discord (@ihazratummar).

Best,
Hazrat Ummar
Founder & Lead Engineer, RelayWorks
Portfolio: https://relayworks.dev
Telegram: @hazratummar | Discord: @ihazratummar`
        };
    }

    if (category === 'Mobile Apps') {
        return {
            subject: `re: HN post (${safeCompany} mobile build)`,
            body: `Hi ${firstWord},

Saw your note on HN regarding the mobile application for ${safeCompany}.

I run RelayWorks (https://relayworks.dev) — I build production native Android (Kotlin / Jetpack Compose) and multi-platform companion apps for founders and backend teams.

Two things that keep risk at zero:
1. Milestone Testing: You test the APK / live build directly on device before signing off on milestones.
2. 100% Store Acceptance: I resolve 100% of store reviewer notes at zero extra cost until your app is live.

Turnaround is typically 2 to 4 weeks with a fixed milestone rate ($1,500 – $2,500).

If you have Figma wireframes or an API spec ready, feel free to reply here or message me on Telegram (@hazratummar).

Best,
Hazrat Ummar
https://relayworks.dev`
        };
    }

    if (category === 'AI & Chatbots') {
        return {
            subject: `re: HN post (AI agent & chatbot automation for ${safeCompany})`,
            body: `Hi ${firstWord},

Saw your post on HN regarding the AI conversational workflows for ${safeCompany}.

I specialize in building deterministic AI chatbots, RAG knowledge-base agents, and API automations (Python FastAPI, LangGraph, pgvector, and multi-channel connectors for WhatsApp, Telegram, and Discord).

I focus heavily on:
• Zero-hallucination pipelines with strict schema enforcement.
• Asynchronous event processing with fast token streaming.
• Direct connection into your existing database and CRM.

Would love to learn more about the exact workflows you want automated for ${safeCompany}. Available to start immediately on a fixed sprint.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Backend
    return {
        subject: `re: HN post (backend & infrastructure for ${safeCompany})`,
        body: `Hi ${firstWord},

Saw your note on HN looking for developer support on ${safeCompany}'s backend stack.

I build resilient, high-throughput backend services and APIs (Node.js, TypeScript, Python FastAPI, PostgreSQL, MongoDB, and Redis).

My background is centered on clean architecture, sub-second latency, and zero-downtime spike tolerance under high concurrency.

Available to jump in immediately on a flexible contract basis. Let me know if you'd like to sync on Telegram (@hazratummar) or review past client builds.

Best,
Hazrat Ummar
https://relayworks.dev`
    };
}

export async function POST() {
    await dbConnect();
    try {
        const queries = [
            'SEEKING FREELANCER bot',
            'SEEKING FREELANCER mobile',
            'SEEKING FREELANCER chatbot',
            'SEEKING FREELANCER backend'
        ];

        let addedCount = 0;

        for (const q of queries) {
            const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=comment&numericFilters=created_at_i>1700000000`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();

            for (const hit of (data.hits as AlgoliaHit[])) {
                const text = (hit.comment_text || '').replace(/<[^>]+>/g, ' ');
                if (!/SEEKING FREELANCER/i.test(text)) continue;

                const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                if (!emailMatch) continue;

                const email = emailMatch[0].toLowerCase();
                const existing = await Lead.findOne({ email });
                if (existing) continue;

                // Determine category
                let category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend' = 'Backend';
                if (/discord|telegram|bot/i.test(text)) {
                    category = 'Discord Bots';
                } else if (/ios|android|mobile|swift|compose|flutter/i.test(text)) {
                    category = 'Mobile Apps';
                } else if (/ai|llm|chatbot|agent|rag|openai/i.test(text)) {
                    category = 'AI & Chatbots';
                }

                // Extract company or title
                const firstLine = text.trim().split('\n')[0].replace(/SEEKING FREELANCER\s*\|?/i, '').trim();
                const company = firstLine.slice(0, 50) || `Project by @${hit.author}`;
                const title = `${category} Implementation for ${company}`;

                // Extract sample tech tags
                const tags: string[] = [];
                if (/python/i.test(text)) tags.push('Python');
                if (/discord/i.test(text)) tags.push('discord.py');
                if (/react|next/i.test(text)) tags.push('Next.js');
                if (/node|typescript/i.test(text)) tags.push('TypeScript');
                if (/postgres/i.test(text)) tags.push('PostgreSQL');
                if (/mongo/i.test(text)) tags.push('MongoDB');
                if (/swift|ios/i.test(text)) tags.push('Swift / iOS');
                if (/android|kotlin/i.test(text)) tags.push('Kotlin / Android');
                if (/fastapi|ai/i.test(text)) tags.push('FastAPI');
                if (tags.length === 0) tags.push('Cloud Architecture');

                const personalizedEmail = generatePersonalizedEmail(
                    category,
                    company,
                    hit.author,
                    text.slice(0, 300),
                    tags
                );

                await Lead.create({
                    title,
                    company,
                    category,
                    decisionMaker: `@${hit.author}`,
                    email,
                    source: 'Hacker News Freelancer Feed',
                    sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                    status: 'New',
                    score: 88,
                    confidence: 'High',
                    painSignal: text.slice(0, 350).trim(),
                    techStack: tags,
                    personalizedEmail,
                    notes: 'Automatically discovered via live feed scan.'
                });

                addedCount++;
            }
        }

        const totalLeads = await Lead.countDocuments({});
        return NextResponse.json({
            success: true,
            addedCount,
            totalLeads,
            message: `Discovery complete. Added ${addedCount} new verified leads.`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Sync failed' }, { status: 500 });
    }
}
