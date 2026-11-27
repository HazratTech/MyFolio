"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Service {
    _id: string;
    title: string;
    category: string;
    description: string;
    price: string;
    icon: string;
    features: string[];
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service>>({ features: [] });
    const [newFeature, setNewFeature] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/services`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setServices(services.filter((s) => s._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete service", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentService._id ? "PUT" : "POST";
            const res = await fetch("/api/services", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentService),
            });

            if (res.ok) {
                fetchServices();
                setIsDialogOpen(false);
                setCurrentService({ features: [] });
            }
        } catch (error) {
            console.error("Failed to save service", error);
        }
    };

    const openEditDialog = (service: Service) => {
        setCurrentService(service);
        setIsDialogOpen(true);
    };

    const openNewDialog = () => {
        setCurrentService({ features: [] });
        setIsDialogOpen(true);
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setCurrentService({
                ...currentService,
                features: [...(currentService.features || []), newFeature.trim()]
            });
            setNewFeature("");
        }
    };

    const removeFeature = (index: number) => {
        const updatedFeatures = [...(currentService.features || [])];
        updatedFeatures.splice(index, 1);
        setCurrentService({ ...currentService, features: updatedFeatures });
    };

    const renderIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Box className="w-5 h-5" />;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-heading">Services</h1>
                <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((service) => (
                    <Card key={service._id} className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
                                    {renderIcon(service.icon)}
                                </div>
                                <span className="truncate">{service.title}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">{service.price}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(service)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(service._id)}
                                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{currentService._id ? "Edit Service" : "New Service"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Title</label>
                                <Input
                                    value={currentService.title || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Category</label>
                                <Input
                                    value={currentService.category || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Description</label>
                            <Textarea
                                value={currentService.description || ""}
                                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                                required
                                className="bg-white border-slate-200 text-slate-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Price</label>
                                <Input
                                    value={currentService.price || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Icon (Lucide Name)</label>
                                <Input
                                    value={currentService.icon || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, icon: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Features</label>
                            <div className="flex gap-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add a feature..."
                                    className="bg-white border-slate-200 text-slate-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addFeature();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
                            </div>
                            <div className="space-y-2 mt-2">
                                {currentService.features?.map((feature, index) => (
                                    <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2 rounded text-sm text-slate-800">
                                        <span>{feature}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-600 hover:bg-slate-100">Cancel</Button>
                            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
