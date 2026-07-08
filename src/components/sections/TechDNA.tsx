"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

const techDomains = [
    {
        name: "Bot Framework",
        color: "bg-[#5865F2]/15 text-[#7289da] border-[#5865F2]/20",
        dotColor: "bg-[#5865F2]",
        techs: ["discord.py", "Pycord", "discord.js", "Slash Commands", "Interactive UI", "Webhooks"],
    },
    {
        name: "Backend",
        color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        dotColor: "bg-orange-400",
        techs: ["FastAPI", "Ktor", "REST APIs", "MongoDB Atlas", "PostgreSQL", "Redis"],
    },
    {
        name: "Android",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotColor: "bg-emerald-400",
        techs: ["Kotlin", "Jetpack Compose", "Firebase", "MVVM", "Room DB", "Google Play"],
    },
    {
        name: "DevOps & Infra",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotColor: "bg-purple-400",
        techs: ["Docker", "Jenkins CI/CD", "PM2", "GitHub Actions", "Nginx", "VPS Deployment"],
    },
];

export const TechDNA = () => {
    return (
        <section id="stack" className="py-20 relative">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Tech Stack</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
                            Tools I ship with.
                        </h2>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {techDomains.map((domain, idx) => (
                            <m.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                            >
                                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5 hover:border-white/10 transition-all duration-300">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <span className={`w-2 h-2 rounded-full ${domain.dotColor}`} />
                                        <span className="text-sm font-semibold text-white">{domain.name}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {domain.techs.map((tech, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className={`text-xs px-3 py-1.5 rounded-lg border ${domain.color} font-medium`}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};
