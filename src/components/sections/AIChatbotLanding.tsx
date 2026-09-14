"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    Bot,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Code2,
    Cpu,
    Database,
    ExternalLink,
    FileText,
    GitBranch,
    Globe,
    Layers,
    Lock,
    Mail,
    MessageSquare,
    Network,
    PhoneCall,
    Send,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    Terminal,
    Users,
    Workflow,
    X,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type SandboxScenario = {
    id: string;
    label: string;
    industry: string;
    messages: {
        role: "user" | "assistant";
        content: string;
        time: string;
    }[];
    executionLog: {
        intent: string;
        sourceDoc: string;
        confidence: string;
        actionTaken: string;
        crmPayload: Record<string, string>;
        escalation: string;
    };
};

const sandboxScenarios: SandboxScenario[] = [
    {
        id: "hvac",
        label: "Commercial HVAC / Field Service",
        industry: "Emergency Repair & Booking",
        messages: [
            {
                role: "user",
                content: "Our walk-in cooler stopped cooling at our bakery. Can we get an emergency technician out today?",
                time: "08:14 PM",
            },
            {
                role: "assistant",
                content: "I can dispatch an on-call commercial refrigeration technician for you tonight. What is the business address and zip code?",
                time: "08:14 PM",
            },
            {
                role: "user",
                content: "742 Evergreen Terrace, Springfield 62704. Business name is Evergreen Bakery.",
                time: "08:15 PM",
            },
            {
                role: "assistant",
                content: "Address verified within our immediate emergency coverage zone. Our on-call technician has an open emergency window at 9:30 PM tonight. Would you like me to reserve that slot?",
                time: "08:15 PM",
            },
            {
                role: "user",
                content: "Yes please, 9:30 PM works. Contact is Marcus at 555-0192.",
                time: "08:16 PM",
            },
            {
                role: "assistant",
                content: "Confirmed. Emergency dispatch booked for 9:30 PM tonight. A live tracking link and dispatch receipt have been texted to 555-0192. Our on-call lead has been paged via Slack.",
                time: "08:16 PM",
            },
        ],
        executionLog: {
            intent: "emergency_field_dispatch",
            sourceDoc: "Commercial_Refrigeration_SOP_2026.pdf (Section 4.2)",
            confidence: "99.6%",
            actionTaken: "Dispatched tech slot via ServiceTitan Webhook",
            crmPayload: {
                company: "Evergreen Bakery",
                contact: "Marcus (555-0192)",
                zip: "62704",
                severity: "High (Commercial Walk-in)",
                scheduled: "Tonight, 9:30 PM",
            },
            escalation: "Paged on-call technician via Slack channel #emergency-dispatch",
        },
    },
    {
        id: "clinic",
        label: "Medical & Dental Practice",
        industry: "Patient Intake & Consultation",
        messages: [
            {
                role: "user",
                content: "Do you accept BlueCross Dental PPO for dental implants and full mouth scans?",
                time: "10:32 PM",
            },
            {
                role: "assistant",
                content: "Yes, Dr. Aris is an in-network PPO provider with BlueCross Dental for implant consultations and 3D CBCT imaging. We verify your benefits in real time before your appointment.",
                time: "10:32 PM",
            },
            {
                role: "user",
                content: "Great. Does Dr. Aris have availability this Thursday morning?",
                time: "10:33 PM",
            },
            {
                role: "assistant",
                content: "Dr. Aris has two open slots this Thursday: 09:30 AM and 11:15 AM. Which time fits your schedule best?",
                time: "10:33 PM",
            },
            {
                role: "user",
                content: "11:15 AM works best for me. Email is sarah.jenkins@outlook.com.",
                time: "10:34 PM",
            },
            {
                role: "assistant",
                content: "Your initial 45-minute consultation is confirmed for Thursday at 11:15 AM. Digital medical history and insurance pre-check forms have been emailed to sarah.jenkins@outlook.com.",
                time: "10:34 PM",
            },
        ],
        executionLog: {
            intent: "patient_consultation_booking",
            sourceDoc: "Clinical_Insurance_Accepted_2026.pdf (Table 1B)",
            confidence: "99.8%",
            actionTaken: "Reserved Cal.com calendar slot for Dr. Aris",
            crmPayload: {
                patient: "Sarah Jenkins",
                insurance: "BlueCross Dental PPO",
                procedure: "Implant Consultation",
                slot: "Thursday, 11:15 AM",
                intakeSent: "true",
            },
            escalation: "Pushed record to AthenaHealth & emailed front desk coordinator",
        },
    },
    {
        id: "realestate",
        label: "Real Estate & High-Ticket B2B",
        industry: "Buyer Qualification & Tour Booking",
        messages: [
            {
                role: "user",
                content: "Looking for an off-market 4-bedroom modern home in Austin with a budget around $1.6M.",
                time: "07:05 PM",
            },
            {
                role: "assistant",
                content: "We currently manage 3 private listings matching that profile across Westlake Hills and Barton Creek. Are you pre-approved or purchasing via 1031 exchange?",
                time: "07:05 PM",
            },
            {
                role: "user",
                content: "Pre-approved through First Republic. Can we arrange a private walkthrough this Saturday?",
                time: "07:06 PM",
            },
            {
                role: "assistant",
                content: "Certainly. Our senior partner David can host private walkthroughs of both properties on Saturday at either 1:00 PM or 3:30 PM. Which works best?",
                time: "07:06 PM",
            },
            {
                role: "user",
                content: "1:00 PM is ideal. Email is alex@vancecapital.com.",
                time: "07:07 PM",
            },
            {
                role: "assistant",
                content: "Private showing scheduled for Saturday at 1:00 PM. Gate access codes and property dossiers have been emailed to alex@vancecapital.com. David will call 15 minutes prior to arrival.",
                time: "07:07 PM",
            },
        ],
        executionLog: {
            intent: "high_ticket_buyer_qualification",
            sourceDoc: "Exclusive_Listings_Portfolio_Q3.pdf (Austin Metro)",
            confidence: "99.5%",
            actionTaken: "Created Qualified Lead #4091 in HubSpot CRM",
            crmPayload: {
                buyer: "Alex Vance",
                firm: "Vance Capital",
                budget: "$1.6M USD",
                neighborhood: "Westlake Hills / Barton Creek",
                showingDate: "Saturday, 1:00 PM",
            },
            escalation: "Assigned deal to Senior Partner David via CRM push",
        },
    },
];

const commercialProblems = [
    {
        title: "The After-Hours Lead Leakage",
        badge: "Revenue Loss",
        metric: "62% of Inquiries",
        description:
            "Over 60% of high-intent website visitors reach out after 6:00 PM or during weekends. Without instant qualification, prospects call your competitors on Google. Our AI engages, answers specific questions from your docs, and locks meetings into your calendar immediately.",
    },
    {
        title: "Staff Burnout on Repetitive FAQs",
        badge: "Operational Drag",
        metric: "20+ Hours / Week",
        description:
            "High-salary office managers and sales reps spend hours manually answering repetitive questions regarding pricing, warranty coverage, turnaround times, and service zones. We automate the repetitive 70% with 100% factual accuracy so your team closes deals.",
    },
    {
        title: "Siloed Inquiries & Lost Data",
        badge: "Pipeline Decay",
        metric: "Zero CRM Sync",
        description:
            "Conversations that happen on fragmented WhatsApp chats or basic live chat widgets rarely make it into your sales pipeline. We engineer bi-directional webhooks that push structured contact data, budgets, and conversation summaries into HubSpot or Salesforce.",
    },
    {
        title: "The Danger of Rogue AI Hallucinations",
        badge: "Brand Liability",
        metric: "Strict Guardrails",
        description:
            "Generic, ungrounded ChatGPT wrappers hallucinate incorrect pricing, approve unauthorized discounts, or make embarrassing statements. We build deterministic retrieval-augmented generation (RAG) bounded strictly to your approved business documentation.",
    },
];

const architectureSteps = [
    {
        number: "01",
        title: "Document Ingestion & Semantic Indexing",
        desc: "We parse and vectorize your service menus, SOPs, pricing sheets, PDFs, and website documentation into secure vector databases using semantic embeddings.",
        tags: ["Vector Embeddings", "PDF Ingestion", "Hybrid Search"],
    },
    {
        number: "02",
        title: "Context-Bounded Retrieval (RAG)",
        desc: "When a customer asks a question, our system retrieves only the verified matching paragraphs from your knowledge base, preventing the model from hallucinating or guessing.",
        tags: ["Cosine Similarity", "Grounded Context", "Zero Guesswork"],
    },
    {
        number: "03",
        title: "Strict Guardrails & Policy Enforcement",
        desc: "Deterministic safety rules enforce company boundaries: blocking competitor endorsement, preventing price bargaining, and rejecting out-of-scope inquiries.",
        tags: ["System Boundaries", "Prompt Injection Defense", "Compliance"],
    },
    {
        number: "04",
        title: "Bi-Directional Action Execution",
        desc: "The assistant performs real commercial tasks: scheduling Cal.com or Calendly slots, triggering webhook events, creating CRM leads, and sending SMS confirmations.",
        tags: ["Cal.com API", "HubSpot Webhooks", "Automated SMS"],
    },
    {
        number: "05",
        title: "Intelligent Human Escalation",
        desc: "When a customer requests a human or expresses complex urgency, the conversation instantly pages your team via Slack, WhatsApp, or email with a full transcript summary.",
        tags: ["Instant Slack Alerts", "Human Takeover", "Warm Handoff"],
    },
];

const deploymentChannels = [
    {
        name: "Custom Website Widget",
        desc: "Ultra-fast (<25KB) branded conversational widget embedded on your Next.js, WordPress, Shopify, or custom site.",
        icon: Globe,
        highlight: "Highest Inbound Conversion",
    },
    {
        name: "WhatsApp Business Cloud API",
        desc: "Official Meta Cloud API integration for instant two-way mobile messaging, interactive buttons, and automated lead capture.",
        icon: PhoneCall,
        highlight: "Best for Global & Mobile",
    },
    {
        name: "Discord Community Engine",
        desc: "Automated support tickets, role gating, knowledge search, and internal team assistants for tech and community brands.",
        icon: MessageSquare,
        highlight: "Community & Developer Ops",
    },
    {
        name: "Internal Team Assistants (Slack/Teams)",
        desc: "Query your internal Notion databases, HR handbooks, sales playbooks, and client records directly from team chat.",
        icon: Terminal,
        highlight: "Internal Productivity",
    },
];

const comparisonData = [
    {
        feature: "Custom Business Logic",
        relayworks: "100% tailored to your specific workflows and rules",
        genericSaas: "Rigid drag-and-drop templates with strict limitations",
        humanHire: "Requires 4-8 weeks of training & constant supervision",
    },
    {
        feature: "Full Source Code Ownership",
        relayworks: "You own 100% of the code, deployed on your cloud",
        genericSaas: "Zero ownership; locked inside proprietary monthly tool",
        humanHire: "N/A (payroll expense)",
    },
    {
        feature: "Factual Accuracy & Guardrails",
        relayworks: "Grounded Vector RAG strictly bounded to your verified docs",
        genericSaas: "Prone to generic prompts and unpredictable hallucinations",
        humanHire: "Subject to human memory errors, mood, and fatigue",
    },
    {
        feature: "Ongoing Infrastructure Cost",
        relayworks: "Direct LLM token pricing (typically $5 - $25 / month)",
        genericSaas: "$99 - $499+ / month recurring platform subscriptions",
        humanHire: "$3,500 - $5,000+ / month salary, benefits, and taxes",
    },
    {
        feature: "Direct CRM & Calendar Webhooks",
        relayworks: "Direct two-way REST APIs (HubSpot, Salesforce, Cal.com)",
        genericSaas: "Limited basic integrations often requiring paid Zapier tiers",
        humanHire: "Manual data entry prone to typos and forgotten logs",
    },
];

const sprintPricing = [
    {
        name: "Starter Assistant Sprint",
        usdPrice: "$350",
        inrPrice: "₹29,000",
        tagline: "A production AI assistant for one primary high-conversion channel.",
        timeline: "5 to 7 business days",
        features: [
            "Single Channel: Custom Web Widget OR WhatsApp Cloud API",
            "Semantic RAG Knowledge Base (trained on docs, PDFs & FAQs)",
            "Structured Lead Qualification (Name, Phone, Service, Budget)",
            "Instant Email or Slack Lead Notification Dispatch",
            "Deterministic Guardrails & Hallucination Prevention Testing",
            "100% Full Source Code Ownership & Self-Hosted Deployment",
            "14-Day Post-Launch Warranty & Model Prompt Tuning",
        ],
        highlighted: false,
    },
    {
        name: "Growth Automation Sprint",
        badge: "Most Selected for Businesses",
        usdPrice: "$750",
        inrPrice: "₹62,000",
        tagline: "Multi-channel conversational automation with live booking and CRM sync.",
        timeline: "10 to 14 business days",
        features: [
            "Dual Channel: Custom Web Widget + WhatsApp Business Cloud API",
            "Real-Time Calendar Booking (Cal.com or Calendly integration)",
            "Two-Way CRM Sync (HubSpot, Pipedrive, Salesforce, or Sheets)",
            "Multi-Document Hybrid Vector Search (PDFs, Notion, URLs)",
            "Intelligent Human Handoff with Instant Team Slack / SMS Alerts",
            "Conversation History Memory & Context Retention",
            "Rigorous Edge-Case Testing & Red-Teaming Guardrails",
            "100% Full Source Code Ownership & Private Infrastructure Setup",
            "30-Day Post-Launch Warranty, Analytics Setup & Tuning",
        ],
        highlighted: true,
    },
    {
        name: "Enterprise Agent Architecture",
        usdPrice: "$1,600+",
        inrPrice: "₹1,32,000+",
        tagline: "Bespoke multi-agent systems connected to private databases and internal APIs.",
        timeline: "Custom Scope (2 to 4 weeks)",
        features: [
            "Multi-Agent Orchestration (Triage, Booking, & Deep Retrieval agents)",
            "Private Database Querying (PostgreSQL, MongoDB, Supabase, internal APIs)",
            "User Authentication & Account-Specific Data Isolation",
            "Private Self-Hosted LLM Deployment (Ollama / vLLM) or Azure Enterprise",
            "Custom Admin Analytics Dashboard & Conversation Auditing",
            "HIPAA / GDPR Data Privacy Compliance Architecture",
            "60-Day Extended Warranty & Priority Engineering Retainer",
        ],
        highlighted: false,
    },
];

const faqs = [
    {
        q: "How do you ensure the AI chatbot will not hallucinate or quote wrong prices?",
        a: "We implement strict Retrieval-Augmented Generation (RAG). The LLM is never allowed to guess. Every incoming query triggers a semantic search against your verified company knowledge base (SOPs, price lists, terms). The model is instructed with deterministic system bounds to answer exclusively from the retrieved text. If information is not explicitly present, it politely states it does not know and offers to escalate to your human team.",
    },
    {
        q: "What are the ongoing running costs after launch?",
        a: "Because you own the code and deploy it directly on your infrastructure (such as Vercel, Railway, AWS, or your own VPS), you do not pay high $150–$500/mo platform subscription fees. You only pay for actual model token usage directly to OpenAI, Anthropic, or Google. For most service businesses handling 1,000 to 3,000 conversations a month, model API costs typically run between $8 and $25 per month.",
    },
    {
        q: "Can the chatbot hand off to a real team member?",
        a: "Yes, human handoff is built into our core architecture. The system monitors customer sentiment and intent. If a prospect requests a human, asks about a high-value custom contract, or seems confused, the bot triggers an immediate alert to your team's Slack, WhatsApp, or email with the full conversation transcript. A team member can take over seamlessly.",
    },
    {
        q: "Can you connect it to our WhatsApp Business account?",
        a: "Yes. We engineer integrations using the official Meta WhatsApp Business Cloud API. We handle webhook registration, template configuration, and message routing so your business can engage leads directly on WhatsApp with interactive buttons, quick replies, and automated CRM sync.",
    },
    {
        q: "How do I update the chatbot's knowledge when our pricing or services change?",
        a: "We structure the knowledge base cleanly so you can easily update PDFs, markdown documentation, or Notion pages. In our Growth and Enterprise sprints, we configure automated re-indexing so that updating your source documentation automatically updates the assistant's knowledge base without touching any code.",
    },
    {
        q: "Do I own the full source code and data?",
        a: "Yes, 100%. Unlike SaaS chatbot builders that lock your conversation data, prompts, and flows into their proprietary walled garden, RelayWorks delivers clean, documented source code (TypeScript, Python, FastAPI/Next.js) directly to your GitHub repository. You retain complete ownership and can host anywhere.",
    },
    {
        q: "What is your development and delivery process?",
        a: "We work in focused 1-on-1 engineering sprints. Day 1–2: Discovery and architecture mapping. Day 3–5: Knowledge base ingestion and prompt engineering. Day 6–8: CRM, calendar, and channel webhook integrations. Day 9–11: Rigorous red-teaming and edge-case testing. Day 12–14: Production deployment and staff walkthrough. You receive continuous updates throughout.",
    },
];

// --- Subcomponents ---

function QuickConsultationForm() {
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        company: "",
        objective: "lead_generation",
        details: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("idle");

        const embed = {
            title: "New AI Chatbot Architecture Lead",
            color: 2469335, // Royal Blue
            fields: [
                { name: "Client Name", value: formData.name || "N/A", inline: true },
                { name: "Email / Phone", value: formData.contact || "N/A", inline: true },
                { name: "Company / Site", value: formData.company || "N/A", inline: true },
                { name: "Primary Objective", value: formData.objective, inline: true },
                { name: "Project Specifications", value: formData.details || "N/A" },
            ],
            timestamp: new Date().toISOString(),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", contact: "", company: "", objective: "lead_generation", details: "" });
                trackEvent("ai_chatbot_lead_submit", { type: "architecture_consultation" });
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("Failed to submit consultation form:", err);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="lead-name" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Your Name *
                    </label>
                    <Input
                        id="lead-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. David Vance"
                        required
                        className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 rounded-xl"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="lead-contact" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Work Email or WhatsApp *
                    </label>
                    <Input
                        id="lead-contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="david@company.com or +1 (555) 0192"
                        required
                        className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 rounded-xl"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="lead-company" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Company Name or Website URL
                    </label>
                    <Input
                        id="lead-company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Apex Clinic / apexclinic.com"
                        className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 rounded-xl"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="lead-objective" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Primary Automation Objective
                    </label>
                    <select
                        id="lead-objective"
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                        <option value="lead_generation">Inbound Lead Capture & Qualification</option>
                        <option value="booking_scheduling">Automated Calendar Appointment Booking</option>
                        <option value="whatsapp_automation">WhatsApp Business Automation</option>
                        <option value="support_deflection">Customer Support & FAQ Deflection</option>
                        <option value="internal_knowledge">Internal Team Knowledge Assistant</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="lead-details" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    What does your team currently repeat manually? *
                </label>
                <Textarea
                    id="lead-details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Describe your current bottleneck (e.g., missed after-hours leads, manually booking dental checkups, answering pricing on WhatsApp, syncing leads to HubSpot)."
                    required
                    className="min-h-[110px] resize-none border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 rounded-xl text-sm"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                className="h-12 w-full rounded-xl font-bold shadow-sm transition-all text-base inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-white"
            >
                {isSubmitting ? "Submitting Inquiry..." : "Schedule Engineering Discovery Call"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>

            {status === "success" && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Inquiry received. Senior engineer Hazrat Ummar Shaikh will review your specifications and reply within 2 business hours.</span>
                </div>
            )}

            {status === "error" && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>Submission error. Please try again or message directly via live chat at the bottom right.</span>
                </div>
            )}
        </form>
    );
}

// --- Main Page Component ---

export const AIChatbotLanding = () => {
    const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
    const [currency, setCurrency] = useState<"USD" | "INR">("USD");
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        const root = document.documentElement;
        const hadDark = root.classList.contains("dark");
        if (hadDark) {
            root.classList.remove("dark");
        }
        return () => {
            if (hadDark) {
                root.classList.add("dark");
            }
        };
    }, []);

    const activeScenario = sandboxScenarios[selectedScenarioIndex];

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-600 selection:text-white">
                
                {/* 1. HERO SECTION (Editorial B2B Light Mode) */}
                <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-20 md:pt-24 md:pb-28">
                    {/* Hairline Grid Background */}
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                            maskImage: "radial-gradient(ellipse 70% 60% at 50% 10%, #000 60%, transparent 100%)",
                        }}
                    />

                    <div className="container relative mx-auto px-6 max-w-7xl">
                        <div className="grid items-center gap-12 lg:grid-cols-12">
                            
                            {/* Left Hero Content */}
                            <div className="lg:col-span-6 space-y-6">
                                {/* Pill Badge */}
                                <div 
                                    className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm border"
                                    style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}
                                >
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Production Conversational AI & Lead Automation</span>
                                </div>

                                {/* Headline */}
                                <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl leading-[1.08]">
                                    Stop Losing Inbound Leads While Your Office Is Closed.
                                </h1>

                                {/* Subheadline */}
                                <p className="text-lg md:text-xl leading-relaxed font-normal" style={{ color: "#334155" }}>
                                    We engineer intelligent website & WhatsApp conversational assistants that qualify prospects, answer intricate business questions from your verified documentation, and book meetings directly into your calendar 24/7. No generic templates, zero hallucinations, and 100% full source code ownership.
                                </p>

                                {/* Action Buttons - Balanced Heights & Padding */}
                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
                                            trackEvent("ai_chatbot_hero_cta", { action: "consultation" });
                                        }}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="h-[54px] px-8 rounded-xl font-semibold text-base shadow-sm hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 group cursor-pointer text-white"
                                    >
                                        <span>Schedule Discovery Call</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <a
                                        href="#interactive-sandbox"
                                        style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                                        className="inline-flex items-center justify-center h-[54px] px-8 rounded-xl border font-semibold text-base transition-colors shadow-sm hover:bg-slate-50"
                                    >
                                        <span>Explore Live Sandbox</span>
                                    </a>
                                </div>

                                {/* Trust Highlights */}
                                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 sm:grid-cols-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Grounded Vector RAG</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Instant Cal & CRM Sync</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Zero Hallucinations</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>100% Code Ownership</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Hero Visual Showcase: Interactive Live Assistant Sandbox */}
                            <div className="lg:col-span-6" id="interactive-sandbox">
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
                                    
                                    {/* Window Header */}
                                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-rose-400" />
                                            <span className="h-3 w-3 rounded-full bg-amber-400" />
                                            <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                            <span className="ml-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Live Assistant Execution Simulator
                                            </span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                            Active System
                                        </div>
                                    </div>

                                    {/* Industry Scenario Tabs */}
                                    <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1 overflow-x-auto">
                                        {sandboxScenarios.map((scenario, idx) => (
                                            <button
                                                key={scenario.id}
                                                onClick={() => setSelectedScenarioIndex(idx)}
                                                style={
                                                    selectedScenarioIndex === idx
                                                        ? { backgroundColor: "#ffffff", color: "#1d4ed8", borderColor: "#cbd5e1" }
                                                        : { color: "#475569" }
                                                }
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                                                    selectedScenarioIndex === idx
                                                        ? "shadow-sm border-slate-300"
                                                        : "border-transparent hover:text-slate-900 hover:bg-white/60"
                                                )}
                                            >
                                                {scenario.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Main Sandbox Grid: Chat on Left, Execution Inspector on Right */}
                                    <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                        
                                        {/* Chat Stream (7 cols) */}
                                        <div className="md:col-span-7 p-4 bg-white min-h-[380px] flex flex-col justify-between">
                                            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                                                {activeScenario.messages.map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn(
                                                            "flex flex-col",
                                                            msg.role === "user" ? "items-end" : "items-start"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed",
                                                                msg.role === "user"
                                                                    ? "rounded-br-none shadow-sm text-white"
                                                                    : "rounded-bl-none font-normal border"
                                                            )}
                                                            style={
                                                                msg.role === "user"
                                                                    ? { backgroundColor: "#2563eb", color: "#ffffff" }
                                                                    : { backgroundColor: "#f1f5f9", color: "#0f172a", borderColor: "#e2e8f0" }
                                                            }
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                                                            {msg.time}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Simulated input bar */}
                                            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                                <div className="h-9 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs text-slate-500 flex items-center">
                                                    Ask service details, quote criteria, or book slot...
                                                </div>
                                                <div 
                                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                    className="h-9 w-9 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* System Inspector Panel (5 cols) */}
                                        <div className="md:col-span-5 p-4 bg-slate-50/80 space-y-3 font-mono text-[11px]">
                                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans flex items-center gap-1.5 pb-1 border-b border-slate-200">
                                                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                                                Execution Inspector
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Identified Intent</span>
                                                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 block truncate">
                                                    {activeScenario.executionLog.intent}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Knowledge Base Match</span>
                                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate text-[10px]">
                                                    {activeScenario.executionLog.sourceDoc}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Confidence: <strong className="text-slate-800">{activeScenario.executionLog.confidence}</strong>
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Structured CRM Object</span>
                                                <div className="bg-slate-900 text-slate-200 p-2 rounded-lg text-[10px] leading-tight space-y-0.5 overflow-x-auto">
                                                    {Object.entries(activeScenario.executionLog.crmPayload).map(([k, v]) => (
                                                        <div key={k}>
                                                            <span className="text-cyan-300">{k}</span>: <span className="text-amber-200">"{v}"</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Human Escalation Matrix</span>
                                                <div className="bg-white border border-slate-200 rounded p-1.5 text-[10px] text-slate-700 flex items-start gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                                                    <span>{activeScenario.executionLog.escalation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. COMMERCIAL PERFORMANCE METRICS (High-Contrast Bar) */}
                <section 
                    style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                    className="py-12 border-b border-slate-800 text-white"
                >
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                            <div className="pt-4 sm:pt-0 sm:px-4">
                                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-blue-400">&lt; 3 Seconds</div>
                                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Average Response Latency</div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Captures leads before they click back</p>
                            </div>
                            <div className="pt-4 sm:pt-0 sm:px-4">
                                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-emerald-400">68% Deflection</div>
                                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Repetitive FAQ Resolution</div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Saves 20+ hours of team busywork</p>
                            </div>
                            <div className="pt-4 sm:pt-0 sm:px-4">
                                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-cyan-400">24/7/365</div>
                                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Uninterrupted Lead Capture</div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Converts after-hours weekend visitors</p>
                            </div>
                            <div className="pt-4 sm:pt-0 sm:px-4">
                                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-white">100% Client Owned</div>
                                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Full Source Code & Data</div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Zero recurring SaaS platform lock-in</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. THE CORE OPERATIONAL PROBLEMS SOLVED */}
                <section className="py-20 md:py-28 bg-[#fafaf9]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-4">
                                Commercial Realities
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
                                Where Businesses Bleed High-Intent Inquiries
                            </h2>
                            <p className="mt-4 text-base sm:text-lg text-slate-600">
                                Most websites lose prospects not because of weak marketing, but because of slow, fragmented, or friction-heavy response systems.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {commercialProblems.map((problem, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                                                {problem.badge}
                                            </span>
                                            <span className="text-xs font-extrabold text-slate-900">
                                                {problem.metric}
                                            </span>
                                        </div>
                                        <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                                            {problem.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-600">
                                            {problem.description}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                                        <span>Resolved with RelayWorks AI</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. TECHNICAL ARCHITECTURE (The Engineering Difference) */}
                <section className="py-20 md:py-28 bg-white border-y border-slate-200">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm mb-4">
                                Robust Systems Engineering
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
                                How We Engineer Zero-Hallucination AI Agents
                            </h2>
                            <p className="mt-4 text-base sm:text-lg text-slate-600">
                                What separates an elite commercial AI system from fragile no-code toys is deterministic architecture, strict safety boundaries, and deep webhook execution.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
                            {architectureSteps.map((step) => (
                                <div
                                    key={step.number}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group"
                                >
                                    <div>
                                        <span className="font-heading text-2xl font-black text-blue-600 group-hover:text-blue-700 transition-colors">
                                            {step.number}
                                        </span>
                                        <h3 className="font-heading text-lg font-bold text-slate-900 mt-3 mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-xs leading-relaxed text-slate-600">
                                            {step.desc}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5">
                                        {step.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. MULTI-CHANNEL DEPLOYMENT PLATFORMS */}
                <section className="py-20 md:py-28 bg-[#fafaf9]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-4">
                                Deployment Channels
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
                                Connect Where Your Customers Already Communicate
                            </h2>
                            <p className="mt-4 text-base sm:text-lg text-slate-600">
                                Deploy a centralized conversational brain across the channels where your audience makes buying decisions.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {deploymentChannels.map((channel) => (
                                <div
                                    key={channel.name}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-4">
                                            <channel.icon className="h-6 w-6" />
                                        </div>
                                        <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                                            {channel.highlight}
                                        </div>
                                        <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                                            {channel.name}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-600">
                                            {channel.desc}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <span>Production Native API</span>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. DIRECT COMPARISON (RelayWorks vs No-Code SaaS vs Hiring) */}
                <section className="py-20 md:py-28 bg-white border-y border-slate-200">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-4">
                                Clear Economic Comparison
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
                                Why Boutique Custom Engineering Wins
                            </h2>
                            <p className="mt-4 text-base sm:text-lg text-slate-600">
                                Compare the real long-term costs, data sovereignty, and technical capabilities.
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-700">
                                        <th className="p-4 sm:p-5">Capability / Metric</th>
                                        <th className="p-4 sm:p-5 bg-blue-50/50 text-blue-900 border-x border-blue-100">
                                            RelayWorks Custom Engineering
                                        </th>
                                        <th className="p-4 sm:p-5 text-slate-600">Generic No-Code Bot SaaS</th>
                                        <th className="p-4 sm:p-5 text-slate-600">Full-Time Support Hire</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-sm">
                                    {comparisonData.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                                            <td className="p-4 sm:p-5 bg-blue-50/20 font-semibold text-blue-950 border-x border-blue-100/80">
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                                    <span>{row.relayworks}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5 text-slate-600">{row.genericSaas}</td>
                                            <td className="p-4 sm:p-5 text-slate-600">{row.humanHire}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 7. TRANSPARENT SPRINT PRICING (USD / INR Switcher) */}
                <section className="py-20 md:py-28 bg-[#fafaf9]" id="pricing">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-4">
                                Fixed Milestone Sprint Pricing
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
                                Transparent Engineering Investments
                            </h2>
                            <p className="mt-4 text-base sm:text-lg text-slate-600">
                                No recurring monthly SaaS hostage fees. You pay for the dedicated engineering sprint, and you own 100% of the completed solution forever.
                            </p>

                            {/* Currency Switcher */}
                            <div className="mt-6 inline-flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                                <button
                                    onClick={() => setCurrency("USD")}
                                    style={currency === "USD" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
                                        currency === "USD"
                                            ? "shadow-sm text-white"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    USD ($)
                                </button>
                                <button
                                    onClick={() => setCurrency("INR")}
                                    style={currency === "INR" ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
                                        currency === "INR"
                                            ? "shadow-sm text-white"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    INR (₹)
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
                            {sprintPricing.map((tier) => (
                                <div
                                    key={tier.name}
                                    style={tier.highlighted ? { borderColor: "#2563eb" } : {}}
                                    className={cn(
                                        "rounded-2xl p-8 flex flex-col justify-between transition-all",
                                        tier.highlighted
                                            ? "bg-white border-2 shadow-xl shadow-blue-600/10 relative"
                                            : "bg-white border border-slate-200 shadow-sm hover:shadow-md"
                                    )}
                                >
                                    {tier.badge && (
                                        <div 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap"
                                        >
                                            {tier.badge}
                                        </div>
                                    )}

                                    <div className={tier.badge ? "pt-4" : ""}>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-heading text-xl font-bold text-slate-950">
                                                {tier.name}
                                            </h3>
                                        </div>

                                        <div className="mt-4 flex items-baseline gap-2">
                                            <span className="font-heading text-4xl font-extrabold text-slate-950">
                                                {currency === "USD" ? tier.usdPrice : tier.inrPrice}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                One-Time Sprint
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                            {tier.tagline}
                                        </p>

                                        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                                            <span>Timeline: {tier.timeline}</span>
                                        </div>

                                        <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                                                Sprint Deliverables
                                            </span>
                                            {tier.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                                                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
                                                trackEvent("ai_chatbot_pricing_select", { tier: tier.name });
                                            }}
                                            style={
                                                tier.highlighted
                                                    ? { backgroundColor: "#2563eb", color: "#ffffff" }
                                                    : { backgroundColor: "#0f172a", color: "#ffffff" }
                                            }
                                            className="w-full h-12 rounded-xl font-bold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-white hover:opacity-95"
                                        >
                                            <span>Book This Sprint</span>
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. FOUNDER CREDIBILITY (Hazrat Ummar Shaikh) */}
                <section className="py-20 md:py-28 bg-white border-y border-slate-200">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-12 shadow-sm">
                            <div className="grid md:grid-cols-12 gap-8 items-center">
                                
                                <div className="md:col-span-4 flex flex-col items-center text-center">
                                    <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                                        <img
                                            src="/images/founder.jpg"
                                            alt="Hazrat Ummar Shaikh, Founder & Lead Software Engineer"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                                        <BadgeCheck className="h-4 w-4 text-blue-600" />
                                        Independent Senior Builder
                                    </div>
                                </div>

                                <div className="md:col-span-8 space-y-4 text-slate-700">
                                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950">
                                        Direct 1-on-1 Engineering. No Agency Overhead.
                                    </h3>
                                    <p className="text-sm sm:text-base leading-relaxed">
                                        I am <strong>Hazrat Ummar Shaikh</strong>, an independent senior software engineer. Over the past 4 years, I have architected and deployed over 200+ conversational AI systems, custom Discord bots, and backend automations for businesses across the US, UK, Middle East, and India.
                                    </p>
                                    <p className="text-sm sm:text-base leading-relaxed">
                                        When you hire RelayWorks, you work directly with me — the engineer writing your system prompts, structuring your vector embeddings, and testing edge cases. There are no junior subcontractors, no account managers playing telephone, and zero agency bloat.
                                    </p>

                                    <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                                        <a
                                            href="https://github.com/ihazratummar"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 transition-colors shadow-sm"
                                        >
                                            <GitBranch className="h-4 w-4 text-slate-600" />
                                            <span>View Public Repositories (GitHub)</span>
                                            <ExternalLink className="h-3 w-3 text-slate-400" />
                                        </a>

                                        <a
                                            href="https://www.linkedin.com/in/hazrat-ummar-shaikh/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 transition-colors shadow-sm"
                                        >
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span>Connect on LinkedIn</span>
                                            <ExternalLink className="h-3 w-3 text-slate-400" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. CONSULTATION & ARCHITECTURE DISCOVERY FORM */}
                <section className="py-20 md:py-28 bg-[#fafaf9] relative" id="consultation-form">
                    <span id="quote-form" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm mb-4">
                                Free 30-Minute Architecture Call
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                                Map Your AI Automation Blueprint
                            </h2>
                            <p className="mt-3 text-base text-slate-600">
                                Share where your team spends manual time or where after-hours leads are slipping through. I will review your workflow and outline the cleanest technical architecture.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
                            <QuickConsultationForm />
                        </div>
                    </div>
                </section>

                {/* 10. COMPREHENSIVE B2B FAQ ACCORDION */}
                <section className="py-20 md:py-28 bg-white border-t border-slate-200" id="faq">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm mb-4">
                                Clear Technical Answers
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="mt-3 text-base text-slate-600">
                                Straightforward technical and commercial answers regarding architecture, ownership, and maintenance.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left font-heading text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown
                                            className={cn(
                                                "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                                                openFaq === index && "rotate-180 text-blue-600"
                                            )}
                                        />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {openFaq === index && (
                                            <m.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-5 pb-6 sm:px-6 pt-0 text-sm leading-relaxed text-slate-600 border-t border-slate-100">
                                                    {faq.a}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 11. FINAL HIGH-CONVERTING CTA BANNER */}
                <section 
                    style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                    className="py-16 md:py-24 text-white"
                >
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-6">
                            Ready for Autonomous Lead Capture?
                        </div>
                        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Never Miss Another Qualified Customer Inbound.
                        </h2>
                        <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
                            Whether you need an emergency repair dispatcher, patient intake assistant, or multi-channel sales agent, we engineer systems that run reliably 24/7.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="h-[54px] px-9 rounded-xl font-bold text-base shadow-lg shadow-blue-600/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 text-white"
                            >
                                <span>Schedule Free Architecture Call</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </LazyMotion>
    );
};
