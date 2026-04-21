"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, ExternalLink, Smartphone, ChevronLeft, ChevronRight, MessageSquare, Send } from "lucide-react";
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
    commentCount?: number;
}

interface Comment {
    _id: string;
    projectId: string;
    name: string;
    content: string;
    createdAt: string;
}

export const Projects = () => {
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
        if (!selectedProject) return;

        setCommentLoading(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProject._id,
                    name: newComment.name,
                    content: newComment.content,
                }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment({ name: "", content: "" });
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

    const filteredProjects = activeTab === "All"
        ? projects
        : projects.filter(project => project.category === activeTab);

    if (loading) {
        return <div className="py-20 text-center">Loading projects...</div>;
    }

    return (
        <section id="projects" className="py-20 bg-black/20">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                            Featured <span className="text-secondary">Projects</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                            A selection of my best work, ranging from automation systems to mobile applications.
                        </p>

                        <Tabs defaultValue="All" className="w-full max-w-3xl mx-auto" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/5 p-1 rounded-xl">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </m.div>

                    <m.div
                        layout
                        className="grid grid-rows-2 grid-flow-col gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 auto-cols-[300px] md:auto-cols-[350px]"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <m.div
                                    layout
                                    key={project.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="snap-center h-full"
                                >
                                    <Card
                                        className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col cursor-pointer"
                                        onClick={() => openProjectDetails(project)}
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                                            {/* Project Image */}
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-white/5 group-hover:scale-105 transition-transform duration-500">
                                                {(project.images && project.images.length > 0) || project.image ? (
                                                    <Image
                                                        src={(project.images && project.images.length > 0) ? project.images[currentImageIndices[project.id] || 0] : project.image || ""}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 350px"
                                                    />
                                                ) : (
                                                    <span>No Image</span>
                                                )}
                                            </div>

                                            {/* Overlay with Links */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10">
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button size="icon" variant="secondary" className="rounded-full">
                                                        <Github className="w-5 h-5" />
                                                    </Button>
                                                </a>
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button size="icon" className="rounded-full bg-primary text-white hover:bg-primary/90">
                                                        {project.liveUrl && project.liveUrl.includes("play.google.com") ? (
                                                            <Smartphone className="w-5 h-5" />
                                                        ) : (
                                                            <ExternalLink className="w-5 h-5" />
                                                        )}
                                                    </Button>
                                                </a>
                                            </div>

                                            {/* Slider Controls */}
                                            {project.images && project.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(project._id, project.images.length); }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(project._id, project.images.length); }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {project.images.map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === (currentImageIndices[project._id] || 0) ? 'bg-white' : 'bg-white/50'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags.map((tag, i) => (
                                                    <Badge key={i} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
                                                <MessageSquare className="w-3 h-3" />
                                                <span>{project.commentCount || 0} Comments</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    </m.div>
                </LazyMotion>
            </div>

            <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                <DialogContent showCloseButton={false} className="max-w-[95vw] w-full md:max-w-7xl bg-background/95 backdrop-blur-2xl border-white/10 text-foreground p-0 gap-0 overflow-hidden shadow-2xl shadow-primary/10">
                    {selectedProject && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 h-[85vh] relative">
                            {/* Custom Close Button */}
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-foreground"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-6 h-6"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            {/* Image Section - Left Side */}
                            <div className="lg:col-span-8 bg-black/40 p-4 lg:p-8 flex flex-col justify-center relative overflow-hidden group h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-30" />

                                <div className="relative w-full h-full min-h-[300px] lg:min-h-0 flex items-center justify-center">
                                    <div className="relative w-full h-full max-h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-muted/20">
                                        {(selectedProject.images && selectedProject.images.length > 0) || selectedProject.image ? (
                                            <>
                                                <Image
                                                    src={(selectedProject.images && selectedProject.images.length > 0) ? selectedProject.images[currentImageIndices[selectedProject.id] || 0] : selectedProject.image || ""}
                                                    alt={selectedProject.title}
                                                    fill
                                                    className="object-contain bg-black/50"
                                                    sizes="(max-width: 1200px) 100vw, 800px"
                                                    priority
                                                />
                                                {selectedProject.images && selectedProject.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(selectedProject._id, selectedProject.images.length); }}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary hover:text-white p-3 rounded-full text-white transition-all backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 duration-300"
                                                        >
                                                            <ChevronLeft className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(selectedProject._id, selectedProject.images.length); }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary hover:text-white p-3 rounded-full text-white transition-all backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 translate-x-[20px] group-hover:translate-x-0 duration-300"
                                                        >
                                                            <ChevronRight className="w-6 h-6" />
                                                        </button>
                                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                                            {selectedProject.images.map((_, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === (currentImageIndices[selectedProject._id] || 0) ? 'bg-primary scale-125' : 'bg-white/40 hover:bg-white/80'}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCurrentImageIndices(prev => ({ ...prev, [selectedProject._id]: idx }));
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground bg-white/5">No Image Available</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Section - Right Side */}
                            <div className="lg:col-span-4 flex flex-col h-full border-l border-white/10 bg-card/50 backdrop-blur-xl overflow-hidden">
                                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 lg:p-8">
                                    <DialogHeader className="mb-6 text-left">
                                        <DialogTitle className="text-3xl lg:text-4xl font-bold font-heading mb-2 text-foreground">
                                            {selectedProject.title}
                                        </DialogTitle>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {selectedProject.tags.map((tag, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none px-3 py-1 text-sm font-medium transition-transform hover:scale-105 shadow-lg shadow-primary/20"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </DialogHeader>

                                    <div className="prose prose-invert max-w-none mb-8">
                                        <p className="text-gray-700 leading-relaxed text-base lg:text-lg">
                                            {selectedProject.description}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mb-8">
                                        <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all h-11">
                                                <Github className="w-4 h-4 mr-2" />
                                                Code
                                            </Button>
                                        </a>
                                        <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-white h-11 shadow-lg shadow-primary/20">
                                                {selectedProject.liveUrl && selectedProject.liveUrl.includes("play.google.com") ? (
                                                    <Smartphone className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                )}
                                                Live Demo
                                            </Button>
                                        </a>
                                    </div>

                                    <div className="border-t border-white/10 pt-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            Discussion ({comments.length})
                                        </h3>

                                        <div className="space-y-3">
                                            {comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div key={comment._id} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-semibold text-primary text-sm">{comment.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-snug">{comment.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 text-muted-foreground bg-white/5 rounded-lg border border-white/5 border-dashed">
                                                    <p className="text-sm">No comments yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Comment Form */}
                                <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md z-10">
                                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                                        <Input
                                            placeholder="Your Name"
                                            value={newComment.name}
                                            onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                                            required
                                            className="bg-muted/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all h-10 text-sm rounded-lg"
                                        />
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Share your thoughts..."
                                                value={newComment.content}
                                                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                                required
                                                className="bg-muted/50 border-white/10 min-h-[60px] pr-12 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm py-3 rounded-lg"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={commentLoading}
                                                size="icon"
                                                className="absolute bottom-2 right-2 h-8 w-8 bg-primary hover:bg-primary/90 text-white rounded-md shadow-lg shadow-primary/20 transition-transform hover:scale-105"
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};
