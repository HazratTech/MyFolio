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
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-white/5 mx-auto md:mx-0">
                    <TabsTrigger value="categories" className="data-[state=active]:bg-primary">Categories</TabsTrigger>
                    <TabsTrigger value="tags" className="data-[state=active]:bg-primary">Tags</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-white/10 md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" />
                                    Add Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddCategory} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Input
                                            value={newCategory.description}
                                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Add Category</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-white/10 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-primary" />
                                    All Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-muted-foreground text-center">Loading...</p>
                                    ) : categories.length === 0 ? (
                                        <p className="text-muted-foreground text-center">No categories yet.</p>
                                    ) : (
                                        categories.map((cat) => (
                                            <div key={cat._id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div>
                                                    <p className="font-medium">{cat.name}</p>
                                                    {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400">
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
                        <Card className="bg-card/50 backdrop-blur-sm border-white/10 md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" />
                                    Add Tag
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddTag} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Add Tag</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-white/10 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TagIcon className="w-4 h-4 text-primary" />
                                    All Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {loading ? (
                                        <p className="text-muted-foreground w-full text-center">Loading...</p>
                                    ) : tags.length === 0 ? (
                                        <p className="text-muted-foreground w-full text-center">No tags yet.</p>
                                    ) : (
                                        tags.map((tag) => (
                                            <div key={tag._id} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                <span className="text-sm">{tag.name}</span>
                                                <button className="text-muted-foreground hover:text-red-400">
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
