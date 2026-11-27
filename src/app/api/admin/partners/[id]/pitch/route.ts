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
            subject: `webhook & script overflow for ${partnerName}`,
            body: `Hi ${partnerName} team,

Saw your Shopify portfolio around ${siteContext?.industries || 'ecommerce builds and growth'}.

When merchants ask for standalone work outside Liquid—like ERP/warehouse webhook syncs, private API middleware, or automated order-ops scripts—I handle those builds silently under NDA as your white-label dev partner with clean repo handover.

If your core team wants extra backend capacity without adding full-time headcount, is there room to connect?

Thanks,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (angle === 'concise') {
        return {
            subject: `quick dev question, ${partnerName}`,
            body: `Hi ${partnerName} team,

I step in white-label under NDA for Shopify agencies when clients need standalone AI support chatbots, ERP/webhook automations, Discord/Telegram bots, or companion mobile apps—with full repo handover under your brand.

Is there ever room for quiet dev backup when those requests hit your roadmap?

Thanks,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (isTechAgency) {
        return {
            subject: `bot & mobile overflow for ${partnerName}`,
            body: `Hi ${partnerName} team,

Saw on your site that your team already handles technical builds and integrations for Shopify brands.

Whenever your roadmap is full and a client asks for a standalone AI support agent, a Discord/Telegram VIP bot, or a native Android/KMP companion app, I ship those tickets white-label under NDA with direct repo handover so you keep margin without pulling core devs off priority work.

Is there any room to keep my contact handy as quiet overflow backup?

Thanks,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    return {
        subject: `white-label dev for ${partnerName}?`,
        body: `Hi ${partnerName} team,

Saw ${partnerName} works on Shopify builds and growth for ${siteContext?.industries || 'consumer brands'}${siteContext?.location ? ` out of ${siteContext.location}` : ''}.

Whenever merchants ask for out-of-scope features like AI support/catalog chatbots, custom ERP/webhook scripts, Discord/Telegram community bots, or companion mobile apps, I build them silently under your brand with clean repo handover—letting you capture that extra retainer revenue with zero hiring overhead.

Is there any room to plug in as quiet white-label dev backup when those asks come up?

Thanks,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function ensureCompletePartnerSignature(body: string): string {
    const trimmed = body.trim();
    if (/relayworks\.dev/i.test(trimmed)) return trimmed;
    const withoutTrailingThanks = trimmed.replace(/\n*(thanks|best|regards),?\s*$/i, '').trim();
    return `${withoutTrailingThanks}\n\nThanks,\nHazrat Ummar\nhttps://relayworks.dev | Telegram: @hazratummar`;
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
    'Start with a friendly greeting ("Hi [Agency] team,") and open with a direct second-person question asking what they do when merchant clients request out-of-scope features (AI chatbots, ERP/webhook syncs, Discord/Telegram bots, or mobile apps) outside normal Shopify work.',
    'Start with "Hey [Agency] team," and introduce yourself plainly as a silent white-label backend, AI, and mobile dev who steps in under NDA when ecommerce clients ask for custom tools outside storefront themes/CRO.',
    'Start with "Hi [Agency] team," and focus directly on the merchant pain: when a client wants an AI support bot, Discord/Telegram community bot, or custom webhook script mid-retainer, you handle the full build under their brand with clean repo handover and zero new hiring.',
    'Start with "Hey [Agency] team," and lead with a short check-in offering quiet overflow engineering capacity so they can say yes to extra technical retainers without pulling core devs off priority Shopify builds.'
];

const SYSTEM_PROMPT = `You are Hazrat Ummar, a solo senior software developer running RelayWorks (https://relayworks.dev).
You write natural, compact, high-value 1-to-1 cold emails to Shopify Partner agencies.

HOW A REAL HUMAN EMAIL WORKS (CRITICAL):
1. NEVER recite or summarize the agency's own bio/services back to them like a Wikipedia entry!
   - FORBIDDEN: "Kinful handles Shopify theme customization...", "Levitate Foundry builds Shopify stores...", "Saw your agency specializes in CRO and migrations..."
   - They already know what their own company does. Only use their Shopify services/vertical as silent background context to tailor WHICH technical add-ons make sense for their clients (e.g. "outside theme sprints" vs "outside CRO retainers").
2. ALWAYS speak directly in 1st & 2nd person ("I" / "you" / "your clients" / "your team"), starting with a warm greeting ("Hi [Agency Name] team,").
3. NEVER open with a dangling modifier ("Based in Austin...", "Working with brands...", "Seeing your work...").

VALUE PROPOSITION (WHY REPLYING HELPS THEM):
- Whenever their merchants ask for standalone software outside normal Shopify work—AI support/order chatbots (FastAPI/LangGraph), ERP/warehouse webhook syncs, Discord/Telegram VIP bots, or native Android/KMP companion apps—you step in **silently under NDA under their brand**.
- Direct Git repo handover, zero client poaching, and they capture that extra retainer margin without hiring full-time Python, AI, or mobile engineers.
- Close gently asking IF there is ever room to keep you on file for white-label overflow.

STRICT PLAIN-ENGLISH RULES (ZERO STIFF PHRASING OR BUZZWORDS):
1. BANNED WORDS / STIFF PHRASES:
   "innovative", "keen focus", "craft", "seamless", "elevate", "bespoke", "connect deeply", "meaningful relationships", "toolkit", "be of interest", "synergy", "robust", "streamline", "leverage", "magic", "impressive", "cutting-edge", "unlock", "delve", "aligns with", "I noticed", "strategic insights", "more technical solutions", "more technical depth", "overflow scenarios", "quietly assist", "beyond your core".
2. FORMATTING:
   - Compact yet complete: **75 to 105 words total** (50 to 70 words if angle is "concise").
   - Double-newline (\\n\\n) between greeting, body paragraphs, and sign-off. Zero em-dashes (—). Zero dollar quotes.
   - Always finish with:
     Thanks,
     Hazrat Ummar
     https://relayworks.dev | Telegram: @hazratummar
3. SUBJECT LINE:
   - 3 to 5 plain words, natural lowercase or simple case (e.g. "white-label dev for Kinful?", "quick dev question, Kinful", "bot & webhook backup?", "Kinful + RelayWorks dev?").

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
                                body: ensureCompletePartnerSignature(cleanAntiSlop(parsed.body))
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
                                body: ensureCompletePartnerSignature(cleanAntiSlop(parsed.body))
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
