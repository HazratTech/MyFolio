import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';
import { sendZohoEmail } from '@/lib/zoho-mail';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const to = String(body.to || '').trim();
        const subject = String(body.subject || '').trim();
        const messageBody = String(body.body || '').trim();

        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            return NextResponse.json(
                { success: false, error: 'Please enter a valid recipient email address.' },
                { status: 400 }
            );
        }

        if (!subject || !messageBody) {
            return NextResponse.json(
                { success: false, error: 'Subject and email message body are required.' },
                { status: 400 }
            );
        }

        const partner = await Partner.findById(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        const sendResult = await sendZohoEmail({
            to,
            subject,
            text: messageBody,
        });

        partner.email = to;
        partner.personalizedPitch = {
            subject,
            body: messageBody,
            angle: body.angle || partner.personalizedPitch?.angle || 'white-label',
            modelUsed: body.modelUsed || partner.personalizedPitch?.modelUsed || 'gpt-4o',
            generatedAt: partner.personalizedPitch?.generatedAt || new Date(),
            sentAt: new Date(),
            sentVia: 'zoho',
        };
        if (partner.status === 'New') {
            partner.status = 'Pitched';
        }
        await partner.save();

        return NextResponse.json({
            success: true,
            message: `Email sent to ${to} via Zoho Mail.`,
            messageId: sendResult.messageId,
            partner,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email via Zoho' },
            { status: 500 }
        );
    }
}
