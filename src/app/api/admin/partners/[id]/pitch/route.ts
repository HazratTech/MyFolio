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
    angle: 'white-label' | 'custom-scripts' | 'concise' | 'technical-audit' | 'ai-automation' = 'white-label',
    siteContext?: ScrapedContext | null
) {
    const isDesignOrCro = /design|cro|conversion|brand|creative|ui|ux/i.test(services.join(' ') + ' ' + desc);
    const serviceHighlight = siteContext?.description?.slice(0, 80) 
        || (isDesignOrCro ? 'store design, UX, and branding' : 'Shopify store builds and merchant growth');

    if (angle === 'custom-scripts' || angle === 'technical-audit') {
        return {
            subject: `custom scripts & webhook overflow for ${partnerName}?`,
            body: `Hey team at ${partnerName},

Saw your focus around ${serviceHighlight}.

When your merchant clients ask for custom technical logic outside standard themes—like event-driven webhook syncs with ERPs/warehouses, custom Shopify Functions, or private backend scripts—who handles that execution for you?

I build custom scripts, private Shopify apps, and automated API pipelines at RelayWorks (https://relayworks.dev). I partner with agencies on a white-label basis to take complex technical tickets off their plate.

Do you typically handle custom script and webhook requests in-house, or do you collaborate with external engineering partners for overflow?

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (angle === 'concise') {
        return {
            subject: `white-label bots & custom apps for ${partnerName}?`,
            body: `Hey there,

When your clients ask for custom AI chatbots, Telegram/Discord community bots, or companion mobile apps, do you have a go-to technical partner, or do you turn those down?

I white-label these specialized builds for Shopify agencies at RelayWorks (https://relayworks.dev), letting your team expand billable services without hiring full-time engineers.

Open to a brief chat or connecting on Telegram (@hazratummar) if you ever look for a reliable engineering subcontractor.

Best,
Hazrat`
        };
    }

    // Default: white-label
    return {
        subject: `white-label AI chatbots & custom tech for ${partnerName}?`,
        body: `Hey team at ${partnerName},

Saw your track record around ${serviceHighlight}.

Because your agency focuses heavily on design, branding, and theme development, what happens when a merchant asks for services outside your core scope—like a 24/7 AI shopping chatbot, Telegram/Discord community bots, custom backend scripts, or a companion mobile app?

I run RelayWorks (https://relayworks.dev). We act as a white-label technical engineering partner for boutique Shopify agencies, delivering the AI chatbots, bots, custom scripts, and mobile apps that design teams don't keep in-house. You bill your client, keep the margin, and we handle the build under your brand.

Do you currently have a go-to partner when clients request these technical builds, or do you handle them internally?

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

const SYSTEM_PROMPT = `You are Hazrat Ummar, senior software engineer and founder of RelayWorks (https://relayworks.dev).
You write direct, human, 1-to-1 cold emails to founders or technical leads at Shopify Partner agencies.

YOUR CORE PROPOSITION:
You are a white-label technical engineering partner for boutique Shopify agencies.
You do NOT assist or meddle in their daily design, branding, SEO, or theme work.
Instead, you offer YOUR OWN specialized engineering services that these agencies typically DO NOT provide in-house:
1. Chatbots & AI Chatbots: 24/7 AI shopping concierges, catalog RAG discovery, instant order lookup, and customer support bots.
2. Discord & Telegram Bots: Custom bots for brand communities, VIP buyer clubs, creator view bounties, and merchant order alerts.
3. Custom Scripts & Webhook Automations: Event-driven webhooks, ERP/warehouse/CRM syncs, inventory routers, background automation scripts, and custom Shopify Functions.
4. Companion Mobile Apps: Production native Android (Kotlin) and cross-platform companion mobile apps for Shopify brands.

THE WINNING B2B WHITE-LABEL ANGLE:
Agency founders want to say YES when their merchant clients ask for advanced technical builds (AI chatbots, Telegram/Discord bots, custom scripts, mobile apps), without having to hire a full-time $120k/yr engineer.
You build it white-label under their agency name. They invoice their client, keep the profit margin, and take zero technical risk.

CRITICAL RULES (ABSOLUTE COMPLIANCE REQUIRED):

1. STRICTLY ZERO PRICING (NO DOLLAR AMOUNTS):
   - NEVER, UNDER ANY CIRCUMSTANCES, QUOTE A PRICE, SPRINT COST, OR RATE ($0 quotes).
   - Do NOT write "$400", "$600", "$250", "$350", "$1,200", or ANY dollar numbers.
   - Agency founders find unsolicited price quotes spammy. Keep this strictly a peer engineering outreach.

2. DO NOT MEDDLE IN THEIR CORE WORK:
   - NEVER give advice on their themes, design, SEO, or client marketing.
   - Acknowledge what they build (e.g. "Saw your focus scaling 765+ apparel brands on Shopify"), then immediately pivot to: what happens when their clients ask for custom AI chatbots, bots, custom scripts, or mobile apps that fall outside their core offering?

3. NATURAL, CONVERSATIONAL CLOSING:
   - Ask a direct, low-friction question:
     * "Do you currently have a go-to technical partner when clients ask for custom AI chatbots, bots, or backend scripts, or do you turn those down?"
     * "If your clients ever request custom Telegram/Discord bots, mobile apps, or backend automations outside your core scope, open to a quick chat to see if a white-label partnership makes sense."
     * "Open to connecting on Telegram (@hazratummar) if you ever look for a reliable engineering subcontractor for client builds."

4. NO FORMULAIC TRIAL SPRINT LINES:
   - ABSOLUTELY NEVER write: "If you have an AI or automation project on your radar, happy to take a trial sprint...".
   - ABSOLUTELY NEVER write: "happy to take a small trial sprint to prove the turnaround" or "demonstrate the results".

5. SUBJECT LINE RULES:
   - Generate a dynamic, unique 3 to 6 word subject line that feels handwritten and specific to them.
   - Examples:
     * "white-label bots & custom tech for [Agency]?"
     * "custom scripts & AI chatbot overflow"
     * "telegram bots & custom apps for [Agency]"
     * "mobile apps & AI concierges for your clients?"
     * "quick question re: technical overflow"

6. ANTI-SLOP & ANTI-AI RULES:
   - No robotic openings ("My name is...", "I am reaching out...", "I hope this email finds you well").
   - No fake flattery ("impressive work", "admire your expertise", "aligns perfectly").
   - No buzzwords ("synergy", "game-changer", "streamline", "robust", "bespoke").
   - NO em-dashes (—).
   - Length: 65 to 95 words. Crisp, peer-to-peer, confident.

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
        const requestedAngle = (body.angle || 'white-label') as 'white-label' | 'custom-scripts' | 'concise' | 'technical-audit' | 'ai-automation';
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

        const angleDescription = (requestedAngle === 'custom-scripts' || requestedAngle === 'technical-audit')
            ? 'Offer custom backend scripts, webhook pipelines (syncing Shopify with ERPs/CRMs/warehouses), private Shopify apps, and Shopify Functions when their theme devs are bottlenecked.'
            : (requestedAngle === 'concise'
                ? 'Ultra-short 3-sentence DM directly to the founder asking if they ever white-label custom AI chatbots, bots, or scripts.'
                : 'White-Label Engineering Partner: Offer Hazrat\'s specialized services (Chatbots, AI chatbots, Discord/Telegram bots, custom scripts & automations, mobile app dev) so this agency can sell these high-ticket capabilities to their clients without hiring in-house engineers.');

        const userPrompt = `TARGET AGENCY INTELLIGENCE:
Agency Name: ${partner.name}
Website: ${partner.websiteUrl || 'Not listed'}
Shopify Directory URL: ${partner.partnerDirectoryUrl}

VERIFIED SHOPIFY PARTNER DIRECTORY FACTS:
${directoryFacts || 'Standard certified Shopify Partner'}

AGENCY WEBSITE INTELLIGENCE (LIVE SCRAPED COPY):
${websiteFacts || 'Website details not accessible'}

REQUESTED OUTREACH ANGLE: ${requestedAngle} (${angleDescription})

TASK:
Write a high-converting, human, peer-to-peer cold email (65 to 95 words) offering Hazrat's specialized services on a white-label basis.
CRITICAL ENFORCEMENT:
- DO NOT meddle or give advice on their theme design or marketing.
- Offer Hazrat's services (Chatbots, AI chatbots, Discord/Telegram bots, custom scripts, mobile dev) as their white-label partner when their clients ask for these capabilities.
- STRICTLY ZERO PRICES ($0 quotes), NO TRIAL SPRINT REPETITION, NO RIGID 4-PARAGRAPH TEMPLATES.`;

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
