import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = cookies().get("admin_session")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || !payload.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ email: payload.email });
}
