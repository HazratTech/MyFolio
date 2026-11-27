"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import type { BankAccount, BusinessProfileRecord } from "./types";

interface ProfileViewProps {
  profile: BusinessProfileRecord | null;
  onRefresh: () => void;
}

export default function ProfileView({ profile, onRefresh }: ProfileViewProps) {
  const [form, setForm] = useState<BusinessProfileRecord>({
    legalName: "RelayWorks Tech",
    tradeName: "RelayWorks",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    pan: "",
    gstin: "",
    email: "",
    phone: "",
    website: "https://relayworks.dev",
    bankAccounts: [
      { accountName: "HDFC Primary", bankName: "HDFC Bank" },
      { accountName: "SBI Account", bankName: "State Bank of India" },
    ],
    defaultCurrency: "USD",
    invoicePrefix: "RW-2026-",
    nextInvoiceNumber: 1,
  });

  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        bankAccounts:
          profile.bankAccounts && profile.bankAccounts.length > 0
            ? profile.bankAccounts
            : [{ accountName: "HDFC Primary", bankName: "HDFC Bank" }],
      });
    }
  }, [profile]);

  const addBankAccount = () => {
    setForm((prev) => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        { accountName: "", bankName: "", accountNumber: "", ifscCode: "" },
      ],
    }));
  };

  const updateBankAccount = (
    idx: number,
    field: keyof BankAccount,
    val: string
  ) => {
    setForm((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((acc, i) =>
        i === idx ? { ...acc, [field]: val } : acc
      ),
    }));
  };

  const removeBankAccount = (idx: number) => {
    if (form.bankAccounts.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      const res = await fetch("/api/admin/billing/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSavedNotice(true);
        onRefresh();
        setTimeout(() => setSavedNotice(false), 2500);
      } else {
        alert(data.error || "Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Business & Tax Identity
            </h2>
            <p className="text-xs text-slate-500">
              Printed on invoice PDFs, emails, and CA export manifests.
            </p>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Profile Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Legal Name
            </label>
            <input
              type="text"
              required
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Trade / Brand Name
            </label>
            <input
              type="text"
              required
              value={form.tradeName}
              onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              value={form.pan}
              onChange={(e) =>
                setForm({ ...form, pan: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              GSTIN (Optional)
            </label>
            <input
              type="text"
              value={form.gstin || ""}
              onChange={(e) =>
                setForm({ ...form, gstin: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ZIP / PIN Code
            </label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Invoice Preferences & Bank Accounts */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Invoicing Sequence & Destination Bank Accounts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Invoice Prefix
            </label>
            <input
              type="text"
              value={form.invoicePrefix}
              onChange={(e) =>
                setForm({ ...form, invoicePrefix: e.target.value })
              }
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Next Invoice Number
            </label>
            <input
              type="number"
              min="1"
              value={form.nextInvoiceNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  nextInvoiceNumber: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Default Currency
            </label>
            <select
              value={form.defaultCurrency}
              onChange={(e) =>
                setForm({ ...form, defaultCurrency: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Saved Indian Bank Accounts (for P2P Reconciliation)
            </span>
            <button
              type="button"
              onClick={addBankAccount}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bank Account
            </button>
          </div>

          {form.bankAccounts.map((acc, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border border-slate-100 bg-slate-50/50"
            >
              <div className="col-span-12 sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={acc.accountName}
                  onChange={(e) =>
                    updateBankAccount(idx, "accountName", e.target.value)
                  }
                  placeholder="HDFC Primary"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={acc.bankName}
                  onChange={(e) =>
                    updateBankAccount(idx, "bankName", e.target.value)
                  }
                  placeholder="HDFC Bank"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Account #
                </label>
                <input
                  type="text"
                  value={acc.accountNumber || ""}
                  onChange={(e) =>
                    updateBankAccount(idx, "accountNumber", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  IFSC
                </label>
                <input
                  type="text"
                  value={acc.ifscCode || ""}
                  onChange={(e) =>
                    updateBankAccount(idx, "ifscCode", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeBankAccount(idx)}
                  disabled={form.bankAccounts.length <= 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Business Settings
        </button>
      </div>
    </form>
  );
}
