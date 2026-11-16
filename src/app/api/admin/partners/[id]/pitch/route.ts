import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

function generateFallbackPitch(
    partnerName: string,
    services: string[],
    desc: string,
    angle: 'white-label' | 'concise' | 'technical-audit' = 'white-label'
) {
    const isDesignOrCro = /design|cro|conversion|brand|creative|ui|ux/i.test(services.join(' ') + ' ' + desc);
    const serviceHighlight = isDesignOrCro ? 'store design, UX, and CRO' : 'store building and merchant growth';

    if (angle === 'concise') {
        return {
            subject: `dev overflow for ${partnerName}?`,
            body: `Hey there,

Who handles your technical overflow when a merchant asks for custom checkout extensions or external API/webhook syncs?

I white-label custom Shopify apps and Python backends for boutique agencies on fixed 1-week sprints ($1,200 - $2,500).

Happy to pick up an overflow ticket if your team is at capacity: Telegram @hazratummar or https://relayworks.dev.

Best,
Hazrat`
        };
    }

    if (angle === 'technical-audit') {
        return {
            subject: `checkout extensions & theme speed for ${partnerName}`,
            body: `Hey team at ${partnerName},

Noticed your focus on ${serviceHighlight}.

When custom stores scale, technical bottlenecks often crop up: checkout UI extensions (Shopify Functions), Liquid theme speed bloat, or brittle third-party ERP webhook syncs.

I specialize strictly in Shopify backend performance and custom apps. I partner with agencies on fixed sprints to handle the technical plumbing so your creative team can launch stores on schedule with zero client friction.

Let me know if you have a build coming up with custom backend requirements.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Default: white-label
    return {
        subject: `dev overflow for ${partnerName}?`,
        body: `Hey team at ${partnerName},

Saw your work on the Shopify directory around ${serviceHighlight}.

When your clients ask for custom backend logic (custom checkout UI extensions, ERP/warehouse webhook synchronization, or custom private apps), who handles that overflow for your team?

I'm an independent backend/Shopify developer at RelayWorks. I white-label for a few boutique partner agencies on fixed 1-2 week sprints ($1,200 - $2,500), taking custom app and Python microservice tickets off your plate so your theme devs never get bottlenecked.

If you have any tricky backend tickets on your backlog or an upcoming build with custom requirements, happy to take a small sprint to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
    };
}

function cleanAntiSlop(text: string): string {
    return text
        .replace(/—/g, ' - ')
        .replace(/–/g, ' - ')
        .replace(/I hope (this email|you are|this message)[\s\S]*?[.!?]\s*/gi, '')
        .replace(/My name is Hazrat Ummar,?\s*(and\s*)?/gi, '')
        .replace(/I am reaching out (to you )?because\s*/gi, '')
        .replace(/I noticed your impressive\s*/gi, 'Saw your ')
        .trim();
}

const SYSTEM_PROMPT = `You are Hazrat Ummar, senior backend & custom Shopify engineer at RelayWorks (https://relayworks.dev).
You write direct, ultra-high-converting, peer-to-peer cold emails to founders or technical leads at Shopify Partner agencies.

YOUR VALUE PROPOSITION:
- You are an independent senior engineer who white-labels for boutique Shopify design and marketing agencies.
- What you build: Custom Shopify apps (Shopify Functions, checkout extensions, custom private apps), Python/FastAPI microservices, webhook synchronizations with ERPs/CRMs/warehouses, high-speed theme optimization, and brand community Discord/Telegram bots.
- Operating model: Fixed-scope sprints ($1,200 - $2,500), fast turnaround, direct repo handover, zero agency overhead.
- Direct channels: Telegram: @hazratummar | Site: https://relayworks.dev

STRICT ANTI-SLOP & ANTI-AI RULES:
1. NEVER start with 'My name is...', 'I am reaching out...', 'I run RelayWorks and specialize in...', or 'I hope this email finds you well'.
2. NEVER compliment them artificially ('I noticed your impressive work', 'I admire your expertise'). State their focus matter-of-factly without flattery.
3. NEVER lecture them on agency margins, salary overheads, or 'extending their capabilities'. Treat them as an equal peer.
4. ABSOLUTELY NO em-dashes (—) or en-dashes (–). Use plain commas, colons, or parentheses.
5. NO corporate buzzwords: 'synergy', 'streamline', 'game-changer', 'leverage', 'robust', 'holistic', 'bespoke'.
6. Keep the email punchy, natural, and brief (70 to 110 words total).

GOLDEN TONE EXAMPLES:

Example 1 (white-label):
Subject: dev overflow for Shugert?
Body:
Hey team at Shugert,

Saw your work on the Shopify directory around Shopify Plus builds and store migrations.

When your clients ask for custom backend logic (custom checkout UI extensions, ERP/warehouse webhook synchronization, or custom private apps), who handles that overflow for your team?

I'm an independent backend/Shopify developer at RelayWorks. I white-label for a few boutique agencies on fixed 1-2 week sprints ($1,200 - $2,500), taking custom app and Python microservice tickets off your plate so your theme devs never get bottlenecked.

If you have any tricky backend tickets on your backlog or an upcoming build with custom requirements, happy to take a small sprint to prove the turnaround.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar

Example 2 (concise):
Subject: quick question re: backend overflow
Body:
Hey there,

Who handles your technical overflow when a merchant asks for custom checkout extensions or external API/webhook syncs?

I white-label custom Shopify apps and Python backends for agencies on fixed 1-week sprints ($1,200 - $2,500).

Happy to pick up an overflow ticket if your team is at capacity: Telegram @hazratummar or https://relayworks.dev.

Best,
Hazrat

Example 3 (technical-audit):
Subject: checkout extensions & theme speed for Shugert
Body:
Hey team at Shugert,

Noticed your focus on high-converting storefronts and CRO.

Often when custom stores scale, technical bottlenecks crop up: checkout UI extensions (Shopify Functions), Liquid theme speed bloat, or brittle third-party ERP webhook syncs.

I specialize strictly in Shopify backend performance and custom apps. I partner with agencies on fixed sprints to handle the deep technical plumbing so your creative team can launch stores on schedule with zero client friction.

Let me know if you have a build coming up with custom backend requirements.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar

OUTPUT: Return strict JSON:
{
  "subject": "3-5 lowercase or sentence case words",
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
        const requestedAngle = (body.angle || 'white-label') as 'white-label' | 'concise' | 'technical-audit';
        const requestedModel = (body.model || 'gpt-4o') as 'gpt-4o' | 'gpt-4o-mini' | 'gemini';

        const partner = await Partner.findById(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        const openAiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        let generatedPitch = generateFallbackPitch(
            partner.name,
            partner.services || [],
            partner.description || '',
            requestedAngle
        );
        let actualModelUsed = 'curated-template';

        const userPrompt = `Target Agency: ${partner.name}
Services: ${(partner.services || []).join(', ') || 'Shopify store development, design, and CRO'}
Description: ${partner.description || 'Verified Shopify Partner Agency'}
Location: ${partner.location || partner.country || 'Global'}
Website: ${partner.websiteUrl || 'Shopify Partner'}
Angle: ${requestedAngle}`;

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
            pitch: partner.personalizedPitch
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to generate pitch' }, { status: 500 });
    }
}
