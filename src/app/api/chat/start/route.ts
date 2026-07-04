import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ChatThread } from "@/models/ChatThread";
import { ChatMessage } from "@/models/ChatMessage";

export async function POST(req: Request) {
    try {
        const { name, initialMessage } = await req.json();

        if (!name || !initialMessage) {
            return NextResponse.json({ error: "Name and initial message are required." }, { status: 400 });
        }

        await dbConnect();

        // 1. Create Thread in MongoDB
        const thread = await ChatThread.create({
            userName: name,
            status: "open",
        });

        // 2. Create Thread in Discord and send initial message
        const botToken = process.env.DISCORD_BOT_TOKEN;
        const channelId = process.env.DISCORD_SUPPORT_CHANNEL_ID;

        if (botToken && channelId) {
            try {
                // Create the thread
                const createThreadRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/threads`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bot ${botToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: `Support: ${name}`,
                        type: 11, // Public Thread
                        auto_archive_duration: 1440,
                    }),
                });

                if (createThreadRes.ok) {
                    const discordThread = await createThreadRes.json();
                    
                    // Update MongoDB with Discord Thread ID
                    thread.discordThreadId = discordThread.id;
                    thread.discordChannelId = channelId;
                    await thread.save();

                    // Send the initial message to the thread
                    await fetch(`https://discord.com/api/v10/channels/${discordThread.id}/messages`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bot ${botToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            content: `**New Live Chat Started** <@475357995367137282>\n**User:** ${name}\n**Message:** ${initialMessage}`
                        }),
                    });
                } else {
                    console.error("Failed to create Discord thread:", await createThreadRes.text());
                }
            } catch (err) {
                console.error("Discord API Error:", err);
            }
        } else {
            console.warn("DISCORD_BOT_TOKEN or DISCORD_SUPPORT_CHANNEL_ID not set. Skipping Discord sync.");
        }

        // 3. Save initial message in MongoDB
        const message = await ChatMessage.create({
            threadId: thread._id.toString(),
            sender: "user",
            content: initialMessage,
        });

        return NextResponse.json({ threadId: thread._id.toString(), message }, { status: 201 });
    } catch (error) {
        console.error("Chat start error:", error);
        return NextResponse.json({ error: "Failed to start chat." }, { status: 500 });
    }
}
