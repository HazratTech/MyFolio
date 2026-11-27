"use client";

import React, { useState, useEffect } from "react";
import { 
    Building2, 
    Globe, 
    ExternalLink, 
    Sparkles, 
    RefreshCw, 
    Search, 
    Copy, 
    Check, 
    Send, 
    Trash2, 
    Filter, 
    Plus, 
    X, 
    Eye, 
    Save, 
    RotateCcw, 
    CheckCircle2, 
    MapPin, 
    Handshake, 
    Briefcase,
    Store,
    Layers,
    DollarSign,
    CheckCircle,
    Cpu,
    Zap,
    Bot,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function decodeEntities(str?: string): string {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;|&apos;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ");
}

interface Partner {
    _id: string;
    name: string;
    handle: string;
    websiteUrl?: string;
    partnerDirectoryUrl: string;
    country: string;
    location?: string;
    services: string[];
    description?: string;
    startingBudget?: string;
    rating?: number;
    reviewCount?: number;
    teamSize?: string;
    email?: string;
    contactName?: string;
    status: "New" | "Pitched" | "In Discussion" | "Partnered" | "Archived";
    personalizedPitch?: {
        subject: string;
        body: string;
        angle?: "white-label" | "custom-scripts" | "concise" | "technical-audit" | "ai-automation";
        modelUsed?: string;
        generatedAt?: string;
    };
    websiteContext?: {
        source?: 'combined' | 'website' | 'shopify-directory';
        title?: string;
        description?: string;
        location?: string;
        teamSize?: string;
        partnerSince?: string;
        industries?: string;
        specialties?: string;
        headings?: string[];
        techKeywords?: string[];
        snippet?: string;
        directorySnippet?: string;
        lastScrapedAt?: string;
    };
    notes?: string;
    createdAt?: string;
}

interface PartnerStats {
    total: number;
    filtered: number;
    new: number;
    pitched: number;
    inDiscussion: number;
    partnered: number;
    countries: Record<string, number>;
}

const initialStats: PartnerStats = {
    total: 0,
    filtered: 0,
    new: 0,
    pitched: 0,
    inDiscussion: 0,
    partnered: 0,
    countries: { All: 0 },
};

export default function ShopifyPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [stats, setStats] = useState<PartnerStats>(initialStats);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncCountry, setSyncCountry] = useState("US");
    const [selectedCountry, setSelectedCountry] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [displayLimit, setDisplayLimit] = useState<number>(100);
    const [syncBatchSize, setSyncBatchSize] = useState<number>(25);

    // AI Pitch Modal State
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [activeAngle, setActiveAngle] = useState<"white-label" | "custom-scripts" | "concise" | "technical-audit" | "ai-automation">("white-label");
    const [pitchModel, setPitchModel] = useState<"gpt-4o" | "gpt-4o-mini" | "gemini">("gpt-4o");
    const [editableSubject, setEditableSubject] = useState("");
    const [editableBody, setEditableBody] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [zohoStatus, setZohoStatus] = useState<{ configured: boolean; senderEmail: string | null }>({ configured: false, senderEmail: null });
    const [isSendingZoho, setIsSendingZoho] = useState(false);
    const [zohoFeedback, setZohoFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Manual Add Partner Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newWebsite, setNewWebsite] = useState("");
    const [newCountry, setNewCountry] = useState("US");
    const [newDirectoryUrl, setNewDirectoryUrl] = useState("");
    const [newServices, setNewServices] = useState("Store building, Theme design");
    const [newDescription, setNewDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const countryOptions = [
        { code: "All", label: "All Regions" },
        { code: "US", label: "🇺🇸 United States" },
        { code: "GB", label: "🇬🇧 United Kingdom" },
        { code: "AU", label: "🇦🇺 Australia" },
        { code: "CA", label: "🇨🇦 Canada" },
        { code: "DE", label: "🇩🇪 Germany" },
        { code: "FR", label: "🇫🇷 France" },
        { code: "NL", label: "🇳🇱 Netherlands" },
        { code: "SE", label: "🇸🇪 Sweden" },
    ];

    const statuses = ["All", "New", "Pitched", "In Discussion", "Partnered"];

    const fetchPartners = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params = new URLSearchParams();
            if (selectedCountry !== "All") params.set("country", selectedCountry);
            if (selectedStatus !== "All") params.set("status", selectedStatus);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());
            params.set("limit", String(displayLimit));

            const res = await fetch(`/api/admin/partners?${params.toString()}`, {
                cache: "no-store",
            });
            if (res.ok) {
                const data = await res.json();
                setPartners(data.partners || []);
                if (data.stats) setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [selectedCountry, selectedStatus, displayLimit]);

    useEffect(() => {
        fetch("/api/admin/email-status", { cache: "no-store" })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setZohoStatus({ configured: !!data.configured, senderEmail: data.senderEmail || null });
            })
            .catch(() => {});
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPartners();
    };

    const handleSyncPartners = async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);
            const res = await fetch(`/api/admin/partners/sync?country=${syncCountry}&limit=${syncBatchSize}`, {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                setSyncMessage(data.message || `Added ${data.addedCount} new partners.`);
                fetchPartners(true);
            } else {
                setSyncMessage(data.error || "Failed to scan partners");
            }
        } catch (err: any) {
            setSyncMessage(err.message || "Network error syncing partners");
        } finally {
            setSyncing(false);
        }
    };

    const updatePartnerStatus = async (id: string, newStatus: string) => {
        try {
            const currentPartner = partners.find(p => p._id === id);
            const oldStatus = currentPartner?.status;

            // 1. Instant optimistic UI update:
            // Remove from list immediately if viewing a specific status filter that no longer matches
            setPartners(prev => {
                if (selectedStatus !== "All" && newStatus !== selectedStatus) {
                    return prev.filter(p => p._id !== id);
                }
                return prev.map(p => p._id === id ? { ...p, status: newStatus as any } : p);
            });

            // Optimistic stats counters update so pills update without any UI lag
            if (oldStatus && oldStatus !== newStatus) {
                setStats(prev => {
                    const next = { ...prev };
                    if (oldStatus === "New") next.new = Math.max(0, next.new - 1);
                    else if (oldStatus === "Pitched") next.pitched = Math.max(0, next.pitched - 1);
                    else if (oldStatus === "In Discussion") next.inDiscussion = Math.max(0, next.inDiscussion - 1);
                    else if (oldStatus === "Partnered") next.partnered = Math.max(0, next.partnered - 1);

                    if (newStatus === "New") next.new += 1;
                    else if (newStatus === "Pitched") next.pitched += 1;
                    else if (newStatus === "In Discussion") next.inDiscussion += 1;
                    else if (newStatus === "Partnered") next.partnered += 1;

                    if (selectedStatus !== "All" && newStatus !== selectedStatus) {
                        next.filtered = Math.max(0, next.filtered - 1);
                    }
                    return next;
                });
            }

            if (selectedPartner && selectedPartner._id === id) {
                setSelectedPartner(prev => prev ? { ...prev, status: newStatus as any } : null);
            }

            // 2. Persist to MongoDB
            const res = await fetch(`/api/admin/partners/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Silently refresh to keep all stats and pagination 100% in sync
                fetchPartners(true);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            fetchPartners(true);
        }
    };

    const deletePartner = async (id: string) => {
        if (!confirm("Are you sure you want to remove this partner agency?")) return;
        try {
            setPartners(prev => prev.filter(p => p._id !== id));
            if (selectedPartner && selectedPartner._id === id) {
                setSelectedPartner(null);
            }
            const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPartners(true);
            }
        } catch (error) {
            console.error("Failed to delete partner:", error);
            fetchPartners(true);
        }
    };

    // Open Pitch Studio and generate AI pitch if not present
    const handleOpenPitchModal = async (partner: Partner) => {
        setSelectedPartner(partner);
        setSaveSuccess(false);
        setZohoFeedback(null);
        setRecipientEmail(partner.email || "");

        if (partner.personalizedPitch?.body && partner.email) {
            setEditableSubject(partner.personalizedPitch.subject);
            setEditableBody(partner.personalizedPitch.body);
            setActiveAngle(partner.personalizedPitch.angle || "white-label");
        } else if (partner.personalizedPitch?.body && !partner.email) {
            // Hydrate existing pitch immediately while extracting missing email/website in background
            setEditableSubject(partner.personalizedPitch.subject);
            setEditableBody(partner.personalizedPitch.body);
            setActiveAngle(partner.personalizedPitch.angle || "white-label");
            await generatePitchForPartner(partner, partner.personalizedPitch.angle || "white-label");
        } else {
            // Default initial angle to White-Label Partner (Full Suite)
            await generatePitchForPartner(partner, "white-label");
        }
    };

    const generatePitchForPartner = async (
        partner: Partner, 
        angle: "white-label" | "custom-scripts" | "concise" | "technical-audit" | "ai-automation",
        modelOverride?: "gpt-4o" | "gpt-4o-mini" | "gemini",
        forceRefresh?: boolean
    ) => {
        try {
            setIsGeneratingPitch(true);
            setActiveAngle(angle);
            const targetModel = modelOverride || pitchModel;
            if (modelOverride) setPitchModel(modelOverride);

            const res = await fetch(`/api/admin/partners/${partner._id}/pitch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ angle, model: targetModel, forceRefresh })
            });
            const data = await res.json();
            if (res.ok && data.pitch) {
                setEditableSubject(data.pitch.subject);
                setEditableBody(data.pitch.body);
                if (data.email) {
                    setRecipientEmail(data.email);
                }
                // Update local state list
                setPartners(prev => prev.map(p => p._id === partner._id ? {
                    ...p,
                    email: data.email || p.email,
                    websiteUrl: data.websiteUrl || p.websiteUrl,
                    description: data.description || p.description,
                    personalizedPitch: data.pitch,
                    websiteContext: data.websiteContext || p.websiteContext
                } : p));
                if (selectedPartner && selectedPartner._id === partner._id) {
                    setSelectedPartner(prev => prev ? { 
                        ...prev, 
                        email: data.email || prev.email,
                        websiteUrl: data.websiteUrl || prev.websiteUrl,
                        description: data.description || prev.description,
                        personalizedPitch: data.pitch,
                        websiteContext: data.websiteContext || prev.websiteContext
                    } : null);
                }
            }
        } catch (err) {
            console.error("Failed to generate AI pitch:", err);
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const handleSendViaZoho = async () => {
        if (!selectedPartner) return;
        if (!recipientEmail.trim()) {
            setZohoFeedback({ type: "error", text: "Enter the agency email address above before sending." });
            return;
        }
        try {
            setIsSendingZoho(true);
            setZohoFeedback(null);
            const res = await fetch(`/api/admin/partners/${selectedPartner._id}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: recipientEmail.trim(),
                    subject: editableSubject,
                    body: editableBody,
                    angle: activeAngle,
                    modelUsed: selectedPartner.personalizedPitch?.modelUsed || pitchModel,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setZohoFeedback({ type: "success", text: data.message || "Sent via Zoho Mail!" });
                if (selectedPartner.status === "New") {
                    updatePartnerStatus(selectedPartner._id, "Pitched");
                }
                fetchPartners(true);
            } else {
                setZohoFeedback({ type: "error", text: data.error || "Failed to send via Zoho Mail" });
            }
        } catch (err: any) {
            setZohoFeedback({ type: "error", text: err.message || "Network error sending via Zoho Mail" });
        } finally {
            setIsSendingZoho(false);
        }
    };

    const handleSavePitch = async () => {
        if (!selectedPartner) return;
        try {
            setIsSaving(true);
            const res = await fetch(`/api/admin/partners/${selectedPartner._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personalizedPitch: {
                        subject: editableSubject,
                        body: editableBody,
                        angle: activeAngle,
                        generatedAt: new Date().toISOString()
                    }
                })
            });
            if (res.ok) {
                setPartners(prev => prev.map(p => p._id === selectedPartner._id ? {
                    ...p,
                    personalizedPitch: {
                        subject: editableSubject,
                        body: editableBody,
                        angle: activeAngle,
                        generatedAt: new Date().toISOString()
                    }
                } : p));
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (err) {
            console.error("Failed to save pitch:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setIsSubmitting(true);
            const serviceArr = newServices.split(",").map(s => s.trim()).filter(Boolean);
            const res = await fetch("/api/admin/partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName.trim(),
                    websiteUrl: newWebsite.trim() || undefined,
                    country: newCountry,
                    partnerDirectoryUrl: newDirectoryUrl.trim() || undefined,
                    services: serviceArr.length > 0 ? serviceArr : ["Store building", "Design"],
                    description: newDescription.trim() || undefined,
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewName("");
                setNewWebsite("");
                setNewDirectoryUrl("");
                setNewDescription("");
                setSyncMessage(`Successfully added partner agency: ${newName}`);
                fetchPartners();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add partner");
            }
        } catch (err: any) {
            alert(err.message || "Network error adding partner");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header: Clean, Authoritative, Anti-Slop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight text-slate-950 flex items-center gap-2.5">
                        <Handshake className="w-8 h-8 text-blue-600" />
                        <span>Shopify Partner Network</span>
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Verified boutique Shopify design &amp; marketing agencies to partner with for white-label engineering overflow.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Add Manual Partner Button */}
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-950 hover:bg-black text-white font-medium text-xs h-10 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Agency</span>
                    </Button>

                    {/* Country Selector for Sync */}
                    <select
                        value={syncCountry}
                        onChange={(e) => setSyncCountry(e.target.value)}
                        className="h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-800 shadow-2xs focus:border-blue-600 cursor-pointer"
                    >
                        <option value="US">🇺🇸 United States</option>
                        <option value="GB">🇬🇧 United Kingdom</option>
                        <option value="AU">🇦🇺 Australia</option>
                        <option value="CA">🇨🇦 Canada</option>
                        <option value="DE">🇩🇪 Germany</option>
                        <option value="ALL">🌐 Multi-Region Batch</option>
                    </select>

                    {/* Batch Size Selector for Sync */}
                    <select
                        value={syncBatchSize}
                        onChange={(e) => setSyncBatchSize(Number(e.target.value))}
                        className="h-10 text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 text-slate-800 shadow-2xs focus:border-blue-600 cursor-pointer"
                        title="Number of new agencies to import per scan"
                    >
                        <option value={25}>+25 per scan</option>
                        <option value={50}>+50 per scan</option>
                        <option value={100}>+100 per scan</option>
                    </select>

                    {/* Scan Shopify Partner Directory Button */}
                    <Button
                        onClick={handleSyncPartners}
                        disabled={syncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-10 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Scanning Directory..." : "Scan Directory"}</span>
                    </Button>
                </div>
            </div>

            {/* Notification Banner */}
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

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <button
                    type="button"
                    onClick={() => setSelectedStatus("All")}
                    className={`p-4 rounded-2xl bg-white border text-left shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedStatus === "All" ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200/90 hover:border-slate-300"
                    }`}
                >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Total Agencies</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-950 mt-1.5">{stats.total}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedStatus("New")}
                    className={`p-4 rounded-2xl bg-white border text-left shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedStatus === "New" ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200/90 hover:border-emerald-300"
                    }`}
                >
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>New &amp; Uncontacted</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-950 mt-1.5">{stats.new}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedStatus("Pitched")}
                    className={`p-4 rounded-2xl bg-white border text-left shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedStatus === "Pitched" ? "border-amber-500 ring-1 ring-amber-500" : "border-slate-200/90 hover:border-amber-300"
                    }`}
                >
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pitched</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-950 mt-1.5">{stats.pitched}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedStatus("In Discussion")}
                    className={`p-4 rounded-2xl bg-white border text-left shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedStatus === "In Discussion" ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200/90 hover:border-blue-300"
                    }`}
                >
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>In Discussion</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-blue-950 mt-1.5">{stats.inDiscussion}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedStatus("Partnered")}
                    className={`p-4 rounded-2xl bg-white border text-left shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedStatus === "Partnered" ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200/90 hover:border-indigo-300"
                    }`}
                >
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Handshake className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Partnered</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-950 mt-1.5">{stats.partnered}</span>
                </button>
            </div>

            {/* Filter Bar & Region Selector */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search agency name, website, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 rounded-xl w-full shadow-2xs"
                        />
                    </form>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                        <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Status:</span>
                        </span>
                        {statuses.map((status) => {
                            const count = status === "All" ? stats.total
                                : status === "New" ? stats.new
                                : status === "Pitched" ? stats.pitched
                                : status === "In Discussion" ? stats.inDiscussion
                                : stats.partnered;
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setSelectedStatus(status)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        selectedStatus === status
                                            ? "bg-slate-900 text-white font-semibold shadow-2xs"
                                            : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-medium"
                                    }`}
                                >
                                    <span>{status}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                        selectedStatus === status ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Country / Region Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
                    {countryOptions.map((opt) => {
                        const count = stats.countries[opt.code] || 0;
                        const isSelected = selectedCountry === opt.code;
                        return (
                            <button
                                key={opt.code}
                                type="button"
                                onClick={() => setSelectedCountry(opt.code)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 font-medium"
                                }`}
                            >
                                <span>{opt.label}</span>
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

            {/* Partner Agency Cards Grid */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse p-6" />
                    ))}
                </div>
            ) : partners.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 border-dashed shadow-xs">
                    <Handshake className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">No Partner Agencies Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                        Scan the Shopify Partner Directory to harvest verified boutique design &amp; marketing agencies.
                    </p>
                    <Button onClick={handleSyncPartners} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl shadow-xs">
                        Scan Shopify Directory
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {partners.map((partner) => {
                        const hasPitch = !!partner.personalizedPitch?.body;
                        return (
                            <div
                                key={partner._id}
                                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                            >
                                {/* Left Content: Agency Profile & Positioning */}
                                <div className="space-y-2.5 flex-grow max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Country Badge */}
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                            <MapPin className="w-3 h-3 text-slate-500" />
                                            <span>{partner.country}</span>
                                        </span>

                                        {/* Team Size Pill */}
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                                            <Briefcase className="w-3 h-3 text-blue-600" />
                                            <span>Team: {partner.teamSize || "2 - 9"}</span>
                                        </span>

                                        {/* Starting Budget Indicator */}
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono">
                                            <span>Budget: {partner.startingBudget || "$1,000 - $5,000"}</span>
                                        </span>

                                        {/* Verified Shopify Partner Link */}
                                        <a
                                            href={partner.partnerDirectoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 px-2 py-0.5 rounded-md transition-colors"
                                            title="View verified Shopify Partner listing"
                                        >
                                            <Store className="w-3 h-3" />
                                            <span>Shopify Directory</span>
                                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                        </a>

                                        {/* Official Agency Website Link */}
                                        {partner.websiteUrl && !/shopifycdn\.com|\.(png|jpg|jpeg|svg|webp)(\?|$)/i.test(partner.websiteUrl) && (
                                            <a
                                                href={partner.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors"
                                                title="Visit official agency website"
                                            >
                                                <Globe className="w-3 h-3" />
                                                <span>Visit Website</span>
                                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                            </a>
                                        )}

                                        {/* Extracted Agency Email Pill */}
                                        {partner.email && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                                <Mail className="w-3 h-3 text-indigo-600" />
                                                <span>{partner.email}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Agency Name & Description */}
                                    <div>
                                        <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <span>{partner.name}</span>
                                            {partner.location && (
                                                <span className="text-xs font-normal text-slate-500 font-mono">· {partner.location}</span>
                                            )}
                                        </h3>
                                        {partner.description && (
                                            <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                                                <span className="font-semibold text-slate-900 mr-1.5">Focus &amp; Specialty:</span>
                                                {decodeEntities(partner.description)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Services Listed */}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {partner.services?.map((s, i) => (
                                            <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Actions: Status & AI Pitch Trigger */}
                                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    {/* Status Selector */}
                                    <select
                                        value={partner.status}
                                        onChange={(e) => updatePartnerStatus(partner._id, e.target.value)}
                                        className="text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:border-blue-600 shadow-2xs cursor-pointer"
                                    >
                                        <option value="New">Status: New 🟢</option>
                                        <option value="Pitched">Status: Pitched 🟡</option>
                                        <option value="In Discussion">Status: In Discussion 🔵</option>
                                        <option value="Partnered">Status: Partnered 🏆</option>
                                        <option value="Archived">Status: Archived 📁</option>
                                    </select>

                                    {/* AI Pitch Button */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => handleOpenPitchModal(partner)}
                                            size="sm"
                                            className={`font-semibold text-xs h-9 px-4 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                                hasPitch 
                                                    ? "bg-slate-950 hover:bg-black text-white" 
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                            <span>{hasPitch ? "View AI Pitch" : "⚡ Prepare Pitch"}</span>
                                        </Button>

                                        <Button
                                            onClick={() => deletePartner(partner._id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                            title="Remove partner"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Load More Agencies Button */}
                    {partners.length < stats.filtered && (
                        <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-2.5">
                            <p className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-900">{partners.length}</span> of <span className="font-bold text-slate-900">{stats.filtered}</span> partner agencies
                            </p>
                            <Button
                                onClick={() => setDisplayLimit(prev => prev + 50)}
                                variant="outline"
                                className="bg-white hover:bg-slate-50 border-slate-300 text-slate-800 text-xs font-semibold h-10 px-6 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>Load Next 50 Agencies</span>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* DYNAMIC AI PITCH STUDIO MODAL */}
            <Dialog open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
                <DialogContent
                    showCloseButton={false}
                    style={{
                        maxHeight: "calc(100dvh - 2.5rem)",
                        height: "min(88dvh, 720px)",
                        maxWidth: "860px",
                        width: "95vw"
                    }}
                    className="sm:max-w-[860px] w-[95vw] max-h-[calc(100dvh-2.5rem)] h-[min(88dvh,720px)] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl focus:outline-none"
                >
                    {selectedPartner && (
                        <div className="flex flex-col h-full max-h-full min-h-0 overflow-hidden">
                            {/* 1. Anchored Header */}
                            <div className="shrink-0 px-5 py-3 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                            Shopify Partner Agency
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">Target: {selectedPartner.name}</span>
                                    </div>
                                    <DialogTitle className="text-lg font-bold font-heading text-slate-950 flex flex-wrap items-center gap-2">
                                        <span>Bespoke Subcontracting Pitch Studio</span>
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 font-normal">
                                            <Cpu className="w-3 h-3 text-blue-600" />
                                            <span>Model: {selectedPartner.personalizedPitch?.modelUsed || pitchModel}</span>
                                        </span>
                                    </DialogTitle>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Inline Status Controller */}
                                    <select
                                        value={selectedPartner.status}
                                        onChange={(e) => updatePartnerStatus(selectedPartner._id, e.target.value)}
                                        className="text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-600 shadow-2xs cursor-pointer"
                                    >
                                        <option value="New">🟢 New</option>
                                        <option value="Pitched">🟡 Pitched</option>
                                        <option value="In Discussion">🔵 In Discussion</option>
                                        <option value="Partnered">🏆 Partnered</option>
                                        <option value="Archived">📁 Archived</option>
                                    </select>

                                    <button
                                        onClick={() => setSelectedPartner(null)}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Dynamic Body */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                                {/* Agency Intelligence Strip */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">Agency:</span>
                                            <span className="font-bold text-slate-950">{selectedPartner.name}</span>
                                            <span className="text-slate-400">·</span>
                                            {selectedPartner.websiteUrl ? (
                                                <a
                                                    href={selectedPartner.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    <span>{selectedPartner.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">Website not listed</span>
                                            )}
                                        </div>

                                        <a
                                            href={selectedPartner.partnerDirectoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                                        >
                                            <Store className="w-3 h-3" />
                                            <span>View Official Shopify Profile</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    </div>

                                    {selectedPartner.description && (
                                        <div className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/70 pt-1.5">
                                            <span className="font-semibold text-slate-800 mr-1">Agency Focus:</span>
                                            {decodeEntities(selectedPartner.description)}
                                        </div>
                                    )}

                                    {selectedPartner.websiteContext && (
                                        <div className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-2 text-[11px]">
                                            <div className="flex items-center justify-between text-slate-700">
                                                <span className="font-semibold flex items-center gap-1.5 text-blue-700">
                                                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Verified Intelligence (Directory &amp; Website)</span>
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {selectedPartner.websiteContext.lastScrapedAt && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            Updated {new Date(selectedPartner.websiteContext.lastScrapedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => generatePitchForPartner(selectedPartner, activeAngle, pitchModel, true)}
                                                        disabled={isGeneratingPitch}
                                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                                        title="Force re-scrape of live website and Shopify Directory"
                                                    >
                                                        <RefreshCw className={`w-2.5 h-2.5 ${isGeneratingPitch ? "animate-spin" : ""}`} />
                                                        <span>Re-scan</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Directory Specific Insights */}
                                            {(selectedPartner.websiteContext.partnerSince || selectedPartner.websiteContext.teamSize || selectedPartner.websiteContext.location || selectedPartner.websiteContext.industries) && (
                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    {selectedPartner.websiteContext.partnerSince && (
                                                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                            Partner Since {selectedPartner.websiteContext.partnerSince}
                                                        </span>
                                                    )}
                                                    {selectedPartner.websiteContext.location && (
                                                        <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                            📍 {selectedPartner.websiteContext.location}
                                                        </span>
                                                    )}
                                                    {selectedPartner.websiteContext.teamSize && (
                                                        <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                            👥 {selectedPartner.websiteContext.teamSize}
                                                        </span>
                                                    )}
                                                    {selectedPartner.websiteContext.industries && (
                                                        <span className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                            🎯 {selectedPartner.websiteContext.industries}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {selectedPartner.websiteContext.title && (
                                                <p className="font-medium text-slate-900 line-clamp-1">
                                                    {selectedPartner.websiteContext.title}
                                                </p>
                                            )}
                                            {selectedPartner.websiteContext.techKeywords && selectedPartner.websiteContext.techKeywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-0.5">
                                                    {selectedPartner.websiteContext.techKeywords.map((tech) => (
                                                        <span key={tech} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Model & Angle Selector */}
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                            <span>AI Model &amp; Tone Engine</span>
                                        </label>
                                        
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    generatePitchForPartner(selectedPartner, activeAngle, "gpt-4o");
                                                }}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                                                    pitchModel === "gpt-4o" ? "bg-white text-slate-950 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                <Cpu className="w-3 h-3 text-blue-600" />
                                                <span>GPT-4o (Senior Voice)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    generatePitchForPartner(selectedPartner, activeAngle, "gpt-4o-mini");
                                                }}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                                                    pitchModel === "gpt-4o-mini" ? "bg-white text-slate-950 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                <Zap className="w-3 h-3 text-amber-500" />
                                                <span>GPT-4o Mini</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    generatePitchForPartner(selectedPartner, activeAngle, "gemini");
                                                }}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                                                    pitchModel === "gemini" ? "bg-white text-slate-950 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                <Sparkles className="w-3 h-3 text-purple-600" />
                                                <span>Gemini</span>
                                            </button>
                                        </div>
                                    </div>

                                    {isGeneratingPitch && (
                                        <div className="text-[11px] text-blue-600 font-medium animate-pulse flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200/80">
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                            <span>{pitchModel.toUpperCase()} is writing a human peer-to-peer pitch for {selectedPartner.name}...</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => generatePitchForPartner(selectedPartner, "white-label")}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                activeAngle === "white-label" || activeAngle === "ai-automation"
                                                    ? "bg-blue-50/80 border-blue-600 text-blue-950 ring-1 ring-blue-600 shadow-2xs"
                                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                            }`}
                                        >
                                            <p className="font-bold text-xs flex items-center gap-1.5 text-blue-950">
                                                <Handshake className="w-3.5 h-3.5 text-blue-600" />
                                                <span>White-Label Partner (Full Suite)</span>
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">AI Chatbots, Discord/Telegram bots &amp; Mobile Apps</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => generatePitchForPartner(selectedPartner, "custom-scripts")}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                activeAngle === "custom-scripts" || activeAngle === "technical-audit"
                                                    ? "bg-purple-50/80 border-purple-600 text-purple-950 ring-1 ring-purple-600 shadow-2xs"
                                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                            }`}
                                        >
                                            <p className="font-bold text-xs flex items-center gap-1.5 text-purple-950">
                                                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                                                <span>Custom Scripts &amp; Automations</span>
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">Webhooks, ERP/warehouse syncs &amp; Shopify Functions</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => generatePitchForPartner(selectedPartner, "concise")}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                activeAngle === "concise"
                                                    ? "bg-emerald-50/80 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-2xs"
                                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                            }`}
                                        >
                                            <p className="font-bold text-xs flex items-center gap-1.5 text-emerald-950">
                                                <Send className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Concise 3-Sentence DM</span>
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">Fast founder outreach for Telegram / LinkedIn</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Recipient Email & Zoho Status */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-blue-600" />
                                            <span>Recipient Email (To)</span>
                                        </label>
                                        {zohoStatus.configured ? (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Zoho Mail Ready: {zohoStatus.senderEmail}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                Zoho SMTP not configured in .env.local
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="e.g. hello@agency.com (auto-extracted when available or paste from website)"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="h-9 text-xs rounded-xl font-mono bg-white border-slate-200"
                                    />
                                </div>

                                {zohoFeedback && (
                                    <div className={`p-2.5 rounded-xl text-xs font-medium border ${
                                        zohoFeedback.type === "success"
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                            : "bg-rose-50 border-rose-200 text-rose-800"
                                    }`}>
                                        {zohoFeedback.text}
                                    </div>
                                )}

                                {/* Subject Line */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Subject Line</label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(editableSubject, "subject")}
                                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {copiedField === "subject" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedField === "subject" ? "Copied" : "Copy Subject"}</span>
                                        </button>
                                    </div>
                                    <Input
                                        value={editableSubject}
                                        onChange={(e) => setEditableSubject(e.target.value)}
                                        className="h-9 text-xs rounded-xl font-mono bg-white border-slate-200"
                                    />
                                </div>

                                {/* Email Body */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Email Message</label>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {editableBody.trim() ? editableBody.trim().split(/\s+/).length : 0} words
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(editableBody, "body")}
                                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {copiedField === "body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedField === "body" ? "Copied" : "Copy Message"}</span>
                                        </button>
                                    </div>
                                    <textarea
                                        rows={10}
                                        value={editableBody}
                                        onChange={(e) => setEditableBody(e.target.value)}
                                        className="w-full min-h-[210px] rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans"
                                    />
                                </div>
                            </div>

                            {/* 3. Anchored Footer */}
                            <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
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
                                    <a
                                        href={`mailto:${recipientEmail.trim() || `contact@${selectedPartner.handle}.com`}?subject=${encodeURIComponent(editableSubject)}&body=${encodeURIComponent(editableBody)}`}
                                        className="inline-flex"
                                        onClick={() => {
                                            if (selectedPartner.status === "New") {
                                                updatePartnerStatus(selectedPartner._id, "Pitched");
                                            }
                                        }}
                                    >
                                        <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs h-8 px-3 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Email App</span>
                                        </Button>
                                    </a>

                                    <Button
                                        type="button"
                                        onClick={handleSendViaZoho}
                                        disabled={isSendingZoho}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {isSendingZoho ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Send className="w-3.5 h-3.5" />
                                        )}
                                        <span>{isSendingZoho ? "Sending..." : "Send via Zoho Mail"}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* MANUAL ADD PARTNER MODAL */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[580px] w-[95vw] rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl p-6">
                    <DialogTitle className="text-xl font-bold font-heading text-slate-950 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <span>Add Partner Agency</span>
                    </DialogTitle>
                    <p className="text-xs text-slate-500 -mt-2">
                        Manually insert an agency found on Clutch, LinkedIn, or personal referral.
                    </p>

                    <form onSubmit={handleCreatePartner} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700">Agency Name *</label>
                                <Input
                                    required
                                    placeholder="e.g. Bungalow Creative"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700">Country / Region</label>
                                <select
                                    value={newCountry}
                                    onChange={(e) => setNewCountry(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-blue-600"
                                >
                                    <option value="US">🇺🇸 United States</option>
                                    <option value="GB">🇬🇧 United Kingdom</option>
                                    <option value="AU">🇦🇺 Australia</option>
                                    <option value="CA">🇨🇦 Canada</option>
                                    <option value="DE">🇩🇪 Germany</option>
                                    <option value="Other">🌐 Other Region</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Official Website URL</label>
                            <Input
                                placeholder="https://agency.com"
                                value={newWebsite}
                                onChange={(e) => setNewWebsite(e.target.value)}
                                className="h-9 text-xs rounded-xl"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Shopify Partner / Clutch Profile Link</label>
                            <Input
                                placeholder="https://shopify.com/in/partners/directory/partner/..."
                                value={newDirectoryUrl}
                                onChange={(e) => setNewDirectoryUrl(e.target.value)}
                                className="h-9 text-xs rounded-xl"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Services Offered (comma separated)</label>
                            <Input
                                placeholder="Store building, Theme design, CRO, SEO"
                                value={newServices}
                                onChange={(e) => setNewServices(e.target.value)}
                                className="h-9 text-xs rounded-xl"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Agency Description / Specialty</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Boutique agency specializing in aesthetics-driven storefronts for fashion and lifestyle brands..."
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowAddModal(false)}
                                className="text-xs text-slate-600 hover:text-slate-900 h-9 px-4 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-xl shadow-xs"
                            >
                                {isSubmitting ? "Adding..." : "Add Partner Agency"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
