"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Bot, Smartphone, Database, Cloud, Server } from "lucide-react";
import { useState } from "react";
import { HireMeModal } from "./HireMeModal";

const discordTiers = [
    {
        name: "Starter Bot",
        price: "$80",
        description: "Essential features for small communities.",
        features: [
            "Welcome System",
            "Auto Roles",
            "Slash Commands",
            "Anti-Invite System",
            "Basic Moderation",
            "24/7 Uptime Support"
        ],

        icon: ({ className }: { className?: string }) => (
            <img src="/discord.svg" alt="Discord" className={className} />
        ),
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        serviceType: "Discord Bot"
    },
    {
        name: "Community Bot",
        price: "$200",
        description: "Advanced engagement & management tools.",
        features: [
            "Everything in Starter",
            "Economy System (Coins, Shop)",
            "XP & Leveling System",
            "Ticketing + Transcripts",
            "Advanced Auto-Moderation",
            "Reaction Roles"
        ],
        icon: Shield,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        popular: true,
        serviceType: "Discord Bot"
    },
    {
        name: "AI Ultimate Bot",
        price: "$450",
        description: "Full AI integration & hybrid commands.",
        features: [
            "Everything in Community",
            "AI Chat & Commands (GPT)",
            "AI Auto-Moderation (NSFW/Toxicity)",
            "Hybrid Commands",
            "Custom Branding",
            "Priority Support"
        ],
        icon: Zap,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        serviceType: "Discord Bot"
    }
];

const mobileTiers = [
    {
        name: "Starter App",
        price: "$300",
        description: "Simple functionality & UI (Up to 5 Screens).",
        features: [
            "Up to 5 Custom Screens",
            "Jetpack Compose UI (Material3)",
            "Firebase Auth (Google/Email)",
            "Local Storage (Room DB)",
            "Push Notifications (FCM)",
            "AdMob Integration"
        ],
        icon: Smartphone,
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
        serviceType: "Mobile App"
    },
    {
        name: "Pro App",
        price: "$750",
        description: "Complex features & backend (Up to 12 Screens).",
        features: [
            "Up to 12 Custom Screens",
            "MongoDB & Firestore Database",
            "API Integration (Retrofit/Ktor)",
            "Custom Backend (Ktor)",
            "Advanced Animations",
            "Play Store Submission Support"
        ],
        icon: Database,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
        popular: true,
        serviceType: "Mobile App"
    },
    {
        name: "AI Powered App",
        price: "$1200",
        description: "Advanced AI & Scale (Up to 20 Screens).",
        features: [
            "Up to 20 Custom Screens",
            "AI Chatbot (OpenAI/Dialogflow)",
            "Image Recognition (ML Kit)",
            "Text Generation & Summaries",
            "Premium Custom Design",
            "Priority Maintenance"
        ],
        icon: Cloud,
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/20",
        serviceType: "Mobile App"
    }
];

const backendTiers = [
    {
        name: "Starter API",
        price: "$200",
        description: "Secure & fast API for small apps.",
        features: [
            "REST API Design",
            "Authentication (JWT/OAuth)",
            "MongoDB / PostgreSQL Integration",
            "Basic Documentation (Swagger)",
            "Server Deployment Setup",
            "Bug Fixes & Support"
        ],
        icon: Server,
        color: "text-indigo-400",
        bg: "bg-indigo-400/10",
        border: "border-indigo-400/20",
        serviceType: "Backend Development"
    },
    {
        name: "Pro Backend",
        price: "$500",
        description: "Scalable architecture for growing products.",
        features: [
            "Everything in Starter",
            "Advanced Logic & Optimization",
            "Ktor / FastAPI Implementation",
            "Redis Caching & Performance",
            "Docker Containerization",
            "Automated Testing"
        ],
        icon: Database,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        border: "border-violet-400/20",
        popular: true,
        serviceType: "Backend Development"
    },
    {
        name: "Enterprise Scale",
        price: "$900",
        description: "High-performance microservices system.",
        features: [
            "Everything in Pro",
            "Microservices Architecture",
            "GraphQL / gRPC Integration",
            "Real-time Systems (WebSockets)",
            "Cloud Scaling (AWS/GCP)",
            "Priority 24/7 Support"
        ],
        icon: Cloud,
        color: "text-fuchsia-400",
        bg: "bg-fuchsia-400/10",
        border: "border-fuchsia-400/20",
        serviceType: "Backend Development"
    }
];

export const PricingModal = ({ children, serviceType }: { children: React.ReactNode, serviceType: "Discord Bot" | "Mobile App" | "Backend Development" }) => {
    const [open, setOpen] = useState(false);

    let tiers;
    switch (serviceType) {
        case "Discord Bot":
            tiers = discordTiers;
            break;
        case "Mobile App":
            tiers = mobileTiers;
            break;
        case "Backend Development":
            tiers = backendTiers;
            break;
        default:
            tiers = discordTiers;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] bg-[#111218] border-white/10 text-foreground p-0 overflow-hidden shadow-2xl">
                <div className="p-6 text-center border-b border-white/10 bg-white/5">
                    <DialogTitle className="text-3xl font-bold mb-2">Choose Your Plan</DialogTitle>
                    <p className="text-muted-foreground">Transparent pricing for {serviceType} Development.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {tiers.map((tier, index) => (
                        <div key={index} className={`p-6 flex flex-col h-full relative ${tier.popular ? 'bg-white/5' : ''}`}>
                            {tier.popular && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    POPULAR
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-lg ${tier.bg} flex items-center justify-center mb-4 ${tier.color}`}>
                                <tier.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                            <div className="text-3xl font-bold mb-2">{tier.price}</div>
                            <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-sm">
                                        <Check className={`w-4 h-4 mr-2 mt-0.5 shrink-0 ${tier.color}`} />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <HireMeModal>
                                <Button className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : 'bg-white/10 hover:bg-white/20'} text-white border border-white/10`}>
                                    Get Started
                                </Button>
                            </HireMeModal>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
