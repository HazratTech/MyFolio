import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

interface ScrapedContext {
    source: 'combined' | 'website' | 'shopify-directory';
    title?: string;
    description?: string;
    location?: string;
    teamSize?: string;
    partnerSince?: string;
    industries?: string;
    specialties?: string;
    headings?: string[];
    techKeywords?: string[];
    snippet?: string;
    directorySnippet?: string;
    lastScrapedAt?: Date | string;
}

function cleanHtml(rawHtml: string): string {
    return rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ')
        .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function scrapeDirectory(directoryUrl: string, headers: Record<string, string>) {
    try {
        const res = await fetch(directoryUrl, { headers, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const html = await res.text();
        const text = cleanHtml(html);

        const partnerSinceMatch = text.match(/Partner since\s*(\d{4})/i);
        const teamSizeMatch = text.match(/Estimated team size\s*([0-9–\-+ ]+\s*people)/i);
        const locationMatch = text.match(/Primary location\s*([A-Za-z0-9, ]+?)(?:Languages|Estimated|$)/i);
        const industriesMatch = text.match(/Top industries\s*(.+?)(?:Top services|Shopify|Experience|$)/i);
        const specialtiesMatch = text.match(/Top services and specialties\s*(.+?)(?:Shopify|What is Shopify|$)/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        return {
            partnerSince: partnerSinceMatch ? partnerSinceMatch[1].trim() : undefined,
            teamSize: teamSizeMatch ? teamSizeMatch[1].trim() : undefined,
            location: locationMatch ? locationMatch[1].trim() : undefined,
            industries: industriesMatch ? industriesMatch[1].trim().slice(0, 160) : undefined,
            specialties: specialtiesMatch ? specialtiesMatch[1].replace(/\(opens in a new tab\)/g, '').trim().slice(0, 200) : undefined,
            description: descMatch ? descMatch[1].trim() : undefined,
            rawSnippet: text.slice(0, 500)
        };
    } catch {
        return null;
    }
}

async function scrapeWebsite(websiteUrl: string, headers: Record<string, string>) {
    try {
        const res = await fetch(websiteUrl, { headers, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const html = await res.text();
        if (html.includes('Attention Required! | Cloudflare') || html.includes('Sorry, you have been blocked')) {
            return null;
        }

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const description = metaDescMatch ? metaDescMatch[1].replace(/\s+/g, ' ').trim() : '';

        const headingMatches = Array.from(html.matchAll(/<h[123][^>]*>([^<]+)<\/h[123]>/gi));
        const headings = headingMatches
            .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
            .filter(h => h.length > 5 && !/menu|nav|cookie|privacy|copyright|cart|sign in|log in|search/i.test(h))
            .slice(0, 6);

        const text = cleanHtml(html);
        // Strip cookie / cart popup clutter from the beginning
        const cleanedSnippet = text
            .replace(/^.*?Accept Decline\s*/i, '')
            .replace(/^.*?Your cart is currently empty\.?\s*/i, '')
            .replace(/^.*?Continue shopping\s*/i, '')
            .slice(0, 1200);

        const knownTech = [
            'Shopify Plus', 'Headless', 'Hydrogen', 'Next.js', 'Klaviyo', 'Recharge',
            'NetSuite', 'ERP', 'B2B', 'Algolia', 'Checkout Extensions', 'Shopify Functions',
            'Migrations', 'CRO', 'Custom Apps', 'Liquid', 'FastAPI', 'Python', 'Subscriptions',
            'AI Agents', 'Chatbots', 'Autonomous'
        ];
        const detectedTech = knownTech.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));

        return {
            title,
            description,
            headings,
            techKeywords: detectedTech,
            snippet: cleanedSnippet
        };
    } catch {
        return null;
    }
}

async function scrapeWebsiteContext(websiteUrl?: string, directoryUrl?: string): Promise<ScrapedContext | null> {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    };

    const [dirResult, webResult] = await Promise.allSettled([
        directoryUrl ? scrapeDirectory(directoryUrl, headers) : Promise.resolve(null),
        websiteUrl ? scrapeWebsite(websiteUrl, headers) : Promise.resolve(null),
    ]);

    const dirData = dirResult.status === 'fulfilled' ? dirResult.value : null;
    const webData = webResult.status === 'fulfilled' ? webResult.value : null;

    if (!dirData && !webData) return null;

    return {
        source: dirData && webData ? 'combined' : (webData ? 'website' : 'shopify-directory'),
        title: webData?.title || dirData?.description?.slice(0, 60),
        description: webData?.description || dirData?.description,
        location: dirData?.location,
        teamSize: dirData?.teamSize,
        partnerSince: dirData?.partnerSince,
        industries: dirData?.industries,
        specialties: dirData?.specialties,
        headings: webData?.headings || [],
        techKeywords: webData?.techKeywords || ['Shopify', 'Liquid'],
        snippet: webData?.snippet,
        directorySnippet: dirData?.description || dirData?.rawSnippet,
        lastScrapedAt: new Date().toISOString()
    };
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

When your merchant clients ask for 24/7 AI shopping concierges (catalog RAG discovery, instant sizing or order lookup) or automated webhook syncs between Shopify and their warehouse/CRM, who handles that technical execution for you?

I engineer deterministic AI chatbots and custom workflow automations at RelayWorks (https://relayworks.dev) using Python FastAPI, LangGraph, and pgvector. I white-label for partner agencies when internal engineering is at capacity.

If you ever run into a build requiring custom AI assistants or external API pipelines, happy to jump on a quick 5-minute technical chat or connect on Telegram (@hazratummar).

Best,
Hazrat Ummar
https://relayworks.dev`
        };
    }

    if (angle === 'concise') {
        return {
            subject: `custom app & automation capacity for ${partnerName}?`,
            body: `Hey there,

Who handles your technical overflow when a merchant asks for custom checkout extensions, AI chatbots, or external API/webhook syncs?

I white-label custom Shopify apps, AI agents, and Python backends for boutique agencies when internal dev teams are booked.

Open to an exploratory chat or Telegram connection (@hazratummar) if you occasionally look for reliable technical subcontractors: https://relayworks.dev.

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

I specialize in Shopify backend performance, custom apps, and automated pipelines. I partner with agencies to handle the deep technical plumbing so your creative team can launch stores on schedule with zero client friction.

Let me know if your team handles all custom app logic in-house or if you occasionally partner with external engineers.

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

I am an independent engineer at RelayWorks. I white-label custom Shopify apps, AI chatbots, and automation pipelines for partner agencies, taking custom tickets off your plate so your theme devs never get bottlenecked.

If you ever have a technical backlog or an upcoming build requiring custom engineering, open to a quick 5-minute chat to see if we'd be a fit.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function cleanAntiSlop(text: string): string {
    return text
        .replace(/—/g, ' - ')
        .replace(/–/g, ' - ')
        .replace(/\(\$[0-9,]+(\s*[-–]\s*\$[0-9,]+)?\)/g, '') // Strips any accidental price parentheticals like ($400 - $600)
        .replace(/\$[0-9,]+\s*[-–]\s*\$[0-9,]+/g, '') // Strips accidental $400 - $600
        .replace(/\b(is|are|was)\s+impressive\b/gi, 'stands out')
        .replace(/\bimpressive\s+/gi, '')
        .replace(/\baligns?\s+perfect(ly)?\b/gi, 'connects directly')
        .replace(/\bintrigued\s+by\b/gi, 'saw your work on')
        .replace(/I hope (this email|you are|this message)[\s\S]*?[.!?]\s*/gi, '')
        .replace(/My name is Hazrat Ummar,?\s*(and\s*)?/gi, '')
        .replace(/I am reaching out (to you )?because\s*/gi, '')
        .replace(/I noticed your impressive\s*/gi, 'Saw your ')
        .replace(/happy to take a (small )?trial sprint[^.\n]*[.!]?/gi, 'open to a quick chat if you ever hit technical capacity.')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

const SYSTEM_PROMPT = `You are Hazrat Ummar, senior software engineer at RelayWorks (https://relayworks.dev).
You write direct, ultra-personalized 1-to-1 cold emails to founders or technical directors at Shopify Partner agencies.

YOUR TECHNICAL CAPABILITIES:
You are an independent technical partner for boutique Shopify agencies:
1. AI Chatbots & Store Assistants: 24/7 AI shopping concierges, catalog RAG discovery bots (answering sizing, product comparisons, stock & order status with zero hallucination), WhatsApp/Telegram merchant concierges.
2. Custom Shopify Apps & Extensions: Shopify Functions (custom discount/bundle logic, cart transforms, volume pricing), Checkout UI extensions.
3. Custom Automations & Webhooks: Event-driven syncs between Shopify and ERPs/CRMs/warehouse APIs, inventory routing, automated background pipelines.
4. Robust Backend Architecture: Python FastAPI microservices, pgvector, LangGraph, high-throughput Node.js/TypeScript APIs.

CRITICAL RULES (ABSOLUTE COMPLIANCE REQUIRED):

1. STRICTLY ZERO PRICING (NO DOLLAR AMOUNTS):
   - NEVER, UNDER ANY CIRCUMSTANCES, QUOTE A PRICE, SPRINT COST, OR RATE.
   - Do NOT write "$400", "$600", "$250", "$350", "$1,200", or ANY dollar numbers.
   - Agency founders find unsolicited prices in a first message spammy. Keep this strictly a peer engineering outreach.

2. BAN FORMULAIC CLOSING LINES:
   - ABSOLUTELY NEVER write: "If you have an AI or automation project on your radar, happy to take a trial sprint ($250 - $350) to demonstrate the results."
   - ABSOLUTELY NEVER write: "happy to take a small trial sprint to prove the turnaround" or "demonstrate the results".
   - ABSOLUTELY NEVER write: "If you have an [X] project on your radar...".
   - Instead, close with a natural, varied, low-pressure question:
     * "Do you usually handle custom Shopify app logic and webhook syncs in-house, or do you work with external engineers on technical overflow?"
     * "If your team ever hits a bottleneck on custom Shopify Functions or external API pipelines, open to connecting on Telegram (@hazratummar) or jumping on a quick 5-minute chat."
     * "Happy to share a quick video demo or architecture breakdown showing how we build deterministic catalog assistants if helpful."
     * "Open to an exploratory sync if you are ever looking for a reliable technical subcontractor for client builds."

3. BAN THE 4-PARAGRAPH BOILERPLATE COPY:
   - Do NOT follow the rigid mad-lib pattern:
     "Saw your focus on [X]. When your clients ask for [Y], who builds [Z]? I specialize in [W]. If you have [A], happy to take trial sprint [B]."
   - Every email MUST have a fresh, spontaneous human flow.
   - Speak directly to their specific client niche (e.g. for clothing/apparel: return rates, automated sizing advisors, custom bundle rules; for food & bev: subscription flows, bundle builders; for high-volume B2B: ERP syncs, custom pricing functions).

4. SUBJECT LINE RULES:
   - Generate a dynamic, unique 3 to 6 word subject line that feels handwritten and specific to them.
   - Examples:
     * "enhancing apparel store efficiency"
     * "custom sizing & catalog bots for BitBranding"
     * "shopify functions & webhook overflow"
     * "quick question re: technical overflow"
     * "ai concierge & custom apps for clothing brands"
     * "automations & custom app overflow for [Agency]"

5. ANTI-SLOP & ANTI-AI RULES:
   - No robotic openings ("My name is...", "I am reaching out...", "I hope this email finds you well").
   - No fake flattery ("impressive work", "admire your expertise", "aligns perfectly").
   - No buzzwords ("synergy", "game-changer", "streamline", "robust", "bespoke").
   - NO em-dashes (—).
   - Length: 60 to 95 words. Punchy, professional, respected.

OUTPUT JSON:
{
  "subject": "3 to 6 words tailored to this agency",
  "body": "The complete email body."
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

        // Check if website was scraped in the past 7 days, or needs full multi-source refresh
        let siteContext: ScrapedContext | null = partner.websiteContext ? {
            source: (partner.websiteContext.source as any) || 'combined',
            title: partner.websiteContext.title,
            description: partner.websiteContext.description,
            location: partner.websiteContext.location,
            teamSize: partner.websiteContext.teamSize,
            partnerSince: partner.websiteContext.partnerSince,
            industries: partner.websiteContext.industries,
            specialties: partner.websiteContext.specialties,
            headings: partner.websiteContext.headings,
            techKeywords: partner.websiteContext.techKeywords,
            snippet: partner.websiteContext.snippet,
            directorySnippet: partner.websiteContext.directorySnippet
        } : null;

        const isCacheStale = !partner.websiteContext?.lastScrapedAt || 
            (Date.now() - new Date(partner.websiteContext.lastScrapedAt).getTime() > 7 * 24 * 60 * 60 * 1000);
        
        // If partner lacks directory details (partnerSince / industries) or client requested refresh, scrape both now!
        const needsFreshData = !siteContext || isCacheStale || !partner.websiteContext?.partnerSince || Boolean(body.forceRefresh);

        if (needsFreshData) {
            const freshContext = await scrapeWebsiteContext(partner.websiteUrl, partner.partnerDirectoryUrl);
            if (freshContext) {
                siteContext = freshContext;
                partner.websiteContext = {
                    source: freshContext.source,
                    title: freshContext.title,
                    description: freshContext.description,
                    location: freshContext.location,
                    teamSize: freshContext.teamSize,
                    partnerSince: freshContext.partnerSince,
                    industries: freshContext.industries,
                    specialties: freshContext.specialties,
                    headings: freshContext.headings || [],
                    techKeywords: freshContext.techKeywords || [],
                    snippet: freshContext.snippet,
                    directorySnippet: freshContext.directorySnippet,
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

        // Prepare rich multi-source facts for prompt
        const directoryFacts = [
            siteContext?.partnerSince ? `Shopify Partner Since: ${siteContext.partnerSince}` : null,
            siteContext?.teamSize ? `Estimated Team Size: ${siteContext.teamSize}` : null,
            siteContext?.location ? `Primary Location: ${siteContext.location}` : (partner.location ? `Location: ${partner.location}` : null),
            siteContext?.industries ? `Top Industries: ${siteContext.industries}` : null,
            siteContext?.specialties ? `Core Specialties: ${siteContext.specialties}` : (partner.services?.length ? `Services: ${partner.services.join(', ')}` : null),
            partner.description ? `Shopify Profile Description: ${partner.description}` : null,
        ].filter(Boolean).join('\n');

        const websiteFacts = [
            siteContext?.title ? `Website Title: ${siteContext.title}` : null,
            siteContext?.description ? `Meta Description: ${siteContext.description}` : null,
            siteContext?.headings?.length ? `Core Headings: ${siteContext.headings.join(' | ')}` : null,
            siteContext?.techKeywords?.length ? `Detected Stack: ${siteContext.techKeywords.join(', ')}` : null,
            siteContext?.snippet ? `Live Website Copy Excerpt: ${siteContext.snippet}` : null,
        ].filter(Boolean).join('\n');

        const userPrompt = `TARGET AGENCY INTELLIGENCE:
Agency Name: ${partner.name}
Website: ${partner.websiteUrl || 'Not listed'}
Shopify Directory URL: ${partner.partnerDirectoryUrl}

VERIFIED SHOPIFY PARTNER DIRECTORY FACTS:
${directoryFacts || 'Standard certified Shopify Partner'}

AGENCY WEBSITE INTELLIGENCE (LIVE SCRAPED COPY):
${websiteFacts || 'Website details not accessible'}

REQUESTED OUTREACH ANGLE: ${requestedAngle}

TASK:
Write a high-converting, human, peer-to-peer cold email (60 to 90 words) strictly tailored to this agency's real work and niche.
CRITICAL ENFORCEMENT: ZERO PRICES ($0 quotes), NO TRIAL SPRINT REPETITION, NO RIGID 4-PARAGRAPH TEMPLATES.`;

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
