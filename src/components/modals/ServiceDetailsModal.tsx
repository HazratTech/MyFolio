"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Bot, Smartphone, Database, Cloud, Server, Code, Layers, Globe } from "lucide-react";
import { useState } from "react";
import { HireMeModal } from "./HireMeModal";

const serviceDetails = {
    "Discord Bot Development": {
        description: "Custom bots with advanced features, moderation tools, and API integrations tailored to your community needs.",
        features: [
            "Custom Slash Commands",
            "Advanced Moderation Systems",
            "Welcome & Auto-Role Systems",
            "Economy & Leveling Systems",
            "Ticket & Support Systems",
            "External API Integrations",
            "Database Integration (MongoDB)",
            "Web Dashboard Integration",
            "Payment Gateway Integration",
            "24/7 Uptime Optimization"
        ],
        icon: Bot,
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    "Native Android Development": {
        description: "High-performance native Android applications built with Kotlin and Jetpack Compose.",
        features: [
            "Native Android (Kotlin)",
            "Modern UI with Jetpack Compose",
            "Material Design 3 Implementation",
            "Room Database (Local Storage)",
            "Retrofit/Ktor API Integration",
            "Background Services & WorkManager",
            "Google Play Services Integration",
            "Firebase Integration (Auth, Firestore)",
            "Clean Architecture & MVVM",
            "Play Store Submission Support"
        ],
        icon: Smartphone,
        color: "text-green-400",
        bg: "bg-green-400/10"
    },
    "Backend Development": {
        description: "Robust and scalable backend systems using FastAPI, KTOR, and MongoDB.",
        features: [
            "RESTful API Design",
            "Database Design (MongoDB/SQL)",
            "Authentication & Authorization (JWT)",
            "Real-time Communication (WebSockets)",
            "Payment Processing (Stripe/PayPal)",
            "Cloud Storage Integration (AWS S3)",
            "Server Deployment & Management",
            "Docker & Containerization",
            "CI/CD Pipeline Setup",
            "API Documentation (Swagger)"
        ],
        icon: Server,
        color: "text-violet-400",
        bg: "bg-violet-400/10"
    }
};

export const ServiceDetailsModal = ({ children, serviceType }: { children: React.ReactNode, serviceType: string }) => {
    const [open, setOpen] = useState(false);
    const details = serviceDetails[serviceType as keyof typeof serviceDetails];

    if (!details) return <>{children}</>;

    const Icon = details.icon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] bg-[#111218] border-white/10 text-foreground p-0 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4 shrink-0">
                    <div className={`w-12 h-12 rounded-lg ${details.bg} flex items-center justify-center ${details.color} shrink-0`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl md:text-2xl font-bold">{serviceType}</DialogTitle>
                        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{details.description}</p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            What's Included
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {details.features.map((feature, i) => (
                                <div key={i} className="flex items-start text-sm p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <Check className={`w-4 h-4 mr-3 mt-0.5 shrink-0 ${details.color}`} />
                                    <span className="text-muted-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">Custom Requirements?</h4>
                        <p className="text-sm text-muted-foreground relative z-10">
                            I am always ready for custom requirements. These are just starting points and I am ready for your unique ideas.
                            Let's discuss exactly what you need and build something amazing together.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20 shrink-0 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                    <HireMeModal>
                        <Button className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
                            Discuss Project
                        </Button>
                    </HireMeModal>
                </div>
            </DialogContent>
        </Dialog>
    );
};
