import { generateAuthUrl } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const proto = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
        const origin = `${proto}://${host}`;
        const url = await generateAuthUrl(origin);
        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate auth url" }, { status: 500 });
    }
}
