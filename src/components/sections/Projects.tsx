"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Github, 
    ExternalLink, 
    Smartphone, 
    ChevronLeft, 
    ChevronRight, 
    MessageSquare, 
    Send, 
    FolderKanban, 
    Sparkles, 
    CheckCircle2, 
    Code2, 
    ArrowRight,
    Server,
    Layers,
    X,
    User,
    Clock,
    Terminal
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    commentCount?: number;
}

interface Comment {
    _id: string;
    projectId: string;
    name: string;
    content: string;
    createdAt: string;
}

const COMMERCIAL_CASE_STUDIES = [
    {
        title: "KarigoJobs",
        category: "Mobile SaaS & Field Suite",
        tech: "Kotlin Multiplatform · Jetpack Compose · SQLDelight · RevenueCat",
        problem: "Field service contractors working in remote job sites, basements, and rural locations suffered constant data loss with cloud-only web forms, unable to generate compliant invoices.",
        solution: "Engineered a zero-server, 100% offline-first architecture utilizing SQLDelight schemas that snapshot material prices locally and compile vector-sharp PDF invoices in under 60 seconds without network connectivity.",
        impact: "Zero data loss across 100% offline job sites. Shared KMP repository layers ready for seamless iOS native deployment."
    },
    {
        title: "OneDrop Blood Donation Network",
        category: "Mission-Critical Healthcare",
        tech: "Native Android · Jetpack Compose · Ktor · MongoDB · Redis",
        problem: "Patients and emergency care clinics struggled with critical donor matching delays during urgent blood shortage requests, relying on fragmented social media posts.",
        solution: "Architected a real-time geo-matching engine and asynchronous push notification pipeline powered by Ktor microservices, Redis caching, and reactive Jetpack Compose UI with one-tap donor dispatch.",
        impact: "Sub-second emergency donor dispatch routing, published on Google Play with verified production uptime."
    },
    {
        title: "OP Shop Gaming Marketplace Bot",
        category: "Platform Automation & Economy",
        tech: "Python · discord.py · MongoDB · Docker · AsyncIO",
        problem: "High-volume Discord gaming communities suffered from manual transaction disputes, trade scams, and unverified in-game currency exchanges.",
        solution: "Engineered an asynchronous Discord event engine featuring dual-currency economy transactions, automated purchase ticket escrow, role verification, and full in-Discord admin panels.",
        impact: "Over 55 production modules running 24/7 with zero downtime and automated escrow handling thousands of transactions."
    }
];

export const Projects = () => {
    // Enforce consistent light theme
    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    const [activeTab, setActiveTab] = useState("All");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: string]: number }>({});
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState({ name: "", content: "" });
    const [commentLoading, setCommentLoading] = useState(false);

    const nextImage = (projectId: string, imagesLength: number) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [projectId]: ((prev[projectId] || 0) + 1) % imagesLength
        }));
    };

    const prevImage = (projectId: string, imagesLength: number) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [projectId]: ((prev[projectId] || 0) - 1 + imagesLength) % imagesLength
        }));
    };

    const fetchComments = async (projectId: string) => {
        try {
            const res = await fetch(`/api/comments?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newComment.name.trim() || !newComment.content.trim()) return;

        setCommentLoading(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProject._id,
                    name: newComment.name.trim(),
                    content: newComment.content.trim(),
                }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment({ name: "", content: "" });
                // Update local comment count on the selected project and list
                setProjects(prev => prev.map(p => p._id === selectedProject._id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
            }
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setCommentLoading(false);
        }
    };

    const openProjectDetails = (project: Project) => {
        setSelectedProject(project);
        fetchComments(project._id);
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const categories = ["All", "Mobile Apps", "Discord Bots", "Backend"];

    const getCategoryCount = (cat: string) => {
        if (cat === "All") return projects.length;
        return projects.filter(p => p.category === cat).length;
    };

    const filteredProjects = activeTab === "All"
        ? projects
        : projects.filter(project => project.category === activeTab);

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pt-4 pb-24 relative">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-4 mb-6">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800 font-semibold">Production Systems</span>
                </nav>

                {/* Hero Header */}
                <div className="pt-2 pb-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs mb-4">
                        <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                        <span>Production Systems &amp; Verified Code</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 mb-4">
                        Shipped Software &amp; <span style={{ color: "#2563eb" }}>Systems</span>
                    </h1>

                    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
                        Production native mobile applications, resilient backend microservices, and high-concurrency Discord platform automations engineered by Hazrat Ummar Shaikh.
                    </p>

                    {/* Credibility Stats Bar */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 pb-2 px-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">{projects.length || 6}</strong> Shipped Systems</span>
                        </div>
                        <div className="hidden sm:block h-3.5 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">Android · KMP · Backend</strong></span>
                        </div>
                        <div className="hidden sm:block h-3.5 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">100%</strong> Source Code Verified</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs Row */}
                <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2" role="group" aria-label="Project Categories">
                    {categories.map((category) => {
                        const count = getCategoryCount(category);
                        const isActive = activeTab === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                style={isActive ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                className={`text-xs font-semibold rounded-xl h-10 px-4 transition-all flex items-center gap-2 cursor-pointer ${
                                    isActive
                                        ? "text-white shadow-xs border border-blue-600"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs"
                                }`}
                            >
                                <span>{category}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse p-6 flex flex-col justify-between">
                                <div className="h-44 bg-slate-100 rounded-xl" />
                                <div className="space-y-2 mt-4">
                                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                                    <div className="h-4 bg-slate-100 rounded w-full" />
                                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                                </div>
                                <div className="h-8 bg-slate-100 rounded-lg mt-4" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && (
                    <LazyMotion features={domAnimation}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                            <AnimatePresence mode="popLayout">
                                {filteredProjects.map((project) => {
                                    const imagesList = project.images && project.images.length > 0 ? project.images : (project.image ? [project.image] : []);
                                    const currentIndex = currentImageIndices[project._id] || 0;
                                    const activeImgSrc = imagesList[currentIndex] || imagesList[0] || "";

                                    return (
                                        <m.div
                                            layout
                                            key={project._id || project.id}
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full"
                                        >
                                            <div
                                                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-300 group h-full flex flex-col cursor-pointer"
                                                onClick={() => openProjectDetails(project)}
                                            >
                                                {/* Card Image Wrapper */}
                                                <div className="relative h-52 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                                                    {activeImgSrc ? (
                                                        <>
                                                            <Image
                                                                src={activeImgSrc}
                                                                alt={project.title}
                                                                fill
                                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-blue-50/60 text-blue-600">
                                                            <Code2 className="w-12 h-12 stroke-[1.5]" />
                                                        </div>
                                                    )}

                                                    {/* Category Badge on Image */}
                                                    <div className="absolute top-3.5 left-3.5 z-10">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-blue-700 border border-slate-200/80 shadow-xs backdrop-blur-sm">
                                                            {project.category || "Software"}
                                                        </span>
                                                    </div>

                                                    {/* Multi-image slider buttons */}
                                                    {imagesList.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    prevImage(project._id, imagesList.length);
                                                                }}
                                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                                aria-label="Previous project image"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    nextImage(project._id, imagesList.length);
                                                                }}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                                aria-label="Next project image"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                                                                {imagesList.map((_, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                                                            idx === currentIndex ? "bg-white" : "bg-white/50"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Card Body & Content with balanced padding */}
                                                <div className="p-6 flex-grow flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                                                            {project.title}
                                                        </h3>

                                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                                            {project.description}
                                                        </p>

                                                        {/* Tech Stack Pills */}
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {project.tags?.slice(0, 4).map((tag, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-[10px] font-mono uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {project.tags && project.tags.length > 4 && (
                                                                <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5">
                                                                    +{project.tags.length - 4}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Card Bottom Links Bar */}
                                                    <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between text-xs text-slate-500">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1 text-slate-500">
                                                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{project.commentCount || 0}</span>
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                            {project.githubUrl && project.githubUrl.trim() !== "" && project.githubUrl !== "#" && (
                                                                <a
                                                                    href={project.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    aria-label={`View ${project.title} on GitHub`}
                                                                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs"
                                                                >
                                                                    <Github className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                            {project.liveUrl && project.liveUrl.trim() !== "" && project.liveUrl !== "#" && (
                                                                <a
                                                                    href={project.liveUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    aria-label={`View ${project.title} live demo`}
                                                                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs"
                                                                >
                                                                    {project.liveUrl.includes("play.google.com") ? (
                                                                        <Smartphone className="w-4 h-4" />
                                                                    ) : (
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    )}
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => openProjectDetails(project)}
                                                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors pl-1"
                                                            >
                                                                <span>Details</span>
                                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </m.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </LazyMotion>
                )}

                {/* Section: Architectural Case Studies */}
                <section className="mb-20">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Architecture Highlights</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 tracking-tight">
                            Commercial Implementation Case Studies
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                            Real software engineered for offline durability, sub-second latency, and deterministic multi-platform execution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COMMERCIAL_CASE_STUDIES.map((study, idx) => (
                            <div 
                                key={idx}
                                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                            {study.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">
                                        {study.title}
                                    </h3>
                                    <div className="text-[11px] font-mono text-slate-500 mb-4 pb-3 border-b border-slate-100">
                                        {study.tech}
                                    </div>

                                    <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                                        <div>
                                            <strong className="text-slate-900 font-semibold block mb-0.5">Problem:</strong>
                                            {study.problem}
                                        </div>
                                        <div>
                                            <strong className="text-slate-900 font-semibold block mb-0.5">Engineered Solution:</strong>
                                            {study.solution}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{study.impact}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Direct Sprint Call to Action */}
                <section className="bg-white border border-slate-200/90 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs mb-5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepting Sprints &amp; Contract Work</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 tracking-tight mb-4">
                        Have a Custom Software Project in Mind?
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                        Work directly with lead engineer Hazrat Ummar Shaikh. From offline-first Android suites to high-throughput backend microservices, get verified architecture delivered on schedule.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/contact">
                            <Button 
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="h-12 px-7 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer inline-flex items-center gap-2"
                            >
                                <span>Schedule Technical Discovery</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                        <Link href="/services">
                            <Button 
                                variant="outline" 
                                style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                                className="h-12 px-7 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-2 border"
                            >
                                <span>View Sprints &amp; Pricing</span>
                            </Button>
                        </Link>
                    </div>
                </section>

            </div>

            {/* Project Details & Discussion Dialog */}
            <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                <DialogContent showCloseButton={false} className="max-w-[95vw] w-full md:max-w-6xl bg-white border border-slate-200 text-slate-900 p-0 gap-0 overflow-hidden shadow-2xl rounded-3xl">
                    {selectedProject && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[88vh] relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                aria-label="Close project details"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Left Column: Image Showcase */}
                            <div className="lg:col-span-7 bg-slate-50 p-6 lg:p-8 flex flex-col justify-center items-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
                                {(() => {
                                    const modalImages = selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images : (selectedProject.image ? [selectedProject.image] : []);
                                    const activeModalImg = modalImages[currentImageIndices[selectedProject._id] || 0] || "";

                                    return (
                                        <div className="relative w-full h-[320px] sm:h-[440px] flex items-center justify-center">
                                            {activeModalImg ? (
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-white">
                                                    <Image
                                                        src={activeModalImg}
                                                        alt={selectedProject.title}
                                                        fill
                                                        className="object-contain"
                                                        sizes="(max-width: 1200px) 100vw, 700px"
                                                        priority
                                                    />
                                                    {modalImages.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    prevImage(selectedProject._id, modalImages.length);
                                                                }}
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all"
                                                                aria-label="Previous image"
                                                            >
                                                                <ChevronLeft className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    nextImage(selectedProject._id, modalImages.length);
                                                                }}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all"
                                                                aria-label="Next image"
                                                            >
                                                                <ChevronRight className="w-5 h-5" />
                                                            </button>
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                                {modalImages.map((_, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setCurrentImageIndices(prev => ({ ...prev, [selectedProject._id]: idx }))}
                                                                        className={`w-2 h-2 rounded-full transition-all ${
                                                                            idx === (currentImageIndices[selectedProject._id] || 0) ? "bg-white scale-125" : "bg-white/40"
                                                                        }`}
                                                                        aria-label={`View image ${idx + 1}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 text-sm">No Preview Image Available</div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right Column: Project Details & Discussion */}
                            <div className="lg:col-span-5 flex flex-col h-full bg-white overflow-hidden">
                                <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6">
                                    <DialogHeader className="text-left space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                {selectedProject.category}
                                            </span>
                                        </div>
                                        <DialogTitle className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950 tracking-tight">
                                            {selectedProject.title}
                                        </DialogTitle>
                                    </DialogHeader>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedProject.tags?.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Full Description */}
                                    <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                        {selectedProject.description}
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {selectedProject.githubUrl && selectedProject.githubUrl.trim() !== "" && selectedProject.githubUrl !== "#" && (
                                            <a
                                                href={selectedProject.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-[130px]"
                                            >
                                                <Button 
                                                    variant="outline" 
                                                    style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                                                    className="w-full h-11 rounded-xl hover:bg-slate-50 font-semibold cursor-pointer"
                                                >
                                                    <Github className="w-4 h-4 mr-2" />
                                                    <span>View Code</span>
                                                </Button>
                                            </a>
                                        )}
                                        {selectedProject.liveUrl && selectedProject.liveUrl.trim() !== "" && selectedProject.liveUrl !== "#" && (
                                            <a
                                                href={selectedProject.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-[130px]"
                                            >
                                                <Button 
                                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                    className="w-full h-11 rounded-xl hover:opacity-90 font-semibold shadow-xs cursor-pointer"
                                                >
                                                    {selectedProject.liveUrl.includes("play.google.com") ? (
                                                        <Smartphone className="w-4 h-4 mr-2" />
                                                    ) : (
                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                    )}
                                                    <span>Live Demo</span>
                                                </Button>
                                            </a>
                                        )}
                                    </div>

                                    {/* Community Discussion Section */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                                <span>Discussion &amp; Feedback ({comments.length})</span>
                                            </h3>
                                        </div>

                                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                                            {comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div 
                                                        key={comment._id} 
                                                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-slate-900">{comment.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 leading-relaxed">{comment.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-xs">
                                                    No comments yet. Share your technical feedback or question!
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment Form */}
                                        <form onSubmit={handleCommentSubmit} className="space-y-2.5">
                                            <Input
                                                placeholder="Your Name / Handle"
                                                value={newComment.name}
                                                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                                                required
                                                className="h-9 text-xs bg-white border-slate-200 rounded-lg focus:border-blue-600"
                                            />
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Ask about the architecture or leave feedback..."
                                                    value={newComment.content}
                                                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                                    required
                                                    rows={2}
                                                    className="text-xs bg-white border-slate-200 rounded-lg focus:border-blue-600 pr-10 resize-none"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={commentLoading}
                                                    size="icon"
                                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                    className="absolute bottom-2 right-2 h-7 w-7 rounded-md hover:opacity-90 cursor-pointer"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
