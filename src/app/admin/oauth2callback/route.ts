import { verifyGoogleToken } from "@/lib/google";
import { sendDiscordWebhook } from "@/lib/discord";
import { createToken } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const proto = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
        const origin = `${proto}://${host}`;
        const payload = await verifyGoogleToken(code, origin);

        const ip = request.headers.get("x-forwarded-for") || request.ip || "Unknown";

        if (payload?.email === "hazratummar9@gmail.com") {
            const token = await createToken(payload.email);

            cookies().set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 30, // 30 minutes
                path: '/',
            });

            await sendDiscordWebhook({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                success: true,
                ip
            });

            return NextResponse.redirect(new URL("/admin", origin));
        } else {
            await sendDiscordWebhook({
                email: payload?.email || "Unknown",
                name: payload?.name,
                picture: payload?.picture,
                success: false,
                ip
            });
            return NextResponse.redirect(new URL("/admin/unauthorized", origin));
        }
    } catch (error) {
        console.error("OAuth Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
