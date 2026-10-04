"use client";

import React from "react";
import { 
    Smartphone, 
    Server, 
    Database, 
    Layers, 
    Bot, 
    Cpu, 
    Terminal, 
    Zap, 
    Globe, 
    Radio 
} from "lucide-react";

interface TechItem {
    name: string;
    category: string;
    icon: React.ReactNode;
    color: string;
}

const techItems: TechItem[] = [
    { name: "Kotlin", category: "Core Mobile", icon: <Smartphone className="w-4 h-4 text-purple-600" />, color: "bg-purple-50 border-purple-200 text-purple-900" },
    { name: "Jetpack Compose", category: "Declarative UI", icon: <Layers className="w-4 h-4 text-emerald-600" />, color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
    { name: "SwiftUI", category: "iOS Native", icon: <Smartphone className="w-4 h-4 text-blue-600" />, color: "bg-blue-50 border-blue-200 text-blue-900" },
    { name: "Kotlin Multiplatform (KMP)", category: "Cross-Platform", icon: <Globe className="w-4 h-4 text-indigo-600" />, color: "bg-indigo-50 border-indigo-200 text-indigo-900" },
    { name: "Spring Boot", category: "Microservices", icon: <Server className="w-4 h-4 text-emerald-700" />, color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
    { name: "FastAPI", category: "High Throughput", icon: <Zap className="w-4 h-4 text-teal-600" />, color: "bg-teal-50 border-teal-200 text-teal-900" },
    { name: "PostgreSQL", category: "Relational DB", icon: <Database className="w-4 h-4 text-blue-700" />, color: "bg-blue-50 border-blue-200 text-blue-900" },
    { name: "MongoDB", category: "Document Store", icon: <Database className="w-4 h-4 text-green-700" />, color: "bg-green-50 border-green-200 text-green-900" },
    { name: "Docker & CI/CD", category: "DevOps", icon: <Cpu className="w-4 h-4 text-sky-600" />, color: "bg-sky-50 border-sky-200 text-sky-900" },
    { name: "Discord.py", category: "Automation", icon: <Bot className="w-4 h-4 text-indigo-600" />, color: "bg-indigo-50 border-indigo-200 text-indigo-900" },
    { name: "SQLDelight", category: "Local-First Sync", icon: <Database className="w-4 h-4 text-amber-600" />, color: "bg-amber-50 border-amber-200 text-amber-900" },
    { name: "WebSockets", category: "Real-Time State", icon: <Radio className="w-4 h-4 text-rose-600" />, color: "bg-rose-50 border-rose-200 text-rose-900" },
];

export const TechMarquee = () => {
    // Duplicate items for continuous seamless loop
    const items = [...techItems, ...techItems];

    return (
        <div className="w-full py-8 border-y border-slate-200/80 bg-slate-50/70 overflow-hidden relative">
            {/* Ambient edge blurs for smooth fading */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified Production Tech Stack</span>
                </div>
                <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
                    100% Native & High-Concurrency
                </span>
            </div>

            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 py-2">
                {items.map((tech, idx) => (
                    <div
                        key={idx}
                        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-xs transition-all hover:scale-105 cursor-default ${tech.color}`}
                    >
                        <span className="p-1 rounded-md bg-white shadow-xs">
                            {tech.icon}
                        </span>
                        <div>
                            <div className="text-xs font-bold font-mono tracking-tight text-slate-900">
                                {tech.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                                {tech.category}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }
            `}</style>
        </div>
    );
};
