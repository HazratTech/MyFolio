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

function extractAgencyEmail(html: string): string | undefined {
    const blocked = /sentry|wixpress|example\.com|shopify\.com|schema\.org|w3\.org|noreply|no-reply|donotreply|@2x|\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;

    const mailtoMatches = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15})/gi));
    for (const m of mailtoMatches) {
        const candidate = m[1].toLowerCase().trim();
        if (!blocked.test(candidate)) return candidate;
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

        return {
            partnerSince: partnerSinceMatch ? partnerSinceMatch[1].trim() : undefined,
            teamSize: teamSizeMatch ? teamSizeMatch[1].trim() : undefined,
            location: locationMatch ? locationMatch[1].trim() : undefined,
            industries: industriesMatch ? industriesMatch[1].trim().slice(0, 160) : undefined,
            specialties: specialtiesMatch ? specialtiesMatch[1].replace(/\(opens in a new tab\)/g, '').trim().slice(0, 200) : undefined,
            description: descMatch ? decodeHtmlEntities(descMatch[1].trim()) : undefined,
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
            // Check /contact or /contact-us quickly for public agency email
            try {
                const origin = new URL(websiteUrl).origin;
                const contactRes = await fetch(`${origin}/contact`, { headers, signal: AbortSignal.timeout(3500) });
                if (contactRes.ok) {
                    const contactHtml = await contactRes.text();
                    foundEmail = extractAgencyEmail(contactHtml);
                }
            } catch {
                // Ignore contact page lookup failure
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
        foundEmail: webData?.foundEmail,
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
        .replace(/\baligns?\s+perfect(ly)?\b/gi, 'fits')
        .replace(/\bintrigued\s+by\b/gi, 'saw')
        .replace(/\bYour setup stands out\.?\s*/gi, '')
        .replace(/\b(streamline|ecommerce magic)\b/gi, (m) => m.toLowerCase() === 'streamline' ? 'simplify' : 'storefront')
        .replace(/I hope (this email|you are|this message)[\s\S]*?[.!?]\s*/gi, '')
        .replace(/My name is Hazrat Ummar,?\s*(and\s*)?/gi, '')
        .replace(/I am reaching out (to you )?because\s*/gi, '')
        .replace(/happy to take a (small )?trial sprint[^.\n]*[.!]?/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const STYLE_VARIATIONS = [
    'Open directly with an observation about one specific industry or vertical they serve (from their website headings/industries), then pivot smoothly to what you build.',
    'Open with a concise 1-sentence question directly tied to their agency size/location or Shopify Partner tenure, then explain how you plug in cleanly.',
    'Lead immediately with a concrete capability (e.g. standalone Telegram/Discord community bots or companion mobile apps) tailored to the types of stores featured on their site.',
    'Write in a direct, builder-to-builder tone referencing a specific heading or phrase from their website copy—avoid any generic opening pleasantries.'
];

const SYSTEM_PROMPT = `You are Hazrat Ummar, solo software engineer and founder of RelayWorks (https://relayworks.dev).
You write genuinely distinct, human, 1-to-1 cold emails to founders or leads at Shopify Partner agencies.

CRITICAL CONTEXT ADAPTATION (READ THEIR ACTUAL AGENCY TYPE FIRST):
Before writing a single word, classify who you are emailing based on their scraped website copy & Shopify profile:
- TYPE A (Design, Branding, Marketing, CRO, or Theme Storefront Agency):
  They specialize in design, branding, themes, or growth. Pitch yourself as their behind-the-scenes technical partner when their merchants request builds outside visual storefront work: AI chatbots (catalog RAG, 24/7 support), Telegram/Discord community bots, backend ERP/webhook scripts, or companion mobile apps.
- TYPE B (Technical Agency, Outsourced CTO, Custom Engineering, or AI Studio — e.g. already has devs/AI team):
  DO NOT insult their intelligence by pretending they lack developers or asking "when clients want tech beyond your core"!
  Instead, acknowledge their technical/CTO focus and pitch **on-demand specialist sprint overflow**: offloading standalone Telegram/Discord community bots, native Android/Kotlin Multiplatform companion apps, or isolated FastAPI webhook microservices so their senior core team stays focused on primary architecture retainers.

YOUR CORE SERVICES (RelayWorks):
1. AI Chatbots & Agents (24/7 support & catalog RAG concierges via FastAPI/LangGraph)
2. Discord & Telegram Bots (VIP buyer clubs, order alerts, crypto/creator payout bots)
3. Custom Scripts & Webhook Automations (ERP/CRM/warehouse syncs, Shopify Functions)
4. Mobile Apps (Native Android Kotlin & Kotlin Multiplatform companion apps)

ANTI-TEMPLATE & ANTI-CLONE RULES (STRICTLY ENFORCED):
1. NEVER copy-paste boilerplate sentences or use a fixed mad-libs template. Every email must read like you personally spent 2 minutes on their homepage.
2. BANNED OPENINGS: NEVER start the body with "Saw your focus...", "Saw your track record...", "Noticed your work...", "Noticed your expertise...", or "I noticed...".
3. BANNED CLONE PHRASES: NEVER use ANY of these overused phrases:
   - "You invoice, keep the margin, and avoid technical risk" (or any variation of "keep the margin / avoid technical risk")
   - "do you have a go-to partner" / "go-to technical partner"
   - "beyond your core" / "outside your core scope"
   - "if a partnership aligns" / "if a white-label partnership makes sense"
   - "Feel free to connect on Telegram (@hazratummar) if that's easier"
   - "happy to take a trial sprint"
4. STRICTLY ZERO PRICING ($0 dollar figures anywhere).
5. DO NOT critique or advise them on their SEO, themes, CRO, or marketing.
6. FORMATTING:
   - Use clean paragraph breaks (\\n\\n between greeting, paragraph 1, question, and sign-off).
   - 60 to 90 words max. Plain conversational English. Zero buzzwords ("robust", "bespoke", "synergy", "seamless", "streamline", "leverage", "magic", "impressive", "collaborate"). Zero em-dashes (—). Never write generic compliment sentences like "Your setup sounds great."
   - Sign off simply on its own lines:
     Hazrat Ummar
     https://relayworks.dev | Telegram: @hazratummar

7. SUBJECT LINE:
   - 3 to 6 words, lowercase or natural title case, unique to their company/type (never generic "custom bots & apps for [Name]?" on every email).

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
                        temperature: 0.72,
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
                                temperature: 0.7
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
            description: partner.description,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to generate pitch' }, { status: 500 });
    }
}
