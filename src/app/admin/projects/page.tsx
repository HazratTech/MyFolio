"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

interface Project {
    _id: string;
    title: string;
    category: string;
    images: string[];
    image?: string;
}

export default function ProjectsAdmin() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setProjects(projects.filter((p) => p._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
                <Link href="/admin/projects/new">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((project) => (
                    <Card key={project._id} className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden group">
                        <div className="h-44 bg-slate-100 relative border-b border-slate-100">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                                {(project.images && project.images.length > 0) || project.image ? (
                                    <img
                                        src={(project.images && project.images.length > 0) ? project.images[0] : project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : "No Image"}
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start text-slate-900">
                                <span className="truncate">{project.title}</span>
                            </CardTitle>
                            <p className="text-xs text-slate-500">{project.category}</p>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2">
                            <Link href={`/admin/projects/${project._id}`}>
                                <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(project._id)}
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
