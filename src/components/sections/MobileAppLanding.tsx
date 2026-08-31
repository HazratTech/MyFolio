"use client";

import React, { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Smartphone, Check, X, ShieldAlert, Sparkles, Terminal,
    Layers, Database, Server, GitBranch, Cpu, Lock, ArrowRight,
    Send, HelpCircle, ChevronDown, CheckCircle2, RefreshCw,
    Activity, Globe, HardDrive, Zap, Code2, AlertTriangle, UserCheck,
    ExternalLink, Github, Wifi, WifiOff, ShieldCheck, Play, ArrowUpRight
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import Image from "next/image";
import Link from "next/link";

interface RealProject {
    id: string;
    name: string;
    tagline: string;
    category: string;
    image: string;
    githubUrl: string;
    liveUrl?: string;
    architectureType: string;
    problemSolved: string;
    engineeringDetails: string[];
    techStack: string[];
}

const realProjects: RealProject[] = [
    {
        id: "karigo",
        name: "KarigoJobs",
        tagline: "Offline-First Field Job & Invoicing App for Tradesmen",
        category: "Field Operations & Mobile SaaS",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/07/d70e8058-4b5e-407b-bff7-1a74d78b9921",
        githubUrl: "https://github.com/ihazratummar/Karigo-App",
        liveUrl: "",
        architectureType: "Kotlin Multiplatform + SQLDelight + RevenueCat",
        problemSolved: "Millions of field contractors in India work in basements and low-signal job sites. Existing software failed without internet. Built a zero-server, 100% offline app that generates PDF invoices in under 60 seconds with rate-snapshotting schemas.",
        engineeringDetails: [
            "100% local-first SQLDelight schema snapshotting material rates at invoice creation",
            "Shared KMP business logic (models, repositories, ViewModels) ready for iOS",
            "RevenueCat in-app subscriptions with offline entitlement verification"
        ],
        techStack: ["Kotlin Multiplatform", "Jetpack Compose", "SQLDelight", "Koin", "RevenueCat"]
    },
    {
        id: "islam24",
        name: "Islam24",
        tagline: "High-Precision Sensor & Background Scheduling Utility",
        category: "Native Android Consumer App",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/04/22489aef-762f-4386-b35d-374a02ba286b",
        githubUrl: "https://github.com/ihazratummar/Islam24",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.islam24",
        architectureType: "Native Android + Jetpack Compose + FusedLocation",
        problemSolved: "Battery drain and missed alerts caused by aggressive Android OEM background task killers. Engineered a pure native background engine utilizing exact Android AlarmManager scheduling and offline calculation tables.",
        engineeringDetails: [
            "Hardware sensor fusion for orientation with zero drift and sub-1.5% daily battery usage",
            "Exact alarm scheduling resilient against Samsung / Xiaomi aggressive battery killers",
            "Live in production on the Google Play Store"
        ],
        techStack: ["Kotlin", "Jetpack Compose", "Room Database", "FusedLocationProvider", "Clean Architecture"]
    },
    {
        id: "onedrop",
        name: "OneDrop",
        tagline: "Reactive Real-Time Medical Donation Network",
        category: "High-Throughput Mobile & Microservice System",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/04/c7cf4eb4-dacb-4880-853f-d7e6505bc403",
        githubUrl: "https://github.com/ihazratummar/OneDrop",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.onedrop",
        architectureType: "Native Mobile + Ktor / Spring Boot + MongoDB",
        problemSolved: "Urgent medical requests required real-time push broadcasts and atomic reservation locks to eliminate race conditions during concurrent blood donor claims.",
        engineeringDetails: [
            "Sub-200ms reactive state updates over WebSockets",
            "Atomic transaction processing preventing duplicate donor reservations",
            "Complete server infrastructure built in Kotlin with automated Docker CI/CD"
        ],
        techStack: ["Kotlin", "Jetpack Compose", "Ktor / Spring Boot", "MongoDB", "WebSockets", "Docker"]
    }
];

export const MobileAppLanding = () => {
    // Currency Toggle
    const [currency, setCurrency] = useState<"USD" | "INR">("USD");

    // Active project showcase
    const [activeProject, setActiveProject] = useState<string>("karigo");

    // Offline Simulator State
    const [isSimulatedOnline, setIsSimulatedOnline] = useState<boolean>(false);
    const [simulatedJobs, setSimulatedJobs] = useState<{ id: number; title: string; amount: string; status: "local" | "synced" }[]>([
        { id: 1, title: "HVAC Unit Inspection #1042", amount: "$420.00", status: "synced" }
    ]);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // FAQ Accordion state
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        appType: "Native Android (Kotlin/Compose)",
        offlineNeeds: "Yes, requires full offline-first operations",
        timeline: "1-2 Weeks (MVP Sprint)",
        projectDetails: ""
    });
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const addSimulatedJob = () => {
        const newJob = {
            id: Date.now(),
            title: `Field Job Report #${Math.floor(1000 + Math.random() * 9000)}`,
            amount: `$${(Math.random() * 300 + 150).toFixed(2)}`,
            status: (isSimulatedOnline ? "synced" : "local") as "local" | "synced"
        };
        setSimulatedJobs(prev => [newJob, ...prev]);
    };

    const triggerSimulatedSync = () => {
        setIsSimulatedOnline(true);
        setIsSyncing(true);
        setTimeout(() => {
            setSimulatedJobs(prev => prev.map(j => ({ ...j, status: "synced" })));
            setIsSyncing(false);
        }, 1200);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: `[Mobile App Sprint Scope] ${formData.appType} - ${formData.timeline}`,
                    message: `Platform: ${formData.appType}\nOffline Requirement: ${formData.offlineNeeds}\nTarget Timeline: ${formData.timeline}\n\nProject Scope:\n${formData.projectDetails}`
                })
            });

            if (res.ok) {
                setFormStatus("success");
                trackEvent("mobile_app_lead_submitted", { appType: formData.appType, timeline: formData.timeline });
            } else {
                setFormStatus("error");
            }
        } catch {
            setFormStatus("error");
        }
    };

    const currentProj = realProjects.find(p => p.id === activeProject) || realProjects[0];

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-primary/30 selection:text-white relative overflow-hidden">
                
                {/* Background Blueprint Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                
                {/* ─── 1. AUTHENTIC HUMAN-FIRST HERO SECTION ─── */}
                <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 border-b border-white/5">
                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                        
                        {/* Live Proof Badge */}
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            Production Native Engineering • Shipped on Google Play
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white max-w-4xl leading-[1.14] mb-6">
                            Mobile apps engineered for <span className="text-cyan-400 font-bold">zero-data-loss offline operations</span> and fluid 60FPS UI.
                        </h1>

                        {/* Authentic Subheadline */}
                        <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-8 font-normal">
                            I build production Native Android (<span className="text-white font-medium">Kotlin & Jetpack Compose</span>), iOS (<span className="text-white font-medium">SwiftUI</span>), and multiplatform applications backed by <span className="text-white font-medium">Kotlin Spring Boot</span>, PostgreSQL, and MongoDB. Direct senior engineer access with zero agency bureaucracy.
                        </p>

                        {/* Primary CTAs */}
                        <div className="flex flex-wrap items-center gap-4 mb-12">
                            <a href="#quote-form">
                                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-base px-7 py-6 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all flex items-center gap-2.5 group">
                                    <span>Request a Sprint Scope</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </a>
                            <a href="#shipped-apps">
                                <Button variant="outline" className="bg-slate-900/70 border-white/10 hover:bg-slate-800 text-slate-200 font-medium text-base px-6 py-6 rounded-xl transition-colors">
                                    View Shipped Apps & Code
                                </Button>
                            </a>
                        </div>

                        {/* Senior Engineer Credibility Bar */}
                        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <img
                                    src="/images/founder.jpg"
                                    alt="Hazrat Ummar Shaikh"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/50 shrink-0"
                                />
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>Hazrat Ummar Shaikh</span>
                                        <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Independent Senior Engineer</span>
                                    </div>
                                    <div className="text-xs text-slate-400">Direct 1-on-1 sprint collaboration • 100% source code transfer</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://github.com/ihazratummar"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-colors"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>GitHub Profile</span>
                                </a>
                                <a
                                    href="https://play.google.com/store/apps/dev?id=8511073495389394372"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Google Play Developer</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ─── 2. INTERACTIVE LIVE OFFLINE-FIRST SIMULATOR ─── */}
                <section className="py-20 md:py-28 bg-[#090c13] border-b border-white/5">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-left max-w-3xl mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
                                Live Interactive Architecture Demonstration
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Experience how our Local-First Delta Sync protects user data.
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                Most apps freeze or wipe unsaved entries when the network drops. In our architecture, every mutation writes immediately to the local device database (Room / SQLDelight) and syncs in the background upon reconnection. Test it below:
                            </p>
                        </div>

                        {/* Interactive Simulator Box */}
                        <div className="p-6 md:p-8 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl">
                            
                            {/* Controls Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Network Simulation:</div>
                                    <button
                                        onClick={() => setIsSimulatedOnline(!isSimulatedOnline)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                                            isSimulatedOnline
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        }`}
                                    >
                                        {isSimulatedOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                                        <span>{isSimulatedOnline ? "ONLINE (Connected to Spring Boot API)" : "OFFLINE (Simulated Basement Dead-Zone)"}</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={addSimulatedJob}
                                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-4 rounded-lg border border-white/10"
                                    >
                                        + Create New Field Job
                                    </Button>
                                    {!isSimulatedOnline && (
                                        <Button
                                            onClick={triggerSimulatedSync}
                                            disabled={isSyncing}
                                            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow"
                                        >
                                            {isSyncing ? "Syncing..." : "Reconnect & Delta Sync"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Simulated Device Memory Queue */}
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                                    <span>Device Local Database Queue (SQLDelight / Room DB)</span>
                                    <span className="text-[11px] text-slate-500">{simulatedJobs.length} records in local storage</span>
                                </div>

                                <div className="space-y-2.5">
                                    {simulatedJobs.map(job => (
                                        <div
                                            key={job.id}
                                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-slate-900 text-slate-300">
                                                    <HardDrive className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{job.title}</div>
                                                    <div className="text-[11px] text-slate-400">Total: {job.amount} • Rate snapshotted locally</div>
                                                </div>
                                            </div>

                                            <div>
                                                {job.status === "synced" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                                                        <Check className="w-3 h-3" />
                                                        Synced to Backend
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold animate-pulse">
                                                        <Activity className="w-3 h-3" />
                                                        Saved in Local Room DB (Pending Sync)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                {/* ─── 3. SHIPPED PRODUCTION APPS SHOWCASE ─── */}
                <section id="shipped-apps" className="py-20 md:py-28 border-b border-white/5">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-left max-w-3xl mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Shipped Production Applications</h2>
                            <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Real mobile products running in production with verified code.
                            </h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                Explore how we solve real commercial challenges across offline field workforce tools, native Android utilities, and high-concurrency medical systems.
                            </p>
                        </div>

                        {/* Project Tabs */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {realProjects.map(proj => (
                                <button
                                    key={proj.id}
                                    onClick={() => setActiveProject(proj.id)}
                                    className={`px-5 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                                        activeProject === proj.id
                                            ? "bg-slate-800 border-primary text-white shadow-lg"
                                            : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {proj.name}
                                </button>
                            ))}
                        </div>

                        {/* Active Project Card */}
                        <div className="p-8 md:p-10 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                
                                {/* Image / Media preview */}
                                <div className="lg:col-span-5 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[4/3] flex items-center justify-center">
                                    <img
                                        src={currentProj.image}
                                        alt={currentProj.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="lg:col-span-7 space-y-5">
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-xs font-semibold text-primary uppercase tracking-widest">{currentProj.category}</span>
                                            <div className="flex items-center gap-2">
                                                {currentProj.githubUrl && (
                                                    <a
                                                        href={currentProj.githubUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 transition-colors"
                                                        title="View Source on GitHub"
                                                    >
                                                        <Github className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {currentProj.liveUrl && (
                                                    <a
                                                        href={currentProj.liveUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 hover:bg-emerald-900/60 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Google Play</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">{currentProj.name}</h4>
                                        <p className="text-xs font-mono text-cyan-400">{currentProj.architectureType}</p>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Problem & Commercial Solution</div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{currentProj.problemSolved}</p>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Technical Implementations</div>
                                        <ul className="space-y-2 text-xs text-slate-200">
                                            {currentProj.engineeringDetails.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {currentProj.techStack.map((tech, idx) => (
                                                <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </section>

                {/* ─── 4. TRANSPARENT SPRINT SCOPES (USD / INR) ─── */}
                <section id="pricing" className="py-20 md:py-28 bg-[#090c13] border-b border-white/5">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Milestone-Based Engineering Sprints</h2>
                            <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Predictable sprint scoping with zero runaway hourly billing.
                            </h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
                                We structure projects into focused, milestone-based sprints. Every sprint produces working, testable builds with 100% source code ownership and direct builder communication.
                            </p>

                            {/* Currency Switcher */}
                            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-white/10">
                                <button
                                    onClick={() => setCurrency("USD")}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        currency === "USD" ? "bg-primary text-white shadow" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    USD ($) Global
                                </button>
                                <button
                                    onClick={() => setCurrency("INR")}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        currency === "INR" ? "bg-primary text-white shadow" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    INR (₹) India
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            
                            {/* Tier 1 */}
                            <div className="p-8 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">Prototype / MVP Sprint</span>
                                    <h4 className="text-xl font-bold text-white mb-2">Native Android MVP</h4>
                                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                        For validating core user flows, database architecture, and native UI on Android before scaling.
                                    </p>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Starting from</div>
                                    <div className="text-3xl font-bold font-heading text-white mb-1">
                                        {currency === "USD" ? "$490" : "₹39,000"}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-6">Fixed sprint milestone • 1-2 weeks</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            <span>Native Kotlin & Jetpack Compose UI</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            <span>Local Room Database / SQLite Setup</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            <span>REST API Integration & State Management</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            <span>Clean Git Repository & Test APK Delivery</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-form">
                                    <Button variant="outline" className="w-full bg-slate-900 border-white/10 hover:bg-slate-800 text-white text-xs font-semibold py-5 rounded-xl">
                                        Request MVP Sprint Scope
                                    </Button>
                                </a>
                            </div>

                            {/* Tier 2: POPULAR */}
                            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0c1017] border-2 border-primary shadow-[0_0_35px_rgba(59,130,246,0.2)] flex flex-col justify-between relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow">
                                    Most Demanded
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">Production Multiplatform</span>
                                    <h4 className="text-xl font-bold text-white mb-2">Android & iOS Native Suite</h4>
                                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                                        Dual-platform native mobile suite with shared Kotlin Multiplatform (KMP/CMP) core and offline delta sync.
                                    </p>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Starting from</div>
                                    <div className="text-3xl font-bold font-heading text-white mb-1">
                                        {currency === "USD" ? "$1,290" : "₹99,000"}
                                    </div>
                                    <div className="text-xs text-slate-400 mb-6">Milestone-based sprints • Iterative delivery</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-200 mb-8 border-t border-white/10 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>Jetpack Compose (Android) + SwiftUI (iOS)</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>Shared Business Logic (KMP / CMP Core)</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>Deterministic Offline Delta Sync Engine</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>Biometric Auth & In-App Purchases / Stripe</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>App Store & Google Play Store Submission</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-form">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-5 rounded-xl shadow-lg">
                                        Request Dual-Platform Scope
                                    </Button>
                                </a>
                            </div>

                            {/* Tier 3 */}
                            <div className="p-8 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Full-Stack Architecture</span>
                                    <h4 className="text-xl font-bold text-white mb-2">Complete System + Spring Boot</h4>
                                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                        Full platform build including native mobile clients, custom Kotlin Spring Boot backend, and PostgreSQL/MongoDB database.
                                    </p>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tailored Project Scope</div>
                                    <div className="text-2xl font-bold font-heading text-white mb-1">
                                        Custom Architecture Scope
                                    </div>
                                    <div className="text-xs text-slate-500 mb-6">Sprint roadmap • End-to-end delivery</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Dual-Platform Client (Android Compose + iOS SwiftUI)</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Kotlin Spring Boot Microservice Server</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>PostgreSQL (ACID) & MongoDB Data Layer</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Docker & GitHub Actions CI/CD Pipeline</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-form">
                                    <Button variant="outline" className="w-full bg-slate-900 border-white/10 hover:bg-slate-800 text-white text-xs font-semibold py-5 rounded-xl">
                                        Request Custom Architecture Scope
                                    </Button>
                                </a>
                            </div>

                        </div>

                    </div>
                </section>

                {/* ─── 5. TECHNICAL FAQ ACCORDION ─── */}
                <section id="faq" className="py-20 md:py-28 border-b border-white/5">
                    <div className="container mx-auto px-6 max-w-4xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Frequently Answered Questions</h2>
                            <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Technical and commercial answers before you start.
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Clear information on architecture, App Store approval guarantees, source code ownership, and post-launch maintenance.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Why use Kotlin Multiplatform (KMP/CMP) + SwiftUI instead of Flutter or React Native?",
                                    a: "Flutter uses an artificial canvas renderer that does not look or feel native to iOS, while React Native relies on bridge serialization that can cause frame drops on complex lists. Kotlin Multiplatform allows us to write 100% native UI in Jetpack Compose on Android and SwiftUI on iOS while sharing 80% of business logic, database queries, and network sync in pure Kotlin without runtime performance penalties."
                                },
                                {
                                    q: "How does the offline-first architecture handle data sync conflicts?",
                                    a: "We implement local-first SQLite/Room storage where user actions are recorded immediately with local timestamps and mutation logs. When the device reconnects to network, a background Delta Sync worker pushes atomic batches to our Spring Boot/PostgreSQL backend with automated field-level conflict resolution, guaranteeing zero data loss."
                                },
                                {
                                    q: "Do you guarantee Apple App Store and Google Play Store approval?",
                                    a: "Yes. Every mobile contract includes complete store submission support, privacy policy compliance, app icon asset bundling, signing key configuration, and direct resolution of any store review feedback until your application is live in production."
                                },
                                {
                                    q: "Do I receive 100% ownership of the source code and IP?",
                                    a: "Yes, completely. Upon final milestone completion, full source code repositories (Android, iOS, and Backend) are transferred to your organization GitHub/GitLab account along with CI/CD deployment scripts and zero vendor lock-in."
                                },
                                {
                                    q: "Can you build the backend microservices as well as the mobile apps?",
                                    a: "Yes. We specialize in full-stack mobile systems using Kotlin Spring Boot, PostgreSQL, MongoDB, and Docker. This ensures your mobile client and backend API are engineered by the same senior builder, eliminating communication friction between frontend and server developers."
                                },
                                {
                                    q: "How are project milestones and payments structured?",
                                    a: "Projects are divided into transparent sprint milestones. You review working test builds on physical devices before releasing milestone funds."
                                }
                            ].map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 cursor-pointer transition-colors hover:border-white/10"
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                >
                                    <div className="flex justify-between items-center text-left">
                                        <h4 className="font-bold text-white text-base md:text-lg flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                                            <span>{faq.q}</span>
                                        </h4>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-4 ${openFaq === idx ? "rotate-180 text-primary" : ""}`} />
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out pl-8 text-left ${openFaq === idx ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none"}`}>
                                        <p className="text-slate-300 text-sm leading-relaxed pb-2">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ─── 6. LEAD INTAKE / SCOPE SPECIFIER ─── */}
                <section id="quote-form" className="py-20 md:py-28">
                    <div className="container mx-auto px-6 max-w-3xl">
                        
                        <div className="text-center mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Direct Engineering Discovery</h2>
                            <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Specify your mobile application scope.
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
                                Receive an architectural evaluation and sprint scope directly from our senior lead engineer within 24 hours.
                            </p>
                        </div>

                        <div className="p-8 md:p-10 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl">
                            
                            {formStatus === "success" ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Scope Specification Received</h4>
                                    <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
                                        Thank you. Our senior lead engineer will review your platform requirements and respond with a structured technical breakdown within 24 hours.
                                    </p>
                                    <Button
                                        onClick={() => setFormStatus("idle")}
                                        variant="outline"
                                        className="bg-slate-900 border-white/10 text-white text-xs"
                                    >
                                        Submit Another Scope
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Your Name / Organization
                                            </label>
                                            <Input
                                                required
                                                placeholder="e.g. Alex Johnson"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-slate-950 border-slate-800 text-white text-sm focus:border-primary rounded-xl py-5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Work Email
                                            </label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="alex@company.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-slate-950 border-slate-800 text-white text-sm focus:border-primary rounded-xl py-5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Target Platform Suite
                                            </label>
                                            <select
                                                value={formData.appType}
                                                onChange={(e) => setFormData({ ...formData, appType: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm focus:border-primary rounded-xl px-3 py-3 outline-none"
                                            >
                                                <option value="Native Android (Kotlin/Compose)">Native Android (Kotlin/Compose)</option>
                                                <option value="Dual-Platform Native (Compose + SwiftUI / KMP)">Dual-Platform Native (Compose + SwiftUI / KMP)</option>
                                                <option value="Full-Stack System (Mobile + Spring Boot Backend)">Full-Stack System (Mobile + Spring Boot Backend)</option>
                                                <option value="Legacy App Modernization / Migration">Legacy App Modernization / Migration</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Offline-First Requirement
                                            </label>
                                            <select
                                                value={formData.offlineNeeds}
                                                onChange={(e) => setFormData({ ...formData, offlineNeeds: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm focus:border-primary rounded-xl px-3 py-3 outline-none"
                                            >
                                                <option value="Yes, requires full offline-first operations">Yes, requires full offline-first operations</option>
                                                <option value="Standard online with basic caching">Standard online with basic caching</option>
                                                <option value="Not sure / Need recommendation">Not sure / Need recommendation</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Project Specifications & Core Features
                                        </label>
                                        <Textarea
                                            required
                                            rows={4}
                                            placeholder="Describe your user workflows, key screens, required third-party integrations (payments, maps, Bluetooth), and target launch date."
                                            value={formData.projectDetails}
                                            onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                                            className="bg-slate-950 border-slate-800 text-white text-sm focus:border-primary rounded-xl"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={formStatus === "submitting"}
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {formStatus === "submitting" ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Processing Scope Specification...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Submit Scope for Architectural Review</span>
                                            </>
                                        )}
                                    </Button>

                                    {formStatus === "error" && (
                                        <div className="text-center text-xs text-red-400 pt-2">
                                            Unable to submit at this moment. Please email us directly at hazratummar@gmail.com.
                                        </div>
                                    )}

                                </form>
                            )}

                        </div>

                    </div>
                </section>

            </div>
        </LazyMotion>
    );
};
