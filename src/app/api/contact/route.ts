import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const webhookUrl = process.env.DISCORD_CONTACT_WEBHOOK_URL;
        
        if (!webhookUrl) {
            console.error("DISCORD_CONTACT_WEBHOOK_URL is not configured.");
            return NextResponse.json(
                { error: "Contact service is not configured properly." },
                { status: 500 }
            );
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            return NextResponse.json({ success: true });
        } else {
            console.error("Failed to send webhook to Discord:", await response.text());
            return NextResponse.json(
                { error: "Failed to send message to Discord." },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in contact API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
