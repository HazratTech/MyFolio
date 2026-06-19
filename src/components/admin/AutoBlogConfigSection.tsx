"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Check } from "lucide-react";

const PRESET_TOPICS = [
    { id: "python", label: "Python" },
    { id: "kotlin", label: "Kotlin" },
    { id: "compose", label: "Jetpack Compose" },
    { id: "android", label: "Android" },
    { id: "android os", label: "Android OS" },
    { id: "ios dev", label: "iOS Dev" },
    { id: "android dev", label: "Android Dev" },
    { id: "fastapi", label: "FastAPI" },
    { id: "off topic", label: "Off Topic" }
];

export function AutoBlogConfigSection() {
    const [isActive, setIsActive] = useState(true);
    const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
    const [customTopics, setCustomTopics] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch("/api/admin/auto-blog-config");
                if (res.ok) {
                    const data = await res.json();
                    setIsActive(data.isActive ?? true);
                    
                    const topics: string[] = data.allowedTopics || [];
                    const presets = topics.filter(t => PRESET_TOPICS.some(p => p.id === t));
                    const customs = topics.filter(t => !PRESET_TOPICS.some(p => p.id === t));
                    
                    setSelectedPresets(presets);
                    setCustomTopics(customs.join(", "));
                }
            } catch (err) {
                console.error("Failed to load config:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleCheckboxChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedPresets(prev => [...prev, id]);
        } else {
            setSelectedPresets(prev => prev.filter(p => p !== id));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        // Parse custom topics
        const customs = customTopics
            .split(",")
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        const allowedTopics = Array.from(new Set([...selectedPresets, ...customs]));

        try {
            const res = await fetch("/api/admin/auto-blog-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ allowedTopics, isActive }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Failed to save configuration");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        AI Auto-Blog Settings
                    </CardTitle>
                    <CardDescription className="mt-1">
                        Configure what topics and content types the AI is allowed to write about.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <Label htmlFor="active-toggle" className="text-xs text-muted-foreground font-medium uppercase tracking-wider cursor-pointer">
                        {isActive ? "Active" : "Disabled"}
                    </Label>
                    <button
                        id="active-toggle"
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            isActive ? "bg-primary" : "bg-zinc-700"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <Label className="text-sm font-semibold text-foreground">Select Allowed Topics</Label>
                        <p className="text-xs text-muted-foreground mb-4">The AI will choose daily trending articles related to these tags.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {PRESET_TOPICS.map((preset) => (
                                <div key={preset.id} className="flex items-center space-x-3 p-3 rounded-lg bg-black/20 hover:bg-black/35 border border-white/5 transition-all">
                                    <input
                                        type="checkbox"
                                        id={`topic-${preset.id}`}
                                        checked={selectedPresets.includes(preset.id)}
                                        onChange={(e) => handleCheckboxChange(preset.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                                    />
                                    <Label
                                        htmlFor={`topic-${preset.id}`}
                                        className="text-sm font-medium cursor-pointer flex-1 select-none"
                                    >
                                        {preset.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-topics" className="text-sm font-semibold">Custom / Other Topics</Label>
                        <p className="text-xs text-muted-foreground">Add any other tags or technologies you want the AI to write about, comma-separated (e.g. node.js, rust, nextjs).</p>
                        <Input
                            id="custom-topics"
                            value={customTopics}
                            onChange={(e) => setCustomTopics(e.target.value)}
                            placeholder="e.g. web assembly, docker, next.js"
                            className="bg-black/20 border-white/10 text-sm py-5 focus-visible:ring-primary focus-visible:border-primary shadow-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary/95 text-white font-medium shadow-lg shadow-primary/20"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Settings"
                            )}
                        </Button>

                        {success && (
                            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
