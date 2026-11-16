import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

interface ScrapedContext {
    source: 'website' | 'shopify-directory';
    title?: string;
    description?: string;
    headings?: string[];
    techKeywords?: string[];
    snippet?: string;
}

async function scrapeWebsiteContext(websiteUrl?: string, directoryUrl?: string): Promise<ScrapedContext | null> {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    };

    // 1. Try partner's official live website first
    if (websiteUrl) {
        try {
            const res = await fetch(websiteUrl, {
                headers,
                signal: AbortSignal.timeout(6000)
            });

            if (res.ok) {
                const html = await res.text();
                // Check if Cloudflare blocked
                if (!html.includes('Attention Required! | Cloudflare') && !html.includes('Sorry, you have been blocked')) {
                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

                    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
                        || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
                    const description = metaDescMatch ? metaDescMatch[1].replace(/\s+/g, ' ').trim() : '';

                    const headingMatches = Array.from(html.matchAll(/<h[123][^>]*>([^<]+)<\/h[123]>/gi));
                    const headings = headingMatches
                        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
                        .filter(h => h.length > 5 && !/menu|nav|cookie|privacy|copyright|cart/i.test(h))
                        .slice(0, 6);

                    const cleaned = html
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    const knownTech = [
                        'Shopify Plus', 'Headless', 'Hydrogen', 'Next.js', 'Klaviyo', 'Recharge',
                        'NetSuite', 'ERP', 'B2B', 'Algolia', 'Checkout Extensions', 'Shopify Functions',
                        'Migrations', 'CRO', 'Custom Apps', 'Liquid', 'FastAPI', 'Python', 'Subscriptions',
                        'AI Agents', 'Chatbots', 'Autonomous'
                    ];
                    const detectedTech = knownTech.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(cleaned));

                    return {
                        source: 'website',
                        title,
                        description,
                        headings,
                        techKeywords: detectedTech,
                        snippet: cleaned.slice(0, 750)
                    };
                }
            }
        } catch (err) {
            console.warn(`Direct website fetch failed for ${websiteUrl}, trying directory:`, err);
        }
    }

    // 2. Fallback to Shopify Partner Directory profile
    if (directoryUrl) {
        try {
            const res = await fetch(directoryUrl, {
                headers,
                signal: AbortSignal.timeout(6000)
            });

            if (res.ok) {
                const html = await res.text();
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

                const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
                const description = metaDescMatch ? metaDescMatch[1].replace(/\s+/g, ' ').trim() : '';

                return {
                    source: 'shopify-directory',
                    title,
                    description,
                    headings: ['Shopify Certified Partner Agency'],
                    techKeywords: ['Shopify Plus', 'Store Building', 'CRO', 'Custom Themes'],
                    snippet: description
                };
            }
        } catch (err) {
            console.warn(`Shopify directory fetch failed for ${directoryUrl}:`, err);
        }
    }

    return null;
}

function generateFallbackPitch(
    partnerName: string,
    services: string[],
    desc: string,
    angle: 'white-label' | 'concise' | 'technical-audit' | 'ai-automation' = 'white-label',
    siteContext?: ScrapedContext | null
) {
    const isDesignOrCro = /design|cro|conversion|brand|creative|ui|ux/i.test(services.join(' ') + ' ' + desc);
    const serviceHighlight = siteContext?.description?.slice(0, 80) 
        || (isDesignOrCro ? 'store design, UX, and CRO' : 'store building and merchant growth');

    if (angle === 'ai-automation') {
        return {
            subject: `ai store agents & automations for ${partnerName}?`,
            body: `Hey team at ${partnerName},

Saw your focus around ${serviceHighlight}.

When your merchant clients ask for 24/7 AI shopping concierges (catalog RAG discovery, instant order lookup) or automated webhook syncs between Shopify and their warehouse/CRM, who builds that technical execution for you?

I engineer deterministic AI chatbots and custom workflow automations at RelayWorks (https://relayworks.dev) using Python FastAPI, LangGraph, and pgvector. I white-label for partner agencies on fixed 1-2 week sprints ($400 - $600).

If you have an upcoming build requiring AI assistants or custom webhook pipelines, happy to take a small trial sprint ($250 - $350) to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (angle === 'concise') {
        return {
            subject: `custom app & automation capacity for ${partnerName}?`,
            body: `Hey there,

Who handles your technical overflow when a merchant asks for custom checkout extensions, AI chatbots, or external API/webhook syncs?

I white-label custom Shopify apps, AI agents, and Python backends for boutique agencies on fixed 1-week sprints ($250 - $400).

Happy to pick up an overflow ticket if your team is at capacity: Telegram @hazratummar or https://relayworks.dev.

Best,
Hazrat`
        };
    }

    if (angle === 'technical-audit') {
        return {
            subject: `checkout extensions & store automations for ${partnerName}`,
            body: `Hey team at ${partnerName},

Saw your work around ${serviceHighlight}.

When custom stores scale, technical bottlenecks often crop up: checkout UI extensions (Shopify Functions), Liquid theme speed bloat, or brittle third-party ERP webhook syncs.

I specialize in Shopify backend performance, custom apps, and automated pipelines. I partner with agencies on fixed sprints ($350 - $550) to handle the technical plumbing so your creative team can launch stores on schedule with zero client friction.

Let me know if you have a build coming up with custom technical requirements.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Default: white-label
    return {
        subject: `custom app & automation overflow for ${partnerName}?`,
        body: `Hey team at ${partnerName},

Saw your work on the Shopify directory focusing on ${serviceHighlight}.

When your clients ask for custom technical logic (custom checkout UI extensions, AI shopping assistants, or ERP/warehouse webhook synchronization), who handles that overflow for your team?

I'm an independent engineer at RelayWorks. I white-label custom Shopify apps, AI chatbots, and automation pipelines for partner agencies on fixed 1-2 week sprints ($400 - $600), taking custom tickets off your plate so your theme devs never get bottlenecked.

If you have any tricky technical tickets on your backlog or an upcoming build, happy to take a small trial sprint ($250 - $350) to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function cleanAntiSlop(text: string): string {
    return text
        .replace(/—/g, ' - ')
        .replace(/–/g, ' - ')
        .replace(/\b(is|are|was)\s+impressive\b/gi, 'stands out')
        .replace(/\bimpressive\s+/gi, '')
        .replace(/\baligns?\s+perfect(ly)?\b/gi, 'connects directly')
        .replace(/\bintrigued\s+by\b/gi, 'saw your work on')
        .replace(/I hope (this email|you are|this message)[\s\S]*?[.!?]\s*/gi, '')
        .replace(/My name is Hazrat Ummar,?\s*(and\s*)?/gi, '')
        .replace(/I am reaching out (to you )?because\s*/gi, '')
        .replace(/I noticed your impressive\s*/gi, 'Saw your ')
        .trim();
}

const SYSTEM_PROMPT = `You are Hazrat Ummar, senior engineer at RelayWorks (https://relayworks.dev).
You write direct, ultra-personalized cold emails to founders or technical leads at Shopify Partner agencies.

YOUR COMPLETE TECHNICAL CAPABILITIES (NOT JUST BACKEND):
You are an independent technical partner for boutique Shopify agencies delivering:
1. AI Chatbots & Store Assistants: 24/7 AI shopping concierges, catalog RAG discovery bots (answering product sizing, inventory, and order tracking questions with zero hallucination), WhatsApp/Telegram/Discord merchant bots.
2. Custom Automations & Webhooks: Event-driven syncs between Shopify and ERPs/CRMs/warehouse APIs, automated order routing, inventory syncs, background worker pipelines.
3. Custom Shopify Apps & Extensions: Shopify Functions (custom discount/pricing/bundle logic), Checkout UI extensions, private custom apps.
4. Robust Backend Architecture: Python FastAPI microservices, pgvector, LangGraph, high-throughput APIs.

CRITICAL PRICING & SPRINT RULES:
- Quote realistic, low-friction fixed sprints in the $250 - $600 range:
  * For a standard 2-week sprint: quote $400 - $600 flat fixed.
  * For a quick 1-week sprint or trial ticket: quote $250 - $400 flat fixed.
  * Vary the numbers naturally between $250 - $600 depending on the scope.
- NEVER, UNDER ANY CIRCUMSTANCES, MENTION A DAILY RATE ($30-$40/day) OR HOURLY RATE. Agency owners want flat-rate sprint certainty. Quote only flat-rate sprint numbers ($250 - $600).

SUBJECT LINE RULES (CRITICAL):
- ABSOLUTELY NEVER use the same repetitive subject like "backend support for [Agency]?".
- Generate a dynamic, unique, contextual subject line (3 to 6 words) that directly reflects what they do.
- Examples based on the agency's actual focus:
  * "ai store agents & automations for [Agency]?"
  * "custom AI chatbots & app overflow for [Agency]"
  * "checkout extensions & store automations for [Agency]?"
  * "bundle logic & AI chatbots for [Agency]?"
  * "catalog AI assistant & webhook syncs for [Agency]"
  * "quick technical question re: [Agency] builds"

ANTI-SLOP & ANTI-AI RULES:
1. NEVER start with 'My name is...', 'I am reaching out...', 'I run RelayWorks...', or 'I hope this email finds you well'.
2. NEVER use fake compliments ('impressive work', 'admire your expertise', 'spot on', 'intrigued by', 'aligns perfectly'). State their focus matter-of-factly without flattery.
3. NEVER lecture them on agency margins, salary overheads, or 'extending their capabilities'. Treat them as an equal peer.
4. ABSOLUTELY NO em-dashes (—) or en-dashes (–). Use plain commas, colons, or parentheses.
5. NO corporate buzzwords: 'synergy', 'streamline', 'game-changer', 'leverage', 'robust', 'holistic', 'bespoke'.
6. Keep the email punchy, natural, and brief with greeting and signature (70 to 110 words total).

LIVE WEBSITE PERSONALIZATION:
You MUST inspect the provided LIVE WEBSITE CONTEXT and align your offer to their actual positioning:
- If they do AI, autonomous commerce, or modern D2C (like Nexus Commerce): prominently lead with AI chatbots, autonomous agent pipelines, and custom workflow automations!
- If they do food & beverage or subscription brands (like Wren Digital): lead with bundle builders, subscription syncs, and AI flavor/catalog assistants!
- If they do B2B or ERP integrations (like Snapshot): lead with ERP automations, custom pricing checkout functions, and webhook syncs!
- If founder name is identified (e.g. Jessie), use 'Hey Jessie,', otherwise 'Hey team at [Agency],'.

GOLDEN TONE EXAMPLES:

Example 1 (AI Chatbot & Automation Angle):
Subject: ai store agents & automations for Nexus?
Body:
Hey team at Nexus,

Saw your focus on autonomous commerce and AI agent workflows for Shopify brands.

When your merchants ask for custom AI shopping concierges (catalog RAG discovery, instant order tracking) or automated webhook pipelines connecting Shopify to their warehouse or CRM, who builds that technical execution for you?

I build deterministic AI chatbots and custom Shopify automations at RelayWorks (https://relayworks.dev) with strict guardrails (Python FastAPI, LangGraph, and pgvector). I white-label for agencies on fixed 1-2 week sprints ($400 - $600).

If you have an AI agent integration or custom automation ticket on your plate, happy to take a small trial sprint ($250 - $350) to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar

Example 2 (White-Label Engineering Partner):
Subject: custom app & automation overflow for Shugert?
Body:
Hey team at Shugert,

Saw your work on the Shopify directory around Shopify Plus builds and store migrations.

When your clients ask for custom technical logic (custom checkout UI extensions, AI customer assistants, or webhook syncs with CRMs/ERPs), who handles that overflow for your team?

I am an independent engineer at RelayWorks. I white-label custom apps, AI chatbots, and automation pipelines for agencies on fixed 1-2 week sprints ($400 - $600) so your design team never gets bottlenecked.

If you have a tricky technical ticket on your backlog, happy to take a small trial sprint ($250 - $350) to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar

Example 3 (Concise 3-Sentence DM):
Subject: quick question re: AI & custom app overflow
Body:
Hey there,

Who handles your technical overflow when a merchant asks for custom AI chatbots, checkout extensions, or external API/webhook syncs?

I white-label custom Shopify apps, AI assistants, and backend automations for agencies on fixed 1-week sprints ($250 - $400).

Happy to pick up an overflow ticket if your team is at capacity: Telegram @hazratummar or https://relayworks.dev.

Best,
Hazrat

OUTPUT: Return strict JSON:
{
  "subject": "3-6 words, varied and tailored to the agency",
  "body": "The complete email body formatted with clean line breaks."
}`;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const requestedAngle = (body.angle || 'white-label') as 'white-label' | 'concise' | 'technical-audit' | 'ai-automation';
        const requestedModel = (body.model || 'gpt-4o') as 'gpt-4o' | 'gpt-4o-mini' | 'gemini';

        const partner = await Partner.findById(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        // Check if website was scraped in the past 7 days, otherwise scrape live now!
        let siteContext: ScrapedContext | null = partner.websiteContext ? {
            source: 'website',
            title: partner.websiteContext.title,
            description: partner.websiteContext.description,
            headings: partner.websiteContext.headings,
            techKeywords: partner.websiteContext.techKeywords,
            snippet: partner.websiteContext.snippet
        } : null;

        const isCacheStale = !partner.websiteContext?.lastScrapedAt || 
            (Date.now() - new Date(partner.websiteContext.lastScrapedAt).getTime() > 7 * 24 * 60 * 60 * 1000);

        if (!siteContext || isCacheStale) {
            const freshContext = await scrapeWebsiteContext(partner.websiteUrl, partner.partnerDirectoryUrl);
            if (freshContext) {
                siteContext = freshContext;
                partner.websiteContext = {
                    title: freshContext.title,
                    description: freshContext.description,
                    headings: freshContext.headings || [],
                    techKeywords: freshContext.techKeywords || [],
                    snippet: freshContext.snippet,
                    lastScrapedAt: new Date()
                };
                await partner.save();
            }
        }

        const openAiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        let generatedPitch = generateFallbackPitch(
            partner.name,
            partner.services || [],
            partner.description || '',
            requestedAngle,
            siteContext
        );
        let actualModelUsed = 'curated-template';

        // Prepare live context block for prompt
        let liveContextStr = 'No live website extracted; rely on Shopify Directory details.';
        if (siteContext) {
            liveContextStr = `Source: ${siteContext.source}
Title: ${siteContext.title || 'N/A'}
Meta Description: ${siteContext.description || 'N/A'}
Core Headings: ${(siteContext.headings || []).join(' | ') || 'N/A'}
Detected Tech Stack: ${(siteContext.techKeywords || []).join(', ') || 'Shopify'}
Live Page Excerpt: ${siteContext.snippet || 'N/A'}`;
        }

        const userPrompt = `Agency Name: ${partner.name}
Website: ${partner.websiteUrl || 'Not listed'}
Shopify Directory Profile: ${partner.partnerDirectoryUrl}
Location: ${partner.location || partner.country || 'Global'}
Directory Services Listed: ${(partner.services || []).join(', ') || 'Shopify store development'}
Angle: ${requestedAngle}

LIVE WEBSITE CONTEXT (Actual live site content you MUST use for hyper-personalization):
${liveContextStr}`;

        // Attempt 1: OpenAI (GPT-4o or GPT-4o-mini)
        if (openAiKey && requestedModel !== 'gemini') {
            try {
                const targetModel = requestedModel === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o';
                const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openAiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: targetModel,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.35,
                        response_format: { type: 'json_object' }
                    })
                });

                if (openAiRes.ok) {
                    const aiData = await openAiRes.json();
                    const contentStr = aiData.choices?.[0]?.message?.content;
                    if (contentStr) {
                        const parsed = JSON.parse(contentStr);
                        if (parsed.subject && parsed.body) {
                            generatedPitch = {
                                subject: cleanAntiSlop(parsed.subject),
                                body: cleanAntiSlop(parsed.body)
                            };
                            actualModelUsed = targetModel;
                        }
                    }
                } else {
                    const errText = await openAiRes.text();
                    console.error('OpenAI generation failed, will try Gemini fallback:', errText);
                }
            } catch (openAiErr) {
                console.error('OpenAI call error, falling back to Gemini:', openAiErr);
            }
        }

        // Attempt 2: Google Gemini (Fallback if OpenAI unavailable or specifically selected)
        if (actualModelUsed === 'curated-template' && geminiKey) {
            try {
                const geminiPrompt = `${SYSTEM_PROMPT}\n\nTask:\n${userPrompt}`;
                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: geminiPrompt }] }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                temperature: 0.3
                            }
                        })
                    }
                );

                if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawJson) {
                        const parsed = JSON.parse(rawJson);
                        if (parsed.subject && parsed.body) {
                            generatedPitch = {
                                subject: cleanAntiSlop(parsed.subject),
                                body: cleanAntiSlop(parsed.body)
                            };
                            actualModelUsed = 'gemini-2.5-flash';
                        }
                    }
                }
            } catch (geminiErr) {
                console.error('Gemini pitch generation error, using curated fallback:', geminiErr);
            }
        }

        // Save generated pitch to the partner document
        partner.personalizedPitch = {
            subject: generatedPitch.subject,
            body: generatedPitch.body,
            angle: requestedAngle,
            modelUsed: actualModelUsed,
            generatedAt: new Date()
        };
        await partner.save();

        return NextResponse.json({
            success: true,
            pitch: partner.personalizedPitch,
            websiteContext: partner.websiteContext
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to generate pitch' }, { status: 500 });
    }
}
