"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Terminal, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DashboardLog {
    id: number;
    timestamp: string;
    source: "APP" | "API" | "BOT";
    event: string;
    color: string;
}

const logTemplates = [
    { source: "APP" as const, event: "User requested quote checkout", color: "text-emerald-400" },
    { source: "API" as const, event: "POST /api/v1/projects - 200 OK", color: "text-blue-400" },
    { source: "BOT" as const, event: "Dispatched staff notification channel", color: "text-purple-400" },
    { source: "API" as const, event: "Stripe Webhook processed successfully", color: "text-blue-400" },
    { source: "APP" as const, event: "Syncing local database state...", color: "text-emerald-400" },
    { source: "BOT" as const, event: "MongoDB configurations reloaded", color: "text-purple-400" },
    { source: "API" as const, event: "GET /api/v1/testimonials - 204ms", color: "text-blue-400" },
];

export const SystemDashboardHero = () => {
    const [logs, setLogs] = useState<DashboardLog[]>([]);
    const [latency, setLatency] = useState(24);
    const [activeSessions, setActiveSessions] = useState(148);
    const [completedJobs, setCompletedJobs] = useState(12840);
    const [sparkline, setSparkline] = useState<number[]>([24, 28, 22, 25, 30, 24, 27, 23, 25, 24]);

    // Logs simulation
    useEffect(() => {
        // Initial set of logs
        const initialLogs = Array.from({ length: 4 }).map((_, idx) => {
            const template = logTemplates[idx % logTemplates.length];
            const time = new Date(Date.now() - (4 - idx) * 3000).toLocaleTimeString("en-US", { hour12: false });
            return {
                id: idx,
                timestamp: time,
                ...template,
            };
        });
        setLogs(initialLogs);

        let logId = 4;
        const logInterval = setInterval(async () => {
            const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
            const time = new Date().toLocaleTimeString("en-US", { hour12: false });
            const newLog = {
                id: logId++,
                timestamp: time,
                ...template,
            };
            setLogs(prev => [...prev.slice(1), newLog]);

            // Measure real latency to https://api.onedropblood.top/
            const start = performance.now();
            try {
                await fetch("https://api.onedropblood.top/", {
                    method: "HEAD",
                    mode: "no-cors",
                    cache: "no-store",
                });
                const duration = Math.round(performance.now() - start);
                setLatency(Math.min(Math.max(duration, 5), 999));
            } catch (err) {
                // Fallback to random if server is unreachable
                setLatency(Math.floor(40 + Math.random() * 15));
            }

            setActiveSessions(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            setCompletedJobs(prev => prev + 1);
        }, 2200);

        return () => clearInterval(logInterval);
    }, []);

    // Sparkline history updating
    useEffect(() => {
        setSparkline(prev => [...prev.slice(1), latency]);
    }, [latency]);

    // Render path for SVG sparkline
    const getSparklinePath = () => {
        const width = 240;
        const height = 40;
        const padding = 4;

        const maxVal = Math.max(...sparkline, 45);
        const minVal = Math.min(...sparkline, 15);
        const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

        const points = sparkline.map((val, idx) => {
            const x = (idx / (sparkline.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((val - minVal) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        });

        return `M ${points.join(" L ")}`;
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 bg-[#090a0f]">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#5865F2]/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column — Value Prop */}
                    <LazyMotion features={domAnimation}>
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-6 space-y-8"
                        >
                            <div className="space-y-6">
                                <m.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                                        Custom Software & Workflow Automation
                                    </span>
                                </m.div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight leading-[1.08] text-white">
                                    We build software
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                                        that runs operations.
                                    </span>
                                </h1>

                                <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
                                    RelayWorks engineers custom Android apps, API integrations, and robust backend microservices that automate manual work and connect your platforms seamlessly.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/contact">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_0_32px_rgba(59,130,246,0.5)] transition-all duration-300">
                                        Start Your Project <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="#services">
                                    <Button variant="outline" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10 h-12 px-8 text-base backdrop-blur-sm">
                                        Explore Services
                                    </Button>
                                </Link>
                            </div>
                        </m.div>
                    </LazyMotion>

                    {/* Right Column — Agency Dashboard */}
                    <LazyMotion features={domAnimation}>
                        <m.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-6"
                        >
                            <div className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 relative group">
                                {/* Header bar */}
                                <div className="flex items-center justify-between px-4 py-3 bg-[#10121a]/80 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-semibold text-white/80 font-mono tracking-wide">SYSTEM MONITOR</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-white/10" />
                                        <div className="w-2 h-2 rounded-full bg-white/10" />
                                        <div className="w-2 h-2 rounded-full bg-white/10" />
                                    </div>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#12141f] border border-white/5 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">ONEDROP LATENCY</div>
                                            <div className="text-xl font-bold text-white font-mono mt-1">{latency}ms</div>
                                        </div>
                                        <div className="bg-[#12141f] border border-white/5 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">ACTIVE SESSIONS</div>
                                            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{activeSessions}</div>
                                        </div>
                                        <div className="bg-[#12141f] border border-white/5 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">COMPLETED JOBS</div>
                                            <div className="text-xl font-bold text-[#5865F2] font-mono mt-1">
                                                {completedJobs.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Latency Waveform Graph */}
                                    <div className="bg-[#12141f] border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[80px]">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">api.onedropblood.top PING</span>
                                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> LIVE UPDATING
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-end">
                                            <svg className="w-full h-10 overflow-visible" viewBox="0 0 240 40">
                                                <path
                                                    d={getSparklinePath()}
                                                    fill="none"
                                                    stroke="url(#sparklineGrad)"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <defs>
                                                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#10b981" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Logs Terminal */}
                                    <div className="bg-[#08090d] border border-white/5 rounded-xl p-4 font-mono text-[11px] h-[150px] overflow-hidden flex flex-col justify-end space-y-1.5 shadow-inner">
                                        <AnimatePresence initial={false}>
                                            {logs.map((log) => (
                                                <m.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="flex gap-2 items-start text-white/50"
                                                >
                                                    <span className="text-white/20 select-none">{log.timestamp}</span>
                                                    <span className={`font-semibold shrink-0 select-none ${log.source === "APP" ? "text-emerald-400" :
                                                        log.source === "API" ? "text-blue-400" : "text-purple-400"
                                                        }`}>
                                                        [{log.source}]
                                                    </span>
                                                    <span className="text-white/80 line-clamp-1">{log.event}</span>
                                                </m.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </m.div>
                    </LazyMotion>
                </div>
            </div>
        </section>
    );
};
