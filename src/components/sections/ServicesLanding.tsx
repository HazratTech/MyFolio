"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Smartphone, Bot, Sparkles, Server, ArrowRight, CheckCircle2,
    Database, Zap, ShieldCheck, ExternalLink, Github, Layers,
    Clock, Cpu, Code2, ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuoteWizard } from "@/components/sections/QuoteWizard";

const architectureNodes = [
    {
        id: "app",
        label: "Customer Mobile App",
        badge: "Client Interface",
        desc: "The client-facing gateway built with Kotlin Jetpack Compose and SwiftUI. Designed for fluid 60FPS UI, offline-first product workflows, and instant local state persistence.",
        icon: Smartphone,
        accentColor: "text-blue-600",
        pillColor: "bg-blue-50 text-blue-700 border-blue-200",
        deliverables: [
            "Offline-First Delta Sync: Local Room / SQLDelight database operates without active signal",
            "Declarative UI: 100% native Jetpack Compose (Android) and SwiftUI (iOS)",
            "Push Notification & Biometric Engine: Sub-200ms background alerts and FaceID/Fingerprint auth"
        ]
    },
    {
        id: "api",
        label: "High-Throughput API Gateway",
        badge: "Core Routing & Logic",
        desc: "The transaction backbone engineered in Kotlin Spring Boot or Python FastAPI. Handles checkout security, idempotent order processing, and sub-100ms REST and WebSocket streams.",
        icon: Server,
        accentColor: "text-indigo-600",
        pillColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        deliverables: [
            "Automated Webhooks: Idempotent Stripe / Razorpay event processing preventing duplicate charges",
            "High-Concurrency Throughput: Asynchronous non-blocking architecture handling peak loads",
            "Zero-Trust Auth Layer: JWT session rotation and automated input sanitization"
        ]
    },
    {
        id: "bot",
        label: "Automations & Event Engines",
        badge: "Operations & Retention",
        desc: "Real-time dispatch and notification systems across Discord and WhatsApp. Alerts operations teams instantly, automates ticket routing, and handles customer inquiries 24/7.",
        icon: Bot,
        accentColor: "text-emerald-600",
        pillColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        deliverables: [
            "Instant Operational Alerts: Staff channels notified the millisecond an anomaly occurs",
            "Deterministic AI Assistants: Grounded RAG chatbots routing qualified leads to CRM",
            "High-Concurrency Discord Bots: 99.99% uptime with thread-safe async locks"
        ]
    },
    {
        id: "db",
        label: "Cloud Database Vault",
        badge: "Persistent Storage",
        desc: "Mission-critical data architecture combining PostgreSQL ACID reliability for financial transactions with MongoDB flexibility for high-throughput catalogs and logs.",
        icon: Database,
        accentColor: "text-purple-600",
        pillColor: "bg-purple-50 text-purple-700 border-purple-200",
        deliverables: [
            "ACID Financial Guarantees: Strict transaction isolation preventing inventory race conditions",
            "Automated Cloud Backups: Daily encrypted snapshots with sub-15-minute point-in-time recovery",
            "Optimized Query Indexes: Sub-10ms query execution across millions of structured records"
        ]
    }
];

export const ServicesLanding = () => {
    // Dynamic Light Theme Mount Effect
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        return () => {
            document.documentElement.classList.add("dark");
        };
    }, []);

    // Currency Switcher State
    const [currency, setCurrency] = useState<"USD" | "INR">("USD");

    // Architecture Node State
    const [activeNode, setActiveNode] = useState<string>("app");
    const activeNodeData = architectureNodes.find(n => n.id === activeNode) || architectureNodes[0];

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-600 selection:text-white">
                
                {/* ─── 1. HERO SECTION ─── */}
                <section 
                    className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-white border-b border-slate-200/80"
                    style={{ 
                        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", 
                        backgroundSize: "24px 24px" 
                    }}
                >
                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                        
                        {/* Eyebrow Pill */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide mb-6 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span>Boutique Software Engineering Studio • Fixed-Scope Sprints</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 max-w-4xl leading-[1.14] mb-6">
                            Production software engineered for <span style={{ color: "#2563eb" }}>scale, resilience & zero-fluff delivery</span>.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-8 font-normal">
                            Direct senior engineer collaboration with zero agency overhead. We architect and ship high-performance native mobile apps, deterministic AI chatbots, custom Discord bot infrastructure, and high-throughput backend APIs with 100% source code ownership.
                        </p>

                        {/* Primary CTAs */}
                        <div className="flex flex-wrap items-center gap-4 mb-12">
                            <a href="#quote-wizard">
                                <Button 
                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                    className="hover:opacity-90 font-bold px-8 h-[52px] text-base rounded-xl shadow-sm transition-all flex items-center gap-2.5 group cursor-pointer"
                                >
                                    <span>Calculate Project Scope</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </a>
                            <a href="#sprints">
                                <Button 
                                    variant="outline" 
                                    className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold px-7 h-[52px] text-base rounded-xl transition-colors cursor-pointer"
                                >
                                    View Sprint Pricing
                                </Button>
                            </a>
                        </div>

                        {/* Senior Engineer Credibility Bar */}
                        <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Hazrat Ummar Shaikh"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50 shrink-0"
                                />
                                <div>
                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <span>Hazrat Ummar Shaikh</span>
                                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Independent Senior Builder</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">Direct 1-on-1 sprint collaboration • 100% source code transfer • Zero middleman</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://github.com/ihazratummar"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>GitHub Profile</span>
                                </a>
                                <a
                                    href="https://play.google.com/store/apps/dev?id=8511073495389394372"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200/80 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Google Play Store</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ─── 2. THE 4 SPECIALIZED DISCIPLINES ─── */}
                <section id="disciplines" className="py-20 md:py-28 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-left max-w-3xl mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Specialized Engineering Disciplines</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Deep technical execution across four core verticals.
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                We do not build cookie-cutter templates. Every discipline represents battle-tested architecture designed for uptime, clean maintainability, and measurable commercial return.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Discipline 1: Native Mobile */}
                            <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-5">
                                        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                                            Flagship Track
                                        </span>
                                    </div>

                                    <h4 className="text-2xl font-black font-heading text-slate-950 mb-3 group-hover:text-blue-600 transition-colors">
                                        Native Mobile Applications
                                    </h4>
                                    
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                        Production Native Android (<span className="text-slate-900 font-semibold">Kotlin & Jetpack Compose</span>) and iOS (<span className="text-slate-900 font-semibold">SwiftUI</span>) applications powered by <span className="text-slate-900 font-semibold">Kotlin Multiplatform (KMP)</span>. Engineered with deterministic offline delta-sync for field operations in signal dead-zones.
                                    </p>

                                    <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-6">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Technical Standards</div>
                                        {[
                                            "100% offline-first SQLDelight / Room schema with local mutation snapshotting",
                                            "Shared KMP business models and ViewModels ready for dual-platform scale",
                                            "Guaranteed Apple App Store & Google Play Store submission approval",
                                            "Sub-1.5% daily background sensor & AlarmManager battery consumption"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Sprint Milestones</div>
                                        <div className="text-base font-black font-heading text-slate-950">Starting from $490 / ₹39,000</div>
                                    </div>
                                    <Link href="/mobile-app-development">
                                        <Button 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="hover:opacity-90 font-bold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Explore Mobile Track</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Discipline 2: AI Chatbot & Automations */}
                            <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-5">
                                        <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-blue-600 shadow-xs">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                                            Grounded AI
                                        </span>
                                    </div>

                                    <h4 className="text-2xl font-black font-heading text-slate-950 mb-3 group-hover:text-blue-600 transition-colors">
                                        AI Chatbots & Conversational Automations
                                    </h4>
                                    
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                        Deterministic retrieval-augmented generation (RAG) assistants for <span className="text-slate-900 font-semibold">web portals and WhatsApp Business</span>. Strictly grounded on your verified business knowledge base with zero hallucinations, CRM lead qualification, and automated booking.
                                    </p>

                                    <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-6">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Technical Standards</div>
                                        {[
                                            "Sub-3-second streaming responses with hybrid semantic vector chunking",
                                            "Zero hallucination guardrails with strict out-of-scope escalation rules",
                                            "Direct Cal.com, HubSpot, Google Sheets & custom CRM webhook sync",
                                            "Direct client LLM API billing — no hidden markups ($5–$25/mo typical)"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Sprint Milestones</div>
                                        <div className="text-base font-black font-heading text-slate-950">Starting from $350 / ₹29,000</div>
                                    </div>
                                    <Link href="/ai-chatbot-development">
                                        <Button 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="hover:opacity-90 font-bold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Explore AI Track</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Discipline 3: Discord Bot Infrastructure */}
                            <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-5">
                                        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
                                            <Bot className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                                            High Concurrency
                                        </span>
                                    </div>

                                    <h4 className="text-2xl font-black font-heading text-slate-950 mb-3 group-hover:text-blue-600 transition-colors">
                                        Custom Discord Bot Engineering
                                    </h4>
                                    
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                        Commission tailor-made Discord automation engines for high-volume communities. Advanced moderation, OAuth2 captcha verification, purchase ticket queues, dual-currency virtual economies, and private admin dashboards.
                                    </p>

                                    <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-6">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Technical Standards</div>
                                        {[
                                            "Async MatchManager with thread-safe concurrency locks preventing race conditions",
                                            "Dynamic CRUD shop engine managed entirely live via Discord admin slash commands",
                                            "Perspective API real-time toxicity scoring and Sightengine image filters",
                                            "Containerized Docker setup with 99.99% uptime and zero-restart config updates"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Sprint Milestones</div>
                                        <div className="text-base font-black font-heading text-slate-950">Starting from $149 / ₹12,000</div>
                                    </div>
                                    <Link href="/discord-bot">
                                        <Button 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="hover:opacity-90 font-bold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Explore Discord Track</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Discipline 4: Backend & APIs */}
                            <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-5">
                                        <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 shadow-xs">
                                            <Server className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                                            Cloud Architecture
                                        </span>
                                    </div>

                                    <h4 className="text-2xl font-black font-heading text-slate-950 mb-3 group-hover:text-blue-600 transition-colors">
                                        Cloud Backends & High-Throughput APIs
                                    </h4>
                                    
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                        Scalable server architectures engineered in <span className="text-slate-900 font-semibold">Kotlin Spring Boot</span>, <span className="text-slate-900 font-semibold">Python FastAPI</span>, and Ktor. Custom microservices with PostgreSQL ACID storage, MongoDB document caching, and automated Docker CI/CD pipelines.
                                    </p>

                                    <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-6">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Technical Standards</div>
                                        {[
                                            "Sub-100ms API endpoints with non-blocking reactive coroutines",
                                            "Idempotent Stripe / Razorpay webhook processing with cryptographic validation",
                                            "Automated Docker container builds and GitHub Actions deploy scripts",
                                            "Redis caching layer with sub-10ms session and state invalidation"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Sprint Milestones</div>
                                        <div className="text-base font-black font-heading text-slate-950">Starting from $450 / ₹36,000</div>
                                    </div>
                                    <a href="#quote-wizard">
                                        <Button 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="hover:opacity-90 font-bold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Request Backend Scope</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                {/* ─── 3. INTERACTIVE SYSTEMS INTEGRATION BLUEPRINT ─── */}
                <section id="blueprint" className="py-20 md:py-28 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-200/80">
                                <Zap className="w-3.5 h-3.5 text-blue-600" />
                                <span>End-to-End Architecture Blueprint</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Interconnected systems that automate your entire commercial workflow.
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                Click any component in our interconnected system architecture below to inspect how data, auth, payments, and events move deterministically across your platform.
                            </p>
                        </div>

                        {/* Interactive Blueprint Canvas */}
                        <div className="p-8 md:p-12 rounded-3xl bg-[#fafaf9] border border-slate-200 shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                
                                {/* Left Diagram Nodes */}
                                <div className="lg:col-span-6 flex flex-col items-center gap-4">
                                    {architectureNodes.map((node) => {
                                        const Icon = node.icon;
                                        const isSelected = activeNode === node.id;
                                        return (
                                            <button
                                                key={node.id}
                                                onClick={() => setActiveNode(node.id)}
                                                className={`w-full max-w-md p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                                                    isSelected
                                                        ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                                                        : "bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                                            {node.badge}
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {node.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                        isSelected ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"
                                                    }`}>
                                                        {isSelected ? "Active Inspector" : "Inspect"}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Right Architecture Inspector Panel */}
                                <div className="lg:col-span-6">
                                    <AnimatePresence mode="wait">
                                        <m.div
                                            key={activeNode}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6"
                                        >
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-blue-50 text-blue-700 border border-blue-200">
                                                    <activeNodeData.icon className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>{activeNodeData.badge}</span>
                                                </div>
                                                <h4 className="text-2xl font-black font-heading text-slate-950 mb-2">
                                                    {activeNodeData.label}
                                                </h4>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {activeNodeData.desc}
                                                </p>
                                            </div>

                                            <div className="border-t border-slate-100 pt-5 space-y-3">
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Architectural Guarantees & Implementation
                                                </div>
                                                <div className="space-y-2.5">
                                                    {activeNodeData.deliverables.map((item, idx) => (
                                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <a href="#quote-wizard">
                                                    <Button 
                                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                        className="w-full hover:opacity-90 text-white font-bold text-xs py-5 rounded-xl shadow-xs transition-opacity cursor-pointer"
                                                    >
                                                        Configure Sprint for {activeNodeData.label} →
                                                    </Button>
                                                </a>
                                            </div>
                                        </m.div>
                                    </AnimatePresence>
                                </div>

                            </div>
                        </div>

                    </div>
                </section>

                {/* ─── 4. TRANSPARENT SPRINT PRICING OVERVIEW ─── */}
                <section id="sprints" className="py-20 md:py-28 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Milestone Sprint Framework</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Transparent milestone pricing with zero runaway hourly billing.
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
                                Every sprint milestone delivers working, testable builds on physical devices or staging environments with 100% source code transfer and zero vendor lock-in.
                            </p>

                            {/* Currency Switcher */}
                            <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
                                <button
                                    onClick={() => setCurrency("USD")}
                                    style={currency === "USD" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        currency === "USD" ? "shadow-sm" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    USD ($) Global
                                </button>
                                <button
                                    onClick={() => setCurrency("INR")}
                                    style={currency === "INR" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        currency === "INR" ? "shadow-sm" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    INR (₹) India
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            
                            {/* Sprint Tier 1 */}
                            <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">Starter / MVP Sprint</span>
                                    <h4 className="text-xl font-bold font-heading text-slate-900 mb-2">Core MVP & Automation</h4>
                                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                        For validating core user flows, shipping an AI assistant, or commissioning a Discord community automation bot.
                                    </p>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Starting from</div>
                                    <div className="text-3xl font-black font-heading text-slate-950 mb-1">
                                        {currency === "USD" ? "$350" : "₹29,000"}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-6">Fixed sprint milestone • 5–7 days</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-200 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>Full single-channel deployment (Web, Discord, or App)</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>Clean Git repository & full source code handover</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>30-day post-launch bug warranty</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-wizard">
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold py-5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Select Starter Sprint
                                    </Button>
                                </a>
                            </div>

                            {/* Sprint Tier 2: POPULAR */}
                            <div className="p-8 rounded-3xl bg-white border-2 border-blue-600 shadow-xl flex flex-col justify-between relative">
                                <div 
                                    style={{ 
                                        backgroundColor: "#2563eb", 
                                        color: "#ffffff",
                                        top: "-13px",
                                        left: "50%",
                                        transform: "translateX(-50%)"
                                    }}
                                    className="absolute px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap z-10"
                                >
                                    Most Demanded
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">Growth Sprint</span>
                                    <h4 className="text-xl font-bold font-heading text-slate-900 mb-2">Production Multi-Channel</h4>
                                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                                        Full native mobile suite, multi-channel AI automation (Web + WhatsApp), or full SaaS shop engine with payment gateway.
                                    </p>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Starting from</div>
                                    <div className="text-3xl font-black font-heading text-slate-950 mb-1">
                                        {currency === "USD" ? "$750" : "₹62,000"}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-6">Milestone-based delivery • 10–14 days</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-200 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>Dual-channel native or web automation suite</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>Database integration & automated CRM / Stripe sync</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>App Store / Play Store or Docker VPS deployment</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>60-day SLA bug-fix guarantee & staging walk-through</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-wizard">
                                    <Button 
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 text-white text-xs font-bold py-5 rounded-xl shadow-sm transition-opacity cursor-pointer"
                                    >
                                        Select Growth Sprint
                                    </Button>
                                </a>
                            </div>

                            {/* Sprint Tier 3 */}
                            <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Enterprise Architecture</span>
                                    <h4 className="text-xl font-bold font-heading text-slate-900 mb-2">Custom Full-Stack System</h4>
                                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                        End-to-end commercial system: Native mobile clients, custom Spring Boot backend microservices, PostgreSQL ACID, and automated CI/CD.
                                    </p>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Tailored Sprint Scope</div>
                                    <div className="text-2xl font-black font-heading text-slate-950 mb-1">
                                        Custom Architecture
                                    </div>
                                    <div className="text-xs text-slate-500 mb-6">Multi-milestone roadmap • End-to-end delivery</div>
                                    
                                    <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-200 pt-6">
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Full-stack native mobile + Spring Boot/FastAPI backend</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>High-concurrency data layer with automated failover</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>GitHub Actions CI/CD with staging & production pipelines</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>90-day senior engineer priority support SLA</span>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#quote-wizard">
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold py-5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Configure Custom Scope
                                    </Button>
                                </a>
                            </div>

                        </div>

                    </div>
                </section>

                {/* ─── 5. INTERACTIVE PROJECT QUOTE WIZARD ─── */}
                <div id="quote-wizard">
                    <QuoteWizard />
                </div>

            </div>
        </LazyMotion>
    );
};
