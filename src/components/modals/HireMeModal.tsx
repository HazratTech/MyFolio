"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const HireMeModal = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        service: "Native Mobile App",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const key = id.replace("hire-", "");
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const embed = {
            title: "New Project Quote Request",
            color: 2450411, // Royal blue (#2563eb)
            fields: [
                { name: "Name", value: formData.name, inline: true },
                { name: "Email", value: formData.email, inline: true },
                { name: "Service", value: formData.service, inline: true },
                { name: "Message", value: formData.message },
            ],
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (response.ok) {
                setResult("Discovery request sent successfully! We'll review and respond within 24 hours.");
                trackEvent("hire_me_submit", {
                    service: formData.service,
                });
                setFormData({ name: "", email: "", service: "Native Mobile App", message: "" });
                setTimeout(() => setOpen(false), 2400);
            } else {
                setResult("Failed to send message. Please try emailing directly.");
            }
        } catch (error) {
            console.error(error);
            setResult("Network error. Please try emailing directly.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-white border border-slate-200 text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8 rounded-3xl">
                <DialogHeader className="space-y-2 text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Direct Senior Engineering</span>
                    </div>
                    <DialogTitle className="text-2xl sm:text-3xl font-black font-heading text-slate-950 tracking-tight">
                        Start Your Project
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        Direct sprint discovery with founder Hazrat Ummar Shaikh. Receive a fixed-scope milestone proposal within 24 hours.
                    </DialogDescription>
                </DialogHeader>

                <form id="hire-form" onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="hire-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Your Name
                        </Label>
                        <Input
                            id="hire-name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500 rounded-xl h-11 text-sm shadow-2xs transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hire-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Work Email
                        </Label>
                        <Input
                            id="hire-email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            required
                            className="bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500 rounded-xl h-11 text-sm shadow-2xs transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hire-service" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Engineering Discipline
                        </Label>
                        <select
                            id="hire-service"
                            value={formData.service}
                            onChange={handleChange}
                            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 shadow-2xs transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans"
                        >
                            <option value="Native Mobile App">Native Mobile App (Android & iOS)</option>
                            <option value="AI Chatbots & Agents">AI Chatbots & Conversational Agents</option>
                            <option value="Discord Bot">Custom Discord Bot & Event Engines</option>
                            <option value="Cloud Backend / APIs">Cloud Backend & High-Throughput APIs</option>
                            <option value="Architecture Audit">Architecture Audit & Refactoring</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hire-message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Project Scope & Objectives
                        </Label>
                        <Textarea
                            id="hire-message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Briefly describe what you're building, target milestones, or technical requirements..."
                            required
                            rows={3}
                            className="bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500 rounded-xl p-3 text-sm min-h-[90px] shadow-2xs transition-all resize-y"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                        className="w-full hover:opacity-90 text-white font-bold h-12 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm transition-opacity"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting Discovery Request...</span>
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                <span>Send Project Discovery Request</span>
                            </>
                        )}
                    </Button>

                    <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                        Prefer direct email?{" "}
                        <a href="mailto:hazratummar9@gmail.com" className="text-blue-600 font-semibold hover:underline">
                            hazratummar9@gmail.com
                        </a>
                    </div>

                    {result && (
                        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                            result.includes("successfully")
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                            {result.includes("successfully") ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            ) : (
                                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            )}
                            <span>{result}</span>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};
