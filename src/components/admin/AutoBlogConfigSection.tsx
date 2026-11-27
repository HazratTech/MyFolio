"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Check, X, Plus } from "lucide-react";

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
    const [customTopics, setCustomTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch("/api/admin/auto-blog-config", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    setIsActive(data.isActive ?? true);

                    const topics: string[] = data.allowedTopics || [];
                    const presets = topics.filter(t => PRESET_TOPICS.some(p => p.id === t));
                    const customs = topics.filter(t => !PRESET_TOPICS.some(p => p.id === t));

                    setSelectedPresets(presets);
                    setCustomTopics(customs);
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

    const handleAddTopic = () => {
        const trimmed = newTopic.trim().toLowerCase();
        if (trimmed && !customTopics.includes(trimmed)) {
            setCustomTopics(prev => [...prev, trimmed]);
        }
        setNewTopic("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTopic();
        }
    };

    const handleRemoveTopic = (topicToRemove: string) => {
        setCustomTopics(prev => prev.filter(t => t !== topicToRemove));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const customs = customTopics
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
            <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
                <CardContent className="py-16 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                        </span>
                        <span>AI Auto-Blog Settings</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                        Configure allowed topics and automated publishing status for daily articles.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                        {isActive ? "Active" : "Paused"}
                    </span>
                    <button
                        id="active-toggle"
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label="Toggle AI Auto-Blog"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
                            isActive ? "bg-blue-600" : "bg-slate-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Preset Topics */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Allowed Preset Topics
                            </Label>
                            <p className="text-xs text-slate-500 mt-0.5">
                                The AI picks daily trending engineering topics from these tags.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {PRESET_TOPICS.map((preset) => {
                                const isChecked = selectedPresets.includes(preset.id);
                                return (
                                    <label
                                        key={preset.id}
                                        htmlFor={`topic-${preset.id}`}
                                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                                            isChecked
                                                ? "bg-blue-50/70 border-blue-500 text-blue-950 shadow-2xs"
                                                : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            id={`topic-${preset.id}`}
                                            checked={isChecked}
                                            onChange={(e) => handleCheckboxChange(preset.id, e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer shrink-0"
                                        />
                                        <span className="truncate">{preset.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Topics */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div>
                            <Label htmlFor="new-topic" className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Custom / Other Topics
                            </Label>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Add specific technologies or niche keywords (press Enter or click Add Topic).
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                id="new-topic"
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. shopify functions, langgraph, docker"
                                className="h-10 bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-xl shadow-2xs flex-1"
                            />
                            <Button
                                type="button"
                                onClick={handleAddTopic}
                                variant="outline"
                                className="h-10 px-4 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>Add Topic</span>
                            </Button>
                        </div>

                        {customTopics.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {customTopics.map((topic) => (
                                    <div
                                        key={topic}
                                        className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 hover:border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                                    >
                                        <span className="font-mono text-[11px] font-semibold text-slate-800">{topic}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTopic(topic)}
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-0.5 transition-colors cursor-pointer"
                                            aria-label={`Remove topic ${topic}`}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Footer */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-950 hover:bg-black text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-xs cursor-pointer transition-colors"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Save Settings"
                            )}
                        </Button>

                        {success && (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Settings saved!</span>
                            </span>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
