import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Conversion from "@/models/Conversion";
import AuditLog from "@/models/AuditLog";
import { recalculateInvoicePaymentState } from "@/lib/billingSync";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const conversion = await Conversion.findById(id);
    if (!conversion) {
      return NextResponse.json({ success: false, error: "Conversion record not found" }, { status: 404 });
    }

    if (body.disposedAsset) conversion.disposedAsset = body.disposedAsset;
    if (body.disposedAmount !== undefined) conversion.disposedAmount = Number(body.disposedAmount);
    if (body.receivedINR !== undefined) conversion.receivedINR = Number(body.receivedINR);
    if (body.conversionMode) conversion.conversionMode = body.conversionMode;
    if (body.platform) conversion.platform = body.platform;
    if (body.orderId !== undefined) conversion.orderId = body.orderId;
    if (body.buyerSellerReference !== undefined) conversion.buyerSellerReference = body.buyerSellerReference;
    if (body.bankAccount) conversion.bankAccount = body.bankAccount;
    if (body.bankUTR !== undefined) conversion.bankUTR = body.bankUTR;
    if (body.bankCreditDate) conversion.bankCreditDate = body.bankCreditDate;
    if (body.notes !== undefined) conversion.notes = body.notes;

    await conversion.save();

    await AuditLog.create({
      action: "CONVERSION_UPDATED",
      entityType: "Conversion",
      entityId: conversion._id.toString(),
      summary: `Updated reconciliation for ${conversion.invoiceNumber} (UTR: ${conversion.bankUTR}, ₹${conversion.receivedINR})`,
    });

    return NextResponse.json({ success: true, data: conversion });
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

    const conversion = await Conversion.findById(id);
    if (!conversion) {
      return NextResponse.json({ success: false, error: "Conversion record not found" }, { status: 404 });
    }

    const invoiceIds: string[] = [];
    if (conversion.invoiceIds && conversion.invoiceIds.length > 0) {
      conversion.invoiceIds.forEach((iid: any) => invoiceIds.push(iid.toString()));
    } else if (conversion.invoiceId) {
      invoiceIds.push(conversion.invoiceId.toString());
    }

    await Conversion.findByIdAndDelete(id);

    if (invoiceIds.length > 0) {
      await Promise.all(
        invoiceIds.map((iid) => recalculateInvoicePaymentState(iid))
      );
    }

    await AuditLog.create({
      action: "CONVERSION_DELETED",
      entityType: "Conversion",
      entityId: id,
      summary: `Rolled back reconciliation for ${conversion.invoiceNumber}. Returned to Pending Reconciliation.`,
    });

    return NextResponse.json({ success: true, message: "Reconciliation record rolled back successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
