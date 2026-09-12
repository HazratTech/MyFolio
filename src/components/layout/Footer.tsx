import React from "react";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Social from "@/models/Social";
import { getIcon } from "@/lib/utils/icons";
import { ExternalLink, Mail } from "lucide-react";
import { FooterQuickInquiry } from "./FooterQuickInquiry";

export const Footer = async () => {
    let socials = [];
    try {
        await dbConnect();
        socials = await Social.find({});
    } catch (error) {
        console.error("Failed to fetch socials:", error);
    }

    const fallbackSocials = [
        { name: "GitHub", href: "https://github.com/ihazratummar", icon: "Github" },
        { name: "LinkedIn", href: "https://www.linkedin.com/in/hazrat-ummar-shaikh/", icon: "Linkedin" },
        { name: "X (Twitter)", href: "https://x.com/ihazratummar9", icon: "Twitter" },
        { name: "Instagram", href: "https://www.instagram.com/hazratummar/", icon: "Instagram" },
    ];

    const displaySocials = socials && socials.length > 0 ? socials : fallbackSocials;

    return (
        <footer className="w-full bg-white border-t border-slate-200 text-slate-900 pt-16 pb-12 relative z-10">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                
                {/* Main 4-Column Layout with explicit flexbox distribution */}
                <div 
                    className="pb-12 border-b border-slate-100"
                    style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        justifyContent: "space-between", 
                        alignItems: "flex-start", 
                        gap: "2.5rem" 
                    }}
                >
                    
                    {/* Col 1: Brand, Mission & Operational Status */}
                    <div style={{ flex: "1 1 300px", maxWidth: "380px" }} className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                            <Image 
                                src="/icon.png" 
                                alt="RelayWorks Logo" 
                                width={32} 
                                height={32} 
                                className="h-8 w-8 object-contain" 
                            />
                            <span className="text-2xl font-black font-heading tracking-tight text-slate-950">
                                Relay<span style={{ color: "#2563eb" }}>Works</span>
                            </span>
                        </Link>
                        
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Independent boutique software engineering studio founded by Hazrat Ummar Shaikh. We engineer production native mobile apps, resilient cloud backends, and deterministic AI automations.
                        </p>
                        
                        {/* Operational Status Pill */}
                        <div className="pt-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>Accepting Projects · Q4 Sprints Available</span>
                            </div>
                        </div>

                        {/* Social Links Row */}
                        <div className="flex items-center gap-2.5 pt-2">
                            {displaySocials.map((social: any, idx: number) => {
                                const Icon = getIcon(social.icon);
                                return (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-xs"
                                        aria-label={`${social.name} Profile`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Col 2: Engineering Disciplines */}
                    <div style={{ flex: "1 1 220px", minWidth: "220px" }} className="space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Disciplines
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li>
                                <Link href="/mobile-app-development" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    Native Mobile (Android & KMP)
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    Cloud Backends & APIs (FastAPI / Spring)
                                </Link>
                            </li>
                            <li>
                                <Link href="/ai-chatbot-development" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    <span>AI Assistants & Automations</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        New
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/discord-bot" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    Custom Discord Bots & Event Engines
                                </Link>
                            </li>
                            <li>
                                <Link href="/#services" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    Architecture Audits & Refactoring
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Flagship Software & Proof */}
                    <div style={{ flex: "1 1 180px", minWidth: "180px" }} className="space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Software & Proof
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li>
                                <a 
                                    href="https://play.google.com/store/apps/dev?id=8511073495389394372" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <span>Google Play Store</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://github.com/ihazratummar" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <span>GitHub Repositories</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </a>
                            </li>
                            <li>
                                <Link href="/projects" className="hover:text-blue-600 transition-colors whitespace-nowrap">
                                    Production Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-blue-600 transition-colors whitespace-nowrap">
                                    Engineering Deep Dives
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="hover:text-blue-600 transition-colors whitespace-nowrap">
                                    Sprint Pricing Matrix
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Direct Connect & Quick Inquiry */}
                    <div style={{ flex: "1 1 260px", maxWidth: "320px" }} className="space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Direct Connect
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Direct technical inquiries answered within 24 hours by lead engineer.
                        </p>
                        <FooterQuickInquiry />
                        <div className="pt-1">
                            <a 
                                href="mailto:hazratummar9@gmail.com"
                                className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>hazratummar9@gmail.com</span>
                            </a>
                        </div>
                    </div>

                </div>

                {/* Bottom Legal Row */}
                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                    <p>
                        &copy; {new Date().getFullYear()} RelayWorks Studio. All rights reserved. Founded & engineered by Hazrat Ummar Shaikh.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <span className="text-slate-300">·</span>
                        <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                        <span className="text-slate-300">·</span>
                        <Link href="/cookie-policy" className="hover:text-blue-600 transition-colors">Cookie Policy</Link>
                        <span className="text-slate-300">·</span>
                        <Link href="#cookie-settings" className="hover:text-blue-600 transition-colors">Manage Cookies</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};
