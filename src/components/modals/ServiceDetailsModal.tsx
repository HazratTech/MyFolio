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
            <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] bg-white border border-slate-200 text-slate-900 p-0 overflow-hidden flex flex-col shadow-2xl rounded-3xl">
                <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-4 shrink-0">
                    <div className={`w-12 h-12 rounded-xl ${details.bg} flex items-center justify-center ${details.color} shrink-0`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl md:text-2xl font-black font-heading text-slate-950">{serviceType}</DialogTitle>
                        <p className="text-slate-600 text-xs md:text-sm line-clamp-2 mt-0.5">{details.description}</p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>Architecture Deliverables</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {details.features.map((feature, i) => (
                                <div key={i} className="flex items-start text-sm p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-colors">
                                    <Check className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${details.color}`} />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 border border-blue-200 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20 text-blue-600" />
                        </div>
                        <h4 className="text-base font-bold text-slate-950 mb-1.5 font-heading">Custom Scope or Enterprise Requirements?</h4>
                        <p className="text-xs text-slate-600 relative z-10 leading-relaxed max-w-xl">
                            Every system is built to your precise production constraints. These feature lists represent standard baseline deliverables. Connect directly with founder Hazrat Ummar Shaikh to tailor your custom sprint scope.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50/70 shrink-0 flex justify-end gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs h-10 px-4" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <HireMeModal>
                        <Button 
                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                            className="hover:opacity-90 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-xs transition-opacity"
                        >
                            Start Project Discovery
                        </Button>
                    </HireMeModal>
                </div>
            </DialogContent>
        </Dialog>
    );
};
