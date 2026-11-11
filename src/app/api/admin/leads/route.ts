import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

function generateDefaultPitch(
    category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend',
    company: string,
    decisionMaker: string,
    painSignal: string,
    techStack: string[]
) {
    const safeCompany = company || 'your project';
    const firstWord = decisionMaker.replace(/[@/u]/g, '').split(' ')[0] || 'there';
    const tech = techStack?.slice(0, 3).join(', ') || 'modern engineering stack';

    if (category === 'Discord Bots') {
        return {
            subject: `re: Custom Discord bot for ${safeCompany}`,
            body: `Hi ${firstWord},

Saw your requirement around ${painSignal} for ${safeCompany}.

I run RelayWorks (https://relayworks.dev) — I build high-concurrency Discord bots and automation engines (Python 3.12, modern Discord Components V2, SQLite in WAL mode, and MongoDB).

Past production bots include ClutchBot, Clipping Club (crypto creator view bounty engine), and Veridex RPG (54-module game economy).

Can deliver this on a fixed 2-week sprint ($1,200 – $2,000) with direct repository handover. Let me know if you'd like to sync on Telegram (@hazratummar) or Discord (@ihazratummar).

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (category === 'Mobile Apps') {
        return {
            subject: `re: Mobile application build for ${safeCompany}`,
            body: `Hi ${firstWord},

Noticed ${safeCompany}'s project requirement: "${painSignal}".

I build production native Android (Kotlin / Jetpack Compose) and cross-platform companion apps. I work with zero client risk: you test APK builds on-device before milestones, and I guarantee 100% store acceptance.

Turnaround is 2 to 4 weeks on a fixed sprint. Let me know if you'd like to review past client builds or sync on Telegram (@hazratummar).

Best,
Hazrat Ummar
https://relayworks.dev`
        };
    }

    if (category === 'AI & Chatbots') {
        return {
            subject: `re: AI agent & chatbot engineering for ${safeCompany}`,
            body: `Hi ${firstWord},

Saw ${safeCompany}'s requirement regarding "${painSignal}".

I build deterministic AI chatbots, RAG retrieval pipelines, and API automations using Python FastAPI, LangGraph, and pgvector with strict Pydantic guardrails (zero hallucination).

Happy to share architecture breakdowns or jump on a quick 10-minute discovery chat.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Backend
    return {
        subject: `re: Backend architecture & APIs for ${safeCompany}`,
        body: `Hi ${firstWord},

Saw your posting regarding backend requirements for ${safeCompany}: "${painSignal}".

I build high-throughput backend services and APIs using Node.js, TypeScript, Python FastAPI, PostgreSQL, and Redis with sub-second latency and idempotent webhooks.

Available immediately on a flexible contractor or fixed sprint agreement.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const newlyAdded = searchParams.get('newlyAdded'); // "true" or "false"
        const sprintOnly = searchParams.get('sprintOnly'); // "true" or "false"
        const sortBy = searchParams.get('sortBy') || 'score'; // 'score' | 'newest'

        const query: any = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        if (sprintOnly === 'true') {
            query.experienceReq = 'No Years Req (Portfolio-Driven)';
        }

        // Newly added window: past 48 hours
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        if (newlyAdded === 'true') {
            query.createdAt = { $gte: fortyEightHoursAgo };
        }

        if (search) {
            query.$or = [
                { company: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { decisionMaker: { $regex: search, $options: 'i' } },
                { painSignal: { $regex: search, $options: 'i' } },
                { techStack: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const sortOptions: any = sortBy === 'newest'
            ? { createdAt: -1, score: -1 }
            : { score: -1, createdAt: -1 };

        const leads = await Lead.find(query).sort(sortOptions);

        // Global stats across the entire database so selecting a tab NEVER zeroes out summary metrics!
        const [
            totalCount,
            hotCount,
            discordCount,
            mobileCount,
            aiCount,
            backendCount,
            newlyAddedCount,
            sprintReadyCount,
            statusNewCount,
            statusContactedCount,
            statusDiscussionCount,
            statusClosedCount
        ] = await Promise.all([
            Lead.countDocuments({}),
            Lead.countDocuments({ score: { $gte: 90 } }),
            Lead.countDocuments({ category: 'Discord Bots' }),
            Lead.countDocuments({ category: 'Mobile Apps' }),
            Lead.countDocuments({ category: 'AI & Chatbots' }),
            Lead.countDocuments({ category: 'Backend' }),
            Lead.countDocuments({ createdAt: { $gte: fortyEightHoursAgo } }),
            Lead.countDocuments({ experienceReq: 'No Years Req (Portfolio-Driven)' }),
            Lead.countDocuments({ status: 'New' }),
            Lead.countDocuments({ status: 'Contacted' }),
            Lead.countDocuments({ status: 'In Discussion' }),
            Lead.countDocuments({ status: 'Closed' }),
        ]);

        const stats = {
            total: totalCount,
            hot: hotCount,
            newlyAdded: newlyAddedCount,
            sprintReady: sprintReadyCount,
            categories: {
                All: totalCount,
                "Discord Bots": discordCount,
                "Mobile Apps": mobileCount,
                "AI & Chatbots": aiCount,
                "Backend": backendCount,
            },
            statuses: {
                All: totalCount,
                New: statusNewCount,
                Contacted: statusContactedCount,
                "In Discussion": statusDiscussionCount,
                Closed: statusClosedCount,
            }
        };

        return NextResponse.json({
            leads,
            stats
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        
        if (!body.title) {
            body.title = `${body.company || 'Project'} · ${body.category || 'Engineering'}`;
        }

        if (!body.confidence) {
            body.confidence = 'High';
        }

        // Auto generate pitch if not provided
        if (!body.personalizedEmail || !body.personalizedEmail.subject || !body.personalizedEmail.body) {
            body.personalizedEmail = generateDefaultPitch(
                body.category || 'Backend',
                body.company || 'your project',
                body.decisionMaker || 'Hiring Lead',
                body.painSignal || 'Technical project implementation',
                body.techStack || []
            );
        }

        if (!body.score) {
            body.score = 92;
        }

        const lead = await Lead.create(body);
        return NextResponse.json(lead, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create lead' }, { status: 500 });
    }
}
