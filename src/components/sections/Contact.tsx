"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ExternalLink, Send, MessageSquare, CheckCircle2, ChevronRight, Clock, ShieldCheck, Terminal } from "lucide-react";
import Link from "next/link";

interface Social {
    name: string;
    href: string;
    icon: string;
    color: string;
}

export const Contact = () => {
    // Enforce consistent light theme
    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        service: "Mobile App Development",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [socials, setSocials] = useState<Social[]>([]);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const res = await fetch('/api/socials');
                if (res.ok) {
                    const data = await res.json();
                    setSocials(data);
                }
            } catch (error) {
                console.error("Failed to fetch socials:", error);
            }
        };
        fetchSocials();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const key = id.replace("contact-", "");
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const embed = {
            title: "New Lead from RelayWorks Contact Page",
            color: 2450411,
            fields: [
                { name: "Name", value: formData.name || "N/A", inline: true },
                { name: "Email", value: formData.email || "N/A", inline: true },
                { name: "Service", value: formData.service || "N/A", inline: true },
                { name: "Subject", value: formData.subject || "N/A", inline: false },
                { name: "Message", value: formData.message || "N/A", inline: false },
            ],
            footer: { text: "RelayWorks Lead Pipeline" },
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    embeds: [embed],
                }),
            });

            if (response.ok) {
                setResult("Thank you! Your message has been sent directly to Hazrat Ummar Shaikh. You will receive a response within 24 hours.");
                setFormData({
                    name: "",
                    email: "",
                    service: "Mobile App Development",
                    subject: "",
                    message: "",
                });
            } else {
                setResult("Failed to send message. Please email directly at hazratummar9@gmail.com");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setResult("Failed to send message. Please email directly at hazratummar9@gmail.com");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pt-4 pb-24 relative">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-4 mb-6">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800 font-semibold">Contact &amp; Discovery</span>
                </nav>

                {/* Hero Header */}
                <div className="pt-2 pb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs mb-4">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        <span>Direct Senior Builder Access</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 mb-4">
                        Let&apos;s Build <span style={{ color: "#2563eb" }}>Together</span>
                    </h1>

                    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                        Have a project in mind? Speak directly with lead engineer Hazrat Ummar Shaikh. Zero account managers, zero sales fluff.
                    </p>

                    <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 pb-2 px-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Response within 24 Hours</span>
                        </span>
                        <span className="hidden sm:inline text-slate-300">·</span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>100% Code Ownership</span>
                        </span>
                        <span className="hidden sm:inline text-slate-300">·</span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Q4 Sprints Available</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
                    
                    {/* Left Column: Direct Connect Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                            <h2 className="text-lg font-bold font-heading text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                                Direct Engineering Contact
                            </h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Canonical Email</div>
                                        <a href="mailto:hazratummar9@gmail.com" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                            hazratummar9@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Discord Handle</div>
                                        <span className="font-semibold text-slate-900 font-mono text-xs">
                                            ihazratummar
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                                &quot;Every project begins with honest architectural feasibility. I will tell you frankly what works, what doesn&apos;t, and the most cost-effective path to production.&quot;
                                <div className="mt-2 font-bold text-slate-900">— Hazrat Ummar Shaikh, Lead Builder</div>
                            </div>
                        </div>

                        {/* Verified Marketplace Profiles */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                                Verified Freelance Profiles
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                <a
                                    href="https://www.fiverr.com/hazratummar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
                                >
                                    <span>Fiverr Verified</span>
                                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                                </a>
                                <a
                                    href="https://github.com/ihazratummar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                                >
                                    <span>GitHub Profile</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Inquiry Form */}
                    <div className="lg:col-span-7">
                        <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                            <CardContent className="p-6 sm:p-8">
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="contact-name" className="text-xs font-bold text-slate-700">
                                                Your Name
                                            </label>
                                            <Input
                                                id="contact-name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Alex Mercer"
                                                required
                                                className="bg-white border-slate-200 text-slate-900 rounded-xl h-10 text-xs focus:border-blue-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="contact-email" className="text-xs font-bold text-slate-700">
                                                Email Address
                                            </label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="alex@company.com"
                                                required
                                                className="bg-white border-slate-200 text-slate-900 rounded-xl h-10 text-xs focus:border-blue-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-service" className="text-xs font-bold text-slate-700">
                                            Engineering Discipline
                                        </label>
                                        <select
                                            id="contact-service"
                                            value={formData.service}
                                            onChange={handleChange}
                                            className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        >
                                            <option value="Mobile App Development">Native Mobile (Android &amp; KMP)</option>
                                            <option value="AI Assistant Development">AI Chatbot &amp; Deterministic Agents</option>
                                            <option value="Discord Bot Architecture">Custom Discord Bot &amp; Automation</option>
                                            <option value="Backend APIs">Cloud Backend &amp; Microservices (Spring/FastAPI)</option>
                                            <option value="Architecture Audit">Architecture Review &amp; Refactoring</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-subject" className="text-xs font-bold text-slate-700">
                                            Subject
                                        </label>
                                        <Input
                                            id="contact-subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Sprint inquiry or system architecture"
                                            required
                                            className="bg-white border-slate-200 text-slate-900 rounded-xl h-10 text-xs focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">
                                            Project Specifications &amp; Requirements
                                        </label>
                                        <Textarea
                                            id="contact-message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Describe your current technical bottleneck, timeline, or requirements..."
                                            required
                                            rows={5}
                                            className="bg-white border-slate-200 text-slate-900 rounded-xl text-xs focus:border-blue-600 resize-none leading-relaxed"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{isSubmitting ? "Sending to Hazrat..." : "Submit Technical Inquiry"}</span>
                                    </Button>

                                    {result && (
                                        <div className={`p-4 rounded-xl text-xs font-medium ${
                                            result.includes("Thank you") 
                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                                : "bg-red-50 text-red-800 border border-red-200"
                                        }`}>
                                            {result}
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </div>
        </div>
    );
};
