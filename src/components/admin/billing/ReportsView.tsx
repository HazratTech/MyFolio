"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  FileArchive,
  Download,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Landmark,
  Receipt,
} from "lucide-react";
import type { BillingReportsData } from "./types";

interface ReportsViewProps {
  reports: BillingReportsData | null;
}

export default function ReportsView({ reports }: ReportsViewProps) {
  const [exporting, setExporting] = useState(false);
  const [exportedDone, setExportedDone] = useState(false);

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

  const handleDownloadCAArchive = async () => {
    setExporting(true);
    setExportedDone(false);
    try {
      const res = await fetch("/api/admin/billing/export");
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Failed to generate archive");
        return;
      }

      const { manifest, csv, raw } = json.data;
      const zip = new JSZip();

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("csv/invoices.csv", csv.invoices);
      zip.file("csv/crypto_payments.csv", csv.payments);
      zip.file("csv/p2p_conversions.csv", csv.conversions);
      zip.file("csv/business_expenses.csv", csv.expenses);

      zip.file("backup/invoices.json", JSON.stringify(raw.invoices, null, 2));
      zip.file("backup/payments.json", JSON.stringify(raw.payments, null, 2));
      zip.file(
        "backup/conversions.json",
        JSON.stringify(raw.conversions, null, 2)
      );
      zip.file("backup/expenses.json", JSON.stringify(raw.expenses, null, 2));
      zip.file("backup/clients.json", JSON.stringify(raw.clients, null, 2));
      zip.file("backup/audit_logs.json", JSON.stringify(raw.logs, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const dateStr = new Date().toISOString().split("T")[0];
      saveAs(blob, `RelayWorks-CA-Tax-Pack-${dateStr}.zip`);
      setExportedDone(true);
      setTimeout(() => setExportedDone(false), 3000);
    } catch (err: any) {
      alert(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CA Export Hero Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              FY Tax & Chartered Accountant (CA) Pack
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Downloads a complete ZIP bundle containing 4 clean CSV ledgers
              (Invoices, Crypto Receipts, P2P UTR Conversions, Expenses) plus
              raw JSON backups and a timestamped manifest for ITR / GST LUT
              filing.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadCAArchive}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shrink-0 disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : exportedDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting
            ? "Bundling ZIP..."
            : exportedDone
            ? "Downloaded ZIP"
            : "Export Full CA Archive (.zip)"}
        </button>
      </div>

      {/* FY Summary Figures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Gross Export Invoiced (USD)
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">
            ${summary.totalInvoicedUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            0% IGST under LUT · {summary.totalInvoicesCount} total invoices
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Bank Realized Turnover (INR)
            </span>
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">
            ₹{summary.totalBankCreditedINR.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Reconciled via P2P / Cash settlements
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Net Profit After Expenses
            </span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">
            ₹{summary.netProfitINR.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            After ₹{summary.totalExpensesINR.toLocaleString()} logged expenses
          </p>
        </div>
      </div>
    </div>
  );
}
