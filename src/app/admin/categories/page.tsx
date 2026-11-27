"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Tag as TagIcon, LayoutGrid } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    description: string;
    count: number;
}

interface Tag {
    _id: string;
    name: string;
    count: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [newTag, setNewTag] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, tagRes] = await Promise.all([
                fetch("/api/blog/categories"),
                fetch("/api/blog/tags")
            ]);

            if (catRes.ok) setCategories(await catRes.json());
            if (tagRes.ok) setTags(await tagRes.json());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/blog/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });
            if (res.ok) {
                setNewCategory({ name: "", description: "" });
                fetchData();
            }
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/blog/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTag }),
            });
            if (res.ok) {
                setNewTag("");
                fetchData();
            }
        } catch (error) {
            console.error("Failed to add tag:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-heading">Manage Taxonomies</h1>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-slate-200/70 p-1 rounded-xl mx-auto md:mx-0">
                    <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600">Categories</TabsTrigger>
                    <TabsTrigger value="tags" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600">Tags</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    Add Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddCategory} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700">Name</label>
                                        <Input
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            required
                                            className="bg-white border-slate-200 text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700">Description</label>
                                        <Input
                                            value={newCategory.description}
                                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                            className="bg-white border-slate-200 text-slate-900"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">Add Category</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                                    All Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loading ? (
                                        <p className="text-slate-500 text-center text-sm">Loading...</p>
                                    ) : categories.length === 0 ? (
                                        <p className="text-slate-500 text-center text-sm">No categories yet.</p>
                                    ) : (
                                        categories.map((cat) => (
                                            <div key={cat._id} className="flex justify-between items-center p-3 bg-slate-50/70 rounded-lg border border-slate-200/80">
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{cat.name}</p>
                                                    {cat.description && <p className="text-xs text-slate-500">{cat.description}</p>}
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tags" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    Add Tag
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddTag} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700">Name</label>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            required
                                            className="bg-white border-slate-200 text-slate-900"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">Add Tag</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                                    <TagIcon className="w-4 h-4 text-blue-600" />
                                    All Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {loading ? (
                                        <p className="text-slate-500 w-full text-center text-sm">Loading...</p>
                                    ) : tags.length === 0 ? (
                                        <p className="text-slate-500 w-full text-center text-sm">No tags yet.</p>
                                    ) : (
                                        tags.map((tag) => (
                                            <div key={tag._id} className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                                                <span className="text-xs font-medium">{tag.name}</span>
                                                <button className="text-slate-400 hover:text-rose-600">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
