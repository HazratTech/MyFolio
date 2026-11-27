"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  ShieldCheck,
  Loader2,
  UserPlus,
} from "lucide-react";
import { computeSHA256, generateInvoiceHTML } from "@/lib/pdfGenerator";
import type {
  BillingTab,
  BusinessProfileRecord,
  ClientRecord,
  InvoiceItem,
} from "./types";

interface InvoiceBuilderProps {
  clients: ClientRecord[];
  profile: BusinessProfileRecord | null;
  onInvoiceCreated: () => void;
  setActiveTab: (tab: BillingTab) => void;
}

export default function InvoiceBuilder({
  clients,
  profile,
  onInvoiceCreated,
  setActiveTab,
}: InvoiceBuilderProps) {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(nextWeek);
  const [currency, setCurrency] = useState(profile?.defaultCurrency || "USD");
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Custom Software & Automation Engineering",
      quantity: 1,
      unit: "Project",
      rate: 500,
      amount: 500,
      sacHsnCode: "998314",
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "Payment accepted in USDT (TRC20/BEP20/ERC20), USDC, or direct wire transfer."
  );
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0]._id);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (profile && !invoiceNumber) {
      const prefix = profile.invoicePrefix || "RW-2026-";
      const seq = String(profile.nextInvoiceNumber || 1).padStart(3, "0");
      setInvoiceNumber(`${prefix}${seq}`);
    }
  }, [profile, invoiceNumber]);

  const selectedClient = clients.find((c) => c._id === selectedClientId);
  const isExport = selectedClient ? selectedClient.isForeign : true;

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.rate),
    0
  );
  const totalAmount = Math.max(0, subtotal - Number(discount || 0));

  const updateItem = (
    idx: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, [field]: value };
        next.amount = Number(next.quantity) * Number(next.rate);
        return next;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: "",
        quantity: 1,
        unit: "Service",
        rate: 0,
        amount: 0,
        sacHsnCode: "998314",
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const previewInvoiceObj = {
    invoiceNumber: invoiceNumber || "DRAFT",
    issueDate,
    dueDate,
    currency,
    clientId: selectedClientId,
    clientName: selectedClient?.legalName || "Select a Client",
    clientCountry: selectedClient?.country || "United States",
    isExport,
    items,
    subtotal,
    discount,
    taxAmount: 0,
    totalAmount,
    notes,
    terms,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedClientId) {
      setError("Please select or create a client before issuing an invoice.");
      return;
    }
    setSubmitting(true);
    try {
      const htmlForHash = generateInvoiceHTML(
        previewInvoiceObj,
        profile,
        selectedClient
      );
      const pdfHash = computeSHA256(htmlForHash);

      const res = await fetch("/api/admin/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          dueDate,
          currency,
          clientId: selectedClientId,
          items,
          discount: Number(discount || 0),
          taxAmount: 0,
          notes,
          terms,
          pdfHash,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create invoice");
      } else {
        onInvoiceCreated();
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
        <UserPlus className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-900">
          Add a Client First
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You need at least one saved client profile so the invoice can record
          legal billing details and export LUT eligibility.
        </p>
        <button
          onClick={() => setActiveTab("clients")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          <UserPlus className="w-4 h-4" />
          Go to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Create & Stamp Invoice
          </h2>
          <p className="text-xs text-slate-500">
            Automatically stamps SHA-256 integrity hash & Export LUT notice when
            billed abroad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? "Back to Editor" : "Preview Document"}
        </button>
      </div>

      {showPreview ? (
        <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 sm:p-8">
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: generateInvoiceHTML(
                previewInvoiceObj,
                profile,
                selectedClient
              ),
            }}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          {/* Header Metadata Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bill To Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.legalName} ({c.country})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {isExport && (
              <div className="rounded-lg bg-blue-50 border border-blue-200/80 px-3.5 py-2.5 flex items-center gap-2 text-xs text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                Foreign Export detected ({selectedClient?.country}): Supply
                under Bond / LUT (0% IGST) declaration will be embedded.
              </div>
            )}
          </div>

          {/* Line Items Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Line Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) =>
                        updateItem(idx, "description", e.target.value)
                      }
                      placeholder="Service description"
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      SAC / HSN
                    </label>
                    <input
                      type="text"
                      value={item.sacHsnCode || ""}
                      onChange={(e) =>
                        updateItem(idx, "sacHsnCode", e.target.value)
                      }
                      placeholder="998314"
                      className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Rate ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(idx, "rate", Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-center justify-between md:justify-end gap-2">
                    <span className="md:hidden text-xs font-semibold text-slate-700 tabular-nums">
                      = {currency} {item.amount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Instructions & Terms
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Internal / Client Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reference or project milestone notes..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-4">
                  <span className="text-slate-500">Discount</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-28 px-2.5 py-1 text-right text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tax (IGST)</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    0% ({currency} 0)
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Total Due
                  </span>
                  <span className="text-xl font-bold text-blue-600 tabular-nums">
                    {currency} {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Issue & Stamp Invoice
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
