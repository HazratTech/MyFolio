"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Server, Bot, MessageSquare } from "lucide-react";
import Link from "next/link";

export const ServiceShowcase = () => {
    return (
        <section id="services" className="py-24 relative bg-[#090a0f] border-t border-white/5">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    {/* Header */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-16 text-center"
                    >
                        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Engineering Pillars</span>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mt-2 text-white">
                            What we engineer.
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto text-sm mt-3">
                            Scalable codebases built using strict, production-ready design patterns.
                        </p>
                    </m.div>

                    {/* 3 Pillars Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pillar 1: Mobile Applications */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group h-full flex flex-col justify-between rounded-2xl border border-white/5 bg-[#10121a]/40 hover:bg-[#10121a]/80 hover:border-emerald-500/20 transition-all duration-300 p-6"
                        >
                            <div className="space-y-6">
                                {/* Visual Graphic */}
                                <div className="aspect-[16/10] w-full rounded-xl bg-[#08090d] border border-white/5 flex items-center justify-center p-4 relative overflow-hidden">
                                    {/* Mockup Mobile Screen */}
                                    <div className="w-[85px] h-[130px] rounded-lg border-2 border-white/10 bg-[#111218] p-2 flex flex-col justify-between relative shadow-2xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 self-center mb-1" />
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="h-2 w-full rounded bg-white/10" />
                                            <div className="h-2 w-2/3 rounded bg-white/10" />
                                            <div className="h-6 w-full rounded-md bg-emerald-500/25 border border-emerald-500/30 mt-1 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                            </div>
                                        </div>
                                        <div className="w-12 h-1 rounded bg-white/10 self-center mt-1" />
                                    </div>
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-400/5 blur-sm" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Smartphone className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-lg font-bold text-white">Mobile Applications</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Native Android development using Kotlin and Jetpack Compose. We build fluid, reactive apps with background processing, offline support, and offline sync capability.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Starting at $200</span>
                                <Link href="/contact">
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground group-hover:text-emerald-400 p-0 hover:bg-transparent">
                                        Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </m.div>

                        {/* Pillar 2: Systems & API Engineering */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group h-full flex flex-col justify-between rounded-2xl border border-white/5 bg-[#10121a]/40 hover:bg-[#10121a]/80 hover:border-blue-500/20 transition-all duration-300 p-6"
                        >
                            <div className="space-y-6">
                                {/* Visual Graphic */}
                                <div className="aspect-[16/10] w-full rounded-xl bg-[#08090d] border border-white/5 flex flex-col justify-center p-4 relative overflow-hidden">
                                    {/* Mockup API Response Code Block */}
                                    <div className="font-mono text-[9px] text-white/50 space-y-1 bg-[#111218] p-3 rounded-lg border border-white/10 shadow-xl">
                                        <div className="flex justify-between items-center text-white/30 border-b border-white/5 pb-1 mb-1.5">
                                            <span>POST /api/v1/checkout</span>
                                            <span className="text-emerald-400">200 OK</span>
                                        </div>
                                        <div>{"{"}</div>
                                        <div className="pl-3">"status": <span className="text-emerald-400">"success"</span>,</div>
                                        <div className="pl-3">"transaction_id": <span className="text-blue-400">"tx_9281a"</span>,</div>
                                        <div className="pl-3">"amount": <span className="text-orange-400">120.00</span></div>
                                        <div>{"}"}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Server className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-lg font-bold text-white">Systems & API Engineering</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Scalable REST APIs and backend microservices engineered in FastAPI and Ktor. Integrated database pooling, Stripe subscriptions, and Redis caching.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Starting at $150</span>
                                <Link href="/contact">
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground group-hover:text-blue-400 p-0 hover:bg-transparent">
                                        Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </m.div>

                        {/* Pillar 3: Process & Community Automation */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="group h-full flex flex-col justify-between rounded-2xl border border-white/5 bg-[#10121a]/40 hover:bg-[#10121a]/80 hover:border-purple-500/20 transition-all duration-300 p-6"
                        >
                            <div className="space-y-6">
                                {/* Visual Graphic */}
                                <div className="aspect-[16/10] w-full rounded-xl bg-[#08090d] border border-white/5 flex items-center justify-center p-4 relative overflow-hidden">
                                    {/* Mockup Discord Slash Command */}
                                    <div className="w-full bg-[#111218] p-3 rounded-lg border border-white/10 shadow-xl space-y-2">
                                        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#5865F2]" />
                                            <span className="font-mono text-[9px] text-white/30">DISCORD COMMAND</span>
                                        </div>
                                        <div className="font-mono text-[10px] text-white/90 bg-[#1e1f22] p-1.5 rounded flex items-center gap-1.5 border border-white/5">
                                            <span className="text-[#5865F2] font-semibold">/shop</span>
                                            <span className="text-white/30">item:</span>
                                            <span className="bg-primary/20 px-1 rounded text-primary text-[9px]">Sword</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Bot className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-lg font-bold text-white">Workflow Automation</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Custom Discord bots, automated system alerts, and notification streams. We integrate with your existing APIs to link your online community directly with your product.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Starting at $50</span>
                                <Link href="/discord-bot">
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground group-hover:text-purple-400 p-0 hover:bg-transparent">
                                        Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </m.div>
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};
