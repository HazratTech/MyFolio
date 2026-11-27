import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import AuditLog from "@/models/AuditLog";
import { sendZohoEmail } from "@/lib/zoho-mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const client = await Client.findById(invoice.clientId);
    const to = String(body.to || client?.email || "").trim();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { success: false, error: "Valid recipient email is required to send invoice." },
        { status: 400 }
      );
    }

    const linesText = (invoice.items || [])
      .map((item: any) => `- ${item.description} (${item.quantity} x ${invoice.currency} ${item.rate}) = ${invoice.currency} ${item.amount}`)
      .join("\n");

    const subject = String(
      body.subject || `Invoice ${invoice.invoiceNumber} from RelayWorks (${invoice.currency} ${invoice.totalAmount.toLocaleString()})`
    );

    const text = String(
      body.body ||
        `Hi ${invoice.clientName},\n\nPlease find your invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nIssue Date: ${invoice.issueDate}\nDue Date: ${invoice.dueDate}\nTotal Due: ${invoice.currency} ${invoice.totalAmount.toLocaleString()}\n\nItems:\n${linesText}\n\nPayment Instructions:\n${invoice.terms}\n${invoice.pdfHash ? `\nSHA-256 Document Hash: ${invoice.pdfHash}\n` : ""}\nThanks,\nHazrat Ummar\nRelayWorks (https://relayworks.dev)`
    );

    const sendRes = await sendZohoEmail({ to, subject, text });

    if (client && !client.email) {
      client.email = to;
      await client.save();
    }

    await AuditLog.create({
      action: "INVOICE_EMAILED",
      entityType: "Invoice",
      entityId: invoice.invoiceNumber,
      summary: `Sent invoice ${invoice.invoiceNumber} via Zoho Mail to ${to}`,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} sent to ${to} via Zoho Mail.`,
      messageId: sendRes.messageId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to send invoice" }, { status: 500 });
  }
}
