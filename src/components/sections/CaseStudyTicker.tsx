"use client";

import React, { useState, useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Github, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Project {
    _id: string;
    id: number;
    title: string;
    description: string;
    tags: string[];
    category: string;
    images: string[];
    image?: string;
    liveUrl: string;
    githubUrl: string;
}

export const CaseStudyTicker = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (isPaused || !scrollRef.current) return;

        const el = scrollRef.current;
        const speed = 0.5;
        let animId: number;

        const scroll = () => {
            if (!el) return;
            el.scrollLeft += speed;

            // Loop back when reaching the end
            if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
                el.scrollLeft = 0;
            }

            animId = requestAnimationFrame(scroll);
        };

        animId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animId);
    }, [isPaused, projects]);

    const scrollBy = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = direction === "left" ? -380 : 380;
        scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    };

    const totalCommits = projects.length > 0 ? projects.length * 15 : 90; // Estimate
    const totalTags = projects.reduce((acc, p) => acc + p.tags.length, 0);

    if (loading) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-56 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="work" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    {/* Header */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
                    >
                        <div>
                            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Recent Work</span>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
                                Shipped & running in production.
                            </h2>
                        </div>

                        {/* Scroll controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scrollBy("left")}
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollBy("right")}
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </m.div>
                </LazyMotion>
            </div>

            {/* Horizontal Scroll Feed */}
            <div
                ref={scrollRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="flex gap-5 overflow-x-auto scrollbar-hide px-6 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Left spacer for container alignment */}
                <div className="shrink-0 w-[max(0px,calc((100vw-1280px)/2))]" />

                {projects.map((project, idx) => {
                    const primaryImage = project.images?.[0] || project.image;
                    return (
                        <LazyMotion key={project._id || idx} features={domAnimation}>
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="shrink-0 w-[340px] md:w-[380px]"
                            >
                                <div className="h-full rounded-2xl border border-white/8 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-white/15 transition-all duration-300 group flex flex-col">
                                    {/* Image */}
                                    {primaryImage && (
                                        <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                                            <img
                                                src={primaryImage}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3">
                                                <span className="text-xs bg-black/50 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-md text-white/80">
                                                    {project.category}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {project.tags.slice(0, 4).map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[10px] bg-white/5 border border-white/8 px-2 py-0.5 rounded text-white/50">
                                                    {tag}
                                                </span>
                                            ))}
                                            {project.tags.length > 4 && (
                                                <span className="text-[10px] text-white/30">+{project.tags.length - 4}</span>
                                            )}
                                        </div>

                                        {/* Links */}
                                        <div className="flex items-center gap-3">
                                            {project.githubUrl && project.githubUrl !== "#" && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
                                                >
                                                    <Github className="w-3.5 h-3.5" /> Source
                                                </a>
                                            )}
                                            {project.liveUrl && project.liveUrl !== "#" && (
                                                <a
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> Live
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        </LazyMotion>
                    );
                })}

                {/* Right spacer */}
                <div className="shrink-0 w-[max(24px,calc((100vw-1280px)/2))]" />
            </div>

            {/* Stats Counter */}
            <div className="container mx-auto px-6 mt-10">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-white font-semibold">{projects.length}</span> projects shipped
                        </span>
                        <span className="text-white/10">|</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-white font-semibold">{totalTags}</span> technologies used
                        </span>
                        <span className="text-white/10">|</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span className="text-white font-semibold">3</span> public GitHub repos
                        </span>
                    </m.div>
                </LazyMotion>
            </div>
        </section>
    );
};
