"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { 
    Menu, X, BookOpen, ChevronDown, Bot, Sparkles, Smartphone, Server, ArrowRight 
} from "lucide-react";
import Image from "next/image";
import { HireMeModal } from "@/components/modals/HireMeModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { servicesNavigationList, ServiceNavItem } from "@/data/services-data";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
    const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(true);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsServicesDropdownOpen(false);
    }, [pathname]);

    const isDiscordLanding = pathname === "/discord-bot";
    const isAiChatbotLanding = pathname === "/ai-chatbot-development";
    const isMobileLanding = pathname === "/mobile-app-development";
    const isSpecialLanding = isDiscordLanding || isAiChatbotLanding || isMobileLanding;
    const isLightMode = isAiChatbotLanding || isDiscordLanding || isMobileLanding || pathname === "/" || pathname.startsWith("/services") || pathname === "/about" || pathname.startsWith("/blog");

    const handleMouseEnter = () => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        setIsServicesDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setIsServicesDropdownOpen(false);
        }, 150);
    };

    const getServiceIcon = (type: ServiceNavItem["iconType"]) => {
        switch (type) {
            case "bot":
                return <Bot className={cn("w-5 h-5", isLightMode ? "text-blue-600" : "text-[#5865F2]")} />;
            case "sparkles":
                return <Sparkles className={cn("w-5 h-5", isLightMode ? "text-blue-600" : "text-cyan-400")} />;
            case "smartphone":
                return <Smartphone className={cn("w-5 h-5", isLightMode ? "text-emerald-600" : "text-emerald-400")} />;
            case "server":
                return <Server className={cn("w-5 h-5", isLightMode ? "text-indigo-600" : "text-purple-400")} />;
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <m.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isLightMode
                        ? isScrolled
                            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm"
                            : "bg-white/80 backdrop-blur-sm border-b border-slate-200/60 py-5"
                        : isScrolled
                            ? isDiscordLanding
                                ? "bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 py-4 shadow-xl"
                                : "bg-background/80 backdrop-blur-md border-b border-white/10 py-4 shadow-xl"
                            : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-2.5">
                            <Image src="/icon.png" alt="RelayWorks Logo" width={28} height={28} className="h-7 w-7 object-contain" priority />
                            <span className={cn("text-xl font-bold font-heading tracking-tighter", isLightMode ? "text-slate-900" : "text-white")}>
                                Relay<span className="text-primary">Works</span>
                            </span>
                        </Link>
                        <span className={isLightMode ? "text-slate-300" : "text-white/20"}>|</span>
                        <Link 
                            href="/blog" 
                            className={cn(
                                "flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold transition-colors",
                                pathname.startsWith("/blog")
                                    ? isLightMode
                                        ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                                        : "bg-primary/20 text-primary border border-primary/40 font-bold"
                                    : isLightMode
                                        ? "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                                        : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                            )}
                        >
                            <BookOpen className="w-3 h-3" />
                            Blog
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        <Link
                            href="/"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary relative py-1 px-1",
                                pathname === "/" ? "text-primary font-semibold" : isLightMode ? "text-slate-600" : "text-[#dbdee1]"
                            )}
                        >
                            Home
                        </Link>

                        {/* Services Mega Dropdown Trigger */}
                        <div 
                            className="relative py-2"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className={cn(
                                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary py-1 px-1 outline-none",
                                    pathname.startsWith("/services") || isSpecialLanding ? "text-primary font-semibold" : isLightMode ? "text-slate-600" : "text-[#dbdee1]"
                                )}
                                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                                aria-expanded={isServicesDropdownOpen}
                            >
                                <span>Services</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-200",
                                    isServicesDropdownOpen ? "rotate-180 text-primary" : isLightMode ? "text-slate-400" : "text-muted-foreground"
                                )} />
                            </button>

                            {/* Dropdown Menu Wrapper with hover bridge */}
                            <AnimatePresence>
                                {isServicesDropdownOpen && (
                                    <div 
                                        style={{ width: "580px" }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 pointer-events-auto"
                                    >
                                        <m.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            style={isLightMode ? { backgroundColor: "#ffffff" } : { backgroundColor: "#0c1017" }}
                                            className={cn(
                                                "w-full rounded-2xl p-4 transition-colors",
                                                isLightMode
                                                    ? "border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                                                    : "border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-[11px] font-bold uppercase tracking-wider px-2 pt-1 pb-2 flex items-center justify-between border-b mb-3",
                                                isLightMode ? "text-slate-500 border-slate-100" : "text-muted-foreground border-white/10"
                                            )}>
                                                <span>Specialized Agency Services</span>
                                                <span className={cn("text-[10px] font-semibold", isLightMode ? "text-blue-600" : "text-primary")}>
                                                    Built for Scale
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                {servicesNavigationList.map((service, idx) => (
                                                    <Link
                                                        key={idx}
                                                        href={service.href}
                                                        className={cn(
                                                            "group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
                                                            isLightMode
                                                                ? "bg-slate-50/70 hover:bg-blue-50/60 border-slate-200/80 hover:border-blue-300"
                                                                : "bg-slate-900/50 hover:bg-slate-800/80 border-white/5 hover:border-primary/40"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "p-2 rounded-lg border group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5",
                                                            isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
                                                        )}>
                                                            {getServiceIcon(service.iconType)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                                <span className={cn(
                                                                    "text-sm font-semibold transition-colors",
                                                                    isLightMode ? "text-slate-900 group-hover:text-blue-600" : "text-white group-hover:text-primary"
                                                                )}>
                                                                    {service.title}
                                                                </span>
                                                                {service.badge && (
                                                                    <span className={cn(
                                                                        "text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider flex-shrink-0",
                                                                        isLightMode
                                                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                            : service.badgeColor
                                                                    )}>
                                                                        {service.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={cn(
                                                                "text-xs line-clamp-2 leading-relaxed",
                                                                isLightMode ? "text-slate-500" : "text-slate-400"
                                                            )}>
                                                                {service.description}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Bottom Footer Bar */}
                                            <div className={cn(
                                                "mt-3 pt-3 border-t flex items-center justify-between px-2 text-xs",
                                                isLightMode ? "border-slate-100" : "border-white/10"
                                            )}>
                                                <span className={isLightMode ? "text-slate-500" : "text-muted-foreground"}>Looking for custom architecture?</span>
                                                <Link 
                                                    href="/services" 
                                                    className={cn(
                                                        "font-semibold flex items-center gap-1 group",
                                                        isLightMode ? "text-blue-600 hover:text-blue-700" : "text-primary hover:text-primary/80"
                                                    )}
                                                >
                                                    <span>View all capabilities</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </div>
                                        </m.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Standard Links */}
                        <Link
                            href="/projects"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary py-1 px-1",
                                pathname === "/projects" ? "text-primary font-semibold" : isLightMode ? "text-slate-600" : "text-[#dbdee1]"
                            )}
                        >
                            Projects
                        </Link>
                        <Link
                            href="/about"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary py-1 px-1",
                                pathname === "/about" ? "text-primary font-semibold" : isLightMode ? "text-slate-600" : "text-[#dbdee1]"
                            )}
                        >
                            About
                        </Link>
                        <Link
                            href="/blog"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary py-1 px-1",
                                pathname.startsWith("/blog") ? "text-primary font-semibold" : isLightMode ? "text-slate-600" : "text-[#dbdee1]"
                            )}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/#contact"
                            className={cn("text-sm font-medium transition-colors hover:text-primary py-1 px-1", isLightMode ? "text-slate-600" : "text-[#dbdee1]")}
                        >
                            Contact
                        </Link>

                        {/* Action CTA */}
                        {isDiscordLanding ? (
                            <Button 
                                onClick={() => {
                                    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="hover:opacity-90 text-white font-semibold text-xs px-5 h-9 rounded-xl shadow-sm transition-opacity"
                            >
                                Free Consultation
                            </Button>
                        ) : isAiChatbotLanding ? (
                            <Button 
                                onClick={() => {
                                    document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="hover:opacity-90 text-white font-semibold text-xs px-5 h-9 rounded-xl shadow-sm transition-opacity"
                            >
                                Book Discovery
                            </Button>
                        ) : isMobileLanding ? (
                            <Button 
                                onClick={() => {
                                    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="hover:opacity-90 text-white font-semibold text-xs px-5 h-9 rounded-xl shadow-sm transition-opacity"
                            >
                                Estimate Project
                            </Button>
                        ) : (
                            <HireMeModal>
                                <Button 
                                    variant="default" 
                                    style={isLightMode ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={cn(
                                        "text-xs px-5 h-9 font-semibold transition-all",
                                        isLightMode ? "hover:opacity-90 text-white rounded-xl shadow-sm" : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    )}
                                >
                                    Get a Quote
                                </Button>
                            </HireMeModal>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={cn("md:hidden p-2 transition-colors", isLightMode ? "text-slate-700 hover:text-slate-950" : "text-[#dbdee1] hover:text-white")}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </m.nav>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "fixed inset-0 z-40 pt-24 pb-8 px-6 md:hidden backdrop-blur-2xl overflow-y-auto transition-colors",
                            isLightMode ? "bg-white/98 text-slate-900" : "bg-[#0a0d14]/98 text-white"
                        )}
                    >
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold transition-colors py-2 border-b",
                                    isLightMode ? "border-slate-200" : "border-white/5",
                                    pathname === "/" ? "text-primary" : isLightMode ? "text-slate-900" : "text-white"
                                )}
                            >
                                Home
                            </Link>

                            {/* Mobile Services Accordion */}
                            <div className={cn("py-2 border-b", isLightMode ? "border-slate-200" : "border-white/5")}>
                                <button
                                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                                    className={cn(
                                        "flex items-center justify-between w-full text-lg font-bold py-1",
                                        isLightMode ? "text-slate-900" : "text-white"
                                    )}
                                >
                                    <span>Services</span>
                                    <ChevronDown className={cn(
                                        "w-5 h-5 transition-transform text-muted-foreground",
                                        isMobileServicesOpen && "rotate-180 text-primary"
                                    )} />
                                </button>

                                {isMobileServicesOpen && (
                                    <div className="mt-3 pl-2 flex flex-col space-y-2.5">
                                        {servicesNavigationList.map((service, index) => (
                                            <Link
                                                key={index}
                                                href={service.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
                                                    isLightMode 
                                                        ? "bg-slate-50 border-slate-200 hover:border-primary/40 text-slate-900" 
                                                        : "bg-white/[0.03] border-white/5 hover:border-primary/30 text-white"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    isLightMode ? "bg-white border border-slate-200" : "bg-white/5"
                                                )}>
                                                    {getServiceIcon(service.iconType)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-sm font-bold truncate",
                                                            isLightMode ? "text-slate-900" : "text-white"
                                                        )}>
                                                            {service.title}
                                                        </span>
                                                        {service.badge && (
                                                            <span className={cn(
                                                                "text-[8px] font-bold px-1.5 py-0.2 rounded-full border",
                                                                service.badgeColor
                                                            )}>
                                                                {service.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                        {service.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/projects"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b",
                                    isLightMode ? "border-slate-200 text-slate-900" : "border-white/5 text-white"
                                )}
                            >
                                Projects
                            </Link>
                            <Link
                                href="/about"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b",
                                    isLightMode ? "border-slate-200" : "border-white/5",
                                    pathname === "/about" ? "text-primary" : isLightMode ? "text-slate-900" : "text-white"
                                )}
                            >
                                About
                            </Link>
                            <Link
                                href="/blog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b",
                                    isLightMode ? "border-slate-200" : "border-white/5",
                                    pathname.startsWith("/blog") ? "text-primary" : isLightMode ? "text-slate-900" : "text-white"
                                )}
                            >
                                Blog
                            </Link>
                            <Link
                                href="/#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b",
                                    isLightMode ? "border-slate-200 text-slate-900" : "border-white/5 text-white"
                                )}
                            >
                                Contact
                            </Link>

                            <div className="pt-4">
                                {isDiscordLanding ? (
                                    <Button 
                                        onClick={() => {
                                            document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                            setIsMobileMenuOpen(false);
                                        }}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 text-white font-bold py-6 text-base shadow-sm rounded-xl border-none"
                                    >
                                        Free Consultation
                                    </Button>
                                ) : isAiChatbotLanding ? (
                                    <Button 
                                        onClick={() => {
                                            document.getElementById("consultation-form")?.scrollIntoView({ behavior: "smooth" });
                                            setIsMobileMenuOpen(false);
                                        }}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 text-white font-bold py-6 text-base shadow-sm rounded-xl"
                                    >
                                        Book Discovery
                                    </Button>
                                ) : isMobileLanding ? (
                                    <Button 
                                        onClick={() => {
                                            document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                            setIsMobileMenuOpen(false);
                                        }}
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 text-white font-bold py-6 text-base shadow-sm rounded-xl"
                                    >
                                        Estimate Project
                                    </Button>
                                ) : (
                                    <HireMeModal>
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                            Get a Quote
                                        </Button>
                                    </HireMeModal>
                                )}
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </LazyMotion>
    );
};
