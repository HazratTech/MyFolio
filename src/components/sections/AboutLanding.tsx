"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Smartphone, Bot, Sparkles, Server, ArrowRight, CheckCircle2,
    Database, Zap, ShieldCheck, ExternalLink, Github, Linkedin,
    Twitter, Star, Code2, Award, Clock, Terminal, UserCheck, Mail
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HireMeModal } from "@/components/modals/HireMeModal";

const corePrinciples = [
    {
        title: "Zero Agency Bureaucracy",
        desc: "No sales reps, project managers, or junior trainees playing telephone. You collaborate directly with the senior lead engineer writing your commits and designing your database schemas.",
        icon: UserCheck
    },
    {
        title: "Production-First Engineering",
        desc: "We don't build disposable MVPs that crash under concurrency. Every architecture is engineered with ACID transactional safety, offline delta-sync, and strict error boundaries.",
        icon: ShieldCheck
    },
    {
        title: "100% Source Code & IP Ownership",
        desc: "You own everything we build. Upon milestone completion, full Git repositories, Docker containers, and CI/CD pipelines are transferred directly to your organization.",
        icon: Code2
    },
    {
        title: "Predictable Milestone Sprints",
        desc: "Zero runaway hourly billing. Projects are scoped into transparent, fixed-cost sprints where you review working test builds before releasing milestone funds.",
        icon: Clock
    }
];

const technicalArsenal = [
    {
        domain: "Native Mobile Architecture",
        tag: "iOS & Android",
        skills: [
            "Kotlin & Jetpack Compose",
            "SwiftUI (Native iOS)",
            "Kotlin Multiplatform (KMP)",
            "Room DB & SQLDelight",
            "Offline-First Delta Sync",
            "RevenueCat In-App Subscriptions"
        ]
    },
    {
        domain: "Backends & High-Throughput APIs",
        tag: "Microservices",
        skills: [
            "Kotlin Spring Boot",
            "Python FastAPI & Ktor",
            "PostgreSQL (ACID Transactions)",
            "MongoDB Atlas & Redis",
            "Stripe & Webhook Idempotency",
            "Asynchronous Reactive Coroutines"
        ]
    },
    {
        domain: "AI & Conversational Automations",
        tag: "Deterministic RAG",
        skills: [
            "Deterministic Vector RAG",
            "WhatsApp Business Cloud API",
            "OpenAI API & Anthropic",
            "Automated CRM Integration",
            "Strict Hallucination Guardrails",
            "Real-Time Human Escalation"
        ]
    },
    {
        domain: "Discord Infrastructure & DevOps",
        tag: "High Concurrency",
        skills: [
            "Discord.py & Pycord",
            "Async MatchManager Locks",
            "Sightengine & Perspective API",
            "Docker & GitHub Actions CI/CD",
            "Linux VPS & PM2 Process Manager",
            "99.99% High Availability Hosting"
        ]
    }
];

const milestonesTimeline = [
    {
        year: "2021",
        role: "Discord Bot Automation Engine Architecture",
        description: "Began engineering custom high-concurrency Discord bots and community management tools. Solved complex permission matrices, automated ticket queues, and thread-safe event handling."
    },
    {
        year: "2022",
        role: "Scalable API & Payment Microservices",
        description: "Expanded into high-throughput backend infrastructure with Python FastAPI and Ktor. Integrated idempotent Stripe and Razorpay webhook processing with zero duplicate transactions."
    },
    {
        year: "2023",
        role: "Production Native Android Engineering",
        description: "Engineered and shipped native Android applications (Islam24, OneDrop) using Kotlin and Jetpack Compose directly to the Google Play Store with exact background scheduling."
    },
    {
        year: "2024",
        role: "Offline-First KMP & Deterministic AI Systems",
        description: "Pioneered offline-first field job and invoicing architectures (KarigoJobs) with SQLDelight delta sync and built deterministic RAG assistants for web and WhatsApp."
    },
    {
        year: "2025–Present",
        role: "RelayWorks Independent Engineering Studio",
        description: "Founded RelayWorks as a boutique software studio. Providing founders, operators, and engineering teams worldwide with direct 1-on-1 access to a senior lead builder."
    }
];

const verifiedTestimonials = [
    {
        name: "Alex M.",
        role: "Founder, SaaS Platform",
        content: "Working with Hazrat was a breath of fresh air after dealing with bloated agencies. He understood our offline-first requirements immediately, shipped clean Kotlin Compose code, and delivered ahead of schedule. 10/10 execution.",
        rating: 5,
        badge: "Verified Client"
    },
    {
        name: "Marcus K.",
        role: "Community Operations Lead",
        content: "Our custom Discord bot handles tens of thousands of members with zero downtime. Hazrat built custom moderation, automated ticketing, and an in-Discord shop that has processed thousands in revenue without a single glitch.",
        rating: 5,
        badge: "Verified Client"
    },
    {
        name: "David S.",
        role: "Managing Director, Dispatch Services",
        content: "The WhatsApp AI assistant Hazrat built deflected over 65% of our incoming routine booking queries within the first 2 weeks. Zero hallucinations, instantaneous responses, and seamless sync with our CRM.",
        rating: 5,
        badge: "Verified Client"
    }
];

export const AboutLanding = () => {
    // Dynamic Light Theme Mount Effect
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        return () => {
            document.documentElement.classList.add("dark");
        };
    }, []);

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
                            <span>Independent Boutique Studio • Lead Software Builder</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 max-w-4xl leading-[1.14] mb-6">
                            Engineering software with <span style={{ color: "#2563eb" }}>extreme precision, zero bureaucracy</span> and 100% ownership.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-10 font-normal">
                            Founded by <span className="text-slate-900 font-semibold">Hazrat Ummar Shaikh</span>. RelayWorks is not a bloated agency with layers of account managers, interns, and endless slide decks. You work directly with a senior engineer who writes the commits, architects the database schemas, and takes personal accountability for your production systems.
                        </p>

                        {/* Founder Spotlight Card */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-12">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                
                                {/* Left: Portrait & Badges */}
                                <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                                    <div className="relative mb-4">
                                        <Image
                                            src="/images/founder.jpg"
                                            alt="Hazrat Ummar Shaikh"
                                            width={140}
                                            height={140}
                                            className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-2 border-blue-500/50 shadow-md"
                                            priority
                                        />
                                        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black font-heading text-slate-950 mb-1">
                                        Hazrat Ummar Shaikh
                                    </h3>
                                    <div className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block mb-3">
                                        Lead Engineer & Studio Founder
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Independent builder with 4+ years shipping production native mobile apps, deterministic AI assistants, and high-concurrency bot infrastructure.
                                    </p>

                                    {/* Social / Developer Links */}
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            href="https://github.com/ihazratummar"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                                            title="GitHub Profile"
                                            aria-label="GitHub Profile"
                                        >
                                            <Github className="w-4 h-4" />
                                        </a>
                                        <a
                                            href="https://play.google.com/store/apps/dev?id=8511073495389394372"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200/80 transition-colors"
                                            aria-label="Google Play Store Developer Profile"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Google Play</span>
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/hazrat-ummar-shaikh/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                                            title="LinkedIn"
                                            aria-label="LinkedIn Profile"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                        <a
                                            href="https://x.com/ihazratummar9"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                                            title="X (Twitter)"
                                            aria-label="X (Twitter) Profile"
                                        >
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                {/* Right: Core Statistics Band */}
                                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center">
                                        <div className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-1">
                                            4+
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Years Shipping
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center">
                                        <div className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-1">
                                            200+
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Systems Built
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center">
                                        <div className="text-3xl md:text-4xl font-black font-heading text-blue-600 mb-1">
                                            100%
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Source Ownership
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center">
                                        <div className="text-3xl md:text-4xl font-black font-heading text-emerald-600 mb-1">
                                            99.9%
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Uptime SLA
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Action CTAs */}
                        <div className="flex flex-wrap items-center gap-4">
                            <HireMeModal>
                                <Button 
                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                    className="hover:opacity-90 font-bold px-8 h-[52px] text-base rounded-xl shadow-sm transition-all flex items-center gap-2.5 group cursor-pointer"
                                >
                                    <span>Discuss a Project</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </HireMeModal>
                            <Link href="/services">
                                <Button 
                                    variant="outline" 
                                    className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold px-7 h-[52px] text-base rounded-xl transition-colors cursor-pointer"
                                >
                                    Explore Engineering Services
                                </Button>
                            </Link>
                        </div>

                    </div>
                </section>

                {/* ─── 2. THE ANTI-AGENCY COMMITMENT ─── */}
                <section className="py-20 md:py-28 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-left max-w-3xl mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Operating Principles</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Why founders choose an independent builder over a bloated agency.
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                Most agencies sell you on their senior partners, then secretly hand off your architecture to junior subcontractors while charging you hourly markups. Here is how we operate differently:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {corePrinciples.map((principle, idx) => {
                                const Icon = principle.icon;
                                return (
                                    <div 
                                        key={idx}
                                        className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-5"
                                    >
                                        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold font-heading text-slate-950 mb-2">
                                                {principle.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {principle.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </section>

                {/* ─── 3. TECHNICAL ARSENAL ─── */}
                <section id="stack" className="py-20 md:py-28 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-left max-w-3xl mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Core Technology Stack</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Battle-tested tools we engineer and ship with.
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                We select languages and frameworks based on operational longevity, concurrency performance, and strong type safety — not fleeting hype.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {technicalArsenal.map((track, idx) => (
                                <div 
                                    key={idx}
                                    className="p-8 rounded-3xl bg-[#fafaf9] border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold font-heading text-slate-950">
                                            {track.domain}
                                        </h4>
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider font-mono">
                                            {track.tag}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {track.skills.map((skill, sIdx) => (
                                            <span 
                                                key={sIdx}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs font-mono"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ─── 4. PROVEN MILESTONES & JOURNEY ─── */}
                <section className="py-20 md:py-28 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-4xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Proven Track Record</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Years of shipping production software.
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Continuous discipline, mastering documentation, solving hard concurrency bugs, and building software that stays in production.
                            </p>
                        </div>

                        <div className="relative border-l-2 border-blue-200 ml-4 md:ml-32 pl-8 space-y-10">
                            {milestonesTimeline.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    {/* Timeline Marker Dot */}
                                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600 group-hover:scale-125 transition-transform shadow-xs" />
                                    
                                    <div className="text-xs font-bold font-mono text-blue-600 uppercase tracking-wider mb-1">
                                        {item.year}
                                    </div>
                                    <h4 className="text-xl font-bold font-heading text-slate-950 mb-2">
                                        {item.role}
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ─── 5. VERIFIED CLIENT SOCIAL PROOF ─── */}
                <section className="py-20 md:py-28 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-6xl">
                        
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Client Endorsements</h2>
                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4">
                                Trusted by founders, CTOs & community leaders.
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Feedback from real founders who commissioned native mobile apps, Discord automations, and backend architectures with RelayWorks.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {verifiedTestimonials.map((testimonial, idx) => (
                                <div 
                                    key={idx}
                                    className="p-8 rounded-3xl bg-[#fafaf9] border border-slate-200 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-1 mb-4 text-amber-400">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed mb-6 font-normal">
                                            "{testimonial.content}"
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-950">{testimonial.name}</div>
                                            <div className="text-xs text-slate-500">{testimonial.role}</div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {testimonial.badge}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ─── 6. FINAL DIRECT CONTACT / DISCOVERY CTA ─── */}
                <section className="py-20 md:py-28 bg-[#fafaf9]">
                    <div className="container mx-auto px-6 max-w-4xl">
                        
                        <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 border border-blue-200/80">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span>Direct Senior Engineer Inquiries</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-black font-heading text-slate-950 mb-4 max-w-2xl mx-auto">
                                Have an architecture or sprint milestone in mind?
                            </h3>
                            
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
                                Connect directly with Hazrat Ummar Shaikh. Receive a structured technical breakdown, platform feasibility check, and milestone roadmap within 24 hours.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <HireMeModal>
                                    <Button 
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="hover:opacity-90 font-bold px-8 h-[52px] text-base rounded-xl shadow-sm transition-all flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <span>Start Technical Discovery</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </HireMeModal>
                                <a 
                                    href="mailto:hazratummar9@gmail.com"
                                    className="inline-flex items-center gap-2 px-7 h-[52px] rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold text-sm transition-colors"
                                >
                                    <span>hazratummar9@gmail.com</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

            </div>
        </LazyMotion>
    );
};
