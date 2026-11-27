"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  Landmark,
  Banknote,
  Edit3,
  RotateCcw,
  X,
  Loader2,
  Layers,
} from "lucide-react";
import type {
  BusinessProfileRecord,
  ConversionRecord,
  InvoiceRecord,
  PaymentRecord,
} from "./types";

interface ReconciliationBoardProps {
  payments: PaymentRecord[];
  conversions: ConversionRecord[];
  invoices: InvoiceRecord[];
  profile: BusinessProfileRecord | null;
  onRefresh: () => void;
}

export default function ReconciliationBoard({
  payments,
  conversions,
  invoices,
  profile,
  onRefresh,
}: ReconciliationBoardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConversion, setEditingConversion] =
    useState<ConversionRecord | null>(null);

  const [conversionMode, setConversionMode] = useState<"BANK_TRANSFER" | "CASH">(
    "BANK_TRANSFER"
  );
  const [platform, setPlatform] = useState("Binance P2P");
  const [disposedAsset, setDisposedAsset] = useState("USDT");
  const [disposedAmount, setDisposedAmount] = useState("");
  const [p2pRate, setP2pRate] = useState("91.5");
  const [receivedINR, setReceivedINR] = useState("");
  const [bankAccount, setBankAccount] = useState("HDFC Primary");
  const [customBankAccount, setCustomBankAccount] = useState("");
  const [bankUTR, setBankUTR] = useState("");
  const [bankCreditDate, setBankCreditDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderId, setOrderId] = useState("");
  const [buyerSellerReference, setBuyerSellerReference] = useState("");
  const [exchangeFeeINR, setExchangeFeeINR] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const savedBanks = useMemo(() => {
    const list =
      profile?.bankAccounts?.map((b) =>
        b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName
      ) || [];
    return list.length > 0 ? list : ["HDFC Primary (HDFC Bank)", "SBI Account"];
  }, [profile]);

  const reconciledPaymentIds = useMemo(() => {
    const set = new Set<string>();
    conversions.forEach((c) => {
      if (c.paymentId) set.add(c.paymentId);
      if (c.paymentIds) c.paymentIds.forEach((id) => set.add(id));
    });
    return set;
  }, [conversions]);

  const pendingPayments = useMemo(() => {
    return payments.filter((p) => {
      if (reconciledPaymentIds.has(p._id)) return false;
      const inv = invoices.find((i) => i._id === p.invoiceId);
      return !inv || inv.reconciliationStatus !== "RECONCILED";
    });
  }, [payments, invoices, reconciledPaymentIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openBatchReconcile = (idsToReconcile: string[]) => {
    const targetPayments = pendingPayments.filter((p) =>
      idsToReconcile.includes(p._id)
    );
    if (targetPayments.length === 0) return;

    const totalCrypto = targetPayments.reduce(
      (sum, p) => sum + Number(p.amountCrypto || 0),
      0
    );
    const primaryAsset = targetPayments[0].asset || "USDT";
    const defaultRate = 91.5;

    setSelectedIds(idsToReconcile);
    setEditingConversion(null);
    setConversionMode("BANK_TRANSFER");
    setPlatform("Binance P2P");
    setDisposedAsset(primaryAsset);
    setDisposedAmount(String(totalCrypto));
    setP2pRate(String(defaultRate));
    setReceivedINR(String(Math.round(totalCrypto * defaultRate)));
    setBankAccount(savedBanks[0] || "HDFC Bank");
    setCustomBankAccount("");
    setBankUTR("");
    setBankCreditDate(new Date().toISOString().split("T")[0]);
    setOrderId("");
    setBuyerSellerReference("");
    setExchangeFeeINR("0");
    setNotes("");
    setShowModal(true);
  };

  const openEditConversion = (conv: ConversionRecord) => {
    setEditingConversion(conv);
    setConversionMode(conv.conversionMode === "CASH" ? "CASH" : "BANK_TRANSFER");
    setPlatform(conv.platform || "Binance P2P");
    setDisposedAsset(conv.disposedAsset || "USDT");
    setDisposedAmount(String(conv.disposedAmount));
    const derivedRate =
      conv.disposedAmount > 0 ? conv.receivedINR / conv.disposedAmount : 0;
    setP2pRate(derivedRate ? derivedRate.toFixed(2) : "91.5");
    setReceivedINR(String(conv.receivedINR));
    const matchingBank = savedBanks.includes(conv.bankAccount)
      ? conv.bankAccount
      : "__CUSTOM__";
    setBankAccount(matchingBank);
    setCustomBankAccount(matchingBank === "__CUSTOM__" ? conv.bankAccount : "");
    setBankUTR(conv.bankUTR || "");
    setBankCreditDate(conv.bankCreditDate || "");
    setOrderId(conv.orderId || "");
    setBuyerSellerReference(conv.buyerSellerReference || "");
    setExchangeFeeINR(String(conv.exchangeFeeINR || 0));
    setNotes(conv.notes || "");
    setShowModal(true);
  };

  const handleAmountOrRateChange = (amt: string, rate: string) => {
    setDisposedAmount(amt);
    setP2pRate(rate);
    const numAmt = Number(amt);
    const numRate = Number(rate);
    if (!Number.isNaN(numAmt) && !Number.isNaN(numRate) && numRate > 0) {
      setReceivedINR(String(Math.round(numAmt * numRate)));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resolvedBank =
        conversionMode === "CASH"
          ? "Cash in Hand"
          : bankAccount === "__CUSTOM__"
          ? customBankAccount || "Custom Bank Account"
          : bankAccount;

      const payload = {
        paymentIds: editingConversion ? undefined : selectedIds,
        disposedAsset,
        disposedAmount: Number(disposedAmount),
        disposedDate: bankCreditDate,
        receivedINR: Number(receivedINR),
        conversionMode,
        platform:
          conversionMode === "CASH" && platform === "Binance P2P"
            ? "Cash / OTC Settlement"
            : platform,
        orderId,
        buyerSellerReference,
        bankAccount: resolvedBank,
        bankUTR:
          conversionMode === "CASH" && !bankUTR.trim()
            ? `CASH-${Date.now().toString().slice(-6)}`
            : bankUTR,
        bankCreditDate,
        exchangeFeeINR: Number(exchangeFeeINR || 0),
        notes,
      };

      const res = await fetch(
        editingConversion
          ? `/api/admin/billing/conversions/${editingConversion._id}`
          : "/api/admin/billing/conversions",
        {
          method: editingConversion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setSelectedIds([]);
        onRefresh();
      } else {
        alert(data.error || "Failed to save reconciliation");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (conv: ConversionRecord) => {
    if (
      !confirm(
        `Roll back reconciliation for ${conv.invoiceNumber} (UTR: ${conv.bankUTR})? Linked invoices will return to Pending Reconciliation.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/billing/conversions/${conv._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Pending Queue */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Pending Bank / UTR Reconciliation ({pendingPayments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select one or more crypto receipts to batch-reconcile against a
              single P2P bank credit or cash settlement.
            </p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => openBatchReconcile(selectedIds)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Reconcile Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {pendingPayments.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">
              Zero pending receipts
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All logged crypto payments have verified bank UTR or cash
              entries.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingPayments.map((p) => {
              const checked = selectedIds.includes(p._id);
              return (
                <div
                  key={p._id}
                  className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    checked ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelection(p._id)}
                      className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {p.invoiceNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          {p.amountCrypto} {p.asset}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 tabular-nums">
                        Received {p.transactionDate} · Receipt valuation: ₹
                        {Math.round(p.fiatValueINRAtReceipt).toLocaleString()}
                      </p>
                    </div>
                  </label>
                  <button
                    onClick={() => openBatchReconcile([p._id])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 self-end sm:self-center"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Reconcile
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Bank UTR & Cash Matches */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Completed Bank / Cash Settlements ({conversions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical off-ramp audit trail linked to bank UTRs.
          </p>
        </div>

        {conversions.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No bank/cash reconciliations logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Invoices</th>
                  <th className="py-3 px-4">Disposed Crypto</th>
                  <th className="py-3 px-4">Method & Account</th>
                  <th className="py-3 px-4">Bank UTR / Ref</th>
                  <th className="py-3 px-4 text-right">Realized INR</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {conversions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-900">
                      {c.invoiceNumber}
                      <div className="font-sans text-[11px] font-normal text-slate-400 tabular-nums mt-0.5">
                        Credited {c.bankCreditDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-800 tabular-nums">
                      {c.disposedAmount} {c.disposedAsset}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-800">
                        {c.conversionMode === "CASH" ? (
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        {c.bankAccount}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {c.platform}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {c.bankUTR}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                      ₹{c.receivedINR.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditConversion(c)}
                          title="Edit Settlement"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRollback(c)}
                          title="Roll Back Settlement"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-slate-900">
                {editingConversion
                  ? "Edit Bank / Cash Reconciliation"
                  : `Reconcile ${selectedIds.length} Crypto Receipt${
                      selectedIds.length > 1 ? "s" : ""
                    }`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setConversionMode("BANK_TRANSFER")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    conversionMode === "BANK_TRANSFER"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Bank Transfer / P2P
                </button>
                <button
                  type="button"
                  onClick={() => setConversionMode("CASH")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    conversionMode === "CASH"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Cash Settlement
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Disposed Amount ({disposedAsset})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={disposedAmount}
                    onChange={(e) =>
                      handleAmountOrRateChange(e.target.value, p2pRate)
                    }
                    className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Effective Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={p2pRate}
                    onChange={(e) =>
                      handleAmountOrRateChange(disposedAmount, e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Realized INR (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={receivedINR}
                    onChange={(e) => setReceivedINR(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              {conversionMode === "BANK_TRANSFER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Destination Bank Account
                    </label>
                    <select
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                    >
                      {savedBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                      <option value="__CUSTOM__">Other Custom Account...</option>
                    </select>
                  </div>
                  {bankAccount === "__CUSTOM__" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Custom Bank Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customBankAccount}
                        onChange={(e) => setCustomBankAccount(e.target.value)}
                        placeholder="e.g. ICICI Business"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bank UTR / IMPS Reference
                    </label>
                    <input
                      type="text"
                      required
                      value={bankUTR}
                      onChange={(e) => setBankUTR(e.target.value)}
                      placeholder="e.g. 421908112233"
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Platform / Channel
                  </label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="Binance P2P, CoinDCX, OTC..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Credit / Settlement Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bankCreditDate}
                    onChange={(e) => setBankCreditDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    P2P Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Counterparty Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={buyerSellerReference}
                    onChange={(e) => setBuyerSellerReference(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
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
                  Confirm Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
