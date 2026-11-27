import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Conversion from "@/models/Conversion";
import Expense from "@/models/Expense";
import Client from "@/models/Client";
import AuditLog from "@/models/AuditLog";
import BusinessProfile from "@/models/BusinessProfile";

export async function GET() {
  try {
    await dbConnect();

    const [invoices, payments, conversions, expenses, clients, logs, profile] = await Promise.all([
      Invoice.find().lean(),
      Payment.find().lean(),
      Conversion.find().lean(),
      Expense.find().lean(),
      Client.find().lean(),
      AuditLog.find().lean(),
      BusinessProfile.findOne().lean(),
    ]);

    const invoiceCsvHeaders = "Invoice Number,Issue Date,Due Date,Client,Country,Is Export,Subtotal,Discount,Tax,Total,Currency,Status,Reconciliation Status\n";
    const invoiceCsvRows = invoices
      .map((i: any) =>
        `"${i.invoiceNumber}","${i.issueDate}","${i.dueDate}","${i.clientName}","${i.clientCountry}","${i.isExport}","${i.subtotal}","${i.discount}","${i.taxAmount}","${i.totalAmount}","${i.currency}","${i.status}","${i.reconciliationStatus}"`
      )
      .join("\n");

    const paymentCsvHeaders = "Invoice Number,Payment Date,Payment Method,Asset,Network,Crypto Amount,TxHash,Spot INR Rate,Spot Fiat Value INR,Payer Wallet,Recipient Wallet\n";
    const paymentCsvRows = payments
      .map((p: any) =>
        `"${p.invoiceNumber}","${p.transactionDate}","${p.paymentMethod}","${p.asset}","${p.network || ""}","${p.amountCrypto}","${p.txHash || ""}","${p.rateINRAtReceipt}","${p.fiatValueINRAtReceipt}","${p.payerWallet || ""}","${p.recipientWallet || ""}"`
      )
      .join("\n");

    const conversionCsvHeaders = "Invoice Number,Disposed Date,Disposed Asset,Disposed Amount,Received INR,Platform,P2P/Trade Order ID,Bank Account,Bank UTR,Bank Credit Date,Fees INR,Status\n";
    const conversionCsvRows = conversions
      .map((c: any) =>
        `"${c.invoiceNumber}","${c.disposedDate}","${c.disposedAsset}","${c.disposedAmount}","${c.receivedINR}","${c.platform}","${c.orderId || ""}","${c.bankAccount}","${c.bankUTR}","${c.bankCreditDate}","${c.exchangeFeeINR || 0}","${c.status}"`
      )
      .join("\n");

    const expenseCsvHeaders = "Date,Vendor,Category,Description,Amount,Currency,Amount INR,Payment Method\n";
    const expenseCsvRows = expenses
      .map((e: any) =>
        `"${e.expenseDate}","${e.vendor}","${e.category}","${e.description || ""}","${e.amount}","${e.currency}","${e.amountINR}","${e.paymentMethod || ""}"`
      )
      .join("\n");

    const manifest = {
      exportedAt: new Date().toISOString(),
      businessName: profile?.tradeName || "RelayWorks",
      recordsCount: {
        invoices: invoices.length,
        payments: payments.length,
        conversions: conversions.length,
        expenses: expenses.length,
        clients: clients.length,
        auditLogs: logs.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        manifest,
        csv: {
          invoices: invoiceCsvHeaders + invoiceCsvRows,
          payments: paymentCsvHeaders + paymentCsvRows,
          conversions: conversionCsvHeaders + conversionCsvRows,
          expenses: expenseCsvHeaders + expenseCsvRows,
        },
        raw: {
          invoices,
          payments,
          conversions,
          expenses,
          clients,
          logs,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
