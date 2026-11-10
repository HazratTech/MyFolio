"use client";

import React from "react";
import Image from "next/image";
import { Terminal, Radio, Database } from "lucide-react";

interface TechItem {
    name: string;
    category: string;
    iconSrc?: string;
    iconFallback?: React.ReactNode;
    color: string;
}

const techItems: TechItem[] = [
    { name: "Kotlin", category: "Core Mobile", iconSrc: "/icons/tech/kotlin.svg", color: "bg-slate-50 border-slate-200 text-slate-900" },
    { name: "Jetpack Compose", category: "Declarative UI", iconSrc: "/icons/tech/android.svg", color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
    { name: "SwiftUI", category: "iOS Native", iconSrc: "/icons/tech/swift.svg", color: "bg-blue-50 border-blue-200 text-blue-900" },
    { name: "Kotlin Multiplatform (KMP)", category: "Cross-Platform", iconSrc: "/icons/tech/kotlin.svg", color: "bg-slate-50 border-slate-200 text-slate-900" },
    { name: "Spring Boot", category: "Microservices", iconSrc: "/icons/tech/spring.svg", color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
    { name: "FastAPI", category: "High Throughput", iconSrc: "/icons/tech/fastapi.svg", color: "bg-teal-50 border-teal-200 text-teal-900" },
    { name: "PostgreSQL", category: "Relational DB", iconSrc: "/icons/tech/postgres.svg", color: "bg-blue-50 border-blue-200 text-blue-900" },
    { name: "MongoDB", category: "Document Store", iconSrc: "/icons/tech/mongodb.svg", color: "bg-green-50 border-green-200 text-green-900" },
    { name: "Docker & CI/CD", category: "DevOps", iconSrc: "/icons/tech/docker.svg", color: "bg-sky-50 border-sky-200 text-sky-900" },
    { name: "Discord.py", category: "Automation", iconSrc: "/icons/tech/discord.svg", color: "bg-indigo-50 border-indigo-200 text-indigo-900" },
    { name: "SQLDelight", category: "Local-First Sync", iconFallback: <Database className="w-4 h-4 text-slate-700" />, color: "bg-slate-50 border-slate-200 text-slate-900" },
    { name: "WebSockets", category: "Real-Time State", iconFallback: <Radio className="w-4 h-4 text-blue-600" />, color: "bg-blue-50 border-blue-200 text-blue-900" },
];

export const TechMarquee = () => {
    // Duplicate items for continuous loop
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
                        <span className="p-1 rounded-md bg-white shadow-xs flex items-center justify-center w-6 h-6 shrink-0">
                            {tech.iconSrc ? (
                                <Image
                                    src={tech.iconSrc}
                                    alt={`${tech.name} logo`}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4 object-contain"
                                />
                            ) : (
                                tech.iconFallback
                            )}
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
