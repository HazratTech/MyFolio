"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    ArrowRight, 
    ExternalLink, 
    Github, 
    Smartphone, 
    Server, 
    Bot, 
    Sparkles, 
    Check, 
    CheckCircle2,
    ShieldCheck, 
    Clock, 
    Star, 
    Layers, 
    Code2, 
    Database, 
    Cpu, 
    Terminal, 
    Zap,
    ChevronRight,
    MoveUpRight
} from "lucide-react";
import { QuoteWizard } from "@/components/sections/QuoteWizard";
import { cn } from "@/lib/utils";

interface FlagshipProject {
    id: string;
    title: string;
    tagline: string;
    category: string;
    image: string;
    architectureType: string;
    problemSolved: string;
    highlights: string[];
    techStack: string[];
    githubUrl: string;
    liveUrl?: string;
}

const flagshipProjects: FlagshipProject[] = [
    {
        id: "karigo",
        title: "KarigoJobs",
        tagline: "Local-First Field Operations & PDF Invoicing Suite",
        category: "Field Operations & Mobile SaaS",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/07/d70e8058-4b5e-407b-bff7-1a74d78b9921",
        architectureType: "Kotlin Multiplatform + SQLDelight + RevenueCat",
        problemSolved: "Field contractors in basements and low-signal job sites faced constant data loss with web tools. Engineered a zero-server, 100% offline mobile app that snapshots material rates and renders crisp client invoices in under 60 seconds without internet.",
        highlights: [
            "100% local-first SQLDelight schema snapshotting material rates at invoice creation",
            "Shared KMP business logic (models, repositories, ViewModels) architected for iOS",
            "RevenueCat in-app subscriptions with offline entitlement verification"
        ],
        techStack: ["Kotlin Multiplatform", "Jetpack Compose", "SQLDelight", "Koin", "RevenueCat"],
        githubUrl: "https://github.com/ihazratummar/Karigo-App"
    },
    {
        id: "islam24",
        title: "Islam24",
        tagline: "Ultra-Low Battery Native Android Background Engine",
        category: "Native Android Consumer Application",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/04/22489aef-762f-4386-b35d-374a02ba286b",
        architectureType: "Native Android + Jetpack Compose + FusedLocation",
        problemSolved: "Aggressive Android OEM background task killers (Samsung, Xiaomi) were dropping critical timed alerts and draining battery. Built a pure native background engine using exact AlarmManager scheduling with sub-1.5% daily battery consumption.",
        highlights: [
            "Hardware sensor fusion for orientation with zero drift and minimal battery footprint",
            "Exact alarm scheduling resilient against aggressive manufacturer process killers",
            "Live in production on Google Play Store with thousands of active installs"
        ],
        techStack: ["Kotlin", "Jetpack Compose", "Room Database", "FusedLocationProvider", "Clean Architecture"],
        githubUrl: "https://github.com/ihazratummar/Islam24",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.islam24"
    },
    {
        id: "onedrop",
        title: "OneDrop",
        tagline: "Reactive Real-Time Healthcare & Blood Donor Network",
        category: "High-Throughput Mobile & Microservice System",
        image: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/04/c7cf4eb4-dacb-4880-853f-d7e6505bc403",
        architectureType: "Native Mobile + Ktor / Spring Boot + MongoDB",
        problemSolved: "Urgent medical requests required real-time push broadcasts and atomic reservation locks to eliminate race conditions during concurrent blood donor claims.",
        highlights: [
            "Sub-200ms reactive state updates over persistent WebSockets",
            "Atomic transaction processing preventing duplicate donor reservations",
            "Complete server infrastructure built in Kotlin with automated Docker CI/CD"
        ],
        techStack: ["Kotlin", "Jetpack Compose", "Ktor / Spring Boot", "MongoDB", "WebSockets", "Docker"],
        githubUrl: "https://github.com/ihazratummar/OneDrop",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.onedrop"
    }
];

const serviceTracks = [
    {
        number: "01",
        title: "Native & Multiplatform Mobile Apps",
        headline: "60FPS fluid UI and zero-data-loss offline architecture.",
        description: "Bespoke Android apps built in Kotlin & Jetpack Compose, iOS in SwiftUI, and unified multiplatform suites in Kotlin Multiplatform (KMP). Engineered with local-first databases (Room/SQLDelight) so field teams never lose data in low-signal environments.",
        href: "/mobile-app-development",
        badge: "Core Discipline",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        tech: ["Kotlin", "Jetpack Compose", "SwiftUI", "KMP", "Room DB", "SQLDelight"],
        sprint: "Starting from $490 / ₹39k"
    },
    {
        number: "02",
        title: "High-Throughput Backends & APIs",
        headline: "Production microservices that handle real business concurrency.",
        description: "Scalable REST and WebSocket backends engineered in Kotlin Spring Boot, Ktor, and FastAPI. Backed by PostgreSQL and MongoDB with containerized Docker deployments, automated GitHub Actions CI/CD, and sub-100ms response times.",
        href: "/services",
        badge: "Cloud Infrastructure",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        tech: ["Kotlin Spring Boot", "FastAPI", "Ktor", "PostgreSQL", "MongoDB", "Docker"],
        sprint: "Milestone-based architecture"
    },
    {
        number: "03",
        title: "Custom Discord Bots & Platform Automation",
        headline: "High-concurrency community automation and revenue engines.",
        description: "Modular Discord bots supporting automated moderation, multi-server economy systems, Stripe and crypto checkout flows, ticket lifecycles, and webhook integrations with zero downtime.",
        href: "/discord-bot",
        badge: "High Conversion",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        tech: ["Python", "discord.py", "MongoDB", "Stripe API", "WebSockets", "Docker"],
        sprint: "Delivered in 3-7 days"
    },
    {
        number: "04",
        title: "AI Assistants & Business Workflows",
        headline: "Context-aware assistants connected to real business pipelines.",
        description: "Targeted web and WhatsApp assistants that ingest your proprietary knowledge base, qualify inbound prospects, schedule appointments, and push contextual lead data straight to your CRM.",
        href: "/ai-chatbot-development",
        badge: "AI Automation",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        tech: ["FastAPI", "OpenAI / Claude", "Vector Search", "WhatsApp API", "CRM Sync"],
        sprint: "Starting from $350"
    }
];

const testimonials = [
    {
        quote: "Speedy and meticulous. Answered all my questions, explained and demonstrated how my bot worked. Delivery was outstanding.",
        author: "sgtgonzo",
        role: "Community Founder",
        platform: "Fiverr 5.0★ Verified",
        platformBadge: "bg-emerald-50 text-emerald-800 border-emerald-200"
    },
    {
        quote: "He asked many questions about the details to make sure I got the exact functionality I needed. Delivery was quick, clean, and highly professional.",
        author: "frescher",
        role: "Product Operator",
        platform: "Fiverr 5.0★ Verified",
        platformBadge: "bg-emerald-50 text-emerald-800 border-emerald-200"
    },
    {
        quote: "The native Android implementation is flawless. Background sync handled edge-case disconnections without a single crash. Will definitely work together again.",
        author: "Alexandre M.",
        role: "Technical Lead",
        platform: "Upwork Verified Client",
        platformBadge: "bg-emerald-50 text-emerald-800 border-emerald-200"
    }
];

export const LandingPage = () => {
    const [selectedProject, setSelectedProject] = useState<string>("karigo");
    const [currency, setCurrency] = useState<"USD" | "INR">("USD");

    useEffect(() => {
        const root = document.documentElement;
        const hadDark = root.classList.contains("dark");
        if (hadDark) {
            root.classList.remove("dark");
        }
        return () => {
            if (hadDark) {
                root.classList.add("dark");
            }
        };
    }, []);

    const activeProject = flagshipProjects.find(p => p.id === selectedProject) || flagshipProjects[0];

    return (
        <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-600 selection:text-white">

            {/* ─── 1. BOUTIQUE STUDIO HERO (Editorial B2B Light Mode) ─── */}
            <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden border-b border-slate-200/80 bg-white">
                {/* Hairline Grid Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage: "radial-gradient(ellipse 70% 60% at 50% 10%, #000 60%, transparent 100%)",
                    }}
                />

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    
                    {/* Studio Eyebrow */}
                    <div 
                        className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm border mb-6"
                        style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Boutique Software Engineering Studio • Independent Senior Builder</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight text-slate-950 max-w-5xl leading-[1.08] mb-6">
                        We engineer <span style={{ color: "#2563eb" }}>mobile apps, backends & automation</span> that run businesses.
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl leading-relaxed mb-8 font-normal max-w-3xl" style={{ color: "#334155" }}>
                        Direct 1-on-1 collaboration with a senior engineer. Production Native Android (<span className="text-slate-950 font-semibold">Kotlin & Compose</span>), iOS (<span className="text-slate-950 font-semibold">SwiftUI</span>), <span className="text-slate-950 font-semibold">Kotlin Multiplatform (KMP)</span>, robust <span className="text-slate-950 font-semibold">Spring Boot & FastAPI</span> backends, and custom automation. Zero agency bureaucracy.
                    </p>

                    {/* Primary CTAs */}
                    <div className="flex flex-wrap items-center gap-4 mb-12">
                        <a 
                            href="#services"
                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                            className="inline-flex items-center justify-center gap-2.5 font-semibold text-base px-8 rounded-xl shadow-sm hover:opacity-95 transition-all group h-[56px] text-white cursor-pointer"
                        >
                            <span>Explore Services & Sprints</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a 
                            href="#case-studies"
                            style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                            className="inline-flex items-center justify-center gap-2 border font-semibold text-base px-8 rounded-xl transition-colors shadow-sm hover:bg-slate-50 h-[56px] cursor-pointer"
                        >
                            <span>View Shipped Work & Code</span>
                        </a>
                    </div>

                    {/* Founder & Credibility Bar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/images/founder.jpg"
                                alt="Hazrat Ummar Shaikh, Founder & Senior Engineer"
                                width={52}
                                height={52}
                                priority
                                className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-sm"
                            />
                            <div>
                                <div className="text-sm font-bold text-slate-950 flex items-center gap-2.5 flex-wrap">
                                    <span>Hazrat Ummar Shaikh</span>
                                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        Independent Senior Engineer
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Direct 1-on-1 sprint collaboration • 100% full source code ownership
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <a
                                href="https://github.com/ihazratummar"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
                            >
                                <Github className="w-3.5 h-3.5 text-slate-600" />
                                <span>GitHub</span>
                            </a>
                            <a
                                href="https://play.google.com/store/apps/dev?id=8511073495389394372"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-sm"
                            >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Google Play Developer</span>
                            </a>
                            <div className="px-3 py-2 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-1.5 border border-amber-200 shadow-sm">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>5.0★ Rating</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* ─── 2. FLAGSHIP SHIPPED SOFTWARE SHOWCASE ─── */}
            <section id="case-studies" className="py-20 md:py-28 border-b border-slate-200/80 bg-[#fafaf9] relative">
                <span id="work" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    {/* Section Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-3">
                            Proven Commercial Execution
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-950 tracking-tight leading-tight max-w-3xl">
                            Real software running in production with verified code.
                        </h2>
                        <p className="text-slate-600 text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
                            We don&apos;t build disposable templates. Explore our commercial implementations across offline-first field suites, native mobile consumer apps, and real-time backend microservices.
                        </p>
                    </div>

                    {/* Project Selector Tabs */}
                    <div className="flex flex-wrap gap-2.5 mb-10 pb-2 border-b border-slate-200">
                        {flagshipProjects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProject(p.id)}
                                style={
                                    selectedProject === p.id
                                        ? { backgroundColor: "#ffffff", color: "#1d4ed8", borderColor: "#cbd5e1" }
                                        : { color: "#475569" }
                                }
                                className={cn(
                                    "px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 border cursor-pointer",
                                    selectedProject === p.id
                                        ? "shadow-sm border-slate-300"
                                        : "border-transparent hover:text-slate-900 hover:bg-white/60"
                                )}
                            >
                                <span>{p.title}</span>
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                    selectedProject === p.id ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-600"
                                )}>
                                    {p.category.split(" ")[0]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Active Project Card */}
                    <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10 items-center">
                            
                            {/* Visual App Mockup */}
                            <div className="lg:col-span-6 relative group rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center shadow-inner">
                                <Image
                                    src={activeProject.image}
                                    alt={activeProject.title}
                                    fill
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Project Breakdown */}
                            <div className="lg:col-span-6 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2.5">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                            {activeProject.category}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {activeProject.architectureType}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading">
                                        {activeProject.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-1 font-medium">
                                        {activeProject.tagline}
                                    </p>
                                </div>

                                {/* Problem Solved */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <div className="text-xs font-bold uppercase text-blue-700 mb-1.5 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5" />
                                        Commercial Problem & Architectural Solution
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {activeProject.problemSolved}
                                    </p>
                                </div>

                                {/* Engineering Highlights */}
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2.5">
                                        Key Engineering Implementations
                                    </div>
                                    <ul className="space-y-2">
                                        {activeProject.highlights.map((h, idx) => (
                                            <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tech Stack Badges */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                    {activeProject.techStack.map((t, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200 font-medium">
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    {activeProject.liveUrl && (
                                        <a
                                            href={activeProject.liveUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:opacity-95"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>View on Google Play</span>
                                        </a>
                                    )}
                                    <a
                                        href={activeProject.githubUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                                        className="px-4 py-2.5 rounded-xl border text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm hover:bg-slate-50"
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        <span>View GitHub Repository</span>
                                    </a>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </section>


            {/* ─── 3. CORE ENGINEERING TRACKS (SERVICE SILOS) ─── */}
            <section id="services" className="py-20 md:py-28 bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm mb-3">
                                Core Disciplines
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-950 tracking-tight leading-tight">
                                Four specialized engineering tracks.
                            </h2>
                        </div>
                        <p className="text-slate-600 text-base max-w-md">
                            Direct senior technical execution. No junior handoffs, no bloated overhead, and no generic template shortcuts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {serviceTracks.map((s) => (
                            <Link
                                key={s.number}
                                href={s.href}
                                className="group p-8 rounded-2xl bg-[#fafaf9] hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <span className="font-heading text-2xl font-black text-blue-600 group-hover:text-blue-700 transition-colors">
                                            {s.number}
                                        </span>
                                        <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider", s.badgeColor)}>
                                            {s.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-950 font-heading group-hover:text-blue-600 transition-colors mb-2">
                                        {s.title}
                                    </h3>
                                    <div className="text-sm font-semibold text-slate-700 mb-4">
                                        {s.headline}
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                        {s.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {s.tech.map((t, idx) => (
                                            <span key={idx} className="px-2.5 py-1 rounded-md bg-white text-slate-600 text-xs font-mono border border-slate-200">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-mono font-bold">
                                        {s.sprint}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                                        <span>Deep Dive</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </section>


            {/* ─── 4. THE ANTI-AGENCY ADVANTAGE ─── */}
            <section className="py-20 md:py-28 bg-[#fafaf9] border-b border-slate-200">
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-3">
                            The Anti-Agency Advantage
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-950 tracking-tight leading-tight">
                            Why clients choose RelayWorks over traditional agencies.
                        </h2>
                        <p className="text-slate-600 text-base md:text-lg mt-4 leading-relaxed">
                            Traditional agencies bill high markups to support layers of non-technical management. RelayWorks gives you direct access to the engineer building your codebase.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        
                        {/* Traditional Agency Card */}
                        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
                            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-6 flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full w-fit">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Traditional Agency Model
                            </div>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>3-4 non-technical account managers filtering all communication</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>Code delegated to junior outsourced contractors</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>Weeks wasted on scoping meetings before a line of code is written</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>Hidden hourly fees, black-box billing, and runaway budgets</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>Messy architecture that breaks when you try to scale</span>
                                </li>
                            </ul>
                        </div>

                        {/* RelayWorks Model */}
                        <div 
                            style={{ borderColor: "#2563eb" }}
                            className="p-8 rounded-2xl bg-white border-2 shadow-xl shadow-blue-600/10 relative"
                        >
                            <div 
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2 px-3 py-1 rounded-full w-fit shadow-sm text-white"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                RelayWorks Boutique Model
                            </div>
                            <ul className="space-y-4 text-sm text-slate-800">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Direct senior engineer access:</strong> 1-on-1 Slack/Discord/Email channel with Hazrat</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Zero delegation:</strong> The person quoting the project writes every commit</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Rapid sprint delivery:</strong> Functional MVP code delivered in 1-2 weeks</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Predictable milestone pricing:</strong> Fixed deliverables with zero hidden surprise bills</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>100% full IP ownership:</strong> Complete source code and deployment keys transferred to you</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>
            </section>


            {/* ─── 5. PREDICTABLE MILESTONE SPRINTS ─── */}
            <section id="pricing" className="py-20 md:py-28 bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-3">
                                Transparent Sprint Scoping
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-950 tracking-tight leading-tight">
                                Predictable pricing with zero runaway scopes.
                            </h2>
                            <p className="text-slate-600 text-base mt-3 max-w-xl">
                                We scope work in agile milestone sprints. You pay only for verified working deliverables, not open-ended agency hours.
                            </p>
                        </div>

                        {/* Currency Toggle */}
                        <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-300 shadow-sm shrink-0">
                            <button
                                onClick={() => setCurrency("USD")}
                                style={currency === "USD" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                                    currency === "USD" ? "text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                USD ($)
                            </button>
                            <button
                                onClick={() => setCurrency("INR")}
                                style={currency === "INR" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                                    currency === "INR" ? "text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                INR (₹)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Sprint 1: Prototype / MVP */}
                        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                                    Sprint Tier 01
                                </div>
                                <h3 className="text-xl font-bold text-slate-950 mb-2">Prototype & MVP Sprint</h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    Rapid commercial validation of your core concept or targeted automated bot.
                                </p>
                                <div className="text-3xl font-extrabold text-slate-950 font-heading mb-6">
                                    {currency === "USD" ? "$490" : "₹39,000"}
                                    <span className="text-xs font-normal text-slate-500 ml-2">/ sprint baseline</span>
                                </div>
                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8 border-t border-slate-100 pt-6">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>1-2 week rapid execution</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Native mobile UI or Discord workflow engine</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Local database & essential API hookups</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Direct 1-on-1 sprint chat with Hazrat</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact">
                                <button 
                                    style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                                    className="w-full py-3 rounded-xl text-xs font-bold transition-all hover:bg-slate-800 text-white cursor-pointer shadow-sm"
                                >
                                    Request MVP Scope
                                </button>
                            </a>
                        </div>

                        {/* Sprint 2: Production Dual-Platform Suite */}
                        <div 
                            style={{ borderColor: "#2563eb" }}
                            className="p-8 rounded-2xl bg-white border-2 shadow-xl shadow-blue-600/10 flex flex-col justify-between relative"
                        >
                            <div 
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap"
                            >
                                Most Requested
                            </div>
                            <div className="pt-4">
                                <div className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-2">
                                    Sprint Tier 02
                                </div>
                                <h3 className="text-xl font-bold text-slate-950 mb-2">Production Suite Sprint</h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    Full commercial dual-platform mobile app (Android + iOS) or high-volume backend.
                                </p>
                                <div className="text-3xl font-extrabold text-slate-950 font-heading mb-6">
                                    {currency === "USD" ? "$1,290" : "₹99,000"}
                                    <span className="text-xs font-normal text-slate-500 ml-2">/ milestone</span>
                                </div>
                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8 border-t border-slate-100 pt-6">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>2-4 week milestone roadmap</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Shared KMP business core + native UI</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Local-first offline sync (Room / SQLDelight)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>In-app purchases, push alerts & auth</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Google Play & TestFlight store prep</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact">
                                <button 
                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                    className="w-full py-3 rounded-xl text-xs font-bold transition-all hover:opacity-95 text-white cursor-pointer shadow-sm"
                                >
                                    Request Suite Scope
                                </button>
                            </a>
                        </div>

                        {/* Sprint 3: Full-Stack Enterprise Platform */}
                        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                                    Sprint Tier 03
                                </div>
                                <h3 className="text-xl font-bold text-slate-950 mb-2">Custom Full-Stack Scope</h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    Multiplatform mobile app + Spring Boot microservices + automated cloud infrastructure.
                                </p>
                                <div className="text-3xl font-extrabold text-slate-950 font-heading mb-6">
                                    Custom Scope
                                </div>
                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8 border-t border-slate-100 pt-6">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Multi-month phased product delivery</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Kotlin Spring Boot / FastAPI microservices</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>PostgreSQL / MongoDB high-availability cluster</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Docker CI/CD automation & SLA support</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact">
                                <button 
                                    style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                                    className="w-full py-3 rounded-xl text-xs font-bold transition-all hover:bg-slate-800 text-white cursor-pointer shadow-sm"
                                >
                                    Discuss Custom Architecture
                                </button>
                            </a>
                        </div>

                    </div>

                </div>
            </section>


            {/* ─── 6. VERIFIED CLIENT FEEDBACK ─── */}
            <section className="py-20 md:py-28 border-b border-slate-200/80 bg-[#fafaf9]">
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-3">
                            Verified Client Reviews
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 tracking-tight">
                            Tested and trusted by founders & technical leads.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center gap-1 mb-4 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-slate-950">{t.author}</div>
                                        <div className="text-xs text-slate-500">{t.role}</div>
                                    </div>
                                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", t.platformBadge)}>
                                        {t.platform}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>


            {/* ─── 7. INTERACTIVE PROJECT INTAKE & DISCOVERY WIZARD ─── */}
            <section id="contact" className="py-20 md:py-28 bg-white">
                <QuoteWizard />
            </section>

        </div>
    );
};
