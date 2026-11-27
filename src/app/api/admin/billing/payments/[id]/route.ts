import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import AuditLog from "@/models/AuditLog";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    if (body.asset) payment.asset = body.asset;
    if (body.network) payment.network = body.network;
    if (body.amountCrypto !== undefined) payment.amountCrypto = Number(body.amountCrypto);
    if (body.rateINRAtReceipt !== undefined) payment.rateINRAtReceipt = Number(body.rateINRAtReceipt);
    if (body.fiatValueINRAtReceipt !== undefined) payment.fiatValueINRAtReceipt = Number(body.fiatValueINRAtReceipt);
    if (body.transactionDate) payment.transactionDate = body.transactionDate;
    if (body.txHash !== undefined) payment.txHash = body.txHash;
    if (body.blockchainExplorerUrl !== undefined) payment.blockchainExplorerUrl = body.blockchainExplorerUrl;
    if (body.rateSource) payment.rateSource = body.rateSource;
    if (body.payerWallet !== undefined) payment.payerWallet = body.payerWallet;
    if (body.recipientWallet !== undefined) payment.recipientWallet = body.recipientWallet;
    if (body.notes !== undefined) payment.notes = body.notes;

    if (body.amountCrypto !== undefined || body.rateINRAtReceipt !== undefined) {
      if (!body.fiatValueINRAtReceipt) {
        payment.fiatValueINRAtReceipt = payment.amountCrypto * payment.rateINRAtReceipt;
      }
    }

    await payment.save();

    await AuditLog.create({
      action: "PAYMENT_UPDATED",
      entityType: "Payment",
      entityId: payment._id.toString(),
      summary: `Updated ${payment.asset} payment record for Invoice ${payment.invoiceNumber} (Amount: ${payment.amountCrypto} ${payment.asset}, ₹${payment.fiatValueINRAtReceipt})`,
    });

    return NextResponse.json({ success: true, data: payment });
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

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const invoiceId = payment.invoiceId;
    await Payment.findByIdAndDelete(id);

    const remainingPayments = await Payment.find({ invoiceId });
    if (remainingPayments.length === 0) {
      await Invoice.findByIdAndUpdate(invoiceId, {
        status: "ISSUED",
        reconciliationStatus: "UNPAID",
      });
    }

    await AuditLog.create({
      action: "PAYMENT_DELETED",
      entityType: "Payment",
      entityId: id,
      summary: `Deleted ${payment.asset} payment record for Invoice ${payment.invoiceNumber}`,
    });

    return NextResponse.json({ success: true, message: "Payment record deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
