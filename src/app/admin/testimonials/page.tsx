"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Testimonial {
    _id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    image: string;
}

export default function TestimonialsAdmin() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({});

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/testimonials");
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            console.error("Failed to fetch testimonials", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;

        try {
            const res = await fetch(`/api/testimonials`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setTestimonials(testimonials.filter((t) => t._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete testimonial", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentTestimonial._id ? "PUT" : "POST";
            const res = await fetch("/api/testimonials", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentTestimonial),
            });

            if (res.ok) {
                fetchTestimonials();
                setIsDialogOpen(false);
                setCurrentTestimonial({});
            }
        } catch (error) {
            console.error("Failed to save testimonial", error);
        }
    };

    const openEditDialog = (testimonial: Testimonial) => {
        setCurrentTestimonial(testimonial);
        setIsDialogOpen(true);
    };

    const openNewDialog = () => {
        setCurrentTestimonial({ rating: 5 });
        setIsDialogOpen(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Testimonials</h1>
                <Button onClick={openNewDialog} className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {testimonials.map((testimonial) => (
                    <Card key={testimonial._id} className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-slate-900">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                    {testimonial.image ? (
                                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-base text-slate-900">{testimonial.name}</div>
                                    <div className="text-xs text-slate-500 font-normal">{testimonial.role} @ {testimonial.company}</div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-1 mb-2 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < (testimonial.rating || 5) ? "fill-current" : "text-slate-200"}`} />
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3">"{testimonial.content}"</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(testimonial)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(testimonial._id)}
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
                        <DialogTitle className="text-slate-900">{currentTestimonial._id ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Name</label>
                                <Input
                                    value={currentTestimonial.name || ""}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Role</label>
                                <Input
                                    value={currentTestimonial.role || ""}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Company</label>
                                <Input
                                    value={currentTestimonial.company || ""}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, company: e.target.value })}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Rating (1-5)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={currentTestimonial.rating || 5}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, rating: Number(e.target.value) })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Image URL</label>
                            <Input
                                value={currentTestimonial.image || ""}
                                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, image: e.target.value })}
                                placeholder="https://..."
                                className="bg-white border-slate-200 text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Content</label>
                            <Textarea
                                value={currentTestimonial.content || ""}
                                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, content: e.target.value })}
                                required
                                className="bg-white border-slate-200 text-slate-900 min-h-[100px]"
                            />
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
