import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import AutoBlogConfig from "@/models/AutoBlogConfig";
import { verifyToken } from "@/lib/session";

async function checkAuth() {
    const token = cookies().get('admin_session')?.value;
    if (!token) return false;
    if (token === 'true') return true; // password login fallback support
    const session = await verifyToken(token);
    return !!session;
}

export async function GET() {
    try {
        if (!(await checkAuth())) {
            return new Response("Unauthorized", { status: 401 });
        }

        await dbConnect();
        let config = await AutoBlogConfig.findOne({ key: "auto-blog" });
        if (!config) {
            // Create default
            config = await AutoBlogConfig.create({ key: "auto-blog" });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to get auto-blog config:", error);
        return NextResponse.json({ error: "Failed to get config" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!(await checkAuth())) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { allowedTopics, isActive } = await req.json();
        if (!Array.isArray(allowedTopics)) {
            return NextResponse.json({ error: "allowedTopics must be an array" }, { status: 400 });
        }

        await dbConnect();
        const config = await AutoBlogConfig.findOneAndUpdate(
            { key: "auto-blog" },
            { 
                allowedTopics: allowedTopics.map(t => t.trim().toLowerCase()).filter(Boolean),
                isActive: !!isActive
            },
            { new: true, upsert: true }
        );

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to update auto-blog config:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
