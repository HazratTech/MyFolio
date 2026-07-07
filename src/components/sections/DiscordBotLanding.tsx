"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Bot, Check, X, ShieldAlert, Sparkles, MessageSquare, Terminal,
    Webhook, Clock, Award, Star, ArrowRight, Send, HelpCircle, ChevronDown, CheckCircle2, Lock, Eye
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
    // Force dark mode class on root for this landing page
    useEffect(() => {
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
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
                    // Filter reviews that are relevant to bots if possible, otherwise display them
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
                            title: "🔐 Server Security Verification",
                            description: "To prevent spam and raid bots, please verify your account. Clicking verify will grant you access to all channels.",
                            color: "#5865F2",
                            fields: [
                                { name: "Step 1", value: "Click the green 'Verify Me' button below." },
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
                            title: "🎟️ Support Ticket Created",
                            description: "Your support request has been registered successfully. A private channel has been created for your issue.",
                            color: "#5865F2",
                            fields: [
                                { name: "Support Channel", value: "🔓 #ticket-0024" },
                                { name: "Estimated Response", value: "⚡ Less than 10 minutes" }
                            ]
                        }
                    }
                ]);
            } else if (simulatorTab === "ai") {
                setMessages([
                    { sender: "user", text: "/ask-ai how do I deploy my first bot?", isCommand: true },
                    { sender: "bot", text: "Thinking... 🧠" }
                ]);

                setTimeout(() => {
                    setMessages([
                        { sender: "user", text: "/ask-ai how do I deploy my first bot?", isCommand: true },
                        {
                            sender: "bot", text: "", embed: {
                                title: "🤖 Dev Assistant AI Response",
                                description: "To deploy your Discord bot, I recommend hosting on a Linux VPS using PM2 to keep it online 24/7. Here are the quick commands:",
                                color: "#5865F2",
                                fields: [
                                    { name: "1. Install PM2", value: "```bash\nnpm install pm2 -g\n```" },
                                    { name: "2. Start Bot", value: "```bash\npm2 start index.js --name \"my-bot\"\n```" },
                                    { name: "3. Monitor status", value: "Check status using `pm2 status` or logs using `pm2 logs`." }
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
            title: "🔥 New Discord Bot Lead",
            color: 5814783, // Discord blue-ish/cyan color
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

    return (
        <LazyMotion features={domAnimation}>
            <div className="bg-[#0f1012] text-[#f2f3f5] min-h-screen">
                {/* 1. HERO SECTION */}
                <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden bg-gradient-to-b from-[#111214] to-[#0f1012]">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#5865F2]/10 rounded-full blur-[160px] -z-10" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[140px] -z-10" />

                    <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-6 space-y-6 text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-xs font-semibold text-[#5865F2] uppercase tracking-wider">
                                <Bot className="w-3.5 h-3.5" /> Custom Discord Bot Development
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black font-heading leading-tight tracking-tight">
                                Custom Discord Bot Development Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-secondary">Your Community</span>
                            </h1>
                            <p className="text-[#dbdee1] text-lg md:text-xl max-w-xl">
                                Looking to <strong className="text-white">make a custom Discord bot</strong>? Hire an expert <strong className="text-white">Discord bot developer</strong> to automate moderation, support ticket systems, custom verification, and AI chatbots built specifically for your server.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Button
                                    onClick={() => {
                                        const el = document.getElementById("quote-form");
                                        el?.scrollIntoView({ behavior: "smooth" });
                                        trackEvent("hero_cta_click", { action: "get_quote" });
                                    }}
                                    className="bg-primary hover:bg-primary/95 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                >
                                    🚀 Discuss My Project
                                </Button>
                                <a
                                    href="#quote-form"
                                    onClick={() => trackEvent("hero_cta_click", { action: "discord_contact" })}
                                    className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 text-lg border border-white/10 hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <img src="/discord.svg" alt="Discord" className="w-5 h-5" />
                                    Message on Discord
                                </a>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-[#949ba4]">
                                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Replies within 24 hours</span>
                                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Free consultation</span>
                                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Fixed pricing</span>
                                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Source code included</span>
                            </div>
                        </m.div>

                        {/* Interactive UI Mockup */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-6 relative"
                        >
                            <div className="relative mx-auto max-w-[500px] aspect-video bg-[#1e1f22] border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                                {/* Discord Header Simulation */}
                                <div className="flex items-center gap-2 pb-3 border-b border-[#1f2023] text-xs text-[#949ba4]">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="ml-4 font-semibold text-[#f2f3f5]"># general-bot-dashboard</span>
                                </div>

                                {/* Simulated Bot Stats Card */}
                                <div className="text-center mb-1 mt-3">
                                    <span className="text-xs font-semibold text-[#949ba4] uppercase tracking-wider">Example bot dashboard</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <div className="bg-[#2b2d31] p-3 rounded-lg border border-white/5">
                                        <div className="text-xs text-[#949ba4]">Uptime</div>
                                        <div className="text-lg font-bold text-green-400">99.99%</div>
                                    </div>
                                    <div className="bg-[#2b2d31] p-3 rounded-lg border border-white/5">
                                        <div className="text-xs text-[#949ba4]">Gateway Latency</div>
                                        <div className="text-lg font-bold text-[#5865F2]">14 ms</div>
                                    </div>
                                    <div className="bg-[#2b2d31] p-3 rounded-lg border border-white/5">
                                        <div className="text-xs text-[#949ba4]">Tasks Executed</div>
                                        <div className="text-lg font-bold text-white">458,912</div>
                                    </div>
                                </div>

                                {/* Graph Mockup */}
                                <div className="mt-4 bg-[#2b2d31] rounded-lg p-3 border border-white/5 h-[100px] flex flex-col justify-between">
                                    <div className="text-xs font-semibold text-[#949ba4] flex justify-between">
                                        <span>Active API Requests / Minute</span>
                                        <span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live</span>
                                    </div>
                                    <div className="flex items-end gap-1.5 h-12 pt-2 px-1">
                                        <div className="w-full bg-[#5865F2]/40 rounded-t-sm h-[30%]" />
                                        <div className="w-full bg-[#5865F2]/40 rounded-t-sm h-[45%]" />
                                        <div className="w-full bg-[#5865F2]/40 rounded-t-sm h-[60%]" />
                                        <div className="w-full bg-[#5865F2]/40 rounded-t-sm h-[50%]" />
                                        <div className="w-full bg-[#5865F2]/70 rounded-t-sm h-[75%]" />
                                        <div className="w-full bg-[#5865F2] rounded-t-sm h-[95%]" />
                                        <div className="w-full bg-[#5865F2]/90 rounded-t-sm h-[85%]" />
                                    </div>
                                </div>
                            </div>
                            {/* Accent badge floating */}
                            <div className="absolute -bottom-4 -left-4 bg-[#232428] border border-white/10 p-3 rounded-xl flex items-center gap-3 shadow-xl">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-[#949ba4]">Verification System</div>
                                    <div className="text-xs font-bold text-white">Active & Secure</div>
                                </div>
                            </div>
                        </m.div>
                    </div>
                </section>

                {/* 2. TRUST BAR */}
                <section className="py-8 bg-[#18191c] border-y border-white/5 relative z-10 -mt-4">
                    <div className="container mx-auto px-6 flex flex-wrap justify-around items-center gap-6 text-[#949ba4] font-medium text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <span className="flex text-yellow-500"><Star className="w-4 h-4 fill-yellow-500" /><Star className="w-4 h-4 fill-yellow-500" /><Star className="w-4 h-4 fill-yellow-500" /><Star className="w-4 h-4 fill-yellow-500" /><Star className="w-4 h-4 fill-yellow-500" /></span>
                            <span className="text-white font-bold">24+ Verified Bot Reviews</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-white">Trusted by 160+ Clients</span> (202+ Orders)
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <span>Clients in 🇺🇸 USA 🇩🇪 Germany 🇦🇹 Austria</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 font-black" />
                            <span className="text-white">4+ Years Experience</span>
                        </div>
                    </div>
                </section>

                {/* 2.5 MEET YOUR DEVELOPER */}
                <section id="developer" className="py-20 bg-[#0f1012]">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="bg-[#1e1f22] border border-[#2f3136] rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#5865F2] to-secondary" />
                            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                                <div className="shrink-0 relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#2b2d31] overflow-hidden shadow-xl z-10 relative bg-[#2b2d31]">
                                        <img src="https://github.com/ihazratummar.png" alt="Hazrat Ummar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#232428] border border-white/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg z-20">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                            👋 Meet Hazrat, Your Expert Discord Developer
                                        </h2>
                                        <p className="text-[#dbdee1] mt-3">
                                            I've spent the last <strong>4+ years</strong> working as a professional <strong className="text-white">Discord bot developer</strong>, building <strong className="text-white">customizable bots for Discord</strong> server administrators.
                                        </p>
                                        <p className="text-[#dbdee1] mt-2">
                                            Whether you want to <strong className="text-white">create your own bot on Discord</strong> or need complex API integrations, I offer robust <strong className="text-white">discord bot development</strong> services. You can read my latest guides on our <a href="/blog" className="text-[#5865F2] hover:underline font-bold">tech blog</a> or view my full <a href="/" className="text-[#5865F2] hover:underline font-bold">software portfolio</a>.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <span className="bg-[#2b2d31] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                                            <span className="text-lg">🌍</span> Based in India
                                        </span>
                                        <span className="bg-[#2b2d31] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-blue-400" /> &lt; 24h Response
                                        </span>
                                        <span className="bg-[#2b2d31] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5 text-yellow-500" /> 160+ Happy Clients
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. PROBLEM SECTION */}
                <section id="problems" className="py-20 bg-[#111214] relative">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                                Stop Wasting Time Managing Server Tasks Manually
                            </h2>
                            <p className="text-[#dbdee1] max-w-2xl mx-auto">
                                Running a successful community is hard work. If your moderators spend their whole day running basic actions, you are losing members and efficiency.
                            </p>
                        </m.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
                            <Card className="bg-[#1e1f22] border border-[#2f3136] p-6 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        The Old Way
                                    </h3>
                                    <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded">Before: 4+ hours/day</span>
                                </div>
                                <ul className="space-y-3 text-[#dbdee1] text-sm pt-2">
                                    <li className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <span className="text-[#949ba4]">Manually fighting spam accounts and verification bypass raids.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <span className="text-[#949ba4]">Answering the exact same support questions manually, 24/7.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <span className="text-[#949ba4]">Manually assigning roles to premium users after receiving payments.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <span className="text-[#949ba4]">Disjointed tools and external dashboard tabs that don't talk.</span>
                                    </li>
                                </ul>
                            </Card>

                            <Card className="bg-[#1e1f22] border border-[#5865F2]/30 p-6 space-y-4 relative overflow-hidden shadow-[0_0_15px_rgba(88,101,242,0.1)]">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#5865F2]" />
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Custom Bot Discord Automation
                                    </h3>
                                    <span className="bg-[#5865F2]/20 text-[#5865F2] text-xs font-bold px-2.5 py-1 rounded">After: 20 mins/day</span>
                                </div>
                                <ul className="space-y-3 text-[#dbdee1] text-sm pt-2">
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">Develop bot Discord features</span> <span className="text-[#949ba4]">specifically optimized for your community's active channels.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">OAuth2 captcha verification</span> <span className="text-[#949ba4]">to block spambots automatically.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">Automatic role Sync</span> <span className="text-[#949ba4]">tied directly to Stripe or PayPal webhooks.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">Single customizable Discord bot</span> <span className="text-[#949ba4]">built for your exact server commands.</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>

                        {/* WHO THIS IS FOR / ISNT FOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 text-left border-t border-white/5 pt-16">
                            <div>
                                <div className="inline-block bg-green-500/10 text-green-400 font-bold px-3 py-1 rounded-full text-xs mb-4">Perfect Fit</div>
                                <h3 className="text-2xl font-bold text-white mb-6">Who This Is For</h3>
                                <ul className="space-y-4 text-sm text-white font-medium">
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Gaming Communities</li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> SaaS Products</li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Patreon Servers</li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Paid Courses & Masterminds</li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Startups</li>
                                </ul>
                            </div>
                            <div className="bg-[#161719] p-8 rounded-2xl border border-red-500/10">
                                <div className="inline-block bg-red-500/10 text-red-400 font-bold px-3 py-1 rounded-full text-xs mb-4">Not A Good Fit</div>
                                <h3 className="text-2xl font-bold text-white mb-6">Who This Isn't For</h3>
                                <ul className="space-y-4 text-sm text-[#949ba4]">
                                    <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Looking for a $20 pre-made bot</li>
                                    <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Need delivery by tomorrow</li>
                                    <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Just want a generic, unbranded bot</li>
                                </ul>
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <p className="text-white font-semibold text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Perfect if you need custom automation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SERVICES CARDS */}
                <section id="services" className="py-20 bg-[#0f1012]">
                    <div className="container mx-auto px-6 text-center max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-12 text-white">
                            Advanced Bot Capabilities Built For You
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Sparkles, name: "Custom Commands Discord Bot", desc: "Deploy customized bots with custom commands for Discord to automate user actions, search databases, or trigger complex workflows." },
                                { icon: Terminal, name: "Stripe & PayPal Payments", desc: "Monetize your community. Sell premium roles via a secure custom bot for Discord with automatic webhook sync." },
                                { icon: Lock, name: "OAuth2 Custom Verification", desc: "Ensure all members verify via web captcha. Block spambots natively before they can access your Discord custom commands." },
                                { icon: MessageSquare, name: "Automated Ticket Systems", desc: "Organized support desk ticket triggers with transcript saving and staff dashboard alerts." },
                                { icon: Bot, name: "Smart Auto-Moderation", desc: "Regex-based filters, link warnings, and custom moderation commands built into your dedicated bot." },
                                { icon: Webhook, name: "API & Webhook Integrations", desc: "Connect Discord directly with external APIs, databases, game servers, or custom website panels." }
                            ].map((service, idx) => (
                                <Card key={idx} className="bg-[#1e1f22] border border-[#2f3136] hover:border-[#5865F2]/40 transition-all p-6 text-left space-y-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center">
                                        <service.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-white">{service.name}</h3>
                                    <p className="text-[#dbdee1] text-sm">{service.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. COMPARISON SECTION */}
                <section id="comparison" className="py-20 bg-[#111214]">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                            Why Choose a Custom Discord Bot?
                        </h2>
                        <p className="text-[#dbdee1] max-w-xl mx-auto mb-12 text-sm">
                            Generic bots are heavily limited, charge monthly subscriptions, and show external branding. Partnering with a dedicated <strong className="text-white">Discord developer</strong> to <strong className="text-white">make a custom Discord bot</strong> gives you total custom commands control.
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-[#2f3136] bg-[#161719]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#2f3136] bg-white/5">
                                        <th className="p-4 font-bold text-white">Feature</th>
                                        <th className="p-4 font-bold text-red-400">Existing Public Bots</th>
                                        <th className="p-4 font-bold text-green-400">Your Custom Bot</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm text-[#dbdee1]">
                                    <tr>
                                        <td className="p-4 font-semibold text-white">Branding</td>
                                        <td className="p-4 text-[#949ba4]">Displays their logo, status text, and links</td>
                                        <td className="p-4 text-white">100% white-labeled (your logo, name, status)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-white">Pricing Model</td>
                                        <td className="p-4 text-[#949ba4]">Monthly subscription plans per server</td>
                                        <td className="p-4 text-white">One-time payment structure, zero monthly fees</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-white">Integrations</td>
                                        <td className="p-4 text-[#949ba4]">Pre-defined options only</td>
                                        <td className="p-4 text-white">Connects to Stripe, OpenAI, your database, or game APIs</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-white">Scalability</td>
                                        <td className="p-4 text-[#949ba4]">Share servers with thousands, causing lag spikes</td>
                                        <td className="p-4 text-white">Dedicated hosting ensures rapid, instantaneous response</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-white">Feature Requests</td>
                                        <td className="p-4 text-[#949ba4]">Not possible</td>
                                        <td className="p-4 text-white">Add or edit features exactly as your community grows</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>


                {/* 6. INTERACTIVE SIMULATOR */}
                <section id="demo" className="py-20 bg-[#0f1012]">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                            Test Drive The Bot Commands
                        </h2>
                        <p className="text-[#dbdee1] mb-10 max-w-lg mx-auto text-sm">
                            Click a command button below to see the bot process request inputs inside our simulated Discord channel.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                            <Button
                                onClick={() => { setSimulatorTab("verify"); trackEvent("simulator_tab_click", { tab: "verify" }); }}
                                className={simulatorTab === "verify" ? "bg-[#5865F2] text-white hover:bg-[#5865F2]/90 font-bold" : "bg-white/5 text-[#dbdee1] hover:bg-white/10 font-bold"}
                            >
                                🔐 /verify
                            </Button>
                            <Button
                                onClick={() => { setSimulatorTab("ticket"); trackEvent("simulator_tab_click", { tab: "ticket" }); }}
                                className={simulatorTab === "ticket" ? "bg-[#5865F2] text-white hover:bg-[#5865F2]/90 font-bold" : "bg-white/5 text-[#dbdee1] hover:bg-white/10 font-bold"}
                            >
                                🎟️ /ticket open
                            </Button>
                            <Button
                                onClick={() => { setSimulatorTab("ai"); trackEvent("simulator_tab_click", { tab: "ai" }); }}
                                className={simulatorTab === "ai" ? "bg-[#5865F2] text-white hover:bg-[#5865F2]/90 font-bold" : "bg-white/5 text-[#dbdee1] hover:bg-white/10 font-bold"}
                            >
                                🤖 /ask-ai
                            </Button>
                        </div>

                        {/* Discord Chat window simulation */}
                        <div className="bg-[#313338] rounded-xl border border-[#2f3136] overflow-hidden text-left shadow-2xl">
                            {/* Discord Channel Header */}
                            <div className="bg-[#2b2d31] px-4 py-3 border-b border-black/20 flex items-center gap-2">
                                <span className="text-[#949ba4] font-bold">#</span>
                                <span className="text-white font-bold text-sm">bot-testing-sandbox</span>
                            </div>

                            {/* Chat Messages container */}
                            <div className="p-6 space-y-6 min-h-[300px]">
                                {isTyping ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] font-black">🤖</div>
                                        <div className="text-[#949ba4] text-xs italic">Bot is typing...</div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${msg.sender === "user" ? "bg-orange-500/20 text-orange-400" : "bg-[#5865F2]/20 text-[#5865F2]"
                                                }`}>
                                                {msg.sender === "user" ? "U" : "BOT"}
                                            </div>

                                            {/* Text Content */}
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-[#f2f3f5]">
                                                        {msg.sender === "user" ? "User#1234" : "CustomBot"}
                                                    </span>
                                                    {msg.sender === "bot" && (
                                                        <span className="bg-[#5865F2] text-[10px] text-white px-1.5 py-0.5 rounded font-black uppercase">Bot</span>
                                                    )}
                                                    <span className="text-[10px] text-[#949ba4]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                {msg.text && (
                                                    <p className={msg.isCommand ? "text-[#00aff4] font-semibold text-sm" : "text-[#dbdee1] text-sm"}>
                                                        {msg.text}
                                                    </p>
                                                )}

                                                {/* Discord Rich Embed emulation */}
                                                {msg.embed && (
                                                    <div className="border-l-4 border-[#5865F2] bg-[#2b2d31] p-4 rounded-r-lg max-w-[520px] space-y-3 mt-2 shadow-md">
                                                        <div className="font-bold text-white text-base">{msg.embed.title}</div>
                                                        <div className="text-sm text-[#dbdee1]">{msg.embed.description}</div>

                                                        {msg.embed.fields && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                                {msg.embed.fields.map((f: any, fIdx: number) => (
                                                                    <div key={fIdx} className="space-y-1">
                                                                        <div className="text-xs font-bold text-[#f2f3f5]">{f.name}</div>
                                                                        <div className="text-sm text-[#dbdee1] dangerously-set" dangerouslySetInnerHTML={{ __html: f.value }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {msg.embed.actions && (
                                                            <div className="flex gap-2 pt-3">
                                                                <Button
                                                                    onClick={() => {
                                                                        setMessages(prev => [
                                                                            ...prev,
                                                                            { sender: "system", text: "✅ Security Challenge Passed! Welcome to the server." }
                                                                        ]);
                                                                        trackEvent("simulator_action_click", { action: "verify_success" });
                                                                    }}
                                                                    className="bg-[#248046] hover:bg-[#1a6535] text-white font-semibold text-xs px-3 py-1.5 h-8 rounded"
                                                                >
                                                                    Verify Me
                                                                </Button>
                                                                <Button className="bg-[#4e5058] hover:bg-[#6d6f78] text-white font-semibold text-xs px-3 py-1.5 h-8 rounded">
                                                                    Cancel
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
                <section id="portfolio" className="py-20 bg-[#111214]">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                                Proven Discord Case Studies
                            </h2>
                            <p className="text-[#dbdee1] max-w-xl mx-auto text-sm">
                                Explore how custom automation solved major moderation bottlenecks and payment collection issues for real server administrators.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {caseStudies.map((study, idx) => (
                                <m.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="p-6 md:p-8 bg-[#161719] border border-[#2f3136] hover:border-primary/20 transition-all rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                                >
                                    <div className="lg:col-span-8 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] px-2.5 py-0.5 rounded-full font-bold">
                                                {study.industry}
                                            </span>
                                            <span className="text-white font-bold text-xl">{study.name}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-red-400 font-bold flex items-center gap-1.5">
                                                    <X className="w-4 h-4 text-red-400" /> The Problem
                                                </div>
                                                <p className="text-[#dbdee1] text-xs">{study.problem}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-green-400 font-bold flex items-center gap-1.5">
                                                    <Check className="w-4 h-4 text-green-400" /> The Solution
                                                </div>
                                                <p className="text-[#dbdee1] text-xs">{study.solution}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <div className="text-xs font-bold text-[#dbdee1] mb-2 uppercase tracking-wide">Key Features Implemented</div>
                                            <div className="flex flex-wrap gap-2">
                                                {study.features.map((feat, fIdx) => (
                                                    <span key={fIdx} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-[#dbdee1]">
                                                        {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 self-stretch flex flex-col gap-4 justify-center">
                                        <div className="bg-[#2b2d31] p-6 rounded-xl border border-white/5 text-center space-y-2">
                                            <div className="text-xs font-semibold text-[#5865F2] uppercase tracking-wide">Results Accomplished</div>
                                            <div className="text-2xl font-black text-white">{study.result.split('.')[0]}</div>
                                            <p className="text-[#dbdee1] text-xs">{study.result.substring(study.result.indexOf('.') + 1).trim()}</p>
                                        </div>
                                        <a
                                            href={
                                                idx === 0 ? "https://github.com/HazratTech/Nexa" :
                                                idx === 1 ? "https://github.com/ihazratummar/OPShop-Discord-Bot" :
                                                "https://github.com/ihazratummar/Vinnies-Bot"
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#1e1f22] rounded-xl border border-[#2f3136] hover:border-[#5865F2]/40 flex items-center justify-center gap-3 text-center p-5 relative group shadow-inner transition-all"
                                        >
                                            <svg className="w-5 h-5 text-[#949ba4] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                            <span className="text-[#949ba4] group-hover:text-white text-sm font-semibold transition-colors">View Source Code →</span>
                                        </a>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* REAL SCREENSHOTS GALLERY SECTION */}
                <section id="screenshots" className="py-20 bg-[#0f1012] border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                                Inside Look: Bot Control Panels & Commands
                            </h2>
                            <p className="text-[#dbdee1] max-w-xl mx-auto text-sm">
                                Real screenshots from active projects. Fully custom web dashboards, system log structures, and Discord interfaces designed for my clients.
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
                                <div key={idx} className="bg-[#1e1f22] rounded-xl overflow-hidden border border-[#2f3136] group hover:border-[#5865F2]/40 transition-all flex flex-col justify-between text-left shadow-lg">
                                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                                        <img
                                            src={img.url}
                                            alt={img.title}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="p-5 space-y-2">
                                        <h3 className="font-bold text-sm text-white">{img.title}</h3>
                                        <p className="text-xs text-[#949ba4] leading-relaxed">{img.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. WHY CHOOSE RELAYWORKS */}
                <section className="py-20 bg-[#0f1012] border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                                Why Choose RelayWorks For Your Bot?
                            </h2>
                            <p className="text-[#dbdee1] text-sm">
                                We are not just copy-paste developers. We build production-grade automation systems using clean, scalable code that responds instantly to user activity.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "Production Scale Architect", desc: "Bots are built with optimal performance models, handling high gateway loads without lag spikes." },
                                    { title: "Third-Party API Expert", desc: "Integrate Stripe, PayPal, OpenAI, Minecraft, Steam, or databases seamlessly into chat nodes." },
                                    { title: "Direct Streamlined Support", desc: "Clean codebase configuration with detailed launch setups, PM2 configurations, and instructions." },
                                    { title: "Safe Code Ownership", desc: "You receive 100% of the compiled Python/TypeScript source files upon delivery with complete control." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left space-y-1">
                                            <div className="font-bold text-white text-sm">{item.title}</div>
                                            <div className="text-[#949ba4] text-xs">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive UI Display */}
                        <div className="relative bg-[#1e1f22] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between text-xs text-[#949ba4] border-b border-white/5 pb-4">
                                <span className="font-bold text-white">🚀 RelayWorks Bot Configuration</span>
                                <span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active</span>
                            </div>
                            <div className="space-y-3 font-mono text-xs text-[#5865F2] text-left">
                                <p className="text-[#949ba4]"># Initializing bot modules...</p>
                                <p className="text-green-400">✔ Database connection successful: MongoDB Atlas</p>
                                <p className="text-green-400">✔ Stripe Webhook endpoint listening on port 8000</p>
                                <p className="text-green-400">✔ OpenAI assistant fine-tuning context loaded</p>
                                <p className="text-[#a6accd]">Bot fully configured. Registering 24 slash commands...</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. TESTIMONIALS (REAL DATABASE INTEGRATION) */}
                <section className="py-20 bg-[#111214]">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                                Stories From Server Administrators
                            </h2>
                            <p className="text-[#dbdee1] max-w-lg mx-auto text-sm">
                                Real reviews fetched directly from RelayWorks client database.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {(reviews.length > 0 ? reviews.filter(r => r.content.toLowerCase().includes("bot") || r.content.toLowerCase().includes("discord") || r.role.toLowerCase().includes("bot") || reviews.length <= 4) : [
                                { name: "sgtgonzo", role: "United States", content: "Amazing work! Speedy and meticulous. Answered all my questions, explained and demonstrated how my bot worked, outstanding job.", rating: 5 },
                                { name: "afcumerma", role: "United States", content: "Hazrat created a custom \"mission creation\" bot for my Discord community of 600+ members, specifically for the Star Citizen space MMO.", rating: 5 },
                                { name: "frescher", role: "Germany", content: "Working with Hazrat was a pleasure. He asked many questions about the details to make sure I got the functionality that I need. Clear recommendation!", rating: 5 },
                                { name: "samswa", role: "Austria", content: "Did a great job setting up a custom bot in our discord server! 10/10", rating: 5 }
                            ]).slice(0, 6).map((review, idx) => (
                                <div key={idx} className="bg-[#2b2d31] border-l-4 border-l-[#5865F2] border-y border-r border-[#2f3136] hover:border-r-[#5865F2]/40 transition-all rounded-r-xl p-6 relative group text-left shadow-md">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(review.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>
                                    <p className="text-[#dbdee1] italic text-sm mb-6 leading-relaxed">
                                        "{review.content}"
                                    </p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                        <div className="w-9 h-9 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                                            {review.image ? (
                                                <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                                            ) : (
                                                review.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white">{review.name}</div>
                                            <div className="text-xs text-[#949ba4]">{review.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. PRICING GUIDANCE */}
                <section id="pricing" className="py-20 bg-[#0f1012]">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                            Simple, Value-Driven Pricing
                        </h2>
                        <p className="text-[#dbdee1] max-w-xl mx-auto mb-12 text-sm">
                            Invest in custom automation that drives engagement, saves moderation labor, and automates payment delivery. No recurring subscription fees.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {[
                                {
                                    name: "Basic Bot",
                                    price: "$100",
                                    desc: "Perfect for simple server administration, automated moderation, or social media webhook links.",
                                    features: [
                                        "Automated moderation filters",
                                        "Basic custom command lists",
                                        "Welcome banners & role setups",
                                        "Deployment documentation included"
                                    ]
                                },
                                {
                                    name: "Advanced Automation",
                                    price: "$300",
                                    desc: "Great for billing automations, custom ticket queues, leveling mechanisms, and advanced logs panels.",
                                    features: [
                                        "Stripe / PayPal payment syncing",
                                        "Interactive ticket setups",
                                        "Advanced verification systems",
                                        "30 days of active support",
                                        "Complete source code ownership"
                                    ],
                                    popular: true
                                },
                                {
                                    name: "Enterprise / AI Bot",
                                    price: "Contact Me",
                                    desc: "Fully customized systems integrated with external databases, OpenAI chatbots, or custom server panels.",
                                    features: [
                                        "OpenAI contextual fine-tuning",
                                        "External API / Database linking",
                                        "Full white-label administration panel",
                                        "Long-term SLA server support",
                                        "Optimized VPS server setup"
                                    ]
                                }
                            ].map((tier, idx) => (
                                <Card key={idx} className={`bg-[#1e1f22] border border-[#2f3136] p-6 flex flex-col justify-between relative shadow-lg ${tier.popular ? "border-primary/40 ring-1 ring-primary/30" : ""
                                    }`}>
                                    {tier.popular && (
                                        <span className="absolute top-[-12px] left-6 bg-primary text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                                            Most Popular
                                        </span>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{tier.name}</h3>
                                            <p className="text-[#949ba4] text-xs mt-1">{tier.desc}</p>
                                        </div>
                                        <div className="py-2 border-y border-white/5">
                                            <span className="text-xs text-[#949ba4]">
                                                {tier.price === "Contact Me" ? "Pricing Model" : "Starting from"}
                                            </span>
                                            <div className="text-3xl font-black text-white mt-1">{tier.price}</div>
                                        </div>
                                        <ul className="space-y-2.5 text-xs text-[#dbdee1]">
                                            {tier.features.map((feat, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-2">
                                                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
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
                                                budget: tier.name === "Basic Bot"
                                                    ? "$100 - $300"
                                                    : tier.name === "Advanced Automation"
                                                        ? "$300 - $1,000"
                                                        : "$1,000+"
                                            }));
                                            trackEvent("pricing_cta_click", { tier: tier.name });
                                        }}
                                        className={`w-full mt-6 font-bold ${tier.popular
                                            ? "bg-primary hover:bg-primary/95 text-white shadow-md"
                                            : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                            }`}
                                    >
                                        Select {tier.name}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 11. PROCESS FLOW */}
                <section className="py-20 bg-[#111214]">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-12 text-white">
                            Our Streamlined Bot Delivery Process
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
                            {[
                                { step: "01", name: "Submit Form", desc: "Send over your exact bot requirements using the form below." },
                                { step: "02", name: "Review", desc: "I review your needs and map out the required logic." },
                                { step: "03", name: "Within 24h", desc: "I reply with questions or a clear action plan." },
                                { step: "04", name: "Quotation", desc: "You receive a fixed-price quote and development timeline." },
                                { step: "05", name: "Development Begins", desc: "Code construction starts with regular updates." }
                            ].map((proc, idx) => (
                                <div key={idx} className="bg-[#161719] border border-[#2f3136] p-5 rounded-xl space-y-3 text-left relative shadow-sm">
                                    <div className="text-2xl font-black text-primary/30">{proc.step}</div>
                                    <h3 className="font-bold text-sm text-white">{proc.name}</h3>
                                    <p className="text-[#949ba4] text-xs leading-relaxed">{proc.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 12. FAQ SECTION */}
                <section id="faq" className="py-20 bg-[#0f1012]">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-10 text-center text-white">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
                            {[
                                { q: "How to make a custom Discord bot for my server?", a: "To make a custom Discord bot, you need to register a developer app on the Discord portal, write the logic (usually in Python or TypeScript), and host it on a server. By hiring an experienced Discord developer, you get a professionally built, 24/7 online bot tailored to your exact needs without any coding stress." },
                                { q: "What are custom commands on a Discord bot?", a: "Custom commands allow you to create interactions specific to your server's needs. You can trigger tasks like pulling stats, managing custom verification databases, or upgrading premium roles instantly. Generic public bots can't provide this level of personalized logic." },
                                { q: "Why choose customizable bots for Discord over public ones?", a: "Choosing customizable bots for Discord ensures 100% white-labeled branding (your bot logo and name), custom commands tailored exactly to your workflows, zero monthly pricing model bottlenecks, and dedicated hosting for fast performance." },
                                { q: "Do you host the bot for me?", a: "I configure the bot to run 24/7 on a Linux VPS server using PM2 manager. If you don't have hosting, I can guide you through setting up a server for free, or handle deployment for you." },
                                { q: "What language and library do you write bots in?", a: "I write high-performance Discord bots in Python (using discord.py or nextcord) to guarantee execution speed and complete support for the latest Discord slash commands and interactions." },
                                { q: "Do I get full ownership of the source code?", a: "Yes, 100%. Upon completion and final payment, you will receive all files, modules, and configurations. You own all rights to your bot's custom source code." },
                                { q: "How long does it take to deliver a bot?", a: "Basic bots take around 3-5 days. Advanced moderation or payment setups take 7-14 days. Complex enterprise/database-linked bots can take 2-3 weeks depending on criteria." },
                                { q: "Can we add new features to the bot in the future?", a: "Yes, the code is structured modularly using Cogs/command-handler layouts, making it incredibly simple to append new features, databases, or APIs later as your server scales." }
                            ].map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-white/10 pb-4 cursor-pointer"
                                    onClick={() => {
                                        setOpenFaq(openFaq === idx ? null : idx);
                                        trackEvent("faq_accordion_click", { question: faq.q });
                                    }}
                                >
                                    <div className="flex justify-between items-center py-2 text-left">
                                        <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                                            {faq.q}
                                        </h3>
                                        <ChevronDown className={`w-4 h-4 text-[#949ba4] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === idx && (
                                            <m.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-2 text-[#dbdee1] text-sm leading-relaxed pl-7 text-left"
                                            >
                                                {faq.a}
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 13. LEAD QUALIFYING CONTACT FORM */}
                <section id="quote-form" className="py-20 bg-[#111214] relative">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
                                Tell Me About Your Bot Idea
                            </h2>
                            <p className="text-[#dbdee1] max-w-md mx-auto text-sm">
                                Fill out our quick quote form to pre-qualify your project requirements and receive a transparent development quote within 24 hours.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between bg-[#1e1f22] border border-primary/20 rounded-xl p-6 mb-8 shadow-xl">
                            <div className="text-left mb-4 md:mb-0">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" /> Hate Filling Out Forms?
                                </h3>
                                <p className="text-[#949ba4] text-sm mt-1">Skip the queue and book a direct 15-minute consultation with me.</p>
                            </div>
                            <a
                                href="https://calendly.com/hazratummarsk9/book-15-minutes"
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => trackEvent("calendly_click")}
                                className="shrink-0 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.3)]"
                            >
                                Book 15 Minutes
                            </a>
                        </div>

                        <Card className="bg-[#1e1f22] border border-[#2f3136] p-6 md:p-8 rounded-2xl shadow-xl">
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label htmlFor="lead-name" className="text-xs font-semibold text-white uppercase tracking-wider">Your Name</label>
                                        <Input
                                            id="lead-name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your Name"
                                            required
                                            className="bg-black/20 border-[#2f3136] focus:border-primary text-white"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label htmlFor="lead-email" className="text-xs font-semibold text-white uppercase tracking-wider">Email Address</label>
                                        <Input
                                            id="lead-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            required
                                            className="bg-black/20 border-[#2f3136] focus:border-primary text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label htmlFor="lead-discord" className="text-xs font-semibold text-white uppercase tracking-wider">Discord Username</label>
                                        <Input
                                            id="lead-discord"
                                            value={formData.discord}
                                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                                            placeholder="username#0000 or username"
                                            required
                                            className="bg-black/20 border-[#2f3136] focus:border-primary text-white"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label htmlFor="lead-budget" className="text-xs font-semibold text-white uppercase tracking-wider">Project Budget</label>
                                        <select
                                            id="lead-budget"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-[#2f3136] bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
                                            style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}
                                        >
                                            <option value="Starts at $100" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Basic Bot (Starts at $100)</option>
                                            <option value="Starts at $300" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Advanced Automation (Starts at $300)</option>
                                            <option value="Contact for Quote" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Enterprise / AI Bot (Custom Quote)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label htmlFor="lead-timeline" className="text-xs font-semibold text-white uppercase tracking-wider">Expected Timeline</label>
                                    <select
                                        id="lead-timeline"
                                        value={formData.timeline}
                                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-[#2f3136] bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                        style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}
                                    >
                                        <option value="1 Week" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Urgent (1 Week)</option>
                                        <option value="2-3 Weeks" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Standard (2-3 Weeks)</option>
                                        <option value="1 Month+" className="bg-[#1e1f22]" style={{ color: '#f2f3f5', backgroundColor: '#1e1f22' }}>Flexible (1 Month+)</option>
                                    </select>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label htmlFor="lead-desc" className="text-xs font-semibold text-white uppercase tracking-wider">Project Description</label>
                                    <Textarea
                                        id="lead-desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What should the bot do? List required slash commands, roles setup, webhook alerts, Stripe plans, or API needs..."
                                        required
                                        className="bg-black/20 border-[#2f3136] focus:border-primary text-white min-h-[120px]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold text-base py-6 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        "Submitting..."
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" /> Send Request
                                        </>
                                    )}
                                </Button>

                                {submitResult === "success" && (
                                    <p className="text-green-500 font-semibold text-center text-sm">
                                        ✔ Request sent successfully! I will contact you on Discord/email within 24 hours.
                                    </p>
                                )}
                                {submitResult === "failed" && (
                                    <p className="text-red-500 font-semibold text-center text-sm">
                                        ❌ Failed to send request. Please contact me on Discord directly.
                                    </p>
                                )}
                            </form>
                        </Card>
                    </div>
                </section>

                {/* 13.5 TECH STACK BAR */}
                <section className="py-6 border-t border-white/5 bg-[#0f1012]">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[#949ba4] font-medium text-xs md:text-sm">
                            <span className="text-white/50 font-bold uppercase tracking-widest text-[10px] w-full text-center mb-2">Powered By Next-Gen Tech</span>
                            <span>Python</span>
                            <span>discord.py</span>
                            <span>MongoDB</span>
                            <span>PostgreSQL</span>
                            <span>Redis</span>
                            <span>Docker</span>
                            <span>Stripe / PayPal</span>
                            <span>OpenAI / Claude / Gemini</span>
                        </div>
                    </div>
                </section>

                {/* 14. STRONG FINAL CTA */}
                <section className="py-20 bg-gradient-to-t from-[#111214] to-[#0f1012] relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#5865F2]/5 rounded-full blur-[100px] -z-10" />

                    <div className="container mx-auto px-6 text-center max-w-xl space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black font-heading leading-tight text-white">
                            Let's Build Your Discord Bot
                        </h2>
                        <p className="text-[#dbdee1] text-sm md:text-base">
                            Transform your server administration workflow, stop bot raids, automate payments, and reward premium users automatically.
                        </p>
                        <div className="pt-4">
                            <Button
                                onClick={() => {
                                    const el = document.getElementById("quote-form");
                                    el?.scrollIntoView({ behavior: "smooth" });
                                    trackEvent("final_cta_click");
                                }}
                                className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-[0_0_25px_rgba(88,101,242,0.4)]"
                            >
                                Discuss My Project
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-8 text-xs font-medium text-[#949ba4]">
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Worldwide Clients</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Secure Payments</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> 100% Source Code</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> 30 Days Support</span>
                        </div>
                    </div>
                </section>
            </div>
        </LazyMotion>
    );
};
