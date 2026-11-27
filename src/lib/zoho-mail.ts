import nodemailer from 'nodemailer';

export interface ZohoConfigStatus {
    configured: boolean;
    senderEmail: string | null;
    host: string;
    port: number;
}

export function getZohoStatus(): ZohoConfigStatus {
    const senderEmail = process.env.ZOHO_EMAIL?.trim() || null;
    const appPassword = process.env.ZOHO_APP_PASSWORD?.trim() || null;
    const host = process.env.ZOHO_SMTP_HOST?.trim() || 'smtp.zoho.com';
    const port = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);

    return {
        configured: Boolean(senderEmail && appPassword),
        senderEmail,
        host,
        port,
    };
}

export async function sendZohoEmail({
    to,
    subject,
    text,
}: {
    to: string;
    subject: string;
    text: string;
}) {
    const status = getZohoStatus();
    const appPassword = process.env.ZOHO_APP_PASSWORD?.trim();

    if (!status.configured || !status.senderEmail || !appPassword) {
        throw new Error(
            'Zoho Mail SMTP is not configured. Add ZOHO_EMAIL, ZOHO_APP_PASSWORD, and optionally ZOHO_SMTP_HOST (e.g. smtp.zoho.com or smtp.zoho.in) to .env.local.'
        );
    }

    const transporter = nodemailer.createTransport({
        host: status.host,
        port: status.port,
        secure: status.port === 465,
        auth: {
            user: status.senderEmail,
            pass: appPassword,
        },
    });

    const senderName = process.env.ZOHO_SENDER_NAME?.trim() || 'Hazrat Ummar';
    const fromHeader = `"${senderName}" <${status.senderEmail}>`;

    const info = await transporter.sendMail({
        from: fromHeader,
        to: to.trim(),
        replyTo: status.senderEmail,
        subject: subject.trim(),
        text: text.trim(),
    });

    return {
        messageId: info.messageId,
        accepted: info.accepted,
        senderEmail: status.senderEmail,
    };
}
