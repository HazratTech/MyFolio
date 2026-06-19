"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import TiptapEditor from "@/components/admin/TiptapEditor";
import { getPresignedUrl, completeUpload, deleteFile } from "@/app/actions/upload";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import EditorImageSettings from "@/components/admin/EditorImageSettings";
import { Editor } from "@tiptap/react";

interface BlogPostFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function BlogPostForm({ initialData, isEditing = false }: BlogPostFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        tags: "",
        coverImage: "",
        status: "draft",
        ...initialData
    });

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setFormData({
                ...initialData,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags
            });
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/blog/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditorChange = (content: string) => {
        setFormData((prev: any) => ({ ...prev, content }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);

            // Delete existing image if replacing
            if (formData.coverImageKey) {
                await deleteFile(formData.coverImageKey);
            }

            // 1. Get Presigned URL
            const { upload_url, object_key } = await getPresignedUrl(file.type, file.size);

            // 2. Upload to MinIO
            await fetch(upload_url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            // 3. Complete Upload
            const { final_url } = await completeUpload(object_key, file.size, file.type);

            setFormData((prev: any) => ({ ...prev, coverImage: final_url, coverImageKey: object_key }));
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
            publishedAt: formData.status === 'published' && !formData.publishedAt ? new Date() : formData.publishedAt
        };

        try {
            const url = isEditing ? `/api/blog/posts/${initialData.slug}` : "/api/blog/posts";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/blog");
                router.refresh();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save post");
            }
        } catch (error) {
            console.error("Failed to save post:", error);
            alert("Failed to save post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold font-heading">
                        {isEditing ? "Edit Post" : "New Post"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="text-lg font-bold bg-background border-border"
                                    placeholder="Enter post title..."
                                />
                            </div>
                            {!isEditing && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Slug (Optional - auto-generated from title)</label>
                                    <Input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="bg-background border-border font-mono text-sm"
                                        placeholder="custom-slug-url"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <TiptapEditor
                                    content={formData.content}
                                    onChange={handleEditorChange}
                                    onEditorReady={setEditorInstance}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Excerpt</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="Brief summary for SEO and previews..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cover Image</label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors relative group">
                                    <Input
                                        id="cover-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    {formData.coverImage ? (
                                        <div className="relative aspect-video w-full rounded-md overflow-hidden group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formData.coverImage}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <MediaPickerModal onSelect={(media) => {
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        coverImage: media.url,
                                                        coverImageKey: media.key
                                                    }));
                                                }}>
                                                    <Button variant="secondary" size="sm">
                                                        Replace
                                                    </Button>
                                                </MediaPickerModal>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setFormData((prev: any) => ({ ...prev, coverImage: "", coverImageKey: "" }))}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <MediaPickerModal onSelect={(media) => {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                coverImage: media.url,
                                                coverImageKey: media.key
                                            }));
                                        }}>
                                            <div className="py-8 cursor-pointer relative hover:bg-white/5 transition-colors">
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Select from Media Library</p>
                                            </div>
                                        </MediaPickerModal>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <div className="flex gap-2">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select Category...</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-xs text-muted-foreground">Create new categories in the Categories tab.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags</label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="nextjs, react, tutorial"
                                    className="bg-background border-border"
                                />
                                <p className="text-xs text-muted-foreground">Comma separated tags.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Settings Panel - Appears when image is selected */}
                    {editorInstance && (
                        <EditorImageSettings editor={editorInstance} />
                    )}
                </div>
            </div>
        </form>
    );
}
