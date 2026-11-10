"use client";

import React, { useState, useEffect } from "react";
import { 
    Target, 
    Sparkles, 
    RefreshCw, 
    Search, 
    Copy, 
    Check, 
    ExternalLink, 
    Send, 
    Flame, 
    Trash2, 
    Filter,
    Bot,
    Smartphone,
    Server,
    X,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Lead {
    _id: string;
    title: string;
    company: string;
    category: "Mobile Apps" | "Discord Bots" | "AI & Chatbots" | "Backend";
    decisionMaker: string;
    email: string;
    source: string;
    sourceUrl?: string;
    status: "New" | "Contacted" | "In Discussion" | "Closed" | "Archived";
    score: number;
    confidence: "High" | "Medium" | "Low";
    painSignal: string;
    techStack: string[];
    personalizedEmail: {
        subject: string;
        body: string;
    };
    notes?: string;
    createdAt: string;
}

export default function LeadsAdminPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const categories = ["All", "Discord Bots", "Mobile Apps", "AI & Chatbots", "Backend"];
    const statuses = ["All", "New", "Contacted", "In Discussion", "Closed"];

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== "All") params.set("category", selectedCategory);
            if (selectedStatus !== "All") params.set("status", selectedStatus);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());

            const res = await fetch(`/api/admin/leads?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [selectedCategory, selectedStatus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    const handleSyncFeeds = async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);
            const res = await fetch("/api/admin/leads/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSyncMessage(data.message || `Found ${data.addedCount} new leads.`);
                fetchLeads();
            } else {
                setSyncMessage(data.error || "Failed to scan feeds");
            }
        } catch (err: any) {
            setSyncMessage(err.message || "Network error syncing leads");
        } finally {
            setSyncing(false);
        }
    };

    const updateLeadStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus as any } : l));
                if (selectedLead && selectedLead._id === id) {
                    setSelectedLead(prev => prev ? { ...prev, status: newStatus as any } : null);
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm("Are you sure you want to remove this lead?")) return;
        try {
            const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
            if (res.ok) {
                setLeads(prev => prev.filter(l => l._id !== id));
                if (selectedLead && selectedLead._id === id) {
                    setSelectedLead(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete lead:", error);
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Discord Bots":
                return <Bot className="w-3.5 h-3.5 text-indigo-600" />;
            case "Mobile Apps":
                return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
            case "AI & Chatbots":
                return <Sparkles className="w-3.5 h-3.5 text-violet-600" />;
            case "Backend":
                return <Server className="w-3.5 h-3.5 text-blue-600" />;
            default:
                return <Target className="w-3.5 h-3.5 text-slate-700" />;
        }
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case "Discord Bots":
                return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
            case "Mobile Apps":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
            case "AI & Chatbots":
                return "bg-violet-50 text-violet-700 border-violet-200/80";
            case "Backend":
                return "bg-blue-50 text-blue-700 border-blue-200/80";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Metrics calculations
    const hotLeadsCount = leads.filter(l => l.score >= 90).length;
    const discordCount = leads.filter(l => l.category === "Discord Bots").length;
    const mobileCount = leads.filter(l => l.category === "Mobile Apps").length;
    const aiCount = leads.filter(l => l.category === "AI & Chatbots").length;
    const backendCount = leads.filter(l => l.category === "Backend").length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header: Confident, Clean, Zero Slop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight text-slate-950">
                        Lead Pipeline
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Active client inquiries harvested from developer networks with tailored engineering pitches.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSyncFeeds}
                        disabled={syncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-10 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Scanning Feeds..." : "Scan Live Feeds"}</span>
                    </Button>
                </div>
            </div>

            {/* Notification Bar */}
            {syncMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between shadow-2xs">
                    <span className="font-medium">{syncMessage}</span>
                    <button 
                        onClick={() => setSyncMessage(null)} 
                        className="text-blue-500 hover:text-blue-900 p-1 rounded-md transition-colors"
                        aria-label="Dismiss message"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Metrics Ribbon (Attio / Axiom Clean High-Contrast Enterprise Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</span>
                    <span className="text-2xl font-black font-mono text-slate-950 mt-1.5">{leads.length}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
                    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>Hot (90+)</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-800 mt-1.5">{hotLeadsCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                    <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Bot className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Discord Bots</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-950 mt-1.5">{discordCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mobile Apps</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-950 mt-1.5">{mobileCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-violet-300 transition-colors">
                    <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        <span>AI &amp; Chatbots</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-violet-950 mt-1.5">{aiCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                    <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Server className="w-3.5 h-3.5 text-blue-600" />
                        <span>Backend</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-blue-950 mt-1.5">{backendCount}</span>
                </div>
            </div>

            {/* Filter Bar & Search (Pure White Card Container) */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search company, tech keyword, or founder..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl w-full shadow-2xs"
                        />
                    </form>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                        <span className="text-xs font-medium text-slate-500 mr-2 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Status:</span>
                        </span>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedStatus === status
                                        ? "bg-slate-900 text-white font-medium shadow-2xs"
                                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-medium"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
                    {categories.map((cat) => {
                        const count = cat === "All" ? leads.length : leads.filter(l => l.category === cat).length;
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 font-medium"
                                }`}
                            >
                                <span>{cat}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Leads Table / Card Grid */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse p-6" />
                    ))}
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 border-dashed shadow-xs">
                    <Target className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">No Leads Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                        No opportunities matched the active filters. Scan live feeds to discover new client inquiries.
                    </p>
                    <Button onClick={handleSyncFeeds} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl shadow-xs">
                        Scan Live Feeds
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {leads.map((lead) => {
                        const isHot = lead.score >= 90;
                        return (
                            <div
                                key={lead._id}
                                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                            >
                                {/* Left Content: Details & Stated Need */}
                                <div className="space-y-2.5 flex-grow max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Score Pill */}
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-md border ${
                                            isHot
                                                ? "bg-amber-50 text-amber-800 border-amber-200/80"
                                                : "bg-blue-50 text-blue-800 border-blue-200/80"
                                        }`}>
                                            {isHot && <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />}
                                            <span>Score {lead.score}</span>
                                        </span>

                                        {/* Category Pill */}
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(lead.category)}`}>
                                            {getCategoryIcon(lead.category)}
                                            <span>{lead.category}</span>
                                        </span>

                                        {/* Source Indicator */}
                                        {lead.sourceUrl ? (
                                            <a
                                                href={lead.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                            >
                                                <span>{lead.source}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-[11px] font-medium text-slate-500">{lead.source}</span>
                                        )}
                                    </div>

                                    {/* Company & Stated Need */}
                                    <div>
                                        <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <span>{lead.company}</span>
                                            <span className="text-xs font-normal text-slate-500 font-mono">· {lead.decisionMaker}</span>
                                        </h3>
                                        <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                                            <span className="font-semibold text-slate-900 mr-1.5">Stated Need:</span>
                                            {lead.painSignal}
                                        </div>
                                    </div>

                                    {/* Tech Stack Pills */}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {lead.techStack?.map((t, i) => (
                                            <span key={i} className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Actions: Status & Pitch Trigger */}
                                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    {/* Status Selector */}
                                    <select
                                        value={lead.status}
                                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                        className="text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs cursor-pointer"
                                    >
                                        <option value="New">Status: New 🟢</option>
                                        <option value="Contacted">Status: Contacted 🟡</option>
                                        <option value="In Discussion">Status: In Discussion 🔵</option>
                                        <option value="Closed">Status: Closed 🏆</option>
                                        <option value="Archived">Status: Archived 📁</option>
                                    </select>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setSelectedLead(lead)}
                                            size="sm"
                                            className="bg-slate-950 hover:bg-black text-white font-medium text-xs h-9 px-4 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View Tailored Pitch</span>
                                        </Button>

                                        <Button
                                            onClick={() => deleteLead(lead._id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                            title="Delete lead"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Personalized Email Modal / Inspector */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent showCloseButton={false} className="max-w-[95vw] w-full md:max-w-2xl bg-white border border-slate-200 text-slate-900 p-0 overflow-hidden rounded-3xl shadow-2xl">
                    {selectedLead && (
                        <div className="flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getCategoryBadgeClass(selectedLead.category)}`}>
                                            {selectedLead.category}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">Target: {selectedLead.company}</span>
                                    </div>
                                    <DialogTitle className="text-xl font-bold font-heading text-slate-950">
                                        Tailored Outreach Pitch
                                    </DialogTitle>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Personalized technical outreach tailored for {selectedLead.decisionMaker}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-900 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-5 flex-grow">
                                {/* Lead Meta Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                                    <div>
                                        <span className="text-slate-500 block mb-0.5 font-medium">Recipient:</span>
                                        <span className="font-semibold text-slate-950">{selectedLead.decisionMaker}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block mb-0.5 font-medium">Direct Email:</span>
                                        <a href={`mailto:${selectedLead.email}`} className="font-mono text-blue-600 hover:underline">
                                            {selectedLead.email}
                                        </a>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-slate-500 block mb-0.5 font-medium">Client's Stated Request:</span>
                                        <p className="text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80">
                                            "{selectedLead.painSignal}"
                                        </p>
                                    </div>
                                </div>

                                {/* Subject Line Section */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-900">Subject Line</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedLead.personalizedEmail.subject, "subject")}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedField === "subject" ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-emerald-700 font-semibold">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Subject</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 font-semibold">
                                        {selectedLead.personalizedEmail.subject}
                                    </div>
                                </div>

                                {/* Email Body Section */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-900">Email Message</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedLead.personalizedEmail.body, "body")}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedField === "body" ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-emerald-700 font-semibold">Copied Message!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Message</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                        {selectedLead.personalizedEmail.body}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer / Dispatch Actions */}
                            <div className="p-5 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            copyToClipboard(
                                                `Subject: ${selectedLead.personalizedEmail.subject}\n\n${selectedLead.personalizedEmail.body}`,
                                                "all"
                                            );
                                        }}
                                        variant="outline"
                                        className="border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 h-10 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs"
                                    >
                                        {copiedField === "all" ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-emerald-700 font-semibold">Entire Email Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy Full Message</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            updateLeadStatus(selectedLead._id, "Contacted");
                                        }}
                                        variant="ghost"
                                        className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 h-10 px-3 rounded-xl cursor-pointer"
                                    >
                                        Mark as Contacted
                                    </Button>
                                </div>

                                <a
                                    href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(selectedLead.personalizedEmail.subject)}&body=${encodeURIComponent(selectedLead.personalizedEmail.body)}`}
                                    className="inline-flex"
                                >
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer">
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Open in Email App</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
