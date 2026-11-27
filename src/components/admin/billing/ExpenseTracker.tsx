"use client";

import React, { useState } from "react";
import { Plus, Trash2, Receipt, X, Loader2 } from "lucide-react";
import type { ExpenseRecord } from "./types";

interface ExpenseTrackerProps {
  expenses: ExpenseRecord[];
  onRefresh: () => void;
}

const CATEGORIES = [
  "Software/SaaS",
  "Cloud/VPS Hosting",
  "AI API Credits",
  "Domains & Infrastructure",
  "Hardware & Equipment",
  "Contractor / Freelancer",
  "Banking / FX Fees",
  "Marketing & Ads",
  "Other",
];

export default function ExpenseTracker({
  expenses,
  onRefresh,
}: ExpenseTrackerProps) {
  const [showModal, setShowModal] = useState(false);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("Software/SaaS");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("87.5");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [receiptReference, setReceiptReference] = useState("");
  const [saving, setSaving] = useState(false);

  const computedINR =
    currency === "INR"
      ? Number(amount || 0)
      : Math.round(Number(amount || 0) * Number(exchangeRate || 87.5));

  const totalINR = expenses.reduce((s, e) => s + Number(e.amountINR || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/billing/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseDate,
          vendor,
          category,
          description,
          currency,
          amount: Number(amount),
          amountINR: computedINR,
          paymentMethod,
          receiptReference,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setVendor("");
        setDescription("");
        setAmount("");
        setReceiptReference("");
        onRefresh();
      } else {
        alert(data.error || "Failed to save expense");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exp: ExpenseRecord) => {
    if (!confirm(`Delete expense for ${exp.vendor}?`)) return;
    const res = await fetch(`/api/admin/billing/expenses?id=${exp._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Business Expenses
          </h2>
          <p className="text-xs text-slate-500 tabular-nums">
            Total Deductible Expenses:{" "}
            <span className="font-semibold text-slate-900">
              ₹{totalINR.toLocaleString()}
            </span>{" "}
            across {expenses.length} item{expenses.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              No business expenses logged
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Track SaaS, VPS hosting, OpenAI/LLM credits, and contractor payouts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-4">Vendor & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Original</th>
                  <th className="py-3 px-4 text-right">INR Equivalent</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 text-xs text-slate-500 tabular-nums">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900">{exp.vendor}</p>
                      {exp.description && (
                        <p className="text-xs text-slate-500">
                          {exp.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {exp.currency} {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 tabular-nums">
                      ₹{exp.amountINR.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Add Business Expense
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Vendor / Merchant
                  </label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Contabo, OpenAI, Cloudflare..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Credit Card, UPI, Crypto"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      if (e.target.value === "EUR") setExchangeRate("95");
                      if (e.target.value === "USD") setExchangeRate("87.5");
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                {currency !== "INR" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      FX Rate (to ₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">INR Equivalent Recorded:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{computedINR.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Monthly VPS renewal..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
