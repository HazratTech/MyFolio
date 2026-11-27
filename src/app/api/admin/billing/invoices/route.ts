import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import BusinessProfile from "@/models/BusinessProfile";
import Client from "@/models/Client";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    const rawInvoices = await Invoice.find().sort({ createdAt: -1 }).lean();
    const invoices = rawInvoices.map((inv: any) => ({
      ...inv,
      paidAmount:
        inv.paidAmount !== undefined && inv.paidAmount !== null
          ? Number(inv.paidAmount)
          : inv.status === "PAID"
          ? Number(inv.totalAmount || 0)
          : 0,
    }));
    return NextResponse.json({ success: true, data: invoices }, {
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

    const client = await Client.findById(body.clientId);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        legalName: "RelayWorks Tech",
        invoicePrefix: "RW-2026-",
        nextInvoiceNumber: 1,
      });
    }

    const seqStr = String(profile.nextInvoiceNumber).padStart(4, "0");
    const invoiceNumber = `${profile.invoicePrefix}${seqStr}`;

    profile.nextInvoiceNumber += 1;
    await profile.save();

    const items = body.items || [];
    const subtotal = items.reduce((acc: number, item: any) => acc + Number(item.rate) * Number(item.quantity), 0);
    const taxAmount = Number(body.taxAmount) || 0;
    const discount = Number(body.discount) || 0;
    const totalAmount = subtotal - discount + taxAmount;
    const isExport = client.country.toLowerCase() !== "india";

    const invoice = await Invoice.create({
      invoiceNumber,
      issueDate: body.issueDate || new Date().toISOString().split("T")[0],
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
      currency: body.currency || "USD",
      clientId: client._id,
      clientName: client.legalName,
      clientCountry: client.country,
      isExport,
      exportClauseApplied: isExport,
      items,
      subtotal,
      discount,
      taxAmount,
      totalAmount,
      notes: body.notes || "",
      terms: body.terms || "Payment due upon receipt. Standard crypto transfer or bank wire accepted.",
      status: body.status || "ISSUED",
      reconciliationStatus: "UNPAID",
      pdfHash: body.pdfHash || "",
    });

    await AuditLog.create({
      action: "INVOICE_CREATED",
      entityType: "Invoice",
      entityId: invoice.invoiceNumber,
      summary: `Created invoice ${invoice.invoiceNumber} for ${client.legalName} (${invoice.currency} ${totalAmount.toLocaleString()})`,
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
