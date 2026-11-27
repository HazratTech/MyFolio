export type LeadCategory = 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend';
export type PitchAngle = 'technical' | 'concise' | 'caseStudy';
export type PitchModel = 'gpt-4o' | 'gpt-4o-mini' | 'gemini';

export interface RawLeadCandidate {
    rawText: string;
    author: string;
    source: string;
    sourceUrl: string;
    extractedEmail?: string;
    defaultCategory: LeadCategory;
    rawCompany?: string;
    rawTitle?: string;
    rawTags?: string[];
    budget?: string;
}

export interface QualifiedLeadResult {
    isQualified: boolean;
    rejectReason?: string;
    company: string;
    decisionMaker: string;
    category: LeadCategory;
    painSignal: string;
    techStack: string[];
    score: number;
    engagementType: 'Fixed Sprint' | 'Contract / Freelance' | 'Hourly' | 'Milestone';
    subject: string;
    body: string;
    dmPitch?: string;
    modelUsed: string;
}

export function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

export function stripHtmlKeepNewlines(html: string): string {
    const withBreaks = html
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, ' ');
    return decodeHtmlEntities(withBreaks)
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n')
        .trim();
}

export function cleanAntiSlop(text: string): string {
    return text
        .replace(/—/g, ', ')
        .replace(/\s+-\s+/g, ', ')
        .replace(/\$\d[\d,]*(?:\s*[-–to]+\s*\$?\d[\d,]*)?/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function extractValidEmail(text: string): string {
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g);
    if (!matches) return '';
    const valid = matches.find(m => {
        const lower = m.toLowerCase();
        return !lower.endsWith('.hn') &&
            !lower.includes('example.com') &&
            !lower.includes('noreply') &&
            !lower.includes('no-reply');
    });
    return valid ? valid.toLowerCase() : '';
}

async function callAiJson(
    systemPrompt: string,
    userPrompt: string,
    preferredModel: PitchModel = 'gpt-4o-mini',
    temperature = 0.25
): Promise<{ data: any; modelUsed: string } | null> {
    const openAiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openAiKey && preferredModel !== 'gemini') {
        try {
            const targetModel = preferredModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini';
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: targetModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature,
                    response_format: { type: 'json_object' },
                }),
                signal: AbortSignal.timeout(15000),
            });

            if (res.ok) {
                const payload = await res.json();
                const content = payload.choices?.[0]?.message?.content;
                if (content) {
                    return { data: JSON.parse(content), modelUsed: targetModel };
                }
            }
        } catch (err) {
            console.error('Lead AI OpenAI error, trying Gemini fallback:', err);
        }
    }

    if (geminiKey) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature,
                        },
                    }),
                    signal: AbortSignal.timeout(15000),
                }
            );
            if (res.ok) {
                const payload = await res.json();
                const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                    const cleaned = rawText.replace(/^```json\n?|\n?```$/g, '').trim();
                    return { data: JSON.parse(cleaned), modelUsed: 'gemini-2.5-flash' };
                }
            }
        } catch (err) {
            console.error('Lead AI Gemini error:', err);
        }
    }

    return null;
}

const QUALIFIER_SYSTEM_PROMPT = `You are an elite B2B lead qualification filter & outbound copywriter for Hazrat Ummar, founder of RelayWorks (https://relayworks.dev | Telegram: @hazratummar | Discord: @ihazratummar).

HAZRAT'S CORE SERVICES:
1. Discord & Telegram Bots (Python, discord.py, custom slash commands, webhooks, Stripe/payment verification, crypto/creator payout bots).
2. AI Chatbots & Agents (Python FastAPI, LangGraph, RAG pipelines, strict Pydantic structured outputs, WhatsApp/Telegram/Discord/Web chatbots).
3. Mobile Apps (Native Android Kotlin/Jetpack Compose, Kotlin Multiplatform, cross-platform companion apps).
4. Custom Scripts, Backend & API Automations (Python FastAPI, Node.js/TypeScript, webhook pipelines, scraping, PostgreSQL/MongoDB/Redis).

YOUR FIRST JOB — STRICT QUALIFICATION GATEKEEPER:
You MUST set "isQualified": false and reject ANY post that falls into these traps:
- A job seeker / freelancer / developer pitching themselves ("SEEKING WORK", "FOR HIRE", "Hey! Loved the opportunity", "I have experience building...", "Would love to work with you", "Looking for a role", "Available for contract work").
- A reply/comment from an applicant applying to someone else's job post.
- Physical hardware, physical robotics (like delivery sidewalk robots), home healthcare, nursing, non-tech copywriting, sales/SDR, customer support phone reps, or non-software roles.
- Heavy enterprise full-time W2 roles explicitly demanding 5-10+ years of corporate executive leadership (VP, Director, Staff/Principal, Security Clearance, US Citizenship required).
- Posts where it's completely unclear what software they want built.

Set "isQualified": true ONLY when a REAL client, founder, startup, or engineering team is actively hiring/looking for a contractor, freelancer, or engineer to BUILD software matching one of the 4 categories.

YOUR SECOND JOB — CLEAN ENTITY EXTRACTION:
- "company": Must be the SHORT, CLEAN company or project name (1 to 4 words max, e.g., "Pond AI", "Substrate Labs", "GetRegistered", "Stealth Fintech"). NEVER put a sentence fragment, greeting, location line, or "Hey! Loved the opportunity" as the company name. If unnamed startup/founder, use "Founder (@author)" or a short descriptive label like "AI Startup (@author)".
- "decisionMaker": Clean first name or "@handle" (never raw garbage).
- "category": Pick the single best fit from: "Discord Bots" | "Mobile Apps" | "AI & Chatbots" | "Backend".
- "painSignal": Summarize in 1 to 2 crisp, plain-English sentences what technical problem they need built right now.
- "techStack": Array of up to 5 clean technology keywords actually mentioned.
- "score": 80-98 (higher if freelance/sprint/contract friendly and has direct contact email).
- "engagementType": "Fixed Sprint" | "Contract / Freelance" | "Hourly" | "Milestone".

YOUR THIRD JOB — HUMAN PEER-TO-PEER PITCH (ZERO SLOP):
- "subject": Write a natural, crisp 3 to 6 word subject line referencing their REAL company name and actual project (e.g., "Discord bot build for Substrate Labs", "FastAPI & RAG support for Pond AI", "Android app build for Xolvio"). NEVER insert broken sentence fragments.
- "body": 60 to 90 words max, formatted with clean double-newline paragraph breaks (short greeting, 1-2 short body paragraphs, crisp sign-off).
  - Direct, human engineering peer tone. Offer Hazrat's hands-on build services rather than lecturing them with unsolicited advice ("consider using X").
  - Reference their specific technical problem accurately.
  - Mention relevant shipped work only where relevant (e.g. ClutchBot/Clipping Club for bots, FastAPI/LangGraph for AI, Kotlin/KMP for mobile).
  - STRICTLY ZERO dollar amounts or sprint prices ($0 quotes).
  - NO em-dashes (—). NO buzzwords ("robust", "synergy", "seamless", "leverage", "streamline", "game-changer"). NO fake flattery ("impressed by", "aligns perfectly").
  - Sign off on its own lines:
    Hazrat Ummar
    https://relayworks.dev | Telegram: @hazratummar

RETURN JSON ONLY:
{
  "isQualified": true,
  "rejectReason": "",
  "company": "Clean Name",
  "decisionMaker": "@handle or Name",
  "category": "AI & Chatbots",
  "painSignal": "Clean 1-2 sentence requirement summary.",
  "techStack": ["Python", "FastAPI"],
  "score": 92,
  "engagementType": "Contract / Freelance",
  "subject": "3 to 6 word subject line",
  "body": "Email body text",
  "dmPitch": "3 to 4 crisp peer sentences for a quick Reddit DM or comment reply referencing their stated task (NO dollar amounts, NO em-dashes, NO buzzwords), ending with Hazrat | https://relayworks.dev | Telegram: @hazratummar"
}`;

export async function qualifyAndExtractLead(candidate: RawLeadCandidate): Promise<QualifiedLeadResult | null> {
    const userPrompt = `CANDIDATE SOURCE: ${candidate.source}
AUTHOR / HANDLE: ${candidate.author}
${candidate.rawCompany ? `RAW COMPANY FIELD: ${candidate.rawCompany}` : ''}
${candidate.rawTitle ? `RAW TITLE FIELD: ${candidate.rawTitle}` : ''}
${candidate.rawTags?.length ? `TAGS: ${candidate.rawTags.join(', ')}` : ''}
EXTRACTED REAL EMAIL: ${candidate.extractedEmail || 'None (Apply via Link)'}

POST CONTENT:
${candidate.rawText.slice(0, 1800)}`;

    const aiResult = await callAiJson(QUALIFIER_SYSTEM_PROMPT, userPrompt, 'gpt-4o-mini', 0.2);
    if (!aiResult?.data) return null;

    const d = aiResult.data;
    if (!d.isQualified) return null;

    const validCategories: LeadCategory[] = ['Discord Bots', 'Mobile Apps', 'AI & Chatbots', 'Backend'];
    const category: LeadCategory = validCategories.includes(d.category) ? d.category : candidate.defaultCategory;
    const validEngagements = ['Fixed Sprint', 'Contract / Freelance', 'Hourly', 'Milestone'] as const;
    const engagementType = validEngagements.includes(d.engagementType) ? d.engagementType : 'Contract / Freelance';

    return {
        isQualified: true,
        company: String(d.company || candidate.rawCompany || `Founder (@${candidate.author})`).slice(0, 60).trim(),
        decisionMaker: String(d.decisionMaker || `@${candidate.author}`).slice(0, 50).trim(),
        category,
        painSignal: String(d.painSignal || candidate.rawText.slice(0, 260)).trim(),
        techStack: Array.isArray(d.techStack) ? d.techStack.slice(0, 5).map(String) : [category],
        score: typeof d.score === 'number' ? Math.min(99, Math.max(70, d.score)) : 90,
        engagementType,
        subject: cleanAntiSlop(String(d.subject || `${category} support for ${d.company}`)),
        body: cleanAntiSlop(String(d.body || '')),
        dmPitch: cleanAntiSlop(String(d.dmPitch || d.body || '')),
        modelUsed: aiResult.modelUsed,
    };
}

export async function generateLeadPitch(
    lead: {
        company: string;
        decisionMaker: string;
        category: LeadCategory;
        painSignal: string;
        techStack: string[];
        source: string;
    },
    angle: PitchAngle = 'technical',
    model: PitchModel = 'gpt-4o'
): Promise<{ subject: string; body: string; modelUsed: string } | null> {
    const angleInstructions = angle === 'concise'
        ? 'Write an ultra-short 3-sentence DM (35-55 words) suitable for cold email or Telegram/Discord, ending with one direct question.'
        : angle === 'caseStudy'
            ? 'Lead with concrete shipped proof matching their category (ClutchBot/Clipping Club for bots, FastAPI/LangGraph/pgvector RAG for AI chatbots, Kotlin/KMP for mobile apps, idempotent webhooks/Redis for backend) and offer a quick technical walkthrough.'
            : 'Write a sharp peer-to-peer engineering outreach (65-90 words) addressing their exact stated build need with concrete architectural focus (reliability, concurrency, schemas, zero bloat).';

    const systemPrompt = `You write high-converting, human, zero-slop outbound emails for Hazrat Ummar (RelayWorks — https://relayworks.dev | Telegram: @hazratummar | Discord: @ihazratummar).

STRICT RULES:
- 3 to 6 word natural subject line (lowercase or title case, never robotic "re: AI agent & chatbot engineering for [Sentence]").
- Format body with clean paragraph breaks (\n\n between paragraphs), 60-90 words total.
- Offer Hazrat's hands-on build services naturally instead of lecturing them ("consider implementing X").
- NEVER mention dollar amounts or sprint prices ($0 quotes).
- NO em-dashes (—). NO buzzwords ("synergy", "leverage", "streamline", "robust", "seamless", "game-changer").
- NO fake flattery ("admire your work", "loved your post").
- ${angleInstructions}
- Sign off on its own lines:
  Hazrat Ummar
  https://relayworks.dev | Telegram: @hazratummar

OUTPUT JSON:
{
  "subject": "...",
  "body": "..."
}`;

    const userPrompt = `COMPANY: ${lead.company}
CONTACT: ${lead.decisionMaker}
CATEGORY: ${lead.category}
SOURCE: ${lead.source}
TECH STACK: ${lead.techStack?.join(', ') || lead.category}
STATED NEED: ${lead.painSignal}`;

    const result = await callAiJson(systemPrompt, userPrompt, model, 0.35);
    if (!result?.data?.subject || !result?.data?.body) return null;

    return {
        subject: cleanAntiSlop(String(result.data.subject)),
        body: cleanAntiSlop(String(result.data.body)),
        modelUsed: result.modelUsed,
    };
}
