import { generateAuthUrl } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const origin = new URL(request.url).origin;
        const url = await generateAuthUrl(origin);
        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate auth url" }, { status: 500 });
    }
}
