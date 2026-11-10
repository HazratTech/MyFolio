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
    Eye,
    Edit3,
    Save,
    RotateCcw,
    Zap,
    ShieldCheck,
    Cpu,
    Plus,
    FileText,
    Mail,
    CheckCircle2
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
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    // Modal Dynamic State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editableSubject, setEditableSubject] = useState("");
    const [editableBody, setEditableBody] = useState("");
    const [editableStatus, setEditableStatus] = useState<string>("New");
    const [editableNotes, setEditableNotes] = useState("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [activePreset, setActivePreset] = useState<"technical" | "concise" | "caseStudy">("technical");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

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
                    setEditableStatus(newStatus);
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

    // Open Modal and hydrate dynamic states
    const handleOpenModal = (lead: Lead) => {
        setSelectedLead(lead);
        setEditableSubject(lead.personalizedEmail?.subject || "");
        setEditableBody(lead.personalizedEmail?.body || "");
        setEditableStatus(lead.status || "New");
        setEditableNotes(lead.notes || "");
        setActivePreset("technical");
        setActiveTab("edit");
        setSaveSuccess(false);
    };

    // Dynamic Tone / Preset Generator
    const getLeadPresets = (lead: Lead) => {
        const tech = lead.techStack?.slice(0, 3).join(", ") || "Python, React, TypeScript";
        
        // Preset 1: Technical Peer (In-depth engineering & architectural guardrails)
        const technicalSubject = lead.personalizedEmail?.subject || `re: HN post (${lead.category} engineering for ${lead.company})`;
        const technicalBody = lead.personalizedEmail?.body || `Hi ${lead.decisionMaker},\n\nSaw your note regarding ${lead.company}'s requirements around ${lead.painSignal}.\n\nI run RelayWorks (https://relayworks.dev) — I build production-grade ${lead.category.toLowerCase()} systems using ${tech}.\n\nWould love to discuss how I can help your team ship faster on a fixed sprint or contractor agreement.\n\nBest,\nHazrat Ummar\nhttps://relayworks.dev | Telegram: @hazratummar`;

        // Preset 2: Direct 3-Sentence DM (Ultra concise cold message)
        const conciseSubject = `Quick question re: ${lead.company} ${lead.category.toLowerCase()}`;
        const conciseBody = `Hi ${lead.decisionMaker},\n\nSaw your post regarding ${lead.company}'s need for ${lead.painSignal}.\n\nI specialize in ${tech} and ship production-ready ${lead.category.toLowerCase()} on 1-2 week fixed sprints.\n\nAre you open to a brief 5-minute chat this week?\n\nBest,\nHazrat Ummar\nhttps://relayworks.dev | Telegram: @hazratummar`;

        // Preset 3: Case Study & Proof
        let proofStory = "built high-throughput bot architectures handling 99.9% uptime";
        if (lead.category === "Mobile Apps") {
            proofStory = "shipped native Android and cross-platform apps with zero-latency background sync and offline SQLite caching";
        } else if (lead.category === "AI & Chatbots") {
            proofStory = "engineered deterministic agent workflows with strict Pydantic schemas, pgvector retrieval, and zero-hallucination guardrails";
        } else if (lead.category === "Discord Bots") {
            proofStory = "built Clipping Club and ClutchBot handling automated media processing, Discord API rate-limiting, and webhook orchestration";
        } else if (lead.category === "Backend") {
            proofStory = "architected resilient microservices with idempotent webhooks, Redis caching, and automated queue workers";
        }

        const caseStudySubject = `Relevant case study for ${lead.company}: ${lead.category} architecture`;
        const caseStudyBody = `Hi ${lead.decisionMaker},\n\nI noticed ${lead.company}'s post about ${lead.painSignal}.\n\nRecently, I ${proofStory} for clients in similar problem spaces using ${tech}.\n\nHappy to share the live repository architecture, demo videos, and technical breakdown if you're evaluating contractors for this.\n\nBest,\nHazrat Ummar\nhttps://relayworks.dev | Telegram: @hazratummar`;

        return {
            technical: { subject: technicalSubject, body: technicalBody },
            concise: { subject: conciseSubject, body: conciseBody },
            caseStudy: { subject: caseStudySubject, body: caseStudyBody }
        };
    };

    const handleApplyPreset = (type: "technical" | "concise" | "caseStudy") => {
        if (!selectedLead) return;
        const presets = getLeadPresets(selectedLead);
        setActivePreset(type);
        if (type === "technical") {
            setEditableSubject(presets.technical.subject);
            setEditableBody(presets.technical.body);
        } else if (type === "concise") {
            setEditableSubject(presets.concise.subject);
            setEditableBody(presets.concise.body);
        } else if (type === "caseStudy") {
            setEditableSubject(presets.caseStudy.subject);
            setEditableBody(presets.caseStudy.body);
        }
    };

    const handleInsertSnippet = (snippet: string) => {
        setEditableBody(prev => `${prev}\n\n${snippet}`);
    };

    const handleSavePitch = async () => {
        if (!selectedLead) return;
        try {
            setIsSaving(true);
            const res = await fetch(`/api/admin/leads/${selectedLead._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personalizedEmail: {
                        subject: editableSubject,
                        body: editableBody,
                    },
                    status: editableStatus,
                    notes: editableNotes,
                }),
            });

            if (res.ok) {
                setLeads(prev => prev.map(l => l._id === selectedLead._id ? {
                    ...l,
                    personalizedEmail: { subject: editableSubject, body: editableBody },
                    status: editableStatus as any,
                    notes: editableNotes,
                } : l));
                setSelectedLead(prev => prev ? {
                    ...prev,
                    personalizedEmail: { subject: editableSubject, body: editableBody },
                    status: editableStatus as any,
                    notes: editableNotes,
                } : null);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2500);
            }
        } catch (err) {
            console.error("Failed to save lead updates:", err);
        } finally {
            setIsSaving(false);
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

    // Word and character calculation
    const wordCount = editableBody.trim() ? editableBody.trim().split(/\s+/).length : 0;
    const readSeconds = Math.max(15, Math.ceil(wordCount / 3));

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

            {/* Filter Bar & Search */}
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
                                            onClick={() => handleOpenModal(lead)}
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

            {/* DYNAMIC OUTREACH STUDIO POPUP (Auto-fitted, never cuts off viewport) */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent 
                    showCloseButton={false} 
                    style={{
                        maxHeight: "calc(100vh - 48px)",
                        height: "min(84vh, 720px)",
                        maxWidth: "860px",
                        width: "95vw"
                    }}
                    className="sm:max-w-[860px] w-[95vw] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl focus:outline-none"
                >
                    {selectedLead && (
                        <div className="flex flex-col h-full max-h-full overflow-hidden">
                            {/* 1. Anchored Header (Always visible at top) */}
                            <div className="shrink-0 px-5 py-3 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getCategoryBadgeClass(selectedLead.category)}`}>
                                            {selectedLead.category}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600">Target: {selectedLead.company}</span>
                                    </div>
                                    <DialogTitle className="text-lg font-bold font-heading text-slate-950 flex items-center gap-2">
                                        <span>Tailored Outreach Studio</span>
                                        <span className="text-xs font-normal text-slate-500 hidden sm:inline">· Pitch for {selectedLead.decisionMaker}</span>
                                    </DialogTitle>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Inline Status Controller */}
                                    <select
                                        value={editableStatus}
                                        onChange={(e) => {
                                            const newStat = e.target.value;
                                            setEditableStatus(newStat);
                                            updateLeadStatus(selectedLead._id, newStat);
                                        }}
                                        className="text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-600 shadow-2xs cursor-pointer"
                                    >
                                        <option value="New">🟢 New</option>
                                        <option value="Contacted">🟡 Contacted</option>
                                        <option value="In Discussion">🔵 In Discussion</option>
                                        <option value="Closed">🏆 Closed</option>
                                        <option value="Archived">📁 Archived</option>
                                    </select>

                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Dynamic Body (Smooth vertical scrolling inside constrained window) */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                                {/* Lead Intelligence Strip */}
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">Contact:</span>
                                            <span className="font-bold text-slate-950">{selectedLead.decisionMaker}</span>
                                            <span className="text-slate-400">·</span>
                                            <a 
                                                href={`mailto:${selectedLead.email}`} 
                                                className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <Mail className="w-3 h-3" />
                                                <span>{selectedLead.email}</span>
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-1 text-slate-500">
                                            <span className="font-medium">Source:</span>
                                            <span>{selectedLead.source}</span>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70 italic">
                                        <span className="font-semibold text-slate-800 not-italic mr-1.5">Stated Request:</span>
                                        "{selectedLead.painSignal}"
                                    </div>
                                </div>

                                {/* Dynamic Tone & Angle Presets */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Dynamic Pitch Angles</span>
                                        </span>
                                        <span className="text-[11px] text-slate-500">Click to switch angles instantly</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApplyPreset("technical")}
                                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                                activePreset === "technical"
                                                    ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-2xs"
                                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                                                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Technical Peer</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Guardrails, schemas &amp; architecture</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleApplyPreset("concise")}
                                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                                activePreset === "concise"
                                                    ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-2xs"
                                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Concise DM</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">3 sentences, direct question</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleApplyPreset("caseStudy")}
                                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                                activePreset === "caseStudy"
                                                    ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-2xs"
                                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Proof &amp; Case Study</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Live metrics &amp; codebase proof</p>
                                        </button>
                                    </div>
                                </div>

                                {/* View Switcher (Compose vs Recipient Preview) */}
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("edit")}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === "edit"
                                                    ? "bg-slate-900 text-white shadow-2xs"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            <span>Compose &amp; Edit</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("preview")}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === "preview"
                                                    ? "bg-slate-900 text-white shadow-2xs"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            <Eye className="w-3 h-3" />
                                            <span>Inbox Preview</span>
                                        </button>
                                    </div>

                                    {/* Live Read & Word Stats */}
                                    <div className="text-[11px] font-mono text-slate-500">
                                        <span className="font-semibold text-slate-800">{wordCount} words</span>
                                        <span className="mx-1">·</span>
                                        <span>~{readSeconds}s read</span>
                                    </div>
                                </div>

                                {activeTab === "edit" ? (
                                    <>
                                        {/* Editable Subject */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-slate-900">
                                                    Subject Line
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(editableSubject, "subject")}
                                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === "subject" ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span className="text-emerald-700 font-semibold">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy Subject</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <Input
                                                value={editableSubject}
                                                onChange={(e) => setEditableSubject(e.target.value)}
                                                className="bg-white border-slate-300 font-mono text-xs text-slate-900 font-semibold h-8 rounded-xl shadow-2xs focus:ring-1 focus:ring-blue-600"
                                            />
                                        </div>

                                        {/* Quick Snippet Injectors */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-medium text-slate-500">Quick Insert Chips:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertSnippet("Feel free to pick 15 minutes directly on my calendar: https://cal.com/hazratummar")}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    <span>+ Add Calendly</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertSnippet("Telegram: @hazratummar | Direct mobile: +91 91702 47365")}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    <span>+ Add Contact Info</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertSnippet("I work on a 100% approval milestone: you test and verify the running code in staging before release.")}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    <span>+ Milestone Guarantee</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertSnippet("Full IP assignment and repository transfer upon milestone completion with standard contractor NDA.")}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    <span>+ IP &amp; NDA Transfer</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Editable Email Message */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-slate-900">
                                                    Email Message
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(editableBody, "body")}
                                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === "body" ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span className="text-emerald-700 font-semibold">Copied Message!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy Message</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <textarea
                                                rows={6}
                                                value={editableBody}
                                                onChange={(e) => setEditableBody(e.target.value)}
                                                className="w-full font-sans text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-2xs resize-none"
                                                placeholder="Write or customize your personalized message..."
                                            />
                                        </div>

                                        {/* Internal Lead Notes */}
                                        <div className="space-y-1 pt-0.5">
                                            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                                <FileText className="w-3 h-3 text-slate-400" />
                                                <span>Internal Notes for this Opportunity (Private)</span>
                                            </label>
                                            <Input
                                                value={editableNotes}
                                                onChange={(e) => setEditableNotes(e.target.value)}
                                                placeholder="e.g. Followed up on HN thread, asked for 15-min sprint demo"
                                                className="bg-slate-50 border-slate-200 text-xs text-slate-700 h-8 rounded-lg shadow-2xs"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* Recipient Preview Mode (Simulated Inbox View) */
                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 p-3.5 space-y-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-500 w-14">From:</span>
                                                <span className="font-medium text-slate-900">Hazrat Ummar &lt;hazratummar9@gmail.com&gt;</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-500 w-14">To:</span>
                                                <span className="font-medium text-slate-900">{selectedLead.decisionMaker} &lt;{selectedLead.email}&gt;</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-500 w-14">Subject:</span>
                                                <span className="font-bold text-slate-950 font-mono">{editableSubject}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                            {editableBody}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Anchored Footer (Always visible at bottom) */}
                            <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {/* Save Pitch & Changes to MongoDB */}
                                    <Button
                                        onClick={handleSavePitch}
                                        disabled={isSaving}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 h-8 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        {saveSuccess ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-emerald-700 font-semibold">Saved!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{isSaving ? "Saving..." : "Save Customizations"}</span>
                                            </>
                                        )}
                                    </Button>

                                    {/* Copy Full Pitch (Subject + Body) */}
                                    <Button
                                        onClick={() => {
                                            copyToClipboard(`Subject: ${editableSubject}\n\n${editableBody}`, "all");
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 h-8 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {copiedField === "all" ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-emerald-700 font-semibold">Pitch Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Copy Full Pitch</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Reset to Original Pitch */}
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (selectedLead) {
                                                const orig = getLeadPresets(selectedLead);
                                                setEditableSubject(orig.technical.subject);
                                                setEditableBody(orig.technical.body);
                                                setActivePreset("technical");
                                            }
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-slate-500 hover:text-slate-900 h-8 px-2.5 rounded-xl flex items-center gap-1"
                                        title="Reset message to original template"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span className="hidden sm:inline">Reset</span>
                                    </Button>

                                    {/* Direct Mailto Dispatch */}
                                    <a
                                        href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(editableSubject)}&body=${encodeURIComponent(editableBody)}`}
                                        className="inline-flex"
                                        onClick={() => {
                                            if (editableStatus === "New") {
                                                setEditableStatus("Contacted");
                                                updateLeadStatus(selectedLead._id, "Contacted");
                                            }
                                        }}
                                    >
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer">
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Open in Email App</span>
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
