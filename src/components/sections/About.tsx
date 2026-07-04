"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { about, skills } from "@/data/portfolio";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const About = () => {
    return (
        <section id="about" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                            About <span className="text-primary">Us</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Get to know more about our journey, skills, and what drives us.
                        </p>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <m.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-2xl font-bold mb-4 text-foreground">
                                {about.headline}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                {about.description}
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Over the years, we've become fluent in <span className="text-primary font-semibold">Kotlin, Jetpack Compose, Ktor, Python, FastAPI</span>, and everything that comes with turning an idea into a working product. We've built complete Android apps, backends, complex APIs, and AI-powered Discord bots with features like activity tracking, image generation, and Stripe integrations.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Our strongest quality? We don't wait for someone to teach us. We open the docs, break things, fix them, and build again — until we master it. Everything we know today is the result of continuous learning and discipline.
                            </p>
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <h4 className="text-xl font-bold mb-6 text-center">Technical Arsenal</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                            <skill.icon className="w-8 h-8 mb-2 text-primary group-hover:text-secondary transition-colors" />
                                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{skill.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Decorative Glow */}
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -z-10" />
                        </m.div>
                    </div>

                    {/* Experience Timeline (Simplified) */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h3 className="text-2xl font-bold mb-8 text-center">Experience</h3>
                        <div className="relative border-l border-white/10 ml-4 md:ml-auto md:mr-auto md:w-2/3 pl-8 space-y-10">
                            <div className="relative">
                                <span className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                                <h4 className="text-xl font-bold">Automation Agency</h4>
                                <span className="text-sm text-primary">2021 - Present</span>
                                <p className="text-muted-foreground mt-2">Building custom Discord bots, Native Android apps, and backend systems for clients worldwide. 4+ years of experience in Discord bot development, server setup, and automation.</p>
                            </div>
                        </div>
                    </m.div>
                </LazyMotion>
            </div>
        </section>
    );
};
