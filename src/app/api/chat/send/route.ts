import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ChatThread } from "@/models/ChatThread";
import { ChatMessage } from "@/models/ChatMessage";

export async function POST(req: Request) {
    try {
        const { threadId, content } = await req.json();

        if (!threadId || !content) {
            return NextResponse.json({ error: "threadId and content are required." }, { status: 400 });
        }

        await dbConnect();

        // 1. Check if thread exists and is open
        const thread = await ChatThread.findById(threadId);
        if (!thread) {
            return NextResponse.json({ error: "Thread not found." }, { status: 404 });
        }
        if (thread.status !== "open") {
            return NextResponse.json({ error: "Thread is closed." }, { status: 400 });
        }

        // 2. Save message in MongoDB
        const message = await ChatMessage.create({
            threadId: thread._id.toString(),
            sender: "user",
            content: content,
        });

        // 3. Send message to Discord if synced
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (botToken && thread.discordThreadId) {
            try {
                await fetch(`https://discord.com/api/v10/channels/${thread.discordThreadId}/messages`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bot ${botToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: `**${thread.userName}:** ${content}`
                    }),
                });
            } catch (err) {
                console.error("Discord API Error on Send:", err);
            }
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("Chat send error:", error);
        return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }
}
