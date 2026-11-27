import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    const clients = await Client.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: clients }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.legalName || !body.country) {
      return NextResponse.json(
        { success: false, error: "Legal Name and Country are required" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      legalName: body.legalName,
      clientType: body.clientType || "Company",
      email: body.email || "",
      country: body.country,
      address: body.address || "",
      stateProvince: body.stateProvince || "",
      zipCode: body.zipCode || "",
      taxId: body.taxId || "",
      discordHandle: body.discordHandle || "",
      notes: body.notes || "",
      agreementReference: body.agreementReference || "",
      isForeign: body.isForeign !== undefined ? Boolean(body.isForeign) : true,
    });

    await AuditLog.create({
      action: "CLIENT_CREATED",
      entityType: "Client",
      entityId: client._id.toString(),
      summary: `Created new client record: ${client.legalName} (${client.country})`,
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
