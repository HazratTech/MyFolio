import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import BusinessProfile from "@/models/BusinessProfile";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        legalName: "RelayWorks Tech",
        tradeName: "RelayWorks",
        address: "Bengaluru, Karnataka",
        country: "India",
        invoicePrefix: "RW-2026-",
        nextInvoiceNumber: 1,
        defaultCurrency: "USD",
      });
    }
    return NextResponse.json({ success: true, data: profile }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = new BusinessProfile(body);
    } else {
      Object.assign(profile, body);
    }
    await profile.save();

    await AuditLog.create({
      action: "PROFILE_UPDATED",
      entityType: "BusinessProfile",
      entityId: profile._id.toString(),
      summary: `Updated business profile for ${profile.tradeName}`,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
