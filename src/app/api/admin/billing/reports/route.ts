import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Conversion from "@/models/Conversion";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    await dbConnect();

    const [invoices, payments, conversions, expenses] = await Promise.all([
      Invoice.find(),
      Payment.find(),
      Conversion.find(),
      Expense.find(),
    ]);

    const totalInvoicedUSD = invoices.reduce((acc, inv) => acc + (inv.currency === "USD" ? inv.totalAmount : 0), 0);
    const totalInvoicedINR = invoices.reduce((acc, inv) => acc + (inv.currency === "INR" ? inv.totalAmount : 0), 0);
    const totalCryptoPaymentsCount = payments.filter((p) => p.paymentMethod === "crypto").length;
    const totalBankCreditedINR = conversions.reduce((acc, c) => acc + c.receivedINR, 0);
    const totalExpensesINR = expenses.reduce((acc, e) => acc + e.amountINR, 0);
    const netProfitINR = totalBankCreditedINR - totalExpensesINR;

    const totalUnreconciledPayments = invoices.filter((i) => i.reconciliationStatus === "UNRECONCILED").length;
    const totalReconciledPayments = invoices.filter((i) => i.reconciliationStatus === "RECONCILED").length;

    const cryptoHoldingsMap: Record<string, { received: number; disposed: number; balance: number }> = {};

    payments.forEach((p) => {
      if (p.paymentMethod === "crypto") {
        if (!cryptoHoldingsMap[p.asset]) {
          cryptoHoldingsMap[p.asset] = { received: 0, disposed: 0, balance: 0 };
        }
        cryptoHoldingsMap[p.asset].received += p.amountCrypto;
      }
    });

    conversions.forEach((c) => {
      if (!cryptoHoldingsMap[c.disposedAsset]) {
        cryptoHoldingsMap[c.disposedAsset] = { received: 0, disposed: 0, balance: 0 };
      }
      cryptoHoldingsMap[c.disposedAsset].disposed += c.disposedAmount;
    });

    Object.keys(cryptoHoldingsMap).forEach((asset) => {
      cryptoHoldingsMap[asset].balance =
        cryptoHoldingsMap[asset].received - cryptoHoldingsMap[asset].disposed;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalInvoicedUSD,
          totalInvoicedINR,
          totalCryptoPaymentsCount,
          totalBankCreditedINR,
          totalExpensesINR,
          netProfitINR,
          totalUnreconciledPayments,
          totalReconciledPayments,
          totalInvoicesCount: invoices.length,
        },
        cryptoLedger: cryptoHoldingsMap,
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
