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
    Mail, 
    Send, 
    Flame, 
    CheckCircle2, 
    Clock, 
    MessageSquare, 
    Trash2, 
    Filter,
    ChevronRight,
    Bot,
    Smartphone,
    Cpu,
    Server,
    X,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
                return <Bot className="w-4 h-4 text-indigo-400" />;
            case "Mobile Apps":
                return <Smartphone className="w-4 h-4 text-emerald-400" />;
            case "AI & Chatbots":
                return <Sparkles className="w-4 h-4 text-amber-400" />;
            case "Backend":
                return <Server className="w-4 h-4 text-blue-400" />;
            default:
                return <Target className="w-4 h-4 text-primary" />;
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
            {/* Header with Title & Live Scan Trigger */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                        <Target className="w-3.5 h-3.5 text-blue-400" />
                        <span>Autonomous Lead Radar · 100% Anti-Slop</span>
                    </div>
                    <h1 className="text-3xl font-black font-heading tracking-tight text-white">
                        Lead Pipeline &amp; Outreach
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        High-intent client requests harvested from live developer networks with company-tailored pitches.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSyncFeeds}
                        disabled={syncing}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Scanning Developer Feeds..." : "⚡ Scan Live Feeds"}</span>
                    </Button>
                </div>
            </div>

            {/* Notification Bar */}
            {syncMessage && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                    <span>{syncMessage}</span>
                    <button onClick={() => setSyncMessage(null)} className="text-blue-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Metrics Ribbon (Axiom / Attio Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-[#121215] border border-white/10 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Total Leads</span>
                    <span className="text-2xl font-black font-mono text-white mt-1">{leads.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-amber-500/20 flex flex-col justify-between">
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Hot (90+)</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-300 mt-1">{hotLeadsCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-indigo-500/20 flex flex-col justify-between">
                    <span className="text-xs text-indigo-400 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Discord Bots</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-300 mt-1">{discordCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-emerald-500/20 flex flex-col justify-between">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile Apps</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-300 mt-1">{mobileCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-amber-500/20 flex flex-col justify-between">
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI &amp; Chatbots</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-300 mt-1">{aiCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-blue-500/20 flex flex-col justify-between">
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5" />
                        <span>Backend</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-blue-300 mt-1">{backendCount}</span>
                </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#121215] border border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search company, tech keyword, or founder..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 bg-white/5 border-white/10 text-xs text-white placeholder:text-slate-500 rounded-xl w-full"
                        />
                    </form>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                        <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Status:</span>
                        </span>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedStatus === status
                                        ? "bg-white/20 text-white font-semibold"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5">
                    {categories.map((cat) => {
                        const count = cat === "All" ? leads.length : leads.filter(l => l.category === cat).length;
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <span>{cat}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                    isSelected ? "bg-white/20 text-white" : "bg-black/30 text-slate-400"
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
                        <div key={i} className="h-28 rounded-2xl bg-[#121215] border border-white/10 animate-pulse p-6" />
                    ))}
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-16 bg-[#121215] rounded-2xl border border-white/10 border-dashed">
                    <Target className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
                    <h3 className="text-lg font-bold text-white mb-1">No Leads Found</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                        No opportunities matched the active filters. Run the live feed scanner to harvest fresh requests.
                    </p>
                    <Button onClick={handleSyncFeeds} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                        Run Live Feed Scanner
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {leads.map((lead) => {
                        const isHot = lead.score >= 90;
                        return (
                            <div
                                key={lead._id}
                                className="p-5 rounded-2xl bg-[#121215] border border-white/10 hover:border-blue-500/40 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                            >
                                {/* Left Content: Details & Stated Need */}
                                <div className="space-y-2 flex-grow max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Score Pill */}
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                                            isHot
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                        }`}>
                                            {isHot && <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                            <span>Score {lead.score}</span>
                                        </span>

                                        {/* Category Pill */}
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                                            {getCategoryIcon(lead.category)}
                                            <span>{lead.category}</span>
                                        </span>

                                        {/* Source Indicator */}
                                        {lead.sourceUrl ? (
                                            <a
                                                href={lead.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                            >
                                                <span>{lead.source}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-slate-500">{lead.source}</span>
                                        )}
                                    </div>

                                    {/* Company & Stated Need */}
                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span>{lead.company}</span>
                                            <span className="text-xs font-normal text-slate-500">· {lead.decisionMaker}</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                            <strong className="text-slate-300 font-medium">Stated Pain: </strong>
                                            {lead.painSignal}
                                        </p>
                                    </div>

                                    {/* Tech Stack Pills */}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {lead.techStack?.map((t, i) => (
                                            <span key={i} className="text-[10px] font-mono bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Actions: Status & Pitch Trigger */}
                                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                    {/* Status Selector */}
                                    <select
                                        value={lead.status}
                                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                        className="text-xs bg-[#18181b] border border-white/10 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 px-3.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View Tailored Pitch</span>
                                        </Button>

                                        <Button
                                            onClick={() => deleteLead(lead._id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
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
                <DialogContent showCloseButton={false} className="max-w-[95vw] w-full md:max-w-3xl bg-[#121215] border border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
                    {selectedLead && (
                        <div className="flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-[#18181b]">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {selectedLead.category}
                                        </span>
                                        <span className="text-xs text-slate-400">Target: {selectedLead.company}</span>
                                    </div>
                                    <DialogTitle className="text-xl font-bold font-heading text-white">
                                        100% Personalized Outreach Pitch
                                    </DialogTitle>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Peer-to-peer engineering voice · Zero AI slop · Tailored for {selectedLead.decisionMaker}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                                {/* Lead Meta Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Recipient:</span>
                                        <span className="font-semibold text-white">{selectedLead.decisionMaker}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Direct Email:</span>
                                        <a href={`mailto:${selectedLead.email}`} className="font-mono text-blue-400 hover:underline">
                                            {selectedLead.email}
                                        </a>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-slate-400 block mb-0.5">Client's Stated Request:</span>
                                        <p className="text-slate-300 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                                            "{selectedLead.painSignal}"
                                        </p>
                                    </div>
                                </div>

                                {/* Subject Line Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-300">Subject Line</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedLead.personalizedEmail.subject, "subject")}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            {copiedField === "subject" ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Subject</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-200">
                                        {selectedLead.personalizedEmail.subject}
                                    </div>
                                </div>

                                {/* Email Body Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-300">Email Body (Anti-Slop Peer Voice)</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedLead.personalizedEmail.body, "body")}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            {copiedField === "body" ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied Body!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Body</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                                        {selectedLead.personalizedEmail.body}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer / Dispatch Actions */}
                            <div className="p-5 border-t border-white/10 bg-[#18181b] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            copyToClipboard(
                                                `Subject: ${selectedLead.personalizedEmail.subject}\n\n${selectedLead.personalizedEmail.body}`,
                                                "all"
                                            );
                                        }}
                                        variant="outline"
                                        className="border-white/10 text-xs text-white hover:bg-white/10 h-10 px-4 rounded-xl flex items-center gap-2"
                                    >
                                        {copiedField === "all" ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-emerald-400 font-semibold">Entire Email Copied!</span>
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
                                        className="text-xs text-amber-400 hover:bg-amber-500/10 h-10 px-3 rounded-xl"
                                    >
                                        Mark as Contacted
                                    </Button>
                                </div>

                                <a
                                    href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(selectedLead.personalizedEmail.subject)}&body=${encodeURIComponent(selectedLead.personalizedEmail.body)}`}
                                    className="inline-flex"
                                >
                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer">
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Open in Email App (Pre-filled)</span>
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
