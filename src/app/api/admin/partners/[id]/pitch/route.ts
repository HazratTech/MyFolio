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
            subject: `Quick question re: ${partnerName}'s engineering overflow`,
            body: `Hi team at ${partnerName},

Saw your focus on ${serviceHighlight}. Since your team concentrates on storefront aesthetics and client growth, who handles your technical overflow when a merchant needs custom checkout extensions, theme speed cleanup, or custom Python API/webhook automations?

I build production Shopify apps and backend services at RelayWorks (https://relayworks.dev) — available for white-label sprint subcontracting.

Open to a brief 5-minute chat this week?

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    if (angle === 'technical-audit') {
        return {
            subject: `Subcontracting technical partner for ${partnerName}`,
            body: `Hi team at ${partnerName},

Noticed your recent storefront builds around ${serviceHighlight}.

When agencies ship custom Shopify builds, client requests often drift into heavy technical scope—like custom checkout field validations, ERP/CRM webhook synchronization, or custom brand Discord/Telegram bots.

I run RelayWorks (https://relayworks.dev). I specialize in high-concurrency Python/FastAPI backends, custom Shopify apps, and offline data sync. I partner with boutique Shopify agencies on a fixed-sprint, white-label basis so your core team can stay 100% focused on design and marketing.

Would love to send over a quick architecture breakdown of past builds if you're evaluating reliable engineering partners.

Best,
Hazrat Ummar
https://relayworks.dev | Telegram: @hazratummar`
        };
    }

    // Default: White-label partnership
    return {
        subject: `White-label Shopify development partner for ${partnerName}`,
        body: `Hi team at ${partnerName},

Saw your work on the Shopify Partner directory focusing heavily on ${serviceHighlight}.

Most boutique agencies we work with love designing high-converting stores, but don't want the overhead of hiring full-time backend developers just to handle custom checkout logic, theme speed optimizations, or third-party API webhook pipelines.

I run RelayWorks (https://relayworks.dev) — I build production Shopify apps (theme optimization & checkout extensions), Kotlin mobile companion apps, and Python/FastAPI backend services.

I work as a dedicated white-label contractor for agencies: you keep the client relationship and billing, and I deliver clean, tested code on a flat-rate sprint basis with zero ongoing overhead.

Would you be open to a quick 5-minute sync to see if having a dedicated technical subcontractor makes sense for your upcoming client pipeline?

Best,
Hazrat Ummar
Founder, RelayWorks
https://relayworks.dev | Telegram: @hazratummar`
    };
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const requestedAngle = (body.angle || 'white-label') as 'white-label' | 'concise' | 'technical-audit';

        const partner = await Partner.findById(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let generatedPitch = generateFallbackPitch(partner.name, partner.services || [], partner.description || '', requestedAngle);

        if (apiKey) {
            try {
                const prompt = `You are Hazrat Ummar, founder and lead engineer at RelayWorks (https://relayworks.dev).
You are writing a cold outreach email proposing a white-label engineering partnership to a Shopify Partner Agency.

Target Agency Profile:
- Agency Name: "${partner.name}"
- Website: "${partner.websiteUrl || 'Shopify Partner'}"
- Country / Location: "${partner.location || partner.country || 'Global'}"
- Services Listed: ${partner.services?.join(', ') || 'Store building, design, CRO'}
- Agency Description / Specialty: "${partner.description || 'Specialized Shopify agency'}"

Your Core Value Proposition as RelayWorks:
- You are a specialized solo engineer / technical partner who subcontracts for design & marketing agencies.
- You build: Custom Shopify apps (theme performance & checkout extensions), Python/FastAPI backend microservices, webhook synchronizations (CRMs, ERPs, warehouse APIs), brand Discord/Telegram community bots, and native Android/Kotlin companion apps.
- Why they need you: They are design/marketing-focused and don't want the salary overhead of an in-house backend engineer. When their merchant clients demand complex technical features, they can outsource it to you on a flat-rate white-label basis while keeping their client margin.
- You offer zero client risk and fast turnaround on fixed sprints ($500 - $1,500).

Instructions:
- Tone: High-trust, peer-to-peer, calm, confident, and direct. NO marketing buzzwords, NO fake compliments, NO AI cliches (like "In today's fast-paced digital world" or "I hope this email finds you well").
- Format: Exactly 3 to 4 short paragraphs.
- Angle: ${requestedAngle} (white-label subcontracting partnership).
- Return ONLY a JSON object with two keys: "subject" and "body". Do not wrap in markdown quotes if possible, or return valid JSON.

JSON output structure:
{
  "subject": "re: Shopify engineering overflow for ${partner.name}",
  "body": "..."
}`;

                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
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
                                subject: parsed.subject,
                                body: parsed.body
                            };
                        }
                    }
                }
            } catch (err) {
                console.error("Gemini pitch generation error, using curated fallback:", err);
            }
        }

        // Save generated pitch to the partner document
        partner.personalizedPitch = {
            subject: generatedPitch.subject,
            body: generatedPitch.body,
            angle: requestedAngle,
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
