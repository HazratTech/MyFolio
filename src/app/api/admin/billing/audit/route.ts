import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    return NextResponse.json({ success: true, data: logs }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
