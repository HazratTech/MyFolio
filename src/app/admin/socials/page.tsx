"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Social {
    _id: string;
    name: string;
    href: string;
    icon: string;
}

export default function SocialsAdmin() {
    const [socials, setSocials] = useState<Social[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSocial, setCurrentSocial] = useState<Partial<Social>>({});

    useEffect(() => {
        fetchSocials();
    }, []);

    const fetchSocials = async () => {
        try {
            const res = await fetch("/api/socials");
            const data = await res.json();
            setSocials(data);
        } catch (error) {
            console.error("Failed to fetch socials", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this social link?")) return;

        try {
            const res = await fetch(`/api/socials`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setSocials(socials.filter((s) => s._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete social link", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentSocial._id ? "PUT" : "POST";
            const res = await fetch("/api/socials", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentSocial),
            });

            if (res.ok) {
                fetchSocials();
                setIsDialogOpen(false);
                setCurrentSocial({});
            }
        } catch (error) {
            console.error("Failed to save social link", error);
        }
    };

    const openEditDialog = (social: Social) => {
        setCurrentSocial(social);
        setIsDialogOpen(true);
    };

    const openNewDialog = () => {
        setCurrentSocial({});
        setIsDialogOpen(true);
    };

    const renderIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Share2 className="w-5 h-5" />;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Social Links</h1>
                <Button onClick={openNewDialog} className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {socials.map((social) => (
                    <Card key={social._id} className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
                                    {renderIcon(social.icon)}
                                </div>
                                <span className="truncate">{social.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4 truncate">{social.href}</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(social)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(social._id)}
                                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{currentSocial._id ? "Edit Social Link" : "New Social Link"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Platform Name</label>
                            <Input
                                value={currentSocial.name || ""}
                                onChange={(e) => setCurrentSocial({ ...currentSocial, name: e.target.value })}
                                placeholder="GitHub, LinkedIn, Twitter"
                                required
                                className="bg-white border-slate-200 text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">URL</label>
                            <Input
                                value={currentSocial.href || ""}
                                onChange={(e) => setCurrentSocial({ ...currentSocial, href: e.target.value })}
                                placeholder="https://..."
                                required
                                className="bg-white border-slate-200 text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Icon (Lucide Name)</label>
                            <Input
                                value={currentSocial.icon || ""}
                                onChange={(e) => setCurrentSocial({ ...currentSocial, icon: e.target.value })}
                                placeholder="Github, Linkedin, Twitter"
                                required
                                className="bg-white border-slate-200 text-slate-900"
                            />
                            <p className="text-xs text-slate-500">
                                Enter the exact name of the Lucide icon (e.g., "Github", "Twitter", "Linkedin").
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-600 hover:bg-slate-100">Cancel</Button>
                            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
