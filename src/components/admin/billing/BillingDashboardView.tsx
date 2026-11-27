"use client";

import React from "react";
import {
  FileText,
  Landmark,
  Coins,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Receipt,
  ArrowRightLeft,
} from "lucide-react";
import type {
  BillingReportsData,
  BillingTab,
  InvoiceRecord,
  PaymentRecord,
} from "./types";

interface BillingDashboardViewProps {
  reports: BillingReportsData | null;
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  setActiveTab: (tab: BillingTab) => void;
}

export default function BillingDashboardView({
  reports,
  invoices,
  payments,
  setActiveTab,
}: BillingDashboardViewProps) {
  const summary = reports?.summary || {
    totalInvoicedUSD: 0,
    totalInvoicedINR: 0,
    totalCryptoPaymentsCount: 0,
    totalBankCreditedINR: 0,
    totalExpensesINR: 0,
    netProfitINR: 0,
    totalUnreconciledPayments: 0,
    totalReconciledPayments: 0,
    totalInvoicesCount: 0,
  };

  const cryptoLedger = reports?.cryptoLedger || {};
  const cryptoEntries = Object.entries(cryptoLedger);

  const pendingPayments = payments.filter((p) => {
    const inv = invoices.find((i) => i._id === p.invoiceId);
    return inv && inv.reconciliationStatus !== "RECONCILED";
  });

  return (
    <div className="space-y-6">
      {/* Unreconciled Attention Banner */}
      {summary.totalUnreconciledPayments > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                {summary.totalUnreconciledPayments} crypto payment
                {summary.totalUnreconciledPayments > 1 ? "s" : ""} awaiting bank
                UTR reconciliation
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Record your P2P trade or cash liquidation with a bank UTR
                reference to complete the tax trail.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("reconciliation")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 self-start sm:self-center"
          >
            Reconcile Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                All paid crypto invoices are reconciled
              </p>
              <p className="text-xs text-emerald-800/80">
                {summary.totalReconciledPayments} conversion batch
                {summary.totalReconciledPayments === 1 ? "" : "es"} matched to
                bank credits or cash settlements.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("new-invoice")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Invoice
          </button>
        </div>
      )}

      {/* KPI Grid (Polar crisp white cards + tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Invoiced (USD)
            </span>
            <span className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ${summary.totalInvoicedUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Across {summary.totalInvoicesCount} invoice
            {summary.totalInvoicesCount === 1 ? "" : "s"}
            {summary.totalInvoicedINR > 0
              ? ` · +₹${summary.totalInvoicedINR.toLocaleString()} INR`
              : ""}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Bank Credited (INR)
            </span>
            <span className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ₹{summary.totalBankCreditedINR.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Verified fiat realized in bank / cash
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Net Realized Profit
            </span>
            <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ₹{summary.netProfitINR.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Expenses: ₹{summary.totalExpensesINR.toLocaleString()} INR
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Crypto Receipts Logged
            </span>
            <span className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {summary.totalCryptoPaymentsCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {pendingPayments.length} pending liquidation
          </p>
        </div>
      </div>

      {/* Main Split: Crypto Treasury Holdings & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Crypto Holdings */}
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Crypto Treasury Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Received vs P2P disposed holdings
              </p>
            </div>
            <button
              onClick={() => setActiveTab("crypto-payments")}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View ledger →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {cryptoEntries.length === 0 ? (
              <div className="p-8 text-center">
                <Coins className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No crypto receipts logged yet
                </p>
              </div>
            ) : (
              cryptoEntries.map(([asset, stats]) => (
                <div key={asset} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-md bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center font-mono">
                        {asset.slice(0, 4)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {asset}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          In: {stats.received.toLocaleString()} · Out:{" "}
                          {stats.disposed.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 tabular-nums font-mono">
                        {stats.balance.toFixed(4)}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          stats.balance > 0.0001
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {stats.balance > 0.0001 ? "Held" : "Settled"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => setActiveTab("crypto-payments")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              Log Receipt
            </button>
            <button
              onClick={() => setActiveTab("reconciliation")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Match UTR
            </button>
          </div>
        </div>

        {/* Right: Recent Invoices Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Invoices
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest client invoices and reconciliation state
              </p>
            </div>
            <button
              onClick={() => setActiveTab("invoices")}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              All invoices →
            </button>
          </div>
          {invoices.length === 0 ? (
            <div className="p-10 text-center">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                No invoices yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Create your first export or domestic invoice in seconds.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-5">Invoice #</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Issued</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {invoices.slice(0, 6).map((inv) => {
                    const paid = Number(inv.paidAmount ?? (inv.status === "PAID" ? inv.totalAmount : 0));
                    const remaining = Math.max(0, Number((inv.totalAmount - paid).toFixed(2)));
                    const pct = inv.totalAmount > 0 ? Math.min(100, Math.round((paid / inv.totalAmount) * 100)) : 0;
                    return (
                    <tr
                      key={inv._id}
                      onClick={() => setActiveTab("invoices")}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-5 font-mono text-xs font-semibold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 text-sm">
                          {inv.clientName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {inv.clientCountry}
                          {inv.isExport ? " · Export LUT" : ""}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 tabular-nums">
                        {inv.issueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                        <div>{inv.currency} {inv.totalAmount.toLocaleString()}</div>
                        {inv.status === "PARTIALLY_PAID" && (
                          <div className="mt-1 space-y-1">
                            <div className="text-[10px] font-medium text-amber-700">
                              Paid {paid.toLocaleString()} · Due {remaining.toLocaleString()} ({pct}%)
                            </div>
                            <div className="w-24 ml-auto h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            inv.status === "PARTIALLY_PAID"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : inv.reconciliationStatus === "RECONCILED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inv.reconciliationStatus === "UNRECONCILED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {inv.status === "PARTIALLY_PAID"
                            ? `Partial (${pct}%)`
                            : inv.reconciliationStatus === "RECONCILED"
                            ? "Reconciled"
                            : inv.reconciliationStatus === "UNRECONCILED"
                            ? "Crypto Paid"
                            : inv.status}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
