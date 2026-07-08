"use client";

import React, { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Smartphone, Server, Bot, Database, Zap, CheckCircle } from "lucide-react";

const nodes = [
    {
        id: "app",
        label: "Customer Mobile App",
        desc: "The client-facing gateway. Designed for frictionless onboarding, offline product browsing, and instant interactions.",
        icon: Smartphone,
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
        activeColor: "border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30",
        details: [
            "Offline Mode: Clients can browse items and log actions without active internet",
            "Instant Push Notifications to boost repeat sales and engagement",
            "Frictionless local authentication to secure customer accounts"
        ]
    },
    {
        id: "api",
        label: "Secure Processing API",
        desc: "The brain of your business. Handles checkout security, checks payment statuses, and routes data securely.",
        icon: Server,
        color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
        activeColor: "border-blue-400 bg-blue-500/10 ring-1 ring-blue-500/30",
        details: [
            "Automated Stripe Webhooks: Instantly upgrades customer accounts on successful payment",
            "Sub-second routing to ensure orders are processed with zero delay",
            "Secure connections preventing any customer data tampering"
        ]
    },
    {
        id: "bot",
        label: "Operations Control Bot",
        desc: "The real-time notifier. Alerts your staff instantly on transactions, logs events, and grants customer roles.",
        icon: Bot,
        color: "text-purple-400 border-purple-500/30 bg-purple-500/5",
        activeColor: "border-purple-400 bg-purple-500/10 ring-1 ring-purple-500/30",
        details: [
            "Instant Alerts: Pings staff channels the millisecond a transaction fails or succeeds",
            "Automated Onboarding: Instantly assigns VIP roles to paid members in Discord",
            "Admin Controls: Allows staff to update shop catalogs directly via simple chat commands"
        ]
    },
    {
        id: "db",
        label: "Cloud Database Hub",
        desc: "The vault. Stores configurations, client records, purchase paths, and logs safely in the cloud.",
        icon: Database,
        color: "text-orange-400 border-orange-500/30 bg-orange-500/5",
        activeColor: "border-orange-400 bg-orange-500/10 ring-1 ring-orange-500/30",
        details: [
            "Redundant Backups: Automated daily snapshots protecting transaction logs",
            "High Availability: 99.9% database availability so your app never stalls",
            "Dynamic Storage: Scale structures instantly as your product catalog grows"
        ]
    }
];

export const IntegrationBlueprint = () => {
    const [activeNode, setActiveNode] = useState<string>("app");

    const activeNodeData = nodes.find(n => n.id === activeNode) || nodes[0];

    return (
        <section id="blueprint" className="py-20 bg-[#090a0f] border-t border-white/5 relative">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    {/* Header */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-14 text-center"
                    >
                        <span className="text-xs uppercase tracking-widest text-primary font-semibold">How It Works</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 text-white">
                            Interconnected workflows that sell.
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto text-sm mt-3">
                            Click on any node in the customer purchase path below to see how your operations automate.
                        </p>
                    </m.div>

                    {/* Blueprint grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
                        
                        {/* Flowchart Diagram (Left Column) */}
                        <div className="lg:col-span-7 flex flex-col items-center gap-6 relative">
                            {/* App Node */}
                            <button
                                onClick={() => setActiveNode("app")}
                                className={`w-[220px] p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                                    activeNode === "app" ? activeNodeData.activeColor : "border-white/5 bg-[#111218] hover:border-white/10"
                                }`}
                            >
                                <Smartphone className={`w-5 h-5 ${activeNode === "app" ? "text-emerald-400" : "text-white/40"}`} />
                                <div className="text-left">
                                    <div className="text-[10px] text-white/40 font-mono">1. CLIENT INTERFACE</div>
                                    <div className="text-sm font-bold text-white">Customer Mobile App</div>
                                </div>
                            </button>

                            {/* Line Down to API */}
                            <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500/40 to-blue-500/40 relative">
                                <Zap className="w-3.5 h-3.5 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                            </div>

                            {/* API Node */}
                            <button
                                onClick={() => setActiveNode("api")}
                                className={`w-[220px] p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                                    activeNode === "api" ? activeNodeData.activeColor : "border-white/5 bg-[#111218] hover:border-white/10"
                                }`}
                            >
                                <Server className={`w-5 h-5 ${activeNode === "api" ? "text-blue-400" : "text-white/40"}`} />
                                <div className="text-left">
                                    <div className="text-[10px] text-white/40 font-mono">2. AUTOMATED ROUTING</div>
                                    <div className="text-sm font-bold text-white">Secure Processing API</div>
                                </div>
                            </button>

                            {/* Split connector lines */}
                            <div className="w-[180px] h-6 flex justify-between relative">
                                <div className="w-[50%] h-[2px] bg-blue-500/20 absolute top-0 left-0" />
                                <div className="w-[50%] h-[2px] bg-blue-500/20 absolute top-0 right-0" />
                                <div className="w-[2px] h-full bg-blue-500/20 absolute top-0 left-0" />
                                <div className="w-[2px] h-full bg-blue-500/20 absolute top-0 right-0" />
                            </div>

                            {/* Bot and DB Side-by-Side */}
                            <div className="flex gap-6 sm:gap-10">
                                <button
                                    onClick={() => setActiveNode("bot")}
                                    className={`w-[170px] p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                                        activeNode === "bot" ? activeNodeData.activeColor : "border-white/5 bg-[#111218] hover:border-white/10"
                                    }`}
                                >
                                    <Bot className={`w-5 h-5 ${activeNode === "bot" ? "text-purple-400" : "text-white/40"}`} />
                                    <div className="text-left">
                                        <div className="text-[9px] text-white/40 font-mono">3. OPERATIONS</div>
                                        <div className="text-xs font-bold text-white">Operations Bot</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveNode("db")}
                                    className={`w-[170px] p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                                        activeNode === "db" ? activeNodeData.activeColor : "border-white/5 bg-[#111218] hover:border-white/10"
                                    }`}
                                >
                                    <Database className={`w-5 h-5 ${activeNode === "db" ? "text-orange-400" : "text-white/40"}`} />
                                    <div className="text-left">
                                        <div className="text-[9px] text-white/40 font-mono">4. STORAGE</div>
                                        <div className="text-xs font-bold text-white">Cloud DB Vault</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Specification Details Card (Right Column) */}
                        <div className="lg:col-span-5">
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={activeNode}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-[#111218] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl"
                                >
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">PRODUCT PROFILE</div>
                                        <div className="flex items-center gap-2">
                                            <activeNodeData.icon className={`w-5 h-5 ${activeNodeData.color.split(" ")[0]}`} />
                                            <h3 className="text-lg font-bold text-white">{activeNodeData.label}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {activeNodeData.desc}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">BUSINESS RESULTS & FEATURES</div>
                                        <div className="space-y-2.5">
                                            {activeNodeData.details.map((detail, idx) => (
                                                <div key={idx} className="flex gap-2 items-start text-xs text-white/80">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </m.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};
