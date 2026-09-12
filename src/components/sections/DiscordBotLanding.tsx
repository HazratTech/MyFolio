"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Bot, Check, X, Sparkles, MessageSquare, Terminal,
    Webhook, Clock, Star, ArrowRight, Send, HelpCircle, ChevronDown, CheckCircle2, Lock, ExternalLink
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface CaseStudy {
    name: string;
    industry: string;
    problem: string;
    solution: string;
    features: string[];
    result: string;
}

const caseStudies: CaseStudy[] = [
    {
        name: "Nexa — AI-Powered Community Bot",
        industry: "Multi-Server Community Management",
        problem: "Server admins lacked a unified bot that could handle moderation, content filtering, and engagement — forcing them to rely on 3-4 separate bots with conflicting configurations.",
        solution: "Built Nexa from scratch with a modular Python architecture: Google Perspective API for real-time toxicity scoring, Sightengine for image NSFW detection, a custom welcome card generator with Pillow, and a YAML-driven dynamic command system — all containerized with Docker and deployed via Jenkins CI/CD.",
        features: ["Google Perspective API Toxicity Filter", "Sightengine Image Moderation", "Custom Welcome Card Generator", "OpenAI Integration", "Automod with Configurable Thresholds", "YouTube / Imgur / Pixabay Search", "MongoDB Guild Config Storage", "Docker + Jenkins CI/CD Pipeline"],
        result: "90+ commits across 30+ modules. Single bot replaced 4 separate services, reducing server overhead and eliminating inter-bot permission conflicts entirely."
    },
    {
        name: "OP Shop — ARK PvP Marketplace Bot",
        industry: "Gaming Marketplace SaaS (ARK: Survival Ascended)",
        problem: "The ARK PvP community relied on manual Discord messages to process in-game item purchases, track reputation, and manage a dual-currency economy — resulting in frequent scams and zero accountability.",
        solution: "Developed a Discord-native SaaS platform with a fully data-driven shop engine, dual-currency economy (Credits + Tokens), XP-based trust scoring, automated purchase ticket workflows, giveaway system, invite tracking, and a complete in-Discord admin panel — all backed by MongoDB with zero hardcoded configurations.",
        features: ["Dynamic Shop Engine (CRUD via Discord)", "Dual-Currency Economy System", "XP & Trust Reputation Scoring", "Automated Purchase Ticket Flows", "Giveaway System with Weighted Draws", "Invite Tracker with Leaderboards", "Full Audit Logging", "In-Discord Admin Panel", "Sticky Messages Module"],
        result: "55+ commits, 15+ modules, 34KB UI layer alone. Zero-config admin workflow — every category, item, and price is managed live via /shop-admin without bot restarts."
    },
    {
        name: "Vinnie's Friend — PvP Mini-Games Bot",
        industry: "Community Entertainment & Engagement",
        problem: "A Discord community wanted competitive mini-games with real-time PvP challenges, but existing bots offered only single-player RNG with no matchmaking, turn tracking, or admin oversight.",
        solution: "Built a custom turn-based PvP game engine supporting 3 mini-games (Dice, Coinflip, and more) with an async MatchManager featuring concurrency locks to prevent race conditions, interactive Discord button-based UI for challenges and gameplay, configurable best-of-N round systems, and admin controls for game management.",
        features: ["3 PvP Mini-Games", "Async MatchManager with Concurrency Locks", "Interactive Button-Based UI", "Turn-Based Round System", "Admin Game Controls", "Channel-Restricted Game Zones", "Rich Embed Match Reports"],
        result: "Clean service-oriented architecture with full separation of concerns. Match state managed in-memory with thread-safe async locks for high-concurrency support."
    }
];

export const DiscordBotLanding = () => {
    // Dynamic Light Theme Mount Effect
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        return () => {
            document.documentElement.classList.add("dark");
        };
    }, []);

    // Simulator states
    const [simulatorTab, setSimulatorTab] = useState<"verify" | "ticket" | "ai">("verify");
    const [messages, setMessages] = useState<Array<{ sender: "user" | "bot" | "system"; text: string; embed?: any; isCommand?: boolean }>>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        discord: "",
        description: "",
        budget: "$300 - $1,000",
        timeline: "2-3 Weeks"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<string | null>(null);

    // FAQ state
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Dynamic testimonials state
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/testimonials");
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (err) {
                console.error("Failed to load reviews:", err);
            }
        };
        fetchReviews();
    }, []);

    // Run simulator text animations when tab changes
    useEffect(() => {
        setMessages([]);
        setIsTyping(true);

        const timer1 = setTimeout(() => {
            setIsTyping(false);
            if (simulatorTab === "verify") {
                setMessages([
                    { sender: "user", text: "/verify", isCommand: true },
                    {
                        sender: "bot", text: "Click the button below to complete security verification and unlock the server:", embed: {
                            title: "Server Security Verification",
                            description: "To prevent spam and raid bots, please verify your account. Clicking verify will grant you access to all channels.",
                            color: "#2563eb",
                            fields: [
                                { name: "Step 1", value: "Click the 'Verify Me' button below." },
                                { name: "Step 2", value: "Check your direct messages if prompted." }
                            ],
                            actions: true
                        }
                    }
                ]);
            } else if (simulatorTab === "ticket") {
                setMessages([
                    { sender: "user", text: "/ticket open subject: Account Billing Help", isCommand: true },
                    {
                        sender: "bot", text: "Creating your private support channel...", embed: {
                            title: "Support Ticket Created",
                            description: "Your support request has been registered successfully. A private channel has been created for your issue.",
                            color: "#2563eb",
                            fields: [
                                { name: "Support Channel", value: "#ticket-0024" },
                                { name: "Estimated Response", value: "Less than 10 minutes" }
                            ]
                        }
                    }
                ]);
            } else if (simulatorTab === "ai") {
                setMessages([
                    { sender: "user", text: "/ask-ai how do I deploy my first bot?", isCommand: true },
                    { sender: "bot", text: "Analyzing query and formulating response..." }
                ]);

                setTimeout(() => {
                    setMessages([
                        { sender: "user", text: "/ask-ai how do I deploy my first bot?", isCommand: true },
                        {
                            sender: "bot", text: "", embed: {
                                title: "Developer Assistant Response",
                                description: "To deploy your Discord bot, host on a Linux VPS using PM2 to keep it online 24/7. Core execution steps:",
                                color: "#2563eb",
                                fields: [
                                    { name: "1. Install PM2", value: "```bash\nnpm install pm2 -g\n```" },
                                    { name: "2. Start Bot", value: "```bash\npm2 start index.js --name \"my-bot\"\n```" },
                                    { name: "3. Monitor Status", value: "Check status via `pm2 status` or stream logs using `pm2 logs`." }
                                ]
                            }
                        }
                    ]);
                }, 1500);
            }
        }, 1000);

        return () => clearTimeout(timer1);
    }, [simulatorTab]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        const embed = {
            title: "New Discord Bot Lead",
            color: 2450411, // Royal blue
            fields: [
                { name: "Name", value: formData.name, inline: true },
                { name: "Email", value: formData.email, inline: true },
                { name: "Discord Username", value: formData.discord || "Not provided", inline: true },
                { name: "Budget Range", value: formData.budget, inline: true },
                { name: "Expected Timeline", value: formData.timeline, inline: true },
                { name: "Project Requirements", value: formData.description }
            ],
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] })
            });

            if (response.ok) {
                setSubmitResult("success");
                setFormData({
                    name: "",
                    email: "",
                    discord: "",
                    description: "",
                    budget: "$300 - $1,000",
                    timeline: "2-3 Weeks"
                });
                trackEvent("discord_bot_lead_submit", {
                    budget: formData.budget,
                    timeline: formData.timeline
                });
            } else {
                setSubmitResult("failed");
            }
        } catch (error) {
            console.error("Form submit failed:", error);
            setSubmitResult("failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quick Quote form states
    const [quickFormData, setQuickFormData] = useState({
        name: "",
        contact: "",
        idea: ""
    });
    const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
    const [quickSubmitResult, setQuickSubmitResult] = useState<string | null>(null);

    const handleQuickFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsQuickSubmitting(true);
        setQuickSubmitResult(null);

        const embed = {
            title: "Quick 60s Discord Bot Lead",
            color: 2450411,
            fields: [
                { name: "Name", value: quickFormData.name, inline: true },
                { name: "Contact (Discord/Email)", value: quickFormData.contact, inline: true },
                { name: "Bot Idea", value: quickFormData.idea }
            ],
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] })
            });

            if (response.ok) {
                setQuickSubmitResult("success");
                setQuickFormData({
                    name: "",
                    contact: "",
                    idea: ""
                });
                trackEvent("discord_bot_lead_submit", {
                    type: "quick_quote"
                });
            } else {
                setQuickSubmitResult("failed");
            }
        } catch (error) {
            console.error("Quick Form submit failed:", error);
            setQuickSubmitResult("failed");
        } finally {
            setIsQuickSubmitting(false);
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <div className="bg-[#fafaf9] text-slate-900 min-h-screen selection:bg-blue-600 selection:text-white">
                
                {/* 1. HERO SECTION */}
                <section 
                    className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-white border-b border-slate-200/80"
                    style={{ 
                        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", 
                        backgroundSize: "24px 24px" 
                    }}
                >
                    <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-6 space-y-6 text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 uppercase tracking-wider shadow-xs">
                                <Bot className="w-3.5 h-3.5 text-blue-600" />
                                <span>Custom Discord Bot Engineering</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black font-heading leading-tight tracking-tight text-slate-950">
                                High-Performance Discord Bots Engineered for <span style={{ color: "#2563eb" }}>Your Community</span>
                            </h1>

                            <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed">
                                Commission high-performance Discord automation systems. Tailor-made moderation, ticket queues, OAuth2 captcha verification, and AI assistants with 100% source code ownership.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Button
                                    onClick={() => {
                                        const el = document.getElementById("quote-form");
                                        el?.scrollIntoView({ behavior: "smooth" });
                                        trackEvent("hero_cta_click", { action: "get_quote" });
                                    }}
                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                    className="hover:opacity-90 font-bold px-8 h-[52px] text-base rounded-xl shadow-sm transition-all"
                                >
                                    <span>Discuss Your Bot Architecture</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                
                                <Button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("openLiveChat"));
                                        trackEvent("hero_cta_click", { action: "discord_chat_open" });
                                    }}
                                    variant="outline"
                                    className="inline-flex items-center justify-center gap-2.5 font-bold px-8 h-[52px] text-base border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-xs"
                                >
                                    <img src="/discord.svg" alt="Discord" className="w-5 h-5" />
                                    <span>Live Chat in Discord UI</span>
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600">
                                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Replies under 2 hours</span>
                                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Free technical consultation</span>
                                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Fixed sprint pricing</span>
                                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> 100% Source code handover</span>
                            </div>
                        </m.div>

                        {/* Interactive UI Mockup */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-6 relative"
                        >
                            <div className="relative mx-auto max-w-[520px] aspect-video bg-white border border-slate-200 rounded-2xl p-5 shadow-lg overflow-hidden">
                                {/* Discord Header Simulation */}
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                        <span className="ml-3 font-semibold text-slate-900"># production-gateway-metrics</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Active Node
                                    </span>
                                </div>

                                {/* Simulated Bot Stats Card */}
                                <div className="grid grid-cols-3 gap-3 pt-3">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="text-[11px] text-slate-500 font-medium">Uptime SLA</div>
                                        <div className="text-lg font-black text-emerald-600">99.99%</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="text-[11px] text-slate-500 font-medium">Gateway Latency</div>
                                        <div className="text-lg font-black" style={{ color: "#2563eb" }}>14 ms</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="text-[11px] text-slate-500 font-medium">Events Handled</div>
                                        <div className="text-lg font-black text-slate-900">458,912</div>
                                    </div>
                                </div>

                                {/* Graph Mockup */}
                                <div className="mt-4 bg-slate-50 rounded-xl p-3.5 border border-slate-200 h-[105px] flex flex-col justify-between">
                                    <div className="text-xs font-semibold text-slate-700 flex justify-between items-center">
                                        <span>Active API Invocations / Min</span>
                                        <span className="text-emerald-700 text-[11px] flex items-center gap-1 font-bold">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2 h-12 pt-2 px-1">
                                        <div className="w-full bg-blue-200 rounded-t-sm h-[30%]" />
                                        <div className="w-full bg-blue-200 rounded-t-sm h-[45%]" />
                                        <div className="w-full bg-blue-300 rounded-t-sm h-[60%]" />
                                        <div className="w-full bg-blue-300 rounded-t-sm h-[50%]" />
                                        <div className="w-full bg-blue-400 rounded-t-sm h-[75%]" />
                                        <div className="w-full bg-blue-600 rounded-t-sm h-[95%]" />
                                        <div className="w-full bg-blue-500 rounded-t-sm h-[85%]" />
                                    </div>
                                </div>
                            </div>

                            {/* Accent badge floating */}
                            <div className="absolute -bottom-4 -left-4 bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-md">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-slate-500 font-medium">OAuth2 Gatekeeper</div>
                                    <div className="text-xs font-bold text-slate-900">Verified & Hardened</div>
                                </div>
                            </div>
                        </m.div>
                    </div>
                </section>

                {/* 2. TRUST BAR */}
                <section className="py-6 bg-[#fafaf9] border-b border-slate-200 relative z-10">
                    <div className="container mx-auto px-6 flex flex-wrap justify-around items-center gap-6 text-slate-600 font-medium text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex text-amber-400">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </span>
                            <span className="text-slate-900 font-bold">24+ Verified Bot Reviews</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-900 font-bold">160+ Commercial Clients</span> (202+ Orders Delivered)
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <span>Clients Across US, Germany, Austria & UK</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-900 font-bold">4+ Years Engineering Experience</span>
                        </div>
                    </div>
                </section>

                {/* 2.1 QUICK QUOTE FORM SECTION (CRO Optimization) */}
                <section className="py-12 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="bg-[#fafaf9] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-2 text-left max-w-md">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Direct Engineer Intake</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-950">
                                        Get a Bot Scope & Quote in 60 Seconds
                                    </h2>
                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                                        No long forms. Share your name, contact handle, and core requirement. Hazrat will reply with an architectural breakdown within 2 hours.
                                    </p>
                                </div>
                                <form onSubmit={handleQuickFormSubmit} className="w-full md:max-w-md space-y-3 text-left">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label htmlFor="quick-name" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Name</label>
                                            <Input
                                                id="quick-name"
                                                type="text"
                                                placeholder="Your Name"
                                                value={quickFormData.name}
                                                onChange={(e) => setQuickFormData({ ...quickFormData, name: e.target.value })}
                                                required
                                                className="bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600 h-10 text-xs rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="quick-contact" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Discord or Email</label>
                                            <Input
                                                id="quick-contact"
                                                type="text"
                                                placeholder="handle or email"
                                                value={quickFormData.contact}
                                                onChange={(e) => setQuickFormData({ ...quickFormData, contact: e.target.value })}
                                                required
                                                className="bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600 h-10 text-xs rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="quick-idea" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Bot Overview</label>
                                        <Input
                                            id="quick-idea"
                                            type="text"
                                            placeholder="e.g. ticket queue with Stripe payment role syncing..."
                                            value={quickFormData.idea}
                                            onChange={(e) => setQuickFormData({ ...quickFormData, idea: e.target.value })}
                                            required
                                            className="bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600 h-10 text-xs rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isQuickSubmitting}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 font-bold h-10 text-xs rounded-xl shadow-sm transition-opacity"
                                    >
                                        {isQuickSubmitting ? "Sending Request..." : "Request Technical Scope"}
                                    </Button>

                                    {quickSubmitResult === "success" && (
                                        <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs font-semibold text-center mt-2">
                                            ✔ Inquiry received! Hazrat will review and reach out shortly.
                                        </p>
                                    )}
                                    {quickSubmitResult === "failed" && (
                                        <p className="text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl text-xs font-semibold text-center mt-2">
                                            ✗ Failed to send. Please contact hazratummar9@gmail.com directly.
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2.5 MEET YOUR DEVELOPER */}
                <section id="developer" className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                                <div className="shrink-0 relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-md z-10 relative bg-slate-100">
                                        <img src="/images/founder.jpg" alt="Hazrat Ummar Shaikh" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm z-20 text-slate-800">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-950 font-heading">
                                            Meet Hazrat Ummar Shaikh, Lead Bot Engineer
                                        </h2>
                                        <p className="text-slate-600 mt-2.5 text-sm leading-relaxed">
                                            Over the past <strong>4+ years</strong>, I have specialized as a dedicated software engineer constructing custom Discord automation platforms, high-throughput webhook routers, and payment gatekeepers.
                                        </p>
                                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                            Every bot is engineered with modular Cogs, async SQLite/PostgreSQL/MongoDB backends, and full Linux VPS deployment setups. Explore my architectural deep dives on the <a href="/blog" className="text-blue-600 font-bold hover:underline">technical blog</a> or inspect my public work on <a href="https://github.com/ihazratummar" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">GitHub</a>.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5 pt-1">
                                        <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                            <span>Studio Lead</span>
                                        </span>
                                        <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-blue-600" /> &lt; 2h Response SLA
                                        </span>
                                        <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-amber-500" /> 160+ Verified Projects
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. PROBLEM SECTION */}
                <section id="problems" className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                                Eliminate Manual Moderation & Fragmented Bot Setups
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                                Running a large Discord community is demanding. When your team spends hours manually handling tickets, role assignment, and spam raids, community engagement suffers.
                            </p>
                        </m.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
                            <Card className="bg-white border border-rose-200 p-6 space-y-4 rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-950">
                                        The Fragmented Way
                                    </h3>
                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full">
                                        Before: 4+ hrs / day
                                    </span>
                                </div>
                                <ul className="space-y-3 text-slate-600 text-sm pt-2">
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Manually fighting spam accounts and verification bypass raids.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Answering repetitive support questions manually 24 hours a day.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Manually verifying PayPal/Stripe receipts and hand-assigning roles.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Relying on 4-6 different public bots with conflicting permissions.</span>
                                    </li>
                                </ul>
                            </Card>

                            <Card className="bg-white border-2 border-blue-600 p-6 space-y-4 rounded-2xl shadow-md relative overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-950">
                                        Custom RelayWorks Automation
                                    </h3>
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full">
                                        After: Fully Autonomous
                                    </span>
                                </div>
                                <ul className="space-y-3 text-slate-700 text-sm pt-2 font-medium">
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>Deterministic automated bot features built specifically for your server.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>OAuth2 captcha verification that blocks raid scripts natively.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>Instantaneous role sync triggered directly by Stripe or PayPal webhooks.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>Unified, single white-label bot carrying your community branding.</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>

                        {/* WHO THIS IS FOR / ISNT FOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 text-left border-t border-slate-200 pt-16">
                            <div className="bg-[#fafaf9] border border-slate-200 p-8 rounded-3xl shadow-xs">
                                <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-full text-xs mb-4">
                                    Ideal Match
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-heading mb-6">Who This Is For</h3>
                                <ul className="space-y-3.5 text-sm text-slate-700 font-medium">
                                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Gaming Communities & In-Game Marketplaces</li>
                                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> B2B SaaS Customer Communities & Support Desks</li>
                                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Paid Subscription Courses & Exclusive Masterminds</li>
                                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Creators, Streamers & Patreon Server Owners</li>
                                </ul>
                            </div>
                            
                            <div className="bg-[#fafaf9] border border-slate-200 p-8 rounded-3xl shadow-xs">
                                <div className="inline-block bg-slate-100 text-slate-600 border border-slate-300 font-bold px-3 py-1 rounded-full text-xs mb-4">
                                    Not Suitable
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-heading mb-6">Who This Isn&apos;t For</h3>
                                <ul className="space-y-3.5 text-sm text-slate-500">
                                    <li className="flex items-center gap-3"><X className="w-4 h-4 text-slate-400 shrink-0" /> Servers seeking a $20 copy-paste pre-made bot</li>
                                    <li className="flex items-center gap-3"><X className="w-4 h-4 text-slate-400 shrink-0" /> Teams requiring rushed 24-hour delivery without testing</li>
                                    <li className="flex items-center gap-3"><X className="w-4 h-4 text-slate-400 shrink-0" /> Communities content with generic third-party branding</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SERVICES CARDS */}
                <section id="services" className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 text-center max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                            Custom Engineering Capabilities
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-12">
                            Production-grade systems built around your specific Discord workflows.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Sparkles, name: "Custom Slash Commands", desc: "Deploy tailored commands to automate user actions, query live databases, and trigger business workflows." },
                                { icon: Terminal, name: "Stripe & PayPal Webhooks", desc: "Monetize your server with automated billing, recurring subscription checks, and instant role provisioning." },
                                { icon: Lock, name: "OAuth2 Gatekeeper Verification", desc: "Require web-based captcha verification to completely neutralize automated raid scripts before entry." },
                                { icon: MessageSquare, name: "Interactive Ticket Desks", desc: "Button-driven ticket channels with full HTML/TXT transcript backups and staff alerting mechanisms." },
                                { icon: Bot, name: "AI Assistants & Moderation", desc: "Integrate fine-tuned OpenAI or Claude models with customized knowledge bases to answer member queries 24/7." },
                                { icon: Webhook, name: "External API & Game Integrations", desc: "Bridge Discord directly to external databases, Minecraft/ARK servers, or custom web administrative dashboards." }
                            ].map((service, idx) => (
                                <Card key={idx} className="bg-white border border-slate-200 hover:shadow-md transition-all p-6 text-left space-y-3 rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                                        <service.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-950">{service.name}</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">{service.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. COMPARISON SECTION */}
                <section id="comparison" className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                            Why Commission a Custom Discord Bot?
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto mb-12 text-sm">
                            Public SaaS bots are heavily constrained, lock core features behind monthly subscriptions, and advertise external branding. A bespoke bot delivers complete autonomy.
                        </p>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-700">Feature</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-rose-600">Standard Public Bots</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-blue-600">RelayWorks Custom Bot</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
                                    <tr>
                                        <td className="p-4 font-semibold text-slate-900">Brand Identity</td>
                                        <td className="p-4 text-slate-500">Displays their logo, branding, and links</td>
                                        <td className="p-4 text-slate-900 font-semibold">100% white-labeled with your studio branding</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-slate-900">Cost Structure</td>
                                        <td className="p-4 text-slate-500">Recurring monthly subscription fee per server</td>
                                        <td className="p-4 text-slate-900 font-semibold">One-time development sprint; zero bot license fees</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-slate-900">Custom Integrations</td>
                                        <td className="p-4 text-slate-500">Locked to pre-defined templates</td>
                                        <td className="p-4 text-slate-900 font-semibold">Connects to your custom databases, APIs, or Stripe</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-slate-900">Performance & Hosting</td>
                                        <td className="p-4 text-slate-500">Shared multi-tenant clusters prone to lag</td>
                                        <td className="p-4 text-slate-900 font-semibold">Dedicated VPS hosting ensuring instant responses</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-slate-900">Feature Customization</td>
                                        <td className="p-4 text-slate-500">Impossible; feature requests ignored</td>
                                        <td className="p-4 text-slate-900 font-semibold">Expand and tailor commands as your community scales</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 6. INTERACTIVE SIMULATOR */}
                <section id="demo" className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                            Interactive Bot Command Sandbox
                        </h2>
                        <p className="text-slate-600 mb-8 max-w-lg mx-auto text-sm">
                            Click a command below to simulate how the bot processes slash commands inside an active Discord interface.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <Button
                                onClick={() => { setSimulatorTab("verify"); trackEvent("simulator_tab_click", { tab: "verify" }); }}
                                style={simulatorTab === "verify" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={simulatorTab === "verify" ? "font-bold h-10 px-5 rounded-xl shadow-xs" : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold h-10 px-5 rounded-xl shadow-xs"}
                            >
                                /verify
                            </Button>
                            <Button
                                onClick={() => { setSimulatorTab("ticket"); trackEvent("simulator_tab_click", { tab: "ticket" }); }}
                                style={simulatorTab === "ticket" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={simulatorTab === "ticket" ? "font-bold h-10 px-5 rounded-xl shadow-xs" : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold h-10 px-5 rounded-xl shadow-xs"}
                            >
                                /ticket open
                            </Button>
                            <Button
                                onClick={() => { setSimulatorTab("ai"); trackEvent("simulator_tab_click", { tab: "ai" }); }}
                                style={simulatorTab === "ai" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={simulatorTab === "ai" ? "font-bold h-10 px-5 rounded-xl shadow-xs" : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold h-10 px-5 rounded-xl shadow-xs"}
                            >
                                /ask-ai
                            </Button>
                        </div>

                        {/* Discord Chat window simulation */}
                        <div className="bg-[#f2f3f5] rounded-2xl border border-slate-300 overflow-hidden text-left shadow-md">
                            {/* Discord Channel Header */}
                            <div className="bg-[#e3e5e8] px-4 py-3 border-b border-slate-300 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                    <span className="text-slate-500 font-black">#</span>
                                    <span>sandbox-bot-testing</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500">Live Gateway</span>
                            </div>

                            {/* Chat Messages container */}
                            <div className="p-6 space-y-6 min-h-[280px]">
                                {isTyping ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="text-slate-500 text-xs italic">CustomBot is typing...</div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                msg.sender === "user" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                            }`}>
                                                {msg.sender === "user" ? "USR" : "BOT"}
                                            </div>

                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-slate-900">
                                                        {msg.sender === "user" ? "ClientAdmin#0001" : "RelayBot"}
                                                    </span>
                                                    {msg.sender === "bot" && (
                                                        <span style={{ backgroundColor: "#2563eb", color: "#ffffff" }} className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                                            Bot
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                {msg.text && (
                                                    <p className={msg.isCommand ? "text-blue-700 font-semibold text-xs" : "text-slate-700 text-xs leading-relaxed"}>
                                                        {msg.text}
                                                    </p>
                                                )}

                                                {msg.embed && (
                                                    <div className="border-l-4 border-blue-600 bg-white p-4 rounded-r-xl max-w-[520px] space-y-3 mt-2 shadow-xs">
                                                        <div className="font-bold text-slate-950 text-sm">{msg.embed.title}</div>
                                                        <div className="text-xs text-slate-600 leading-relaxed">{msg.embed.description}</div>

                                                        {msg.embed.fields && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                                {msg.embed.fields.map((f: any, fIdx: number) => (
                                                                    <div key={fIdx} className="space-y-1">
                                                                        <div className="text-[11px] font-bold text-slate-900">{f.name}</div>
                                                                        <div className="text-xs text-slate-600" dangerouslySetInnerHTML={{ __html: f.value }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {msg.embed.actions && (
                                                            <div className="flex gap-2 pt-2">
                                                                <Button
                                                                    onClick={() => {
                                                                        setMessages(prev => [
                                                                            ...prev,
                                                                            { sender: "system", text: "Security challenge passed. Welcome to the server." }
                                                                        ]);
                                                                        trackEvent("simulator_action_click", { action: "verify_success" });
                                                                    }}
                                                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                                    className="hover:opacity-90 font-semibold text-xs px-3.5 h-8 rounded-lg"
                                                                >
                                                                    Verify Me
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. PORTFOLIO CASE STUDIES */}
                <section id="portfolio" className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                                Proven Discord Engineering Case Studies
                            </h2>
                            <p className="text-slate-600 max-w-xl mx-auto text-sm">
                                Review how custom automation solved critical moderation, economy, and matchmaking challenges for real communities.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {caseStudies.map((study, idx) => (
                                <m.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="p-6 md:p-8 bg-[#fafaf9] border border-slate-200 hover:shadow-md transition-all rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                                >
                                    <div className="lg:col-span-8 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                                                {study.industry}
                                            </span>
                                            <h3 className="text-slate-950 font-bold text-lg md:text-xl font-heading">{study.name}</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-200">
                                                <div className="text-rose-700 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                                                    <X className="w-3.5 h-3.5 text-rose-500" /> The Problem
                                                </div>
                                                <p className="text-slate-600 text-xs leading-relaxed">{study.problem}</p>
                                            </div>
                                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-200">
                                                <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> The Solution
                                                </div>
                                                <p className="text-slate-600 text-xs leading-relaxed">{study.solution}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Key Modules Implemented</div>
                                            <div className="flex flex-wrap gap-2">
                                                {study.features.map((feat, fIdx) => (
                                                    <span key={fIdx} className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-medium">
                                                        {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 self-stretch flex flex-col gap-4 justify-center">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 shadow-xs">
                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Result Achieved</div>
                                            <div className="text-2xl font-black text-slate-950">{study.result.split('.')[0]}</div>
                                            <p className="text-slate-600 text-xs leading-relaxed">{study.result.substring(study.result.indexOf('.') + 1).trim()}</p>
                                        </div>

                                        <a
                                            href={
                                                idx === 0 ? "https://github.com/HazratTech/Nexa" :
                                                idx === 1 ? "https://github.com/ihazratummar/OPShop-Discord-Bot" :
                                                "https://github.com/ihazratummar/Vinnies-Bot"
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white rounded-xl border border-slate-300 hover:border-slate-400 flex items-center justify-center gap-2.5 text-center p-3.5 shadow-xs transition-colors group"
                                        >
                                            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
                                            <span className="text-slate-800 group-hover:text-slate-950 text-xs font-bold">Inspect Source Code ↗</span>
                                        </a>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. SCREENSHOTS GALLERY */}
                <section id="screenshots" className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-950">
                                Real Production Interfaces & Control Panels
                            </h2>
                            <p className="text-slate-600 max-w-xl mx-auto text-sm">
                                Actual screenshots from deployed production bots: web admin panels, verification flows, and operational analytics.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Discord Client Interface",
                                    desc: "Interactive verifier buttons and embed logs displaying directly inside Discord channels.",
                                    url: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/06/47698adc-1625-4229-8f5d-e36513906816"
                                },
                                {
                                    title: "Custom Bot Control Dashboard",
                                    desc: "Web interface built for server administrators to fine-tune bot modules and track activities.",
                                    url: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/06/76cbb685-6aba-4693-a892-d28b099a93cf"
                                },
                                {
                                    title: "Real-time Analytics Panel",
                                    desc: "Mobile-responsive portal tracking detailed usage analytics, API logs, and server stats.",
                                    url: "https://minio-api.hazratdev.top/692ad2d770e2d6c86034e690-myfolio-38e4028f/uploads/2026/06/8442f1ae-68a7-49b0-8879-131dd1ee9151"
                                }
                            ].map((img, idx) => (
                                <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between text-left shadow-xs">
                                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={img.url}
                                            alt={img.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-5 space-y-1.5">
                                        <h3 className="font-bold text-sm text-slate-950">{img.title}</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{img.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 9. WHY CHOOSE RELAYWORKS */}
                <section className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-left">
                            <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-950">
                                Why Partner with RelayWorks for Your Bot?
                            </h2>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                We avoid fragile, unmaintained templates. Every system is engineered in clean, async Python or TypeScript designed to withstand high gateway traffic spikes.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "High-Throughput Gateway Reliability", desc: "Designed with async match managers, thread-safe locks, and optimal gateway handling." },
                                    { title: "Third-Party API Integration", desc: "Native linking to Stripe, PayPal, OpenAI, PostgreSQL, or game servers." },
                                    { title: "Turnkey Deployment & PM2 Setup", desc: "Delivered with complete systemd/PM2 service configs and step-by-step documentation." },
                                    { title: "100% Clean Code Ownership", desc: "You receive full copyright and complete source code repository access upon project sign-off." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                                            <div className="text-slate-600 text-xs leading-relaxed">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive UI Display */}
                        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl text-left">
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                                <span className="font-mono font-bold text-slate-200">relayworks-gateway.py</span>
                                <span className="text-emerald-400 flex items-center gap-1.5 text-[11px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operational
                                </span>
                            </div>
                            <div className="space-y-2 font-mono text-xs text-slate-300">
                                <p className="text-slate-500"># Initializing modular cogs...</p>
                                <p className="text-emerald-400">✔ Database connection successful: MongoDB Atlas</p>
                                <p className="text-emerald-400">✔ Stripe Webhook router listening on port 8000</p>
                                <p className="text-emerald-400">✔ OpenAI contextual guardrails loaded</p>
                                <p className="text-blue-400">✔ 28 slash commands synchronized with Discord API</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. TESTIMONIALS */}
                <section className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                                Verified Server Owner Feedback
                            </h2>
                            <p className="text-slate-600 max-w-lg mx-auto text-sm">
                                Direct reviews from Discord community administrators and founders.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(reviews.length > 0 ? reviews.filter(r => r.content.toLowerCase().includes("bot") || r.content.toLowerCase().includes("discord") || r.role.toLowerCase().includes("bot") || reviews.length <= 4) : [
                                { name: "sgtgonzo", role: "United States", content: "Amazing work! Speedy and meticulous. Answered all my questions, explained and demonstrated how my bot worked, outstanding job.", rating: 5 },
                                { name: "afcumerma", role: "United States", content: "Hazrat created a custom mission creation bot for my Discord community of 600+ members, specifically for the Star Citizen space MMO.", rating: 5 },
                                { name: "frescher", role: "Germany", content: "Working with Hazrat was a pleasure. He asked many questions about the details to make sure I got the functionality that I need. Clear recommendation!", rating: 5 },
                                { name: "samswa", role: "Austria", content: "Did a great job setting up a custom bot in our discord server! 10/10", rating: 5 }
                            ]).slice(0, 4).map((review, idx) => (
                                <div key={idx} className="bg-white border-l-4 border-l-blue-600 border border-slate-200 rounded-r-2xl p-6 text-left shadow-xs space-y-4">
                                    <div className="flex gap-1">
                                        {[...Array(review.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 italic text-sm leading-relaxed">
                                        &ldquo;{review.content}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                        <div style={{ backgroundColor: "#2563eb", color: "#ffffff" }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                            {review.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-xs text-slate-900">{review.name}</div>
                                            <div className="text-[11px] text-slate-500">{review.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 11. PRICING GUIDANCE */}
                <section id="pricing" className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-4 text-slate-950">
                            Transparent Milestone Sprints
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto mb-12 text-sm">
                            Fixed-price project scopes with milestone delivery. No ongoing bot subscription fees.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {[
                                {
                                    name: "Starter Utility Bot",
                                    price: "$149",
                                    desc: "Ideal for basic server moderation, custom slash commands, and welcome verification.",
                                    features: [
                                        "Automated moderation filters",
                                        "Custom slash command suite",
                                        "Welcome canvas image generation",
                                        "Linux PM2 setup guide"
                                    ]
                                },
                                {
                                    name: "Advanced Automation",
                                    price: "$349",
                                    desc: "Complete community operations with billing, tickets, and external database sync.",
                                    features: [
                                        "Stripe / PayPal webhook role sync",
                                        "Interactive ticket queue with transcripts",
                                        "OAuth2 captcha verification system",
                                        "30 days warranty & active support",
                                        "100% full source code ownership"
                                    ],
                                    popular: true
                                },
                                {
                                    name: "Enterprise / AI Architecture",
                                    price: "$750+",
                                    desc: "Complex architectures linked with private databases, AI assistants, or web panels.",
                                    features: [
                                        "OpenAI contextual fine-tuning",
                                        "External REST API / PostgreSQL linking",
                                        "Web-based admin control panel",
                                        "High-throughput load optimization",
                                        "Turnkey server deployment"
                                    ]
                                }
                            ].map((tier, idx) => (
                                <Card 
                                    key={idx} 
                                    className={`bg-white border p-6 flex flex-col justify-between rounded-2xl relative shadow-sm ${
                                        tier.popular ? "border-2 border-blue-600 shadow-md" : "border-slate-200"
                                    }`}
                                >
                                    {tier.popular && (
                                        <span 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="absolute top-[-12px] left-6 text-white text-[10px] uppercase font-black px-3 py-0.5 rounded-full tracking-wider shadow-xs"
                                        >
                                            Most Popular
                                        </span>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-950 font-heading">{tier.name}</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{tier.desc}</p>
                                        </div>
                                        <div className="py-2 border-y border-slate-100">
                                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Fixed Sprint Fee</span>
                                            <div className="text-3xl font-black text-slate-950 mt-0.5">{tier.price}</div>
                                        </div>
                                        <ul className="space-y-2.5 text-xs text-slate-700">
                                            {tier.features.map((feat, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-2">
                                                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const el = document.getElementById("quote-form");
                                            el?.scrollIntoView({ behavior: "smooth" });
                                            setFormData(prev => ({
                                                ...prev,
                                                budget: tier.name === "Starter Utility Bot"
                                                    ? "$100 - $300"
                                                    : tier.name === "Advanced Automation"
                                                        ? "$300 - $1,000"
                                                        : "$1,000+"
                                            }));
                                            trackEvent("pricing_cta_click", { tier: tier.name });
                                        }}
                                        style={tier.popular ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                        className={`w-full mt-6 font-bold h-11 text-xs rounded-xl shadow-xs ${
                                            tier.popular
                                                ? "hover:opacity-90 text-white"
                                                : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
                                        }`}
                                    >
                                        Select {tier.name}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 12. PROCESS FLOW */}
                <section className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-12 text-slate-950">
                            Predictable 5-Step Delivery Flow
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { step: "01", name: "Submit Spec", desc: "Detail your required commands and bot architecture." },
                                { step: "02", name: "Technical Review", desc: "I map database schemas, APIs, and permissions." },
                                { step: "03", name: "Fixed Proposal", desc: "Receive a transparent sprint quote within 24 hours." },
                                { step: "04", name: "Active Build", desc: "Modular Python development with staging updates." },
                                { step: "05", name: "Deploy & Handover", desc: "Linux VPS deployment and 100% source code transfer." }
                            ].map((proc, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 text-left shadow-xs">
                                    <div className="text-2xl font-black text-blue-600/40 font-heading">{proc.step}</div>
                                    <h3 className="font-bold text-sm text-slate-950">{proc.name}</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">{proc.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 13. FAQ SECTION */}
                <section id="faq" className="py-20 bg-white border-b border-slate-200/80">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black font-heading mb-10 text-center text-slate-950">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
                            {[
                                { q: "How to make a custom Discord bot for my server?", a: "To create a custom Discord bot, you register an application on the Discord Developer Portal, write the asynchronous event handlers (in Python or TypeScript), and deploy it to a server. By engaging RelayWorks, you receive a production-hardened bot engineered to your exact specifications without the burden of maintenance." },
                                { q: "What are custom commands on a Discord bot?", a: "Custom slash commands allow you to build workflows specific to your server — such as querying internal databases, synchronizing billing tiers, or issuing automated support channels. Generic public bots cannot provide this level of personalized logic." },
                                { q: "Why choose customizable bots for Discord over public ones?", a: "Customizable bots ensure 100% white-label identity (your bot avatar, name, and presence), zero recurring per-server subscription fees, and dedicated execution without third-party rate limits." },
                                { q: "Do you host the bot for me?", a: "I configure the bot to run 24/7 on a Linux VPS using the PM2 process manager. If you already maintain a server, I deploy directly to your infrastructure; otherwise, I guide you through free or low-cost VPS setups." },
                                { q: "What language and libraries do you build in?", a: "I build Discord bots primarily in asynchronous Python (discord.py or nextcord) and TypeScript for maximum execution performance and full support for modern Discord UI components." },
                                { q: "Do I get full ownership of the source code?", a: "Yes, 100%. Upon sprint completion and sign-off, you receive full copyright ownership of all code files, database schemas, and configuration assets." },
                                { q: "How long does it take to deliver a bot sprint?", a: "Standard utility bots are typically delivered in 3–5 days. Advanced payment and ticket automations take 7–14 days. Complex multi-database systems take 2–3 weeks." },
                                { q: "Can we expand the bot features in the future?", a: "Yes. All bots are built using modular Cogs architectures, making it straightforward to append new slash commands, database tables, or third-party APIs as your community expands." }
                            ].map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-slate-200 pb-4 cursor-pointer"
                                    onClick={() => {
                                        setOpenFaq(openFaq === idx ? null : idx);
                                        trackEvent("faq_accordion_click", { question: faq.q });
                                    }}
                                >
                                    <div className="flex justify-between items-center py-2 text-left">
                                        <h3 className="font-bold text-slate-950 text-base md:text-lg flex items-center gap-2.5">
                                            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>{faq.q}</span>
                                        </h3>
                                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                                    </div>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out pl-6 text-left ${
                                            openFaq === idx ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                                        }`}
                                    >
                                        <p className="text-slate-600 text-sm leading-relaxed pb-2">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 14. CONTACT / QUOTE FORM */}
                <section id="quote-form" className="py-20 bg-[#fafaf9] border-b border-slate-200/80 relative">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-black font-heading mb-3 text-slate-950">
                                Commission Your Custom Discord Bot
                            </h2>
                            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                                Share your project requirements below to receive a technical architecture breakdown and fixed milestone quote within 2 hours.
                            </p>
                        </div>

                        {/* Fast Track Calendly Box */}
                        <div className="flex flex-col md:flex-row items-center justify-between bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 mb-8 shadow-xs">
                            <div className="text-left mb-4 md:mb-0">
                                <h3 className="text-slate-950 font-bold text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" /> Prefer a Direct Voice Discovery?
                                </h3>
                                <p className="text-slate-600 text-xs mt-1">Book a direct 15-minute architecture conversation with lead engineer Hazrat.</p>
                            </div>
                            <a
                                href="https://calendly.com/hazratummarsk9/book-15-minutes"
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => trackEvent("calendly_click")}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="shrink-0 font-bold text-xs px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-xs"
                            >
                                Schedule 15 Min ↗
                            </a>
                        </div>

                        <Card className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-name" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Name</label>
                                        <Input
                                            id="lead-name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your Name"
                                            required
                                            className="bg-white border-slate-300 text-slate-900 rounded-xl h-11 text-sm focus:border-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-email" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Work Email</label>
                                        <Input
                                            id="lead-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="name@domain.com"
                                            required
                                            className="bg-white border-slate-300 text-slate-900 rounded-xl h-11 text-sm focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-discord" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discord Handle</label>
                                        <Input
                                            id="lead-discord"
                                            value={formData.discord}
                                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                                            placeholder="username"
                                            required
                                            className="bg-white border-slate-300 text-slate-900 rounded-xl h-11 text-sm focus:border-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-budget" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated Budget</label>
                                        <select
                                            id="lead-budget"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        >
                                            <option value="Starts at $149">Starter Utility Bot (Starts at $149)</option>
                                            <option value="Starts at $349">Advanced Automation (Starts at $349)</option>
                                            <option value="Contact for Quote">Enterprise / AI Bot (Custom Scope)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="lead-timeline" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Target Timeline</label>
                                    <select
                                        id="lead-timeline"
                                        value={formData.timeline}
                                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="1 Week">Urgent (1 Week Delivery)</option>
                                        <option value="2-3 Weeks">Standard (2–3 Weeks Delivery)</option>
                                        <option value="1 Month+">Flexible (1 Month+ Delivery)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="lead-desc" className="text-xs font-bold text-slate-800 uppercase tracking-wider">Bot Scope & Requirements</label>
                                    <Textarea
                                        id="lead-desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the required commands, payment integrations, verification workflows, or game servers..."
                                        required
                                        className="bg-white border-slate-300 text-slate-900 rounded-xl focus:border-blue-600 min-h-[120px] text-sm"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                    className="w-full hover:opacity-90 font-bold text-sm h-12 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-opacity"
                                >
                                    {isSubmitting ? "Submitting Requirements..." : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Send Project Requirements</span>
                                        </>
                                    )}
                                </Button>

                                {submitResult === "success" && (
                                    <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold text-center text-xs">
                                        ✔ Project request submitted! Hazrat will contact you within 2 hours.
                                    </p>
                                )}
                                {submitResult === "failed" && (
                                    <p className="text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl font-semibold text-center text-xs">
                                        ❌ Submission failed. Please email hazratummar9@gmail.com directly.
                                    </p>
                                )}
                            </form>
                        </Card>
                    </div>
                </section>

                {/* 15. FINAL CTA BANNER */}
                <section 
                    className="py-20 bg-white relative overflow-hidden"
                    style={{ 
                        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", 
                        backgroundSize: "24px 24px" 
                    }}
                >
                    <div className="container mx-auto px-6 text-center max-w-xl space-y-5 relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black font-heading leading-tight text-slate-950">
                            Ready to Build Your Custom Discord Bot?
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                            Stop manual moderation overhead, prevent raid scripts, automate billing, and grant verified roles instantly.
                        </p>
                        <div className="pt-2">
                            <Button
                                onClick={() => {
                                    const el = document.getElementById("quote-form");
                                    el?.scrollIntoView({ behavior: "smooth" });
                                    trackEvent("final_cta_click");
                                }}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="hover:opacity-90 font-bold text-base px-10 h-14 rounded-xl shadow-sm transition-all"
                            >
                                <span>Discuss Your Bot Architecture</span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Worldwide Delivery</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Secure Milestone Billing</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 100% Source Code</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 30-Day Warranty</span>
                        </div>
                    </div>
                </section>

            </div>
        </LazyMotion>
    );
};
