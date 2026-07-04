"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
            {/* Background Effects - Hidden on mobile for performance */}
            <div className="absolute inset-0 z-0 hidden md:block">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse-glow delay-1000" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm text-primary mb-6 backdrop-blur-sm">
                            Available for New Projects
                        </span>

                        <h1 className="text-4xl md:text-7xl font-bold font-heading tracking-tight mb-6">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary">RelayWorks</span>
                            <br />
                            <span className="text-3xl md:text-6xl text-foreground/90">
                                Automation & Software Agency
                            </span>
                        </h1>

                        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            We build high-performance Discord bots, automation systems, and custom software that help businesses scale.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact" scroll={false}>
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[160px] h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300">
                                    Partner with Us <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/projects" scroll={false}>
                                <Button variant="outline" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10 text-foreground min-w-[160px] h-12 text-base backdrop-blur-sm">
                                    View Projects
                                </Button>
                            </Link>
                        </div>
                    </m.div>
                </LazyMotion>
            </div>

            {/* Scroll Indicator - Hidden on very small screens */}
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block"
                >
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-primary rounded-full animate-scroll" />
                    </div>
                </m.div>
            </LazyMotion>
        </section>
    );
};
