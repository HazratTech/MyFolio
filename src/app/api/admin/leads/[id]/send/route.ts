import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
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

        const lead = await Lead.findById(id);
        if (!lead) {
            return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
        }

        const sendResult = await sendZohoEmail({
            to,
            subject,
            text: messageBody,
        });

        lead.email = to;
        lead.personalizedEmail = {
            subject,
            body: messageBody,
            modelUsed: lead.personalizedEmail?.modelUsed,
        };
        if (lead.status === 'New') {
            lead.status = 'Contacted';
        }
        await lead.save();

        return NextResponse.json({
            success: true,
            message: `Email sent to ${to} via Zoho Mail.`,
            messageId: sendResult.messageId,
            lead,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email via Zoho' },
            { status: 500 }
        );
    }
}
