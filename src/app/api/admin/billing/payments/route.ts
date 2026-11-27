import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import AuditLog from "@/models/AuditLog";
import {
  getEffectiveAppliedAmount,
  recalculateInvoicePaymentState,
} from "@/lib/billingSync";

export async function GET() {
  try {
    await dbConnect();
    const payments = await Payment.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments }, {
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

    const invoice = await Invoice.findById(body.invoiceId);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const rateINRAtReceipt = Number(body.rateINRAtReceipt) || 0;
    const amountCrypto = Number(body.amountCrypto) || 0;
    const fiatValueINRAtReceipt = body.fiatValueINRAtReceipt
      ? Number(body.fiatValueINRAtReceipt)
      : rateINRAtReceipt * amountCrypto;
    const appliedAmount =
      body.appliedAmount !== undefined && body.appliedAmount !== null && body.appliedAmount !== ""
        ? Number(body.appliedAmount)
        : getEffectiveAppliedAmount(
            {
              amountCrypto,
              fiatValueINRAtReceipt,
              asset: body.asset || "USDT",
              paymentMethod: body.paymentMethod || "crypto",
            },
            invoice.currency
          );

    const payment = await Payment.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      paymentMethod: body.paymentMethod || "crypto",
      asset: body.asset || "USDT",
      network: body.network || "TRC20",
      amountCrypto,
      transactionDate: body.transactionDate || new Date().toISOString().split("T")[0],
      txHash: body.txHash || "",
      blockchainExplorerUrl: body.blockchainExplorerUrl || "",
      rateINRAtReceipt,
      fiatValueINRAtReceipt,
      appliedAmount,
      rateSource: body.rateSource || "Binance Spot / Market Rate",
      payerWallet: body.payerWallet || "",
      recipientWallet: body.recipientWallet || "",
      notes: body.notes || "",
    });

    const updatedInvoice = await recalculateInvoicePaymentState(invoice._id);
    const totalPaid = updatedInvoice?.paidAmount ?? appliedAmount;
    const remaining = Math.max(0, Number((invoice.totalAmount - totalPaid).toFixed(2)));

    await AuditLog.create({
      action: "PAYMENT_RECORDED",
      entityType: "Payment",
      entityId: payment._id.toString(),
      summary: `Recorded ${payment.asset} ${payment.amountCrypto} (${invoice.currency} ${appliedAmount.toLocaleString()} applied) for Invoice ${invoice.invoiceNumber} — Paid ${totalPaid.toLocaleString()} / ${invoice.totalAmount.toLocaleString()} (${updatedInvoice?.status}, Remaining: ${remaining.toLocaleString()})`,
    });

    return NextResponse.json(
      { success: true, data: payment, invoice: updatedInvoice },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
