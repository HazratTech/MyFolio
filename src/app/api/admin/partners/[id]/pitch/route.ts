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
    foundEmail?: string;
    discoveredWebsite?: string;
    lastScrapedAt?: Date | string;
}

function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;|&apos;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ');
}

function cleanHtml(rawHtml: string): string {
    const stripped = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ')
        .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ');
    return decodeHtmlEntities(stripped)
        .replace(/\s+/g, ' ')
        .trim();
}

function decodeCfEmail(hex: string): string | undefined {
    try {
        const key = parseInt(hex.slice(0, 2), 16);
        let out = '';
        for (let i = 2; i < hex.length; i += 2) {
            out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out) ? out.toLowerCase() : undefined;
    } catch {
        return undefined;
    }
}

function isBrokenWebsiteUrl(url?: string): boolean {
    if (!url) return true;
    return /shopifycdn\.com|shopify\.com|\.(png|jpg|jpeg|svg|webp|gif|pdf)(\?|$)/i.test(url);
}

function extractAgencyEmail(html: string): string | undefined {
    const blocked = /sentry|wixpress|example\.com|shopify\.com|shopifycdn\.com|schema\.org|w3\.org|noreply|no-reply|donotreply|u002f|@2x|\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;

    const mailtoMatches = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15})/gi));
    for (const m of mailtoMatches) {
        const candidate = m[1].toLowerCase().trim();
        if (!blocked.test(candidate)) return candidate;
    }

    const cfMatches = Array.from(html.matchAll(/data-cfemail=["']([0-9a-fA-F]+)["']/gi));
    for (const m of cfMatches) {
        const decoded = decodeCfEmail(m[1]);
        if (decoded && !blocked.test(decoded)) return decoded;
    }

    const textMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g) || [];
    for (const raw of textMatches) {
        const candidate = raw.toLowerCase().trim();
        if (!blocked.test(candidate)) return candidate;
    }

    return undefined;
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

        const foundEmail = extractAgencyEmail(html);

        let discoveredWebsite: string | undefined;
        const jsonSite = html.match(/contactType\\",\\"(?:website|other)\\",\\"contactUrl\\",\\"(https?:\/\/[^\\"]+)\\"/i);
        if (jsonSite && jsonSite[1] && !isBrokenWebsiteUrl(jsonSite[1])) {
            try {
                discoveredWebsite = new URL(jsonSite[1].replace(/\\u002F/gi, '/')).origin;
            } catch {
                discoveredWebsite = jsonSite[1];
            }
        } else if (foundEmail) {
            const domain = foundEmail.split('@')[1];
            if (domain && !/^(gmail|yahoo|outlook|hotmail|icloud|protonmail|aol)\./i.test(domain)) {
                discoveredWebsite = `https://${domain}`;
            }
        }

        return {
            partnerSince: partnerSinceMatch ? partnerSinceMatch[1].trim() : undefined,
            teamSize: teamSizeMatch ? teamSizeMatch[1].trim() : undefined,
            location: locationMatch ? locationMatch[1].trim() : undefined,
            industries: industriesMatch ? industriesMatch[1].trim().slice(0, 160) : undefined,
            specialties: specialtiesMatch ? specialtiesMatch[1].replace(/\(opens in a new tab\)/g, '').trim().slice(0, 200) : undefined,
            description: descMatch ? decodeHtmlEntities(descMatch[1].trim()) : undefined,
            rawSnippet: text.slice(0, 500),
            foundEmail,
            discoveredWebsite,
        };
    } catch {
        return null;
    }
}

async function scrapeWebsite(websiteUrl: string, headers: Record<string, string>) {
    try {
        if (isBrokenWebsiteUrl(websiteUrl)) return null;
        const res = await fetch(websiteUrl, { headers, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
            return null;
        }
        const html = await res.text();
        if (html.includes('Attention Required! | Cloudflare') || html.includes('Sorry, you have been blocked')) {
            return null;
        }

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? decodeHtmlEntities(titleMatch[1]).replace(/\s+/g, ' ').trim() : '';

        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const description = metaDescMatch ? decodeHtmlEntities(metaDescMatch[1]).replace(/\s+/g, ' ').trim() : '';

        const headingMatches = Array.from(html.matchAll(/<h[123][^>]*>([^<]+)<\/h[123]>/gi));
        const headings = headingMatches
            .map(m => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
            .filter(h => h.length > 5 && !/menu|nav|cookie|privacy|copyright|cart|sign in|log in|search/i.test(h))
            .slice(0, 6);

        let foundEmail = extractAgencyEmail(html);
        if (!foundEmail) {
            const origin = new URL(websiteUrl).origin;
            for (const path of ['/contact', '/contact-us', '/about']) {
                try {
                    const contactRes = await fetch(`${origin}${path}`, { headers, signal: AbortSignal.timeout(3500) });
                    if (contactRes.ok) {
                        const contactHtml = await contactRes.text();
                        foundEmail = extractAgencyEmail(contactHtml);
                        if (foundEmail) break;
                    }
                } catch {
                    // Try next path
                }
            }
        }

        const text = cleanHtml(html);
        const cleanedSnippet = text
            .replace(/^.*?Accept Decline\s*/i, '')
            .replace(/^.*?Your cart is currently empty\.?\s*/i, '')
            .replace(/^.*?Continue shopping\s*/i, '')
            .slice(0, 1400);

        const knownTech = [
            'Shopify Plus', 'Headless', 'Hydrogen', 'Next.js', 'Klaviyo', 'Recharge',
            'NetSuite', 'ERP', 'B2B', 'Algolia', 'Checkout Extensions', 'Shopify Functions',
            'Migrations', 'CRO', 'Custom Apps', 'Liquid', 'FastAPI', 'Python', 'Subscriptions',
            'AI Agents', 'Chatbots', 'Autonomous', 'Outsourced CTO', 'Data Science'
        ];
        const detectedTech = knownTech.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));

        return {
            title,
            description,
            headings,
            techKeywords: detectedTech,
            snippet: cleanedSnippet,
            foundEmail,
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

    const dirData = directoryUrl ? await scrapeDirectory(directoryUrl, headers) : null;
    const effectiveWebsiteUrl = !isBrokenWebsiteUrl(websiteUrl) ? websiteUrl : dirData?.discoveredWebsite;
    const webData = effectiveWebsiteUrl ? await scrapeWebsite(effectiveWebsiteUrl, headers) : null;

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
        foundEmail: dirData?.foundEmail || webData?.foundEmail,
        discoveredWebsite: effectiveWebsiteUrl,
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
    const cleanDesc = decodeHtmlEntities(desc);
    const isTechAgency = /cto|engineering team|data science|custom app|headless|api|backend/i.test(`${services.join(' ')} ${cleanDesc}`);

    if (angle === 'custom-scripts' || angle === 'technical-audit') {
        return {
            subject: `webhook & script capacity for ${partnerName}`,
            body: `Hey ${partnerName} team,

Saw your work around ${siteContext?.industries || 'Shopify merchant builds'}.

When client projects require standalone backend scripts, ERP/warehouse webhook syncs, or custom Shopify Functions outside standard storefront sprints, I take those tickets white-label so your core team stays focused.

Would extra backend engineering bandwidth be helpful when roadmaps pile up?

Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (angle === 'concise') {
        return {
            subject: `quick dev question, ${partnerName}`,
            body: `Hey ${partnerName} team,

I build white-label AI shopping chatbots, Discord/Telegram community bots, and Android/KMP companion apps for Shopify agencies.

Open to connecting if you ever need sprint capacity on those fronts?

Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (isTechAgency) {
        return {
            subject: `bot & mobile sprint capacity for ${partnerName}`,
            body: `Hey ${partnerName} team,

Looked through your site and saw you already run dedicated technical and engineering builds for clients.

When your main roadmap is busy and a client asks for a standalone Discord/Telegram community bot, an AI support concierge, or a native Android/KMP companion app, I handle those sprints white-label at RelayWorks (https://relayworks.dev).

Open to keeping my contact handy for specialist overflow sprints?

Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    return {
        subject: `bots & mobile builds for ${partnerName}`,
        body: `Hey ${partnerName} team,

Looked at your ${siteContext?.location ? `${siteContext.location} ` : ''}Shopify portfolio around ${siteContext?.industries || 'storefront design and growth'}.

I partner white-label with agencies when merchants request standalone technical builds like AI support/catalog chatbots, Telegram/Discord VIP bots, ERP webhook scripts, or companion mobile apps.

If those requests ever hit your inbox, open to a quick chat?

Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function cleanAntiSlop(text: string): string {
    return decodeHtmlEntities(text)
        .replace(/—/g, ', ')
        .replace(/–/g, ', ')
        .replace(/\(\$[0-9,]+(\s*[-–]\s*\$[0-9,]+)?\)/g, '')
        .replace(/\$[0-9,]+\s*[-–]\s*\$[0-9,]+/g, '')
        .replace(/\$\d[\d,]*/g, '')
        .replace(/\b(is|are|was|sounds?)\s+impressive\b/gi, 'stands out')
        .replace(/\bimpressive\b/gi, 'solid')
        .replace(/\baligns?\s+(perfect(ly)?|with)\b/gi, 'fits')
        .replace(/\bintrigued\s+by\b/gi, 'saw')
        .replace(/\bYour setup stands out\.?\s*/gi, '')
        .replace(/\b(streamline|seamless|bespoke|innovative|elevate|cutting-edge|next-level|holistic|transformative)\b/gi, (m) => {
            const low = m.toLowerCase();
            if (low === 'streamline') return 'simplify';
            if (low === 'elevate') return 'support';
            if (low === 'bespoke') return 'custom';
            if (low === 'seamless') return 'smooth';
            return '';
        })
        .replace(/\becommerce magic\b/gi, 'storefront')
        .replace(/\bkeen focus\b/gi, 'focus')
        .replace(/I hope (this email|you are|this message)[\s\S]*?[.!?]\s*/gi, '')
        .replace(/My name is Hazrat Ummar,?\s*(and\s*)?/gi, '')
        .replace(/I am reaching out (to you )?because\s*/gi, '')
        .replace(/happy to take a (small )?trial sprint[^.\n]*[.!]?/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const STYLE_VARIATIONS = [
    'Open with a short, plain factual mention of the types of brands or location on their Shopify profile, then state what you build and ask if there is any room.',
    'Open immediately with what you build at RelayWorks, tie it briefly to their Shopify storefront/marketing work, and ask if they ever have overflow room for external dev work.',
    'Open with a casual developer-to-developer check-in mentioning one specific service/industry from their site, then ask simply if there is room to plug in white-label.',
    'Keep it 3 short, direct paragraphs: 1 plain observation from their site, 1 plain sentence listing your dev capabilities, 1 humble no-pressure question asking if there is room.'
];

const SYSTEM_PROMPT = `You are Hazrat Ummar, a solo software developer running RelayWorks (https://relayworks.dev).
You write plain, honest, low-pressure 1-to-1 emails to Shopify Partner agencies.

THE CORE MINDSET (READ CAREFULLY):
- DO NOT teach, advise, lecture, or flatter the partner about their own business ("ensure they connect deeply", "elevate customer engagement", "craft seamless experiences"). They already know how to run their agency.
- Your ONLY goal is to plainly introduce what you build and ask gently **"IF there is any room"** for you to integrate white-label when their clients ask for extra dev work.

WHO THEY ARE (ADAPT CONTEXT WITHOUT FLUFF):
- TYPE A (Design / Branding / Marketing / CRO Agency): They build stores or run marketing. Mention 1 concrete fact (their city, vertical like apparel/food/beauty, or Shopify Partner tenure), then ask if their clients ever ask for AI chatbots, Discord/Telegram community bots, custom backend scripts, or companion mobile apps where there might be room for white-label dev help.
- TYPE B (Technical / Engineering / Outsourced CTO / AI Shop): They already have devs. Simply acknowledge their engineering/CTO focus plainly and ask if there's ever room for overflow sprint help on standalone Discord/Telegram bots, native Android/KMP mobile apps, or isolated FastAPI webhook scripts when their core team is booked.

WHAT HAZRAT BUILDS (STATE PLAINLY, NO HYPE):
- AI chatbots & catalog/support agents (Python FastAPI, LangGraph)
- Discord & Telegram bots (VIP communities, order alerts, crypto/creator tracking)
- Custom backend scripts & ERP/webhook automations
- Mobile companion apps (Android Kotlin / Kotlin Multiplatform)

STRICT PLAIN-ENGLISH RULES (ZERO AI BUZZWORDS):
1. BANNED WORDS (NEVER USE ANY OF THESE):
   "innovative", "keen focus", "craft", "seamless", "elevate", "bespoke", "connect deeply", "meaningful relationships", "toolkit", "be of interest", "synergy", "robust", "streamline", "leverage", "magic", "impressive", "cutting-edge", "unlock", "delve", "aligns with", "I noticed", "strategic insights".
2. BANNED CANNED TEMPLATES:
   NEVER write: "You invoice, keep the margin, and avoid technical risk", "go-to technical partner", "beyond your core", "if a partnership aligns", or "Saw your focus...".
3. TONE & VOICE:
   Sound like a normal, grounded human developer writing a quick plain email at their desk. Short everyday words. Zero sales hype. Zero preaching.
4. ZERO PRICING ($0 quotes).
5. FORMATTING:
   - 50 to 80 words total. Clean paragraph breaks (\\n\\n). Zero em-dashes (—).
   - Sign off simply:
     Hazrat Ummar
     https://relayworks.dev | Telegram: @hazratummar
6. SUBJECT LINE:
   - 3 to 5 ultra-plain words in natural lowercase or simple case (e.g. "white-label dev for DXagency?", "bot / app overflow for DXagency", "DXagency + RelayWorks dev?", "quick dev question, DXagency"). NEVER buzzword titles like "Innovative touch for Health & Beauty brands".

OUTPUT JSON ONLY:
{
  "subject": "...",
  "body": "..."
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

        // Clean any legacy HTML entities stored in partner.description
        if (partner.description && /&#?\w+;/.test(partner.description)) {
            partner.description = decodeHtmlEntities(partner.description);
        }

        let siteContext: ScrapedContext | null = partner.websiteContext ? {
            source: (partner.websiteContext.source as any) || 'combined',
            title: partner.websiteContext.title ? decodeHtmlEntities(partner.websiteContext.title) : undefined,
            description: partner.websiteContext.description ? decodeHtmlEntities(partner.websiteContext.description) : undefined,
            location: partner.websiteContext.location,
            teamSize: partner.websiteContext.teamSize,
            partnerSince: partner.websiteContext.partnerSince,
            industries: partner.websiteContext.industries,
            specialties: partner.websiteContext.specialties,
            headings: partner.websiteContext.headings,
            techKeywords: partner.websiteContext.techKeywords,
            snippet: partner.websiteContext.snippet ? decodeHtmlEntities(partner.websiteContext.snippet) : undefined,
            directorySnippet: partner.websiteContext.directorySnippet ? decodeHtmlEntities(partner.websiteContext.directorySnippet) : undefined
        } : null;

        const isCacheStale = !partner.websiteContext?.lastScrapedAt ||
            (Date.now() - new Date(partner.websiteContext.lastScrapedAt).getTime() > 7 * 24 * 60 * 60 * 1000);

        const needsFreshData = !siteContext || isCacheStale || !partner.websiteContext?.partnerSince || !partner.email || Boolean(body.forceRefresh);

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
                if (!partner.email && freshContext.foundEmail) {
                    partner.email = freshContext.foundEmail;
                }
                if (freshContext.discoveredWebsite && isBrokenWebsiteUrl(partner.websiteUrl)) {
                    partner.websiteUrl = freshContext.discoveredWebsite;
                }
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

        const directoryFacts = [
            siteContext?.partnerSince ? `Shopify Partner Since: ${siteContext.partnerSince}` : null,
            siteContext?.teamSize ? `Estimated Team Size: ${siteContext.teamSize}` : null,
            siteContext?.location ? `Primary Location: ${siteContext.location}` : (partner.location ? `Location: ${partner.location}` : null),
            siteContext?.industries ? `Top Industries: ${siteContext.industries}` : null,
            siteContext?.specialties ? `Core Specialties: ${siteContext.specialties}` : (partner.services?.length ? `Services: ${partner.services.join(', ')}` : null),
            partner.description ? `Shopify Profile Description: ${decodeHtmlEntities(partner.description)}` : null,
        ].filter(Boolean).join('\n');

        const websiteFacts = [
            siteContext?.title ? `Website Title: ${siteContext.title}` : null,
            siteContext?.description ? `Meta Description: ${siteContext.description}` : null,
            siteContext?.headings?.length ? `Website Headings: ${siteContext.headings.join(' | ')}` : null,
            siteContext?.techKeywords?.length ? `Detected Tech/Positioning: ${siteContext.techKeywords.join(', ')}` : null,
            siteContext?.snippet ? `Live Website Copy Excerpt: ${siteContext.snippet}` : null,
        ].filter(Boolean).join('\n');

        const angleDescription = (requestedAngle === 'custom-scripts' || requestedAngle === 'technical-audit')
            ? 'Focus specifically on standalone custom scripts, ERP/CRM/warehouse webhook syncs, private apps, and Shopify Functions.'
            : (requestedAngle === 'concise'
                ? 'Ultra-short 3-sentence note (40-55 words total) suited for quick reading.'
                : 'White-Label / Specialist Overflow Partner across AI chatbots, Discord/Telegram bots, custom scripts, and mobile companion apps.');

        const styleSeed = STYLE_VARIATIONS[Math.floor(Math.random() * STYLE_VARIATIONS.length)];

        const userPrompt = `TARGET AGENCY: ${partner.name}
WEBSITE: ${partner.websiteUrl || 'Not listed'}
SHOPIFY DIRECTORY: ${partner.partnerDirectoryUrl}

VERIFIED DIRECTORY FACTS:
${directoryFacts || 'Certified Shopify Partner'}

LIVE WEBSITE COPY:
${websiteFacts || 'Website copy unavailable'}

REQUESTED ANGLE: ${requestedAngle} (${angleDescription})
STYLE DIRECTION FOR THIS EMAIL: ${styleSeed}

Write a genuinely original, non-templated email adapting strictly to whether ${partner.name} is a Design/Marketing shop (TYPE A) or an existing Technical/CTO/AI shop (TYPE B). Use double-newline paragraph breaks.`;

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
                        temperature: 0.45,
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
                }
            } catch (openAiErr) {
                console.error('OpenAI call error, falling back to Gemini:', openAiErr);
            }
        }

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
                                temperature: 0.45
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
            websiteContext: partner.websiteContext,
            email: partner.email || '',
            websiteUrl: partner.websiteUrl || '',
            description: partner.description,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to generate pitch' }, { status: 500 });
    }
}
