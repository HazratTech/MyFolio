"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2, MessageSquare, Eye, Sparkles, ExternalLink, Github, Code2, Check, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { uploadFromUrl, getPresignedUrl, completeUpload, deleteFile } from "@/app/actions/upload";

const PRESET_THUMBNAILS = [
    { label: "ClutchBot (Valorant AI)", path: "/images/projects/clutchbot.jpg" },
    { label: "Clipping Club (Bounty)", path: "/images/projects/clippingclub.jpg" },
    { label: "Veridex (RPG/Faction)", path: "/images/projects/veridex.jpg" },
    { label: "Clock In N Out (Shift)", path: "/images/projects/clock_in_n_out.jpg" },
];

const QUICK_TAGS = [
    "Python 3.12", "discord.py", "Components V2", "PostgreSQL", "MongoDB", "Motor",
    "FastAPI", "Docker", "AsyncIO", "Redis", "Android", "Kotlin", "Jetpack Compose",
    "KMP", "Next.js", "TypeScript"
];

export default function ProjectForm({ params }: { params: { id?: string } }) {
    const router = useRouter();
    const isEditing = !!params.id;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Discord Bots",
        tags: "",
        images: [] as string[],
        imageKeys: [] as string[],
        liveUrl: "",
        githubUrl: "",
        id: 0, // Custom ID for ordering
    });
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        if (isEditing) {
            fetchProject();
        }
    }, [isEditing]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`);
            const data = await res.json();
            setFormData({
                ...data,
                tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
                images: data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []),
                imageKeys: data.imageKeys || [],
            });
            fetchComments(data._id);
        } catch (error) {
            console.error("Failed to fetch project", error);
        }
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

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setComments(comments.filter((c) => c._id !== commentId));
            }
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (index: number, value: string, key?: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;

        const newKeys = [...formData.imageKeys];
        if (key) {
            newKeys[index] = key;
        }

        setFormData({ ...formData, images: newImages, imageKeys: newKeys });
    };

    const addImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, ""],
            imageKeys: [...formData.imageKeys, ""]
        });
    };

    const removeImageField = async (index: number) => {
        const imageKey = formData.imageKeys[index];
        if (imageKey) {
            if (confirm("Are you sure you want to remove this image? It will be deleted from storage.")) {
                try {
                    await deleteFile(imageKey);
                } catch (error) {
                    console.error("Failed to delete file from storage", error);
                }
            }
        }

        const newImages = formData.images.filter((_, i) => i !== index);
        const newKeys = formData.imageKeys.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages, imageKeys: newKeys });
    };

    const toggleQuickTag = (tag: string) => {
        const currentTags = formData.tags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);

        const index = currentTags.indexOf(tag);
        let updated: string[];
        if (index > -1) {
            updated = currentTags.filter(t => t !== tag);
        } else {
            updated = [...currentTags, tag];
        }
        setFormData({ ...formData, tags: updated.join(", ") });
    };

    const applyPresetThumbnail = (path: string) => {
        if (formData.images.length === 0) {
            setFormData({
                ...formData,
                images: [path],
                imageKeys: [""]
            });
        } else {
            handleImageChange(0, path, "");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
            id: Number(formData.id),
        };

        try {
            const url = isEditing ? `/api/projects/${params.id}` : "/api/projects";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/projects");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to save project", error);
        } finally {
            setLoading(false);
        }
    };

    const parsedTags = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
    const activePreviewImg = formData.images[0] || "";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/projects">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold font-heading">
                        {isEditing ? "Edit Project" : "New Project"}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-7">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. ClutchBot — Valorant Assistant"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#18181b] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                            <option value="Discord Bots">Discord Bots</option>
                                            <option value="Mobile Apps">Mobile Apps</option>
                                            <option value="Backend">Backend</option>
                                            <option value="AI & Automations">AI &amp; Automations</option>
                                            <option value="Web Development">Web Development</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Display Order ID</label>
                                        <Input
                                            type="number"
                                            name="id"
                                            value={formData.id}
                                            onChange={handleChange}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Live Demo URL</label>
                                        <Input
                                            name="liveUrl"
                                            value={formData.liveUrl}
                                            onChange={handleChange}
                                            placeholder="https://relayworks.dev/..."
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">GitHub Repository URL</label>
                                    <Input
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleChange}
                                        placeholder="https://github.com/ihazratummar/..."
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>

                                {/* Quick Presets for Thumbnails */}
                                <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                            <span>Quick Preset Thumbnails (Generated Assets)</span>
                                        </label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_THUMBNAILS.map((preset) => (
                                            <button
                                                type="button"
                                                key={preset.path}
                                                onClick={() => applyPresetThumbnail(preset.path)}
                                                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                                    formData.images[0] === preset.path
                                                        ? "bg-blue-600 border-blue-500 text-white font-semibold"
                                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Project Images */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Project Images &amp; Storage</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="flex flex-col gap-2 p-4 border border-white/10 rounded-lg bg-white/5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-muted-foreground">Image {index + 1}</span>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeImageField(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {img ? (
                                                    <div className="flex gap-4 items-center">
                                                        <div className="relative w-24 h-24 bg-black/20 rounded-md overflow-hidden flex-shrink-0">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-grow space-y-2">
                                                            <Input
                                                                value={img}
                                                                onChange={(e) => handleImageChange(index, e.target.value)}
                                                                className="bg-white/5 border-white/10 font-mono text-xs"
                                                            />
                                                            <p className="text-xs text-green-400">✓ Active image set</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-xs text-muted-foreground">Paste Image URL / Local Path</label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="/images/projects/... or https://..."
                                                                        className="bg-white/5 border-white/10 text-xs"
                                                                        id={`url-input-${index}`}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const input = document.getElementById(`url-input-${index}`) as HTMLInputElement;
                                                                            if (!input.value) return;
                                                                            handleImageChange(index, input.value.trim());
                                                                        }}
                                                                    >
                                                                        Set
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-xs text-muted-foreground">Or Upload File to Storage</label>
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="bg-white/5 border-white/10 cursor-pointer text-xs"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;

                                                                        try {
                                                                            setLoading(true);
                                                                            const { upload_url, object_key } = await getPresignedUrl(file.type, file.size);
                                                                            await fetch(upload_url, {
                                                                                method: "PUT",
                                                                                headers: { "Content-Type": file.type },
                                                                                body: file,
                                                                            });
                                                                            const { final_url } = await completeUpload(object_key, file.size, file.type);
                                                                            handleImageChange(index, final_url, object_key);
                                                                        } catch (err) {
                                                                            alert("Failed to upload file");
                                                                            console.error(err);
                                                                        } finally {
                                                                            setLoading(false);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addImageField} className="mt-2 w-full border-dashed">
                                        + Add Image
                                    </Button>
                                </div>

                                {/* Tags & Quick Selector */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Tags (comma separated)</label>
                                    <Input
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="Python 3.12, discord.py, Components V2"
                                        className="bg-white/5 border-white/10"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {QUICK_TAGS.map((tag) => {
                                            const isSelected = parsedTags.includes(tag);
                                            return (
                                                <button
                                                    type="button"
                                                    key={tag}
                                                    onClick={() => toggleQuickTag(tag)}
                                                    className={`text-[11px] px-2 py-0.5 rounded-md font-mono border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-blue-600 border-blue-500 text-white"
                                                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                                                    }`}
                                                >
                                                    {isSelected ? "✓ " : "+ "}{tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Description</label>
                                        <span className="text-xs text-slate-400 font-mono">{formData.description.length} chars</span>
                                    </div>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        placeholder="Describe the architecture, key commands, client problem solved, and production metrics..."
                                        className="bg-white/5 border-white/10 min-h-[160px] text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6">
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? "Saving Project..." : "Save Project"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Card Preview Column */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="sticky top-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live Portfolio Card Preview</h2>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-md flex flex-col text-slate-900">
                            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                {activePreviewImg ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={activePreviewImg}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-blue-50/60 text-blue-600">
                                        <Code2 className="w-12 h-12 stroke-[1.5]" />
                                    </div>
                                )}

                                <div className="absolute top-3.5 left-3.5 z-10">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-blue-700 border border-slate-200/80 shadow-xs">
                                        {formData.category || "Discord Bots"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col justify-between flex-grow">
                                <div>
                                    <h3 className="text-lg font-bold font-heading text-slate-900 mb-1.5 line-clamp-1">
                                        {formData.title || "Untitled Project"}
                                    </h3>
                                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-3">
                                        {formData.description || "Enter a description to see how it will be previewed on the portfolio page..."}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {parsedTags.length > 0 ? (
                                            parsedTags.slice(0, 4).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-[10px] font-mono uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-mono text-slate-400">No tags added</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        {formData.githubUrl && (
                                            <span className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
                                                <Github className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                        {formData.liveUrl && (
                                            <span className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-blue-600 font-semibold text-xs">View Details →</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments admin preview if editing */}
                        {isEditing && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-300">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <span>Comments ({comments.length})</span>
                                </h3>
                                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment._id} className="bg-white/5 p-3 rounded-lg flex justify-between items-start text-xs border border-white/10">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-blue-400">{comment.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300">{comment.content}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-6 w-6"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-xs text-center py-3">No comments on this project yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
