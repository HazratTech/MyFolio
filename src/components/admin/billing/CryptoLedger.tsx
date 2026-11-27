"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ExternalLink,
  RefreshCw,
  Trash2,
  Coins,
  X,
  Edit3,
  Loader2,
  Search,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { POPULAR_COINS } from "@/lib/popularCoins";
import type { InvoiceRecord, PaymentRecord } from "./types";

interface CryptoLedgerProps {
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
  preselectedInvoiceId?: string | null;
  onClearPreselect?: () => void;
  onRefresh: () => void;
}

const USD_STABLE_ASSETS = new Set(["USDT", "USDC", "USD", "BUSD", "DAI", "FDUSD"]);

function getExplorerUrl(
  txHash: string,
  network?: string,
  customUrl?: string
): string {
  if (customUrl && customUrl.startsWith("http")) return customUrl;
  const h = (txHash || "").trim();
  if (!h) return "";
  const net = (network || "").toUpperCase();
  if (net.includes("TRC") || net.includes("TRON")) {
    return `https://tronscan.org/#/transaction/${h}`;
  }
  if (net.includes("BEP") || net.includes("BSC") || net.includes("BNB")) {
    return `https://bscscan.com/tx/${h}`;
  }
  if (net.includes("POLYGON") || net.includes("MATIC")) {
    return `https://polygonscan.com/tx/${h}`;
  }
  if (net.includes("ARB")) {
    return `https://arbiscan.io/tx/${h}`;
  }
  if (net.includes("OP")) {
    return `https://optimistic.etherscan.io/tx/${h}`;
  }
  if (net.includes("SOL")) {
    return `https://solscan.io/tx/${h}`;
  }
  if (net.includes("BTC")) {
    return `https://mempool.space/tx/${h}`;
  }
  if (net.includes("TON")) {
    return `https://tonscan.org/tx/${h}`;
  }
  if (net.includes("SUI")) {
    return `https://suiscan.xyz/mainnet/tx/${h}`;
  }
  return `https://etherscan.io/tx/${h}`;
}

export default function CryptoLedger({
  payments,
  invoices,
  preselectedInvoiceId,
  onClearPreselect,
  onRefresh,
}: CryptoLedgerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coinSearch, setCoinSearch] = useState("");
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);

  const [invoiceId, setInvoiceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "crypto" | "bank_wire" | "other"
  >("crypto");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [rateINRAtReceipt, setRateINRAtReceipt] = useState("87.5");
  const [priceUSD, setPriceUSD] = useState("1");
  const [appliedAmount, setAppliedAmount] = useState("");
  const [appliedManuallyEdited, setAppliedManuallyEdited] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [txHash, setTxHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [payerWallet, setPayerWallet] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [notes, setNotes] = useState("");

  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectableInvoices = invoices.filter(
    (inv) => inv.status !== "CANCELLED"
  );

  const getInvoiceBalance = useCallback(
    (inv: InvoiceRecord | undefined) => {
      if (!inv) return { total: 0, paid: 0, remaining: 0, count: 0 };
      const linked = payments.filter((p) => p.invoiceId === inv._id);
      const paid = Number(
        (
          inv.paidAmount ?? (inv.status === "PAID" ? inv.totalAmount : 0)
        ).toFixed(2)
      );
      const remaining = Math.max(
        0,
        Number((inv.totalAmount - paid).toFixed(2))
      );
      return { total: inv.totalAmount, paid, remaining, count: linked.length };
    },
    [payments]
  );

  const computeAppliedValue = (
    amtStr: string,
    currAsset: string,
    currMethod: "crypto" | "bank_wire" | "other",
    usdRateStr: string,
    inrRateStr: string,
    invCurr: string
  ) => {
    const amt = Number(amtStr || 0);
    const rINR = Number(inrRateStr || 87.5);
    const rUSD = Number(usdRateStr || 1);
    if (invCurr.toUpperCase() === "INR") {
      return currMethod === "bank_wire" && currAsset === "INR"
        ? String(Number(amt.toFixed(2)))
        : String(Number((amt * rINR).toFixed(2)));
    }
    if (
      currMethod !== "crypto" ||
      USD_STABLE_ASSETS.has(currAsset.toUpperCase())
    ) {
      return String(Number(amt.toFixed(2)));
    }
    return String(Number((amt * rUSD).toFixed(2)));
  };

  const openForInvoice = useCallback(
    (targetInv: InvoiceRecord | undefined) => {
      setEditingId(null);
      setPaymentMethod("crypto");
      setAsset("USDT");
      setNetwork("TRC20");
      setRateINRAtReceipt("87.5");
      setPriceUSD("1");
      setAppliedManuallyEdited(false);

      const bal = getInvoiceBalance(targetInv);
      const defaultAmt =
        bal.remaining > 0
          ? String(bal.remaining)
          : targetInv
          ? String(targetInv.totalAmount)
          : "";
      setInvoiceId(targetInv?._id || "");
      setAmountCrypto(defaultAmt);
      setAppliedAmount(defaultAmt);
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setTxHash("");
      setExplorerUrl("");
      setPayerWallet("");
      setRecipientWallet("");
      setNotes("");
      setShowModal(true);
    },
    [getInvoiceBalance]
  );

  useEffect(() => {
    if (preselectedInvoiceId && invoices.length > 0) {
      const targetInv = invoices.find((i) => i._id === preselectedInvoiceId);
      if (targetInv) {
        openForInvoice(targetInv);
      }
      onClearPreselect?.();
    }
  }, [preselectedInvoiceId, invoices, openForInvoice, onClearPreselect]);

  const filteredCoins = POPULAR_COINS.filter(
    (c) =>
      c.symbol.toLowerCase().includes(coinSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(coinSearch.toLowerCase())
  );

  const selectedInvoice = invoices.find((i) => i._id === invoiceId);
  const selectedBalance = getInvoiceBalance(selectedInvoice);

  const fetchLiveRate = async (symbol: string, currentAmt = amountCrypto) => {
    setFetchingPrice(true);
    try {
      const res = await fetch(
        `/api/admin/billing/prices?symbol=${encodeURIComponent(symbol)}`
      );
      const data = await res.json();
      if (data.success && data.priceINR) {
        const nextInr = String(Number(data.priceINR).toFixed(2));
        const nextUsd = String(Number(data.priceUSD || 1));
        setRateINRAtReceipt(nextInr);
        setPriceUSD(nextUsd);
        if (!appliedManuallyEdited) {
          setAppliedAmount(
            computeAppliedValue(
              currentAmt,
              symbol,
              paymentMethod,
              nextUsd,
              nextInr,
              selectedInvoice?.currency || "USD"
            )
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingPrice(false);
    }
  };

  const openAddModal = () => {
    const firstPending =
      selectableInvoices.find((i) => i.status !== "PAID") ||
      selectableInvoices[0];
    openForInvoice(firstPending);
  };

  const openEditModal = (p: PaymentRecord) => {
    setEditingId(p._id);
    setInvoiceId(p.invoiceId);
    setPaymentMethod(p.paymentMethod || "crypto");
    setAsset(p.asset);
    setNetwork(p.network || "TRC20");
    setAmountCrypto(String(p.amountCrypto));
    setRateINRAtReceipt(String(p.rateINRAtReceipt));
    const derivedUsd =
      p.appliedAmount && p.amountCrypto > 0
        ? String(Number((p.appliedAmount / p.amountCrypto).toFixed(4)))
        : p.rateINRAtReceipt > 0
        ? String(Number((p.rateINRAtReceipt / 87.5).toFixed(4)))
        : "1";
    setPriceUSD(derivedUsd);
    const inv = invoices.find((i) => i._id === p.invoiceId);
    const effectiveApplied =
      p.appliedAmount !== undefined && p.appliedAmount !== null
        ? String(p.appliedAmount)
        : computeAppliedValue(
            String(p.amountCrypto),
            p.asset,
            p.paymentMethod || "crypto",
            derivedUsd,
            String(p.rateINRAtReceipt),
            inv?.currency || "USD"
          );
    setAppliedAmount(effectiveApplied);
    setAppliedManuallyEdited(true);
    setTransactionDate(p.transactionDate);
    setTxHash(p.txHash || "");
    setExplorerUrl(p.blockchainExplorerUrl || "");
    setPayerWallet(p.payerWallet || "");
    setRecipientWallet(p.recipientWallet || "");
    setNotes(p.notes || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        invoiceId,
        paymentMethod,
        asset: paymentMethod === "crypto" ? asset.toUpperCase() : asset,
        network,
        amountCrypto: Number(amountCrypto),
        rateINRAtReceipt: Number(rateINRAtReceipt),
        fiatValueINRAtReceipt:
          Number(amountCrypto || 0) * Number(rateINRAtReceipt || 0),
        appliedAmount: Number(appliedAmount || 0),
        transactionDate,
        txHash,
        blockchainExplorerUrl: explorerUrl,
        payerWallet,
        recipientWallet,
        notes,
      };
      const res = await fetch(
        editingId
          ? `/api/admin/billing/payments/${editingId}`
          : "/api/admin/billing/payments",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        onRefresh();
      } else {
        alert(data.error || "Failed to save payment");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: PaymentRecord) => {
    if (
      !confirm(
        `Delete ${p.amountCrypto} ${p.asset} receipt for ${p.invoiceNumber}? The invoice paid balance & status will automatically recalculate.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/billing/payments/${p._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) onRefresh();
  };

  // Live preview of balance after adding/editing this installment
  const editingOriginalApplied = editingId
    ? Number(payments.find((p) => p._id === editingId)?.appliedAmount ?? 0)
    : 0;
  const basePaidExcludingCurrent = Math.max(
    0,
    selectedBalance.paid - editingOriginalApplied
  );
  const projectedTotalPaid = Number(
    (basePaidExcludingCurrent + Number(appliedAmount || 0)).toFixed(2)
  );
  const projectedRemaining = Math.max(
    0,
    Number((selectedBalance.total - projectedTotalPaid).toFixed(2))
  );
  const willFullySettle =
    selectedBalance.total > 0 &&
    projectedTotalPaid >= selectedBalance.total - 0.01;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Payments &amp; Crypto Installment Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Record full or partial installment receipts (crypto, wire, or fiat),
            live spot INR values, and applied invoice credits.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Receipt / Installment
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              No payments recorded yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Log incoming USDT, USDC, BTC, SOL, or partial installments against
              any invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Invoice &amp; Date</th>
                  <th className="py-3 px-4">Asset / Method</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4 text-right">Applied to Invoice</th>
                  <th className="py-3 px-4 text-right">INR Value</th>
                  <th className="py-3 px-4">On-Chain Tx / Ref</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((p) => {
                  const inv = invoices.find((i) => i._id === p.invoiceId);
                  const link = getExplorerUrl(
                    p.txHash || "",
                    p.network,
                    p.blockchainExplorerUrl
                  );
                  const appliedDisplay =
                    p.appliedAmount !== undefined && p.appliedAmount !== null
                      ? `${inv?.currency || "USD"} ${Number(p.appliedAmount).toLocaleString()}`
                      : inv?.status === "PAID"
                      ? `Settled`
                      : `—`;

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-xs font-semibold text-slate-900 block">
                          {p.invoiceNumber}
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {p.transactionDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                          {p.asset}
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {p.network || p.paymentMethod}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {p.amountCrypto.toLocaleString()} {p.asset}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/70">
                          {appliedDisplay}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-semibold text-slate-900">
                          ₹{Math.round(p.fiatValueINRAtReceipt).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          @ ₹{p.rateINRAtReceipt}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.txHash ? (
                          link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:underline"
                            >
                              {p.txHash.slice(0, 10)}...
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-mono text-slate-600">
                              {p.txHash.slice(0, 10)}...
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Edit Payment"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Payment"
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

      {/* Add / Edit Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-slate-900">
                {editingId
                  ? "Edit Payment / Installment"
                  : "Record Payment / Installment"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Linked Invoice
                  </label>
                  <select
                    required
                    value={invoiceId}
                    onChange={(e) => {
                      const inv = invoices.find((i) => i._id === e.target.value);
                      const bal = getInvoiceBalance(inv);
                      setInvoiceId(e.target.value);
                      setAppliedManuallyEdited(false);
                      const nextAmt =
                        bal.remaining > 0
                          ? String(bal.remaining)
                          : inv
                          ? String(inv.totalAmount)
                          : "";
                      setAmountCrypto(nextAmt);
                      setAppliedAmount(
                        computeAppliedValue(
                          nextAmt,
                          asset,
                          paymentMethod,
                          priceUSD,
                          rateINRAtReceipt,
                          inv?.currency || "USD"
                        )
                      );
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  >
                    <option value="">Select Invoice...</option>
                    {selectableInvoices.map((inv) => {
                      const bal = getInvoiceBalance(inv);
                      return (
                        <option key={inv._id} value={inv._id}>
                          {inv.invoiceNumber} — {inv.clientName} (
                          {inv.currency} {bal.remaining.toLocaleString()} due /{" "}
                          {inv.totalAmount.toLocaleString()} total) [{inv.status}]
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Live Installment Tracker Box */}
              {selectedInvoice && (
                <div
                  className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                    willFullySettle
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-blue-50/70 border-blue-200 text-blue-950"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      {willFullySettle ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {selectedInvoice.invoiceNumber} Installment Status
                    </span>
                    <span className="font-mono tabular-nums">
                      Total: {selectedInvoice.currency}{" "}
                      {selectedBalance.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] opacity-85 tabular-nums">
                    <span>
                      Already paid: {selectedInvoice.currency}{" "}
                      {basePaidExcludingCurrent.toLocaleString()} (
                      {selectedBalance.count} receipt
                      {selectedBalance.count === 1 ? "" : "s"})
                    </span>
                    <span>
                      {willFullySettle
                        ? "After this: PAID IN FULL"
                        : `Remaining after this: ${selectedInvoice.currency} ${projectedRemaining.toLocaleString()} (PARTIAL)`}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100">
                {(
                  [
                    { id: "crypto", label: "Crypto" },
                    { id: "bank_wire", label: "Bank Wire" },
                    { id: "other", label: "Wise / Other" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== "crypto") {
                        setAsset(selectedInvoice?.currency || "USD");
                        setNetwork(m.id === "bank_wire" ? "SWIFT/WIRE" : "OTHER");
                        setPriceUSD("1");
                      } else {
                        setAsset("USDT");
                        setNetwork("TRC20");
                        setPriceUSD("1");
                      }
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      paymentMethod === m.id
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {paymentMethod === "crypto"
                      ? "Asset Ticker (45+ Supported)"
                      : "Currency / Rail"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={asset}
                      onFocus={() =>
                        paymentMethod === "crypto" && setShowCoinDropdown(true)
                      }
                      onChange={(e) => {
                        const sym = e.target.value.toUpperCase();
                        setAsset(sym);
                        setCoinSearch(e.target.value);
                        if (paymentMethod === "crypto") setShowCoinDropdown(true);
                      }}
                      placeholder="USDT, BTC, SOL..."
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                    {paymentMethod === "crypto" && (
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {showCoinDropdown && paymentMethod === "crypto" && (
                    <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {filteredCoins.slice(0, 12).map((c) => (
                        <button
                          key={c.symbol}
                          type="button"
                          onClick={() => {
                            setAsset(c.symbol);
                            setNetwork(c.defaultNetwork);
                            setShowCoinDropdown(false);
                            setCoinSearch("");
                            fetchLiveRate(c.symbol);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-900">
                            {c.symbol}{" "}
                            <span className="font-normal text-slate-500">
                              — {c.name}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {c.defaultNetwork}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCoinDropdown(false)}
                        className="w-full px-3 py-1.5 text-center text-[11px] text-slate-500 bg-slate-50 hover:bg-slate-100 border-t border-slate-100"
                      >
                        Close dropdown
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {paymentMethod === "crypto"
                      ? "Chain / Network"
                      : "Channel / Reference"}
                  </label>
                  <input
                    type="text"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    placeholder="TRC20, ERC20, SOL..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount Received ({asset})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amountCrypto}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAmountCrypto(v);
                      if (!appliedManuallyEdited) {
                        setAppliedAmount(
                          computeAppliedValue(
                            v,
                            asset,
                            paymentMethod,
                            priceUSD,
                            rateINRAtReceipt,
                            selectedInvoice?.currency || "USD"
                          )
                        );
                      }
                    }}
                    className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Applied to Invoice ({selectedInvoice?.currency || "USD"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={appliedAmount}
                    onChange={(e) => {
                      setAppliedManuallyEdited(true);
                      setAppliedAmount(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm font-semibold tabular-nums rounded-lg border border-blue-200 bg-blue-50/30 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Spot INR Rate
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="any"
                      required
                      value={rateINRAtReceipt}
                      onChange={(e) => setRateINRAtReceipt(e.target.value)}
                      className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => fetchLiveRate(asset)}
                      title="Fetch Live Spot Rate"
                      className="px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          fetchingPrice ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2 flex flex-col justify-center text-xs">
                  <span className="text-slate-500">INR Valuation at Receipt:</span>
                  <span className="font-bold text-slate-900 tabular-nums text-sm">
                    ₹
                    {Math.round(
                      Number(amountCrypto || 0) * Number(rateINRAtReceipt || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction Hash / Payment Reference
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x... or Tron/Solana signature or Wire Ref"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payer Wallet (Optional)
                  </label>
                  <input
                    type="text"
                    value={payerWallet}
                    onChange={(e) => setPayerWallet(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Recipient Wallet (Optional)
                  </label>
                  <input
                    type="text"
                    value={recipientWallet}
                    onChange={(e) => setRecipientWallet(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
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
                  {editingId
                    ? "Save Changes"
                    : willFullySettle
                    ? "Record Final Payment"
                    : "Record Installment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
