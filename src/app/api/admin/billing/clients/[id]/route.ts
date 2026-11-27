import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import AuditLog from "@/models/AuditLog";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const client = await Client.findByIdAndUpdate(id, body, { new: true });

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "CLIENT_UPDATED",
      entityType: "Client",
      entityId: client._id.toString(),
      summary: `Updated client profile for ${client.legalName}`,
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "CLIENT_DELETED",
      entityType: "Client",
      entityId: id,
      summary: `Deleted client ${client.legalName}`,
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
