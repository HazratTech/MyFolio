"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  PlusCircle,
  Coins,
  ArrowRightLeft,
  Receipt,
  Users,
  ShieldCheck,
  FileArchive,
  Settings,
  RefreshCw,
} from "lucide-react";
import BillingDashboardView from "./BillingDashboardView";
import InvoicesList from "./InvoicesList";
import InvoiceBuilder from "./InvoiceBuilder";
import CryptoLedger from "./CryptoLedger";
import ReconciliationBoard from "./ReconciliationBoard";
import ExpenseTracker from "./ExpenseTracker";
import ClientsView from "./ClientsView";
import AuditTrailView from "./AuditTrailView";
import ReportsView from "./ReportsView";
import ProfileView from "./ProfileView";
import type {
  AuditLogRecord,
  BillingReportsData,
  BillingTab,
  BusinessProfileRecord,
  ClientRecord,
  ConversionRecord,
  ExpenseRecord,
  InvoiceRecord,
  PaymentRecord,
} from "./types";

const TABS: {
  id: BillingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Overview", icon: LayoutGrid },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "new-invoice", label: "New Invoice", icon: PlusCircle },
  { id: "crypto-payments", label: "Crypto Ledger", icon: Coins },
  { id: "reconciliation", label: "UTR Reconciliation", icon: ArrowRightLeft },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "clients", label: "Clients", icon: Users },
  { id: "reports", label: "Tax Pack", icon: FileArchive },
  { id: "audit-log", label: "Audit Trail", icon: ShieldCheck },
  { id: "settings", label: "Business Settings", icon: Settings },
];

export default function BillingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as BillingTab) || "dashboard";

  const [activeTab, setActiveTabState] = useState<BillingTab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "dashboard"
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [reports, setReports] = useState<BillingReportsData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [conversions, setConversions] = useState<ConversionRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [profile, setProfile] = useState<BusinessProfileRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  const setActiveTab = (tab: BillingTab) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/billing?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const paramTab = searchParams.get("tab") as BillingTab | null;
    if (paramTab && TABS.some((t) => t.id === paramTab)) {
      setActiveTabState(paramTab);
    }
  }, [searchParams]);

  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [
        repRes,
        invRes,
        cliRes,
        payRes,
        convRes,
        expRes,
        profRes,
        audRes,
      ] = await Promise.all([
        fetch("/api/admin/billing/reports", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/invoices", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/clients", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/payments", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/conversions", { cache: "no-store" }).then(
          (r) => r.json()
        ),
        fetch("/api/admin/billing/expenses", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/profile", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/billing/audit", { cache: "no-store" }).then((r) =>
          r.json()
        ),
      ]);

      if (repRes.success) setReports(repRes.data);
      if (invRes.success) setInvoices(invRes.data || []);
      if (cliRes.success) setClients(cliRes.data || []);
      if (payRes.success) setPayments(payRes.data || []);
      if (convRes.success) setConversions(convRes.data || []);
      if (expRes.success) setExpenses(expRes.data || []);
      if (profRes.success) setProfile(profRes.data || null);
      if (audRes.success) setAuditLogs(audRes.data || []);
    } catch (error) {
      console.error("Failed to load billing workspace data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const unreconciledCount = reports?.summary?.totalUnreconciledPayments || 0;

  return (
    <div className="space-y-6">
      {/* Header Row (Polar-style clean title bar + quick CTA) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Billing & Tax Suite
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Export LUT invoicing, on-chain crypto receipts, bank UTR matching,
            and CA tax archives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAllData(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setActiveTab("new-invoice")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Horizontal Module Pill Navigation */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "reconciliation" && unreconciledCount > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-amber-400 text-slate-950"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {unreconciledCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div>
          {activeTab === "dashboard" && (
            <BillingDashboardView
              reports={reports}
              invoices={invoices}
              payments={payments}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "invoices" && (
            <InvoicesList
              invoices={invoices}
              clients={clients}
              profile={profile}
              setActiveTab={setActiveTab}
              onRefresh={() => fetchAllData(true)}
            />
          )}
          {activeTab === "new-invoice" && (
            <InvoiceBuilder
              clients={clients}
              profile={profile}
              setActiveTab={setActiveTab}
              onInvoiceCreated={() => {
                fetchAllData(true);
                setActiveTab("invoices");
              }}
            />
          )}
          {activeTab === "crypto-payments" && (
            <CryptoLedger
              payments={payments}
              invoices={invoices}
              onRefresh={() => fetchAllData(true)}
            />
          )}
          {activeTab === "reconciliation" && (
            <ReconciliationBoard
              payments={payments}
              conversions={conversions}
              invoices={invoices}
              profile={profile}
              onRefresh={() => fetchAllData(true)}
            />
          )}
          {activeTab === "expenses" && (
            <ExpenseTracker
              expenses={expenses}
              onRefresh={() => fetchAllData(true)}
            />
          )}
          {activeTab === "clients" && (
            <ClientsView
              clients={clients}
              onRefresh={() => fetchAllData(true)}
            />
          )}
          {activeTab === "reports" && <ReportsView reports={reports} />}
          {activeTab === "audit-log" && <AuditTrailView logs={auditLogs} />}
          {activeTab === "settings" && (
            <ProfileView
              profile={profile}
              onRefresh={() => fetchAllData(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
