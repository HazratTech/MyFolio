"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Smartphone, Server, MessageSquare, ArrowRight, ArrowLeft, Check, Send, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const serviceOptions = [
    {
        id: "android",
        icon: Smartphone,
        title: "Mobile App",
        desc: "Native Android App (Kotlin / Compose)",
        color: "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800",
        selectedColor: "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600 shadow-sm",
    },
    {
        id: "backend",
        icon: Server,
        title: "Backend / API",
        desc: "FastAPI / Ktor Backend Systems",
        color: "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800",
        selectedColor: "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600 shadow-sm",
    },
    {
        id: "discord",
        icon: Bot,
        title: "Workflow Bot",
        desc: "Discord Bot / Automated Workflows",
        color: "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800",
        selectedColor: "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600 shadow-sm",
    },
    {
        id: "ai-chatbot",
        icon: MessageSquare,
        title: "AI Chatbot",
        desc: "Website, WhatsApp, and lead automation",
        color: "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800",
        selectedColor: "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600 shadow-sm",
    },
];

const featuresByService: Record<string, string[]> = {
    discord: ["Moderation / AutoMod", "Virtual Shop / Economy", "Operational Alerts", "Stripe Checkout Sync", "Interactive Chat Buttons", "Activity Leaderboards", "Secure Ticket Handling", "Automated Client Roles"],
    android: ["User Registration & Login", "Push Announcements", "In-App Payments", "Location & Maps", "Photo / Video Sharing", "Offline-First Support", "Dashboard Panel", "Backend Sync"],
    backend: ["Database Integration", "User Login & Security", "Stripe Payment Setup", "File Storage & Uploads", "Third-Party API Hookups", "Sub-Second Response Speeds", "Automatic Daily Backups", "Secure Admin Portal"],
    "ai-chatbot": ["Website Chatbot", "WhatsApp Automation", "Lead Qualification", "Appointment Booking", "Human Handoff", "CRM Integration", "Knowledge Base Answers", "Analytics Dashboard"],
};

const budgetOptions = ["< $100", "$100 – $300", "$300 – $1,000", "$1,000+", "Not sure yet"];
const timelineOptions = ["ASAP / Rush", "1–2 Weeks", "2–4 Weeks", "1–2 Months", "Flexible"];

export const QuoteWizard = () => {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [budget, setBudget] = useState<string | null>(null);
    const [timeline, setTimeline] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState({ name: "", email: "", discord: "", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);
    const [socials, setSocials] = useState<any[]>([]);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const res = await fetch("/api/socials");
                if (res.ok) setSocials(await res.json());
            } catch {}
        };
        fetchSocials();
    }, []);

    const toggleFeature = (feat: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 1: return !!selectedService;
            case 2: return selectedFeatures.length > 0;
            case 3: return !!budget && !!timeline;
            case 4: return contactInfo.name.trim() && contactInfo.email.trim();
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitResult(null);

        const service = serviceOptions.find(s => s.id === selectedService);

        const embed = {
            title: "🚀 New Quote Request from RelayWorks",
            color: 0x2563eb,
            fields: [
                { name: "Service", value: service?.title || selectedService || "N/A", inline: true },
                { name: "Budget", value: budget || "N/A", inline: true },
                { name: "Timeline", value: timeline || "N/A", inline: true },
                { name: "Features", value: selectedFeatures.length > 0 ? selectedFeatures.join(", ") : "None specified" },
                { name: "Client Name", value: contactInfo.name, inline: true },
                { name: "Client Email", value: contactInfo.email, inline: true },
                { name: "Discord", value: contactInfo.discord || "N/A", inline: true },
                { name: "Additional Notes", value: contactInfo.notes || "None" },
            ],
            footer: { text: "RelayWorks Quote Wizard • " + new Date().toLocaleDateString() },
        };

        try {
            const res = await fetch("/api/discord/webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (res.ok) {
                setSubmitResult("success");
                trackEvent("quote_wizard_submit", {
                    service: selectedService || "",
                    budget: budget || "",
                    timeline: timeline || "",
                });
            } else {
                setSubmitResult("error");
            }
        } catch {
            setSubmitResult("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepVariants = {
        enter: { opacity: 0, x: 30 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
    };

    return (
        <section id="contact" className="py-20 relative">
            <div className="container mx-auto px-6 max-w-3xl">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-10 text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm mb-3">
                            Fast Project Intake
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-950 tracking-tight mt-1">
                            Get a scoped quote in 60 seconds.
                        </h2>
                        <p className="text-slate-600 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                            Share what your business needs and Hazrat will review your requirements and respond within 24 hours with a plan and estimate.
                        </p>
                    </m.div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-1.5 mb-8 max-w-md mx-auto">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
                                <m.div
                                    className="h-full"
                                    style={{ backgroundColor: "#2563eb" }}
                                    initial={{ width: 0 }}
                                    animate={{ width: s <= step ? "100%" : "0%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Success State */}
                    {submitResult === "success" ? (
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16 space-y-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-950 font-heading">Quote request sent!</h3>
                            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                                I'll review your requirements and get back to you within 24 hours with a detailed plan and pricing.
                            </p>
                        </m.div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Service Selection */}
                                {step === 1 && (
                                    <m.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <h3 className="text-lg font-bold text-slate-950 mb-1">What do you need?</h3>
                                        <p className="text-xs text-slate-500 mb-5">Select the primary engineering track.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {serviceOptions.map(svc => (
                                                <button
                                                    key={svc.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedService(svc.id);
                                                        setSelectedFeatures([]);
                                                    }}
                                                    className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                                        selectedService === svc.id ? svc.selectedColor : svc.color
                                                    }`}
                                                >
                                                    <svc.icon className="w-6 h-6 text-blue-600 mb-3" />
                                                    <div className="text-sm font-bold text-slate-950">{svc.title}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{svc.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </m.div>
                                )}

                                {/* Step 2: Features */}
                                {step === 2 && selectedService && (
                                    <m.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <h3 className="text-lg font-bold text-slate-950 mb-1">What features do you need?</h3>
                                        <p className="text-xs text-slate-500 mb-5">Select all that apply. Specifics can be refined later.</p>

                                        <div className="grid grid-cols-2 gap-2">
                                            {featuresByService[selectedService]?.map(feat => (
                                                <button
                                                    key={feat}
                                                    type="button"
                                                    onClick={() => toggleFeature(feat)}
                                                    className={`px-4 py-3 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${
                                                        selectedFeatures.includes(feat)
                                                            ? "border-blue-600 bg-blue-50/80 text-blue-950 font-semibold ring-1 ring-blue-600"
                                                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {selectedFeatures.includes(feat) && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                                        {feat}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </m.div>
                                )}

                                {/* Step 3: Budget & Timeline */}
                                {step === 3 && (
                                    <m.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-950 mb-1">What's your budget?</h3>
                                                <p className="text-xs text-slate-500 mb-4">Approximate investment range.</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {budgetOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setBudget(opt)}
                                                            className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
                                                                budget === opt
                                                                    ? "border-blue-600 bg-blue-50/80 text-blue-950 font-semibold ring-1 ring-blue-600"
                                                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-950 mb-1">When do you need it?</h3>
                                                <p className="text-xs text-slate-500 mb-4">Estimated delivery window.</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {timelineOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setTimeline(opt)}
                                                            className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
                                                                timeline === opt
                                                                    ? "border-blue-600 bg-blue-50/80 text-blue-950 font-semibold ring-1 ring-blue-600"
                                                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </m.div>
                                )}

                                {/* Step 4: Contact Info */}
                                {step === 4 && (
                                    <m.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <h3 className="text-lg font-bold text-slate-950 mb-1">Last step — how do I reach you?</h3>
                                        <p className="text-xs text-slate-500 mb-5">Hazrat will respond directly within 24 hours.</p>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input
                                                    placeholder="Your name"
                                                    value={contactInfo.name}
                                                    onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus-visible:ring-blue-600"
                                                />
                                                <Input
                                                    placeholder="Work email address"
                                                    type="email"
                                                    value={contactInfo.email}
                                                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus-visible:ring-blue-600"
                                                />
                                            </div>
                                            <Input
                                                placeholder="Discord username or WhatsApp phone (optional)"
                                                value={contactInfo.discord}
                                                onChange={e => setContactInfo({ ...contactInfo, discord: e.target.value })}
                                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus-visible:ring-blue-600"
                                            />
                                            <Textarea
                                                placeholder="Anything else you'd like to mention? (e.g., current links, repositories, or deadline details)"
                                                value={contactInfo.notes}
                                                onChange={e => setContactInfo({ ...contactInfo, notes: e.target.value })}
                                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[90px] resize-none rounded-xl focus-visible:ring-blue-600 text-sm"
                                            />
                                        </div>

                                        {submitResult === "error" && (
                                            <p className="text-rose-600 text-xs mt-3 font-semibold">Something went wrong. Please try again or reach out directly via Discord/GitHub.</p>
                                        )}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
                                {step > 1 ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="text-sm text-slate-600 hover:text-slate-950 cursor-pointer"
                                    >
                                        <ArrowLeft className="mr-1.5 w-3.5 h-3.5" /> Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {step < 4 ? (
                                    <Button
                                        onClick={() => setStep(prev => prev + 1)}
                                        disabled={!canProceed()}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="text-white h-10 px-6 text-sm rounded-xl font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer hover:opacity-95"
                                    >
                                        Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canProceed() || isSubmitting}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="text-white h-10 px-6 text-sm rounded-xl font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer hover:opacity-95"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="mr-1.5 w-3.5 h-3.5 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="mr-1.5 w-3.5 h-3.5" /> Submit Quote Request</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </LazyMotion>
            </div>
        </section>
    );
};
