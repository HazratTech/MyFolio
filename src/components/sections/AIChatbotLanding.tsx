"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    Bot,
    BrainCircuit,
    CalendarCheck,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Database,
    FileSearch,
    Gauge,
    GitBranch,
    Globe2,
    Headphones,
    Mail,
    MessageCircle,
    MessageSquare,
    Network,
    PhoneCall,
    Plug,
    Send,
    ShieldCheck,
    Slack,
    Sparkles,
    Star,
    Target,
    UserCheck,
    Workflow,
    X,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type DemoMessage = {
    role: "customer" | "ai" | "system";
    text: string;
};

type DemoStep = {
    messages: DemoMessage[];
    status: string;
    calendar: string;
    crm: string;
    alert: string;
};

const demoSteps: DemoStep[] = [
    {
        messages: [
            { role: "customer", text: "Can I schedule AC service tomorrow?" },
        ],
        status: "Customer question received",
        calendar: "Checking available slots",
        crm: "No lead yet",
        alert: "Waiting",
    },
    {
        messages: [
            { role: "customer", text: "Can I schedule AC service tomorrow?" },
            { role: "ai", text: "Absolutely. I can book that for you. Does 10:00 AM or 2:00 PM work better?" },
        ],
        status: "AI replied instantly",
        calendar: "Two slots found",
        crm: "Lead captured",
        alert: "Intent detected",
    },
    {
        messages: [
            { role: "customer", text: "Can I schedule AC service tomorrow?" },
            { role: "ai", text: "Absolutely. I can book that for you. Does 10:00 AM or 2:00 PM work better?" },
            { role: "customer", text: "2 PM works." },
            { role: "ai", text: "Booked for tomorrow at 2:00 PM. I also sent your details to the team." },
        ],
        status: "Appointment booked",
        calendar: "Tomorrow, 2:00 PM",
        crm: "Lead created",
        alert: "Team notified",
    },
];

const stats = [
    { value: "160+", label: "businesses and clients" },
    { value: "200+", label: "custom projects delivered" },
    { value: "24+", label: "verified reviews" },
    { value: "4+", label: "years building automations" },
];

const problems = [
    {
        icon: Clock,
        title: "Missed Leads",
        desc: "Visitors ask questions after hours, wait too long, and move to a faster competitor.",
    },
    {
        icon: Headphones,
        title: "Slow Support",
        desc: "Your team answers simple questions manually while high-value conversations wait.",
    },
    {
        icon: MessageSquare,
        title: "Repeated Questions",
        desc: "Pricing, availability, policies, and setup questions drain attention every day.",
    },
    {
        icon: CalendarCheck,
        title: "Manual Booking",
        desc: "Back-and-forth scheduling creates friction right when a customer is ready to buy.",
    },
    {
        icon: GitBranch,
        title: "Disconnected Systems",
        desc: "Leads, chats, calendars, CRMs, and team notifications stay scattered.",
    },
];

const platforms = [
    { icon: Globe2, name: "Website", desc: "Embedded chatbots trained on your business, services, docs, and FAQs." },
    { icon: PhoneCall, name: "WhatsApp", desc: "Automated sales and support flows for mobile-first customers." },
    { icon: MessageCircle, name: "Discord", desc: "Community support, moderation assistance, tickets, and AI helpers." },
    { icon: Send, name: "Telegram", desc: "Fast chatbot workflows for communities, support, and notifications." },
    { icon: Mail, name: "Messenger", desc: "Lead capture and support automation across social channels." },
    { icon: Slack, name: "Slack", desc: "Internal alerts, approvals, summaries, and employee assistants." },
];

const featureGroups = [
    {
        title: "Support",
        icon: Headphones,
        items: ["24/7 support", "FAQ automation", "Knowledge base search", "Human handoff"],
    },
    {
        title: "Sales",
        icon: Target,
        items: ["Lead qualification", "Quote generation", "Appointment booking", "CRM sync"],
    },
    {
        title: "Automation",
        icon: Workflow,
        items: ["Email automation", "API integration", "Database integration", "Workflow routing"],
    },
    {
        title: "AI Systems",
        icon: BrainCircuit,
        items: ["OpenAI integration", "Claude integration", "Gemini integration", "Internal AI agents"],
    },
    {
        title: "Knowledge",
        icon: FileSearch,
        items: ["Document search", "Employee assistant", "Reporting", "Policy answers"],
    },
    {
        title: "Operations",
        icon: ShieldCheck,
        items: ["Fallback rules", "Admin controls", "Analytics", "Source code included"],
    },
];

const integrations = ["OpenAI", "Claude", "Gemini", "WhatsApp", "HubSpot", "Google Calendar", "Slack", "MongoDB", "Stripe", "Custom API"];

const caseStudies = [
    {
        name: "Local Service Company",
        problem: "After-hours quote requests were going unanswered until the next morning.",
        solution: "Built a website chatbot that qualifies the job, collects location details, offers available appointment slots, and sends the lead to the team.",
        result: "More booked consultations from evening traffic without adding support staff.",
    },
    {
        name: "Online Coaching Business",
        problem: "The founder spent hours answering pricing, fit, and booking questions manually.",
        solution: "Created an AI assistant trained on program details, FAQs, objections, and calendar availability with human handoff for warm leads.",
        result: "Cleaner lead qualification and fewer repetitive sales conversations.",
    },
    {
        name: "Community SaaS Workflow",
        problem: "Support requests, user status, and staff notifications were spread across Discord and internal tools.",
        solution: "Connected an AI support assistant with Discord tickets, database lookups, and staff escalation rules.",
        result: "Faster triage, better context for staff, and fewer missed requests.",
    },
];

const pricing = [
    {
        name: "Starter",
        price: "From $499",
        desc: "A focused chatbot for one primary workflow.",
        features: ["Website chatbot", "FAQ and service training", "Lead capture", "Email or Discord alerts", "Launch support"],
    },
    {
        name: "Growth",
        price: "From $1,500",
        desc: "A business automation chatbot with integrations.",
        features: ["Website or WhatsApp chatbot", "Appointment booking", "CRM integration", "Human handoff", "Analytics and testing"],
        featured: true,
    },
    {
        name: "Custom",
        price: "Scoped",
        desc: "Advanced AI agents for complex internal systems.",
        features: ["Custom API integrations", "Document search", "Multi-channel support", "Admin workflows", "Long-term support"],
    },
];

const faqs = [
    {
        q: "What kind of AI chatbot can you build?",
        a: "RelayWorks builds website chatbots, WhatsApp chatbots, Discord and Telegram assistants, customer support bots, lead generation chatbots, appointment booking bots, CRM-connected automations, and internal AI agents.",
    },
    {
        q: "Can the chatbot use my existing website, documents, or FAQs?",
        a: "Yes. The chatbot can be trained around your existing pages, FAQs, policies, service details, documents, and internal business rules so the answers match your workflow.",
    },
    {
        q: "Can it hand off to a real person?",
        a: "Yes. Human handoff can route complex or high-value conversations to your live chat, email, Discord, Slack, CRM, or another channel your team already uses.",
    },
    {
        q: "Do you support WhatsApp chatbot development?",
        a: "Yes. WhatsApp flows can qualify leads, answer common questions, send reminders, collect details, and connect with your CRM or booking system.",
    },
    {
        q: "Which AI models do you work with?",
        a: "I can integrate OpenAI, Claude, Gemini, and other model providers depending on the use case, budget, reliability needs, and privacy requirements.",
    },
    {
        q: "How long does a chatbot project take?",
        a: "Simple website chatbots can often launch in one to two weeks. Integrated systems with WhatsApp, CRM sync, appointment booking, or internal tools are scoped after discovery.",
    },
    {
        q: "Will I get the source code?",
        a: "Yes. Source code can be included, and the system can be built so you are not locked into a fragile no-code setup.",
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

function openLiveChat(source: string) {
    window.dispatchEvent(new CustomEvent("openLiveChat"));
    trackEvent("ai_chatbot_live_chat_open", { source });
}

function SectionHeading({
    eyebrow,
    title,
    desc,
}: {
    eyebrow: string;
    title: string;
    desc?: string;
}) {
    return (
        <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
        >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
            </div>
            <h2 className="font-heading text-3xl font-black tracking-tight text-white md:text-5xl">
                {title}
            </h2>
            {desc && (
                <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
                    {desc}
                </p>
            )}
        </m.div>
    );
}

function HeroDemo() {
    const [step, setStep] = useState(0);
    const shouldReduceMotion = useReducedMotion();
    const current = demoSteps[step];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((value) => (value + 1) % demoSteps.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative mx-auto max-w-[560px]"
        >
            <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#111827] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                        <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        Live workflow demo
                    </div>
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="min-h-[340px] border-white/10 p-4 lg:border-r">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">RelayWorks AI</p>
                                <p className="text-xs text-slate-400">Support, sales, and booking assistant</p>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            <m.div
                                key={step}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-3"
                            >
                                {current.messages.map((message, index) => (
                                    <div
                                        key={`${message.role}-${index}`}
                                        className={cn(
                                            "flex",
                                            message.role === "customer" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg",
                                                message.role === "customer"
                                                    ? "rounded-br-md bg-cyan-500 text-slate-950"
                                                    : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-100"
                                            )}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {step < 2 && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                                            <span className="inline-block h-2 w-2 rounded-full bg-slate-300/80 animate-bounce" />
                                            <span className="inline-block h-2 w-2 rounded-full bg-slate-300/80 animate-bounce" style={{ animationDelay: "0.2s" }} />
                                            <span className="inline-block h-2 w-2 rounded-full bg-slate-300/80 animate-bounce" style={{ animationDelay: "0.4s" }} />
                                        </div>
                                    </div>
                                )}
                            </m.div>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-3 bg-slate-950/35 p-4">
                        {[
                            { icon: Gauge, label: "Status", value: current.status },
                            { icon: CalendarCheck, label: "Calendar", value: current.calendar },
                            { icon: Database, label: "CRM", value: current.crm },
                            { icon: Slack, label: "Team alert", value: current.alert },
                        ].map((item) => (
                            <m.div
                                key={item.label}
                                layout
                                className="rounded-xl border border-white/10 bg-white/[0.045] p-3"
                            >
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    <item.icon className="h-3.5 w-3.5 text-cyan-300" />
                                    {item.label}
                                </div>
                                <p className="text-sm font-bold text-white">{item.value}</p>
                            </m.div>
                        ))}
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                Human handoff available
                            </div>
                            <p className="mt-1 text-xs leading-5 text-emerald-100/80">
                                Complex conversations can route to your real team instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </m.div>
    );
}

function QuickQuoteForm() {
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        workflow: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<"success" | "failed" | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const embed = {
            title: "New AI Chatbot Landing Lead",
            color: 3447003,
            fields: [
                { name: "Name", value: formData.name, inline: true },
                { name: "Contact", value: formData.contact, inline: true },
                { name: "Workflow", value: formData.workflow },
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
                setResult("success");
                setFormData({ name: "", contact: "", workflow: "" });
                trackEvent("ai_chatbot_lead_submit", { type: "quick_quote" });
            } else {
                setResult("failed");
            }
        } catch (error) {
            console.error("AI chatbot lead form failed:", error);
            setResult("failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="ai-quick-name" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Name
                    </label>
                    <Input
                        id="ai-quick-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                        className="h-11 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="ai-quick-contact" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Email or WhatsApp
                    </label>
                    <Input
                        id="ai-quick-contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Where should I reply?"
                        required
                        className="h-11 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="ai-quick-workflow" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    What should the chatbot automate?
                </label>
                <Textarea
                    id="ai-quick-workflow"
                    value={formData.workflow}
                    onChange={(e) => setFormData({ ...formData, workflow: e.target.value })}
                    placeholder="Example: answer pricing questions, qualify AC repair leads, book appointments, and send the lead to HubSpot."
                    required
                    className="min-h-[112px] resize-none border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400"
                />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 flex-1 rounded-xl bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300"
                >
                    {isSubmitting ? "Sending..." : "Book Free Consultation"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <Button
                    type="button"
                    onClick={() => openLiveChat("quick_quote_form")}
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-white/10 bg-white/[0.04] font-bold text-white hover:bg-white/10 hover:text-white"
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat Live
                </Button>
            </div>
            {result === "success" && (
                <p className="text-sm font-semibold text-emerald-300">
                    Sent successfully. I will reply shortly.
                </p>
            )}
            {result === "failed" && (
                <p className="text-sm font-semibold text-rose-300">
                    Failed to send. Please try again or use live chat.
                </p>
            )}
        </form>
    );
}



export const AIChatbotLanding = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/testimonials");
                if (res.ok) {
                    const data = await res.json();
                    setReviews(Array.isArray(data) ? data.slice(0, 3) : []);
                }
            } catch (error) {
                console.error("Failed to load testimonials:", error);
            }
        };

        fetchReviews();
    }, []);

    const testimonials = useMemo(() => {
        if (reviews.length > 0) return reviews;

        return [
            {
                name: "Verified Client",
                role: "Automation Project",
                content: "RelayWorks delivered a clear system, communicated quickly, and made the workflow easier for our team.",
            },
            {
                name: "Business Owner",
                role: "Support Automation",
                content: "The chatbot helped us answer common questions faster and capture better leads from our website.",
            },
            {
                name: "Community Founder",
                role: "Custom Bot Integration",
                content: "The final system felt custom to our process instead of a generic template.",
            },
        ];
    }, [reviews]);

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-[#07111d] text-white">
                <section className="relative overflow-hidden bg-[linear-gradient(180deg,#07111d_0%,#0b1726_55%,#07111d_100%)] px-6 pb-16 pt-24 md:pb-24 md:pt-32">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
                    <div className="container relative mx-auto grid items-center gap-12 lg:grid-cols-12">
                        <m.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                            className="lg:col-span-6"
                        >
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                                <Bot className="h-3.5 w-3.5" />
                                AI Chatbot Development
                            </div>
                            <h1 className="font-heading text-4xl font-black leading-[1.04] tracking-tight text-white md:text-6xl">
                                Stop Losing Customers While You're Offline.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                                Build custom AI chatbots that answer customers instantly, qualify leads, book appointments, and automate business workflows across your website, WhatsApp, Discord, and Telegram.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Button
                                    onClick={() => {
                                        document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                        trackEvent("ai_chatbot_hero_cta", { action: "consultation" });
                                    }}
                                    className="h-16 rounded-xl bg-cyan-400 px-10 text-lg font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(34,211,238,0.45)] transition-shadow"
                                >
                                    Book Free Consultation
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <button
                                    onClick={() => openLiveChat("hero")}
                                    className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
                                >
                                    Or chat live with the founder →
                                </button>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-300">
                                {["Replies within 2 hours", "Free consultation", "You own it forever", "Custom-built"].map((item) => (
                                    <span key={item} className="inline-flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-300" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </m.div>

                        <div className="lg:col-span-6">
                            <HeroDemo />
                        </div>
                    </div>
                </section>

                <section className="border-y border-white/10 bg-white/[0.035] px-6 py-7">
                    <m.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}
                        className="container mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {stats.map((stat) => (
                            <m.div key={stat.label} variants={fadeUp} className="rounded-xl border border-white/10 bg-slate-950/30 p-5 text-center">
                                <p className="font-heading text-3xl font-black text-cyan-300">{stat.value}</p>
                                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                            </m.div>
                        ))}
                    </m.div>
                </section>

                <section id="problems" className="px-6 py-20 md:py-28">
                    <div className="container mx-auto">
                        <SectionHeading
                            eyebrow="Problems We Solve"
                            title="Your Team Shouldn't Spend All Day Answering The Same Questions"
                            desc="Customers expect instant answers. Your systems should capture the lead, move the conversation forward, and alert the right person without manual busywork."
                        />
                        <m.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5"
                        >
                            {problems.map((problem) => (
                                <m.div
                                    key={problem.title}
                                    variants={fadeUp}
                                    whileHover={{ y: -6 }}
                                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10"
                                >
                                    <problem.icon className="mb-5 h-7 w-7 text-cyan-300" />
                                    <h3 className="font-heading text-lg font-black text-white">{problem.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-400">{problem.desc}</p>
                                </m.div>
                            ))}
                        </m.div>
                    </div>
                </section>

                <section id="solution" className="border-y border-white/10 bg-[#0b1726] px-6 py-20 md:py-28">
                    <div className="container mx-auto grid gap-10 lg:grid-cols-2">
                        <m.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.45 }}
                            className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.045] p-7"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <X className="h-6 w-6 text-rose-300" />
                                <h2 className="font-heading text-2xl font-black">Without AI</h2>
                            </div>
                            {["Manual replies", "Lost leads", "Repeated work", "Human bottlenecks", "Disconnected follow-up"].map((item) => (
                                <div key={item} className="flex items-center gap-3 border-t border-white/10 py-4 text-slate-300">
                                    <X className="h-4 w-4 text-rose-300" />
                                    {item}
                                </div>
                            ))}
                        </m.div>
                        <m.div
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.45 }}
                            className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.055] p-7"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                                <h2 className="font-heading text-2xl font-black">With RelayWorks</h2>
                            </div>
                            {["AI answers instantly", "Leads captured automatically", "CRM updated", "Appointments booked", "Human handoff when needed"].map((item) => (
                                <div key={item} className="flex items-center gap-3 border-t border-white/10 py-4 text-slate-200">
                                    <Check className="h-4 w-4 text-emerald-300" />
                                    {item}
                                </div>
                            ))}
                        </m.div>
                    </div>
                </section>

                <section id="quote-form" className="px-6 py-20 md:py-28">
                    <div className="container mx-auto max-w-3xl">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                        >
                            <div className="text-center">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                                    <Plug className="h-3.5 w-3.5" />
                                    Free Consultation
                                </div>
                                <h2 className="font-heading text-3xl font-black tracking-tight md:text-5xl">
                                    Let&apos;s Build Your AI Chatbot
                                </h2>
                                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                                    Tell me what your team repeats, where leads come from, and which systems need to connect. I&apos;ll map the cleanest build.
                                </p>
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300">
                                    <Zap className="h-4 w-4" />
                                    Only 2 project slots available this month
                                </div>
                            </div>
                            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.045] p-6">
                                <QuickQuoteForm />
                            </div>
                        </m.div>
                    </div>
                </section>

                <section id="process" className="px-6 py-20 md:py-28">
                    <div className="container mx-auto">
                        <SectionHeading
                            eyebrow="How It Works"
                            title="From Messy Workflow To Reliable AI System"
                        />
                        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
                            {[
                                "Discovery",
                                "Conversation design",
                                "Knowledge setup",
                                "Integrations",
                                "Testing",
                                "Launch and support",
                            ].map((step, index) => (
                                <m.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.35, delay: index * 0.04 }}
                                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
                                >
                                    <span className="font-heading text-3xl font-black text-cyan-300">{index + 1}</span>
                                    <h3 className="mt-4 font-heading text-lg font-black text-white">{step}</h3>
                                </m.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="px-6 py-20 md:py-28">
                    <div className="container mx-auto">
                        <SectionHeading
                            eyebrow="Testimonials"
                            title="Built With Founder-Level Attention"
                        />
                        <div className="mt-12 grid gap-5 lg:grid-cols-3">
                            {testimonials.map((testimonial: any, index: number) => (
                                <m.div
                                    key={`${testimonial.name}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-6"
                                >
                                    <div className="mb-4 flex text-amber-300">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm leading-7 text-slate-300">
                                        {testimonial.content || testimonial.message || testimonial.review || "Great communication, clean delivery, and a custom solution that matched the workflow."}
                                    </p>
                                    <div className="mt-5 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                                            <UserCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{testimonial.name || "Verified Client"}</p>
                                            <p className="text-xs text-slate-400">{testimonial.role || testimonial.company || "RelayWorks client"}</p>
                                        </div>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="border-t border-white/10 bg-[#0b1726] px-6 py-20 md:py-28">
                    <div className="container mx-auto max-w-4xl">
                        <SectionHeading
                            eyebrow="FAQ"
                            title="AI Chatbot Development Questions"
                        />
                        <div className="mt-12 space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={faq.q} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-heading text-lg font-black text-white"
                                    >
                                        {faq.q}
                                        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", openFaq === index && "rotate-180")} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {openFaq === index && (
                                            <m.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <p className="border-t border-white/10 px-5 py-5 text-sm leading-7 text-slate-300">
                                                    {faq.a}
                                                </p>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16">
                    <div className="container mx-auto rounded-3xl border border-cyan-300/20 bg-cyan-400/[0.08] p-8 text-center md:p-12">
                        <Zap className="mx-auto mb-5 h-9 w-9 text-cyan-300" />
                        <h2 className="font-heading text-3xl font-black md:text-5xl">
                            Ready to stop losing qualified conversations?
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                            Start with one workflow: support, lead capture, booking, CRM updates, or internal assistance. Then expand once it proves value.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <Button
                                onClick={() => document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" })}
                                className="h-13 rounded-xl bg-cyan-400 px-7 font-black text-slate-950 hover:bg-cyan-300"
                            >
                                Book Free Consultation
                            </Button>
                            <Button
                                onClick={() => openLiveChat("final_cta")}
                                variant="outline"
                                className="h-13 rounded-xl border-white/10 bg-white/[0.04] px-7 font-black text-white hover:bg-white/10 hover:text-white"
                            >
                                Chat Live
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </LazyMotion>
    );
};
