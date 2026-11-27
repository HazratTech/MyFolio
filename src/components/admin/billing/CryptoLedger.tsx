"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { POPULAR_COINS } from "@/lib/popularCoins";
import type { InvoiceRecord, PaymentRecord } from "./types";

interface CryptoLedgerProps {
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
  onRefresh: () => void;
}

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
  onRefresh,
}: CryptoLedgerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coinSearch, setCoinSearch] = useState("");
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);

  const [invoiceId, setInvoiceId] = useState("");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [rateINRAtReceipt, setRateINRAtReceipt] = useState("87.5");
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

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status !== "PAID" && inv.status !== "CANCELLED"
  );

  const filteredCoins = POPULAR_COINS.filter(
    (c) =>
      c.symbol.toLowerCase().includes(coinSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(coinSearch.toLowerCase())
  );

  const fetchLiveRate = async (symbol: string) => {
    setFetchingPrice(true);
    try {
      const res = await fetch(
        `/api/admin/billing/prices?symbol=${encodeURIComponent(symbol)}`
      );
      const data = await res.json();
      if (data.success && data.priceINR) {
        setRateINRAtReceipt(String(Number(data.priceINR).toFixed(2)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingPrice(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    const defaultInv = unpaidInvoices[0] || invoices[0];
    setInvoiceId(defaultInv?._id || "");
    setAsset("USDT");
    setNetwork("TRC20");
    setAmountCrypto(defaultInv ? String(defaultInv.totalAmount) : "");
    setRateINRAtReceipt("87.5");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setTxHash("");
    setExplorerUrl("");
    setPayerWallet("");
    setRecipientWallet("");
    setNotes("");
    setShowModal(true);
  };

  const openEditModal = (p: PaymentRecord) => {
    setEditingId(p._id);
    setInvoiceId(p.invoiceId);
    setAsset(p.asset);
    setNetwork(p.network || "TRC20");
    setAmountCrypto(String(p.amountCrypto));
    setRateINRAtReceipt(String(p.rateINRAtReceipt));
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
        paymentMethod: "crypto",
        asset: asset.toUpperCase(),
        network,
        amountCrypto: Number(amountCrypto),
        rateINRAtReceipt: Number(rateINRAtReceipt),
        fiatValueINRAtReceipt:
          Number(amountCrypto || 0) * Number(rateINRAtReceipt || 0),
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
        `Delete ${p.amountCrypto} ${p.asset} receipt for ${p.invoiceNumber}? The invoice status will revert to UNPAID.`
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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Crypto Payments Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Track on-chain client payments, fair-market INR value at receipt,
            and explorer TX hashes.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Crypto Receipt
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              No crypto payments recorded
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Log incoming USDT, USDC, BTC, SOL, or custom tokens against an
              invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Invoice & Date</th>
                  <th className="py-3 px-4">Asset / Network</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">INR Value at Receipt</th>
                  <th className="py-3 px-4">On-Chain Tx</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((p) => {
                  const link = getExplorerUrl(
                    p.txHash || "",
                    p.network,
                    p.blockchainExplorerUrl
                  );
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
                            {p.network || "Spot"}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {p.amountCrypto.toLocaleString()} {p.asset}
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
                {editingId ? "Edit Crypto Receipt" : "Record Crypto Receipt"}
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
                      setInvoiceId(e.target.value);
                      if (inv) setAmountCrypto(String(inv.totalAmount));
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  >
                    <option value="">Select Invoice...</option>
                    {invoices.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} — {inv.clientName} ({inv.currency}{" "}
                        {inv.totalAmount}) [{inv.status}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Asset Ticker (45+ Supported)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={asset}
                      onFocus={() => setShowCoinDropdown(true)}
                      onChange={(e) => {
                        setAsset(e.target.value.toUpperCase());
                        setCoinSearch(e.target.value);
                        setShowCoinDropdown(true);
                      }}
                      placeholder="USDT, BTC, SOL..."
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {showCoinDropdown && (
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
                    Chain / Network
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
                    Crypto Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amountCrypto}
                    onChange={(e) => setAmountCrypto(e.target.value)}
                    className="w-full px-3 py-2 text-sm tabular-nums rounded-lg border border-slate-200 bg-white text-slate-900"
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
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Calculated INR Valuation at Receipt:
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹
                  {Math.round(
                    Number(amountCrypto || 0) * Number(rateINRAtReceipt || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction Hash (TxID)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x... or Tron/Solana signature"
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
                  {editingId ? "Save Changes" : "Record Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
