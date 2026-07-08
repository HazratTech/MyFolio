"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Smartphone, Server, ArrowRight, ArrowLeft, Check, Send, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const serviceOptions = [
    {
        id: "android",
        icon: Smartphone,
        title: "Mobile App",
        desc: "Native Android App (Kotlin / Compose)",
        color: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60",
        selectedColor: "border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30",
    },
    {
        id: "backend",
        icon: Server,
        title: "Backend / API",
        desc: "FastAPI / Ktor Backend Systems",
        color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60",
        selectedColor: "border-blue-500 bg-blue-500/15 ring-1 ring-blue-500/30",
    },
    {
        id: "discord",
        icon: Bot,
        title: "Workflow Bot",
        desc: "Discord Bot / Automated Workflows",
        color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60",
        selectedColor: "border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/30",
    },
];

const featuresByService: Record<string, string[]> = {
    discord: ["Moderation / AutoMod", "Virtual Shop / Economy", "Operational Alerts", "Stripe Checkout Sync", "Interactive Chat Buttons", "Activity Leaderboards", "Secure Ticket Handling", "Automated Client Roles"],
    android: ["User Registration & Login", "Push Announcements", "In-App Payments", "Location & Maps", "Photo / Video Sharing", "Offline-First Support", "Dashboard Panel", "Backend Sync"],
    backend: ["Database Integration", "User Login & Security", "Stripe Payment Setup", "File Storage & Uploads", "Third-Party API Hookups", "Sub-Second Response Speeds", "Automatic Daily Backups", "Secure Admin Portal"],
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
            color: 5814783,
            fields: [
                { name: "Service", value: service?.title || selectedService || "Unknown", inline: true },
                { name: "Budget", value: budget || "Not specified", inline: true },
                { name: "Timeline", value: timeline || "Not specified", inline: true },
                { name: "Features", value: selectedFeatures.join(", ") || "None selected" },
                { name: "Name", value: contactInfo.name, inline: true },
                { name: "Email", value: contactInfo.email, inline: true },
                ...(contactInfo.discord ? [{ name: "Discord", value: contactInfo.discord, inline: true }] : []),
                ...(contactInfo.notes ? [{ name: "Additional Notes", value: contactInfo.notes }] : []),
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
                setSubmitResult("success");
                trackEvent("quote_wizard_submit", {
                    service: selectedService,
                    budget,
                    timeline,
                    features_count: selectedFeatures.length,
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
                        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Get Started</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
                            Get a quote in 60 seconds.
                        </h2>
                        <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
                            Tell me what you need and I'll get back within 24 hours with a plan and estimate.
                        </p>
                    </m.div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-1 mb-8 max-w-md mx-auto">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                                <m.div
                                    className="h-full bg-primary"
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
                            className="text-center py-16 space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Quote request sent!</h3>
                            <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                I'll review your requirements and get back to you within 24 hours with a detailed plan and pricing.
                            </p>
                        </m.div>
                    ) : (
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Service Selection */}
                                {step === 1 && (
                                    <m.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <h3 className="text-lg font-bold text-white mb-1">What do you need?</h3>
                                        <p className="text-xs text-muted-foreground mb-5">Select the type of project.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {serviceOptions.map(svc => (
                                                <button
                                                    key={svc.id}
                                                    onClick={() => {
                                                        setSelectedService(svc.id);
                                                        setSelectedFeatures([]);
                                                    }}
                                                    className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                                                        selectedService === svc.id ? svc.selectedColor : svc.color
                                                    }`}
                                                >
                                                    <svc.icon className="w-6 h-6 text-white/70 mb-3" />
                                                    <div className="text-sm font-semibold text-white">{svc.title}</div>
                                                    <div className="text-[11px] text-white/40 mt-1">{svc.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </m.div>
                                )}

                                {/* Step 2: Features */}
                                {step === 2 && selectedService && (
                                    <m.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                        <h3 className="text-lg font-bold text-white mb-1">What features do you need?</h3>
                                        <p className="text-xs text-muted-foreground mb-5">Select all that apply. You can describe specifics later.</p>

                                        <div className="grid grid-cols-2 gap-2">
                                            {featuresByService[selectedService]?.map(feat => (
                                                <button
                                                    key={feat}
                                                    onClick={() => toggleFeature(feat)}
                                                    className={`px-4 py-3 rounded-lg border text-left text-sm transition-all duration-200 ${
                                                        selectedFeatures.includes(feat)
                                                            ? "border-primary bg-primary/10 text-white"
                                                            : "border-white/8 bg-white/[0.02] text-white/60 hover:border-white/15"
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {selectedFeatures.includes(feat) && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
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
                                                <h3 className="text-lg font-bold text-white mb-1">What's your budget?</h3>
                                                <p className="text-xs text-muted-foreground mb-4">Approximate range is fine.</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {budgetOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setBudget(opt)}
                                                            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                                                                budget === opt
                                                                    ? "border-primary bg-primary/10 text-white"
                                                                    : "border-white/8 bg-white/[0.02] text-white/60 hover:border-white/15"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">When do you need it?</h3>
                                                <p className="text-xs text-muted-foreground mb-4">Estimated delivery window.</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {timelineOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setTimeline(opt)}
                                                            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                                                                timeline === opt
                                                                    ? "border-primary bg-primary/10 text-white"
                                                                    : "border-white/8 bg-white/[0.02] text-white/60 hover:border-white/15"
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
                                        <h3 className="text-lg font-bold text-white mb-1">Last step — how do I reach you?</h3>
                                        <p className="text-xs text-muted-foreground mb-5">I'll respond within 24 hours.</p>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input
                                                    placeholder="Your name"
                                                    value={contactInfo.name}
                                                    onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                                                    className="bg-white/[0.03] border-white/10 h-11"
                                                />
                                                <Input
                                                    placeholder="Email address"
                                                    type="email"
                                                    value={contactInfo.email}
                                                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                    className="bg-white/[0.03] border-white/10 h-11"
                                                />
                                            </div>
                                            <Input
                                                placeholder="Discord username (optional)"
                                                value={contactInfo.discord}
                                                onChange={e => setContactInfo({ ...contactInfo, discord: e.target.value })}
                                                className="bg-white/[0.03] border-white/10 h-11"
                                            />
                                            <Textarea
                                                placeholder="Anything else you'd like to mention? (optional)"
                                                value={contactInfo.notes}
                                                onChange={e => setContactInfo({ ...contactInfo, notes: e.target.value })}
                                                className="bg-white/[0.03] border-white/10 min-h-[80px] resize-none"
                                            />
                                        </div>

                                        {submitResult === "error" && (
                                            <p className="text-red-400 text-xs mt-3">Something went wrong. Please try again or reach out on Discord.</p>
                                        )}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                                {step > 1 ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="text-sm text-muted-foreground hover:text-white"
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
                                        className="bg-primary hover:bg-primary/90 text-white h-10 px-6 text-sm disabled:opacity-30"
                                    >
                                        Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canProceed() || isSubmitting}
                                        className="bg-primary hover:bg-primary/90 text-white h-10 px-6 text-sm disabled:opacity-30"
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
