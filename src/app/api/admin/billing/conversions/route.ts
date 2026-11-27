import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Conversion from "@/models/Conversion";
import Payment from "@/models/Payment";
import AuditLog from "@/models/AuditLog";
import { recalculateInvoicePaymentState } from "@/lib/billingSync";

export async function GET() {
  try {
    await dbConnect();
    const conversions = await Conversion.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: conversions }, {
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

    const paymentIds: string[] = body.paymentIds || (body.paymentId ? [body.paymentId] : []);
    if (paymentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one payment record ID is required" },
        { status: 400 }
      );
    }

    const payments = await Payment.find({ _id: { $in: paymentIds } });
    if (payments.length === 0) {
      return NextResponse.json({ success: false, error: "Payment records not found" }, { status: 404 });
    }

    const invoiceIdsSet = new Set<string>();
    const invoiceNumbersSet = new Set<string>();
    let totalDisposedCrypto = 0;
    const primaryAsset = body.disposedAsset || payments[0].asset;

    payments.forEach((p) => {
      invoiceIdsSet.add(p.invoiceId.toString());
      invoiceNumbersSet.add(p.invoiceNumber);
      totalDisposedCrypto += p.amountCrypto;
    });

    const invoiceIds = Array.from(invoiceIdsSet);
    const invoiceNumberStr = Array.from(invoiceNumbersSet).join(", ");

    const conversion = await Conversion.create({
      paymentId: payments[0]._id,
      paymentIds: payments.map((p) => p._id),
      invoiceId: payments[0].invoiceId,
      invoiceIds: invoiceIds.map((id) => new mongoose.Types.ObjectId(id)),
      invoiceNumber: invoiceNumberStr,
      disposedAsset: primaryAsset,
      disposedAmount: Number(body.disposedAmount) || totalDisposedCrypto,
      acquiredDate: payments[0].transactionDate,
      disposedDate: body.disposedDate || new Date().toISOString().split("T")[0],
      receivedINR: Number(body.receivedINR) || 0,
      conversionMode: body.conversionMode || "BANK_TRANSFER",
      platform: body.platform || (body.conversionMode === "CASH" ? "Cash / Friend Transfer" : "Binance P2P"),
      orderId: body.orderId || "",
      buyerSellerReference: body.buyerSellerReference || "",
      bankAccount: body.bankAccount || (body.conversionMode === "CASH" ? "Cash in Hand" : "HDFC Bank"),
      bankUTR: body.bankUTR || (body.conversionMode === "CASH" ? `CASH-${Date.now().toString().slice(-6)}` : "UTR-UNSPECIFIED"),
      bankCreditDate: body.bankCreditDate || new Date().toISOString().split("T")[0],
      exchangeFeeINR: Number(body.exchangeFeeINR) || 0,
      status: "RECONCILED",
      notes: body.notes || "",
    });

    await Promise.all(
      invoiceIds.map((iid) => recalculateInvoicePaymentState(iid))
    );

    await AuditLog.create({
      action: "BATCH_CONVERSION_RECONCILED",
      entityType: "Conversion",
      entityId: conversion._id.toString(),
      summary: `Reconciled ${payments.length} payment(s) totaling ${conversion.disposedAmount} ${conversion.disposedAsset} to ₹${conversion.receivedINR.toLocaleString()} in ${conversion.bankAccount} (Ref: ${conversion.bankUTR})`,
    });

    return NextResponse.json({ success: true, data: conversion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
