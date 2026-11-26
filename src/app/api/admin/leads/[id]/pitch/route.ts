import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { PitchAngle, PitchModel, generateLeadPitch } from '@/lib/lead-ai';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const angle = (body.angle || 'technical') as PitchAngle;
        const model = (body.model || 'gpt-4o') as PitchModel;

        const lead = await Lead.findById(id);
        if (!lead) {
            return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
        }

        const pitch = await generateLeadPitch(
            {
                company: lead.company,
                decisionMaker: lead.decisionMaker,
                category: lead.category,
                painSignal: lead.painSignal,
                techStack: lead.techStack || [],
                source: lead.source,
            },
            angle,
            model
        );

        if (!pitch) {
            return NextResponse.json({ success: false, error: 'AI generation failed' }, { status: 500 });
        }

        lead.personalizedEmail = {
            subject: pitch.subject,
            body: pitch.body,
            modelUsed: pitch.modelUsed,
        };
        await lead.save();

        return NextResponse.json({
            success: true,
            pitch: lead.personalizedEmail,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to regenerate lead pitch' },
            { status: 500 }
        );
    }
}
