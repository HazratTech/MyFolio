import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ChatMessage } from "@/models/ChatMessage";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const threadId = searchParams.get("threadId");

        if (!threadId) {
            return NextResponse.json({ error: "threadId is required." }, { status: 400 });
        }

        await dbConnect();

        // Fetch messages for the given thread, sorted by creation time
        const messages = await ChatMessage.find({ threadId }).sort({ createdAt: 1 }).lean();

        return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
        console.error("Chat fetch messages error:", error);
        return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
    }
}
