import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import AuditLog from "@/models/AuditLog";
import { recalculateInvoicePaymentState } from "@/lib/billingSync";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const prevStatus = invoice.status;
    Object.assign(invoice, body);
    await invoice.save();
    await recalculateInvoicePaymentState(invoice._id);

    await AuditLog.create({
      action: "INVOICE_UPDATED",
      entityType: "Invoice",
      entityId: invoice.invoiceNumber,
      summary: `Updated invoice ${invoice.invoiceNumber}. Status changed from ${prevStatus} to ${invoice.status}`,
    });

    return NextResponse.json({ success: true, data: invoice });
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
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "INVOICE_DELETED",
      entityType: "Invoice",
      entityId: invoice.invoiceNumber,
      summary: `Deleted invoice ${invoice.invoiceNumber} (${invoice.clientName})`,
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
