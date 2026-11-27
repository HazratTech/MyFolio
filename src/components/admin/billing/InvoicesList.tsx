"use client";

import React, { useState } from "react";
import {
  Search,
  Printer,
  Copy,
  Check,
  Trash2,
  Mail,
  Plus,
  ShieldCheck,
  X,
  Send,
  Loader2,
  FileText,
  Coins,
} from "lucide-react";
import { generateInvoiceHTML } from "@/lib/pdfGenerator";
import type {
  BillingTab,
  BusinessProfileRecord,
  ClientRecord,
  InvoiceRecord,
  PaymentRecord,
} from "./types";

interface InvoicesListProps {
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  clients: ClientRecord[];
  profile: BusinessProfileRecord | null;
  setActiveTab: (tab: BillingTab) => void;
  onRecordInstallment: (invoiceId: string) => void;
  onRefresh: () => void;
}

export default function InvoicesList({
  invoices,
  payments,
  clients,
  profile,
  setActiveTab,
  onRecordInstallment,
  onRefresh,
}: InvoicesListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Zoho Mail Modal State
  const [emailModalInvoice, setEmailModalInvoice] =
    useState<InvoiceRecord | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const filtered = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.clientCountry.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      inv.status === statusFilter ||
      inv.reconciliationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyHash = (inv: InvoiceRecord) => {
    if (!inv.pdfHash) return;
    navigator.clipboard.writeText(inv.pdfHash);
    setCopiedHashId(inv._id);
    setTimeout(() => setCopiedHashId(null), 1800);
  };

  const handlePrintPDF = (inv: InvoiceRecord) => {
    const client = clients.find((c) => c._id === inv.clientId);
    const html = generateInvoiceHTML(inv, profile, client);
    const printWin = window.open("", "_blank", "width=900,height=1000");
    if (!printWin) return;
    printWin.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Invoice ${inv.invoiceNumber}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body style="margin:0;padding:24px;background:#ffffff;">
          ${html}
          <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const openEmailModal = (inv: InvoiceRecord) => {
    const client = clients.find((c) => c._id === inv.clientId);
    const linesText = (inv.items || [])
      .map(
        (item) =>
          `- ${item.description} (${item.quantity} x ${inv.currency} ${item.rate}) = ${inv.currency} ${item.amount}`
      )
      .join("\n");

    const paid = Number(inv.paidAmount || 0);
    const remaining = Math.max(0, Number((inv.totalAmount - paid).toFixed(2)));
    const balanceSection =
      paid > 0 && remaining > 0.01
        ? `Invoice Total: ${inv.currency} ${inv.totalAmount.toLocaleString()}\nPaid to Date: ${inv.currency} ${paid.toLocaleString()}\nBalance Due: ${inv.currency} ${remaining.toLocaleString()}`
        : `Total Due: ${inv.currency} ${inv.totalAmount.toLocaleString()}`;

    setEmailModalInvoice(inv);
    setEmailTo(client?.email || "");
    setEmailSubject(
      `Invoice ${inv.invoiceNumber} from ${profile?.tradeName || "RelayWorks"} (${inv.currency} ${(remaining > 0.01 && paid > 0 ? remaining : inv.totalAmount).toLocaleString()})`
    );
    setEmailBody(
      `Hi ${inv.clientName},\n\nPlease find your invoice details below:\n\nInvoice #: ${inv.invoiceNumber}\nIssue Date: ${inv.issueDate}\nDue Date: ${inv.dueDate}\n${balanceSection}\n\nItems:\n${linesText}\n\nPayment Instructions:\n${inv.terms || "Cryptocurrency (USDT/USDC) or Direct Bank Transfer accepted."}${
        inv.pdfHash ? `\n\nSHA-256 Document Hash: ${inv.pdfHash}` : ""
      }\n\nThanks,\n${profile?.legalName || "Hazrat Ummar"}\n${profile?.tradeName || "RelayWorks"}`
    );
    setEmailNotice(null);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalInvoice) return;
    setSendingEmail(true);
    setEmailNotice(null);
    try {
      const res = await fetch(
        `/api/admin/billing/invoices/${emailModalInvoice._id}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: emailTo,
            subject: emailSubject,
            body: emailBody,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        setEmailNotice({ type: "err", text: data.error || "Send failed" });
      } else {
        setEmailNotice({
          type: "ok",
          text: data.message || "Invoice sent via Zoho Mail.",
        });
        onRefresh();
        setTimeout(() => setEmailModalInvoice(null), 1200);
      }
    } catch (err: any) {
      setEmailNotice({ type: "err", text: err.message || "Network error" });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async (inv: InvoiceRecord) => {
    if (
      !confirm(
        `Delete invoice ${inv.invoiceNumber} for ${inv.clientName}? This action is logged.`
      )
    ) {
      return;
    }
    setDeletingId(inv._id);
    try {
      const res = await fetch(`/api/admin/billing/invoices/${inv._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error || "Failed to delete invoice");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, client, country..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Issued (Unpaid)</option>
            <option value="PARTIALLY_PAID">Partially Paid (Installments)</option>
            <option value="PAID">Paid in Full</option>
            <option value="UNRECONCILED">Crypto Unreconciled</option>
            <option value="RECONCILED">Reconciled (Bank UTR)</option>
          </select>
        </div>
        <button
          onClick={() => setActiveTab("new-invoice")}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              No matching invoices
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your filters or generate a new invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Invoice</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4 text-right">Amount &amp; Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Hash</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((inv) => {
                  const invPayments = payments.filter(
                    (p) => p.invoiceId === inv._id
                  );
                  const paid = Number(
                    inv.paidAmount ?? (inv.status === "PAID" ? inv.totalAmount : 0)
                  );
                  const remaining = Math.max(
                    0,
                    Number((inv.totalAmount - paid).toFixed(2))
                  );
                  const pct =
                    inv.totalAmount > 0
                      ? Math.min(100, Math.round((paid / inv.totalAmount) * 100))
                      : 0;
                  const canAddInstallment =
                    inv.status !== "PAID" && inv.status !== "CANCELLED";

                  return (
                    <tr
                      key={inv._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-xs font-semibold text-slate-900 block">
                          {inv.invoiceNumber}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inv.isExport && (
                            <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                              Export LUT
                            </span>
                          )}
                          {invPayments.length > 0 && (
                            <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {invPayments.length} installment
                              {invPayments.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">
                          {inv.clientName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {inv.clientCountry}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                        <div>Issued: {inv.issueDate}</div>
                        <div className="text-slate-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-semibold text-slate-900">
                          {inv.currency} {inv.totalAmount.toLocaleString()}
                        </div>
                        {inv.status === "PARTIALLY_PAID" && (
                          <div className="mt-1 space-y-1">
                            <div className="text-[11px] font-medium text-amber-700">
                              Paid {inv.currency} {paid.toLocaleString()} · Due{" "}
                              {inv.currency} {remaining.toLocaleString()}
                            </div>
                            <div className="w-28 ml-auto h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                              inv.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : inv.status === "PARTIALLY_PAID"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : inv.status === "CANCELLED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {inv.status === "PARTIALLY_PAID"
                              ? `PARTIAL (${pct}%)`
                              : inv.status}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              inv.reconciliationStatus === "RECONCILED"
                                ? "text-emerald-600"
                                : inv.reconciliationStatus === "UNRECONCILED"
                                ? "text-amber-600"
                                : "text-slate-400"
                            }`}
                          >
                            {inv.reconciliationStatus === "RECONCILED"
                              ? "UTR Matched"
                              : inv.reconciliationStatus === "UNRECONCILED"
                              ? "Awaiting UTR"
                              : "Unpaid"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.pdfHash ? (
                          <button
                            onClick={() => handleCopyHash(inv)}
                            title={inv.pdfHash}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-mono text-[11px] transition-colors"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {inv.pdfHash.slice(0, 8)}...
                            {copiedHashId === inv._id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {canAddInstallment && (
                            <button
                              onClick={() => onRecordInstallment(inv._id)}
                              title="Record Payment / Installment"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              + Pay
                            </button>
                          )}
                          <button
                            onClick={() => openEmailModal(inv)}
                            title="Send Invoice via Zoho Mail"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </button>
                          <button
                            onClick={() => handlePrintPDF(inv)}
                            title="Print / Save PDF"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            PDF
                          </button>
                          <button
                            onClick={() => handleDelete(inv)}
                            disabled={deletingId === inv._id}
                            title="Delete Invoice"
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Zoho Mail Modal */}
      {emailModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Send Invoice via Zoho Mail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {emailModalInvoice.invoiceNumber} ·{" "}
                  {emailModalInvoice.clientName}
                </p>
              </div>
              <button
                onClick={() => setEmailModalInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-5 space-y-4">
              {emailNotice && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border ${
                    emailNotice.type === "ok"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {emailNotice.text}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Recipient Email (To)
                </label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={8}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {sendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
