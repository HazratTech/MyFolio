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
    const isSpecialLanding = isDiscordLanding || isAiChatbotLanding;

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
                return <Bot className="w-5 h-5 text-[#5865F2]" />;
            case "sparkles":
                return <Sparkles className="w-5 h-5 text-cyan-400" />;
            case "smartphone":
                return <Smartphone className="w-5 h-5 text-emerald-400" />;
            case "server":
                return <Server className="w-5 h-5 text-purple-400" />;
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
                    isScrolled
                        ? isSpecialLanding
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
                            <span className="text-xl font-bold font-heading tracking-tighter text-white">
                                Relay<span className="text-primary">Works</span>
                            </span>
                        </Link>
                        <span className="text-white/20">|</span>
                        <Link 
                            href="/blog" 
                            className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold hover:bg-primary/20 transition-colors"
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
                                pathname === "/" ? "text-primary font-semibold" : "text-[#dbdee1]"
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
                                    pathname.startsWith("/services") || isSpecialLanding ? "text-primary font-semibold" : "text-[#dbdee1]"
                                )}
                                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                                aria-expanded={isServicesDropdownOpen}
                            >
                                <span>Services</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-200 text-muted-foreground",
                                    isServicesDropdownOpen && "rotate-180 text-primary"
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
                                            style={{ backgroundColor: "#0c1017" }}
                                            className="w-full border border-slate-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-4"
                                        >
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-2 flex items-center justify-between border-b border-white/10 mb-3">
                                                <span>Specialized Agency Services</span>
                                                <span className="text-primary text-[10px] font-semibold">Built for Scale</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                {servicesNavigationList.map((service, idx) => (
                                                    <Link
                                                        key={idx}
                                                        href={service.href}
                                                        className="group flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-primary/40 transition-all duration-200"
                                                    >
                                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                                                            {getServiceIcon(service.iconType)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                                <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                                                    {service.title}
                                                                </span>
                                                                {service.badge && (
                                                                    <span className={cn(
                                                                        "text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider flex-shrink-0",
                                                                        service.badgeColor
                                                                    )}>
                                                                        {service.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                                {service.description}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Bottom Footer Bar */}
                                            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between px-2 text-xs">
                                                <span className="text-muted-foreground">Looking for custom architecture?</span>
                                                <Link 
                                                    href="/services" 
                                                    className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 group"
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
                            href="/#work"
                            className="text-sm font-medium text-[#dbdee1] transition-colors hover:text-primary py-1 px-1"
                        >
                            Projects
                        </Link>
                        <Link
                            href="/about"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary py-1 px-1",
                                pathname === "/about" ? "text-primary font-semibold" : "text-[#dbdee1]"
                            )}
                        >
                            About
                        </Link>
                        <Link
                            href="/#contact"
                            className="text-sm font-medium text-[#dbdee1] transition-colors hover:text-primary py-1 px-1"
                        >
                            Contact
                        </Link>

                        {/* Action CTA */}
                        {isSpecialLanding ? (
                            <Button 
                                onClick={() => {
                                    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                variant="default" 
                                className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] border-none text-xs px-5 h-9"
                            >
                                Free Consultation
                            </Button>
                        ) : (
                            <HireMeModal>
                                <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] text-xs px-5 h-9 font-semibold">
                                    Get a Quote
                                </Button>
                            </HireMeModal>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-[#dbdee1] p-2 hover:text-white"
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
                        className="fixed inset-0 z-40 pt-24 pb-8 px-6 md:hidden bg-[#0a0d14]/98 backdrop-blur-2xl overflow-y-auto"
                    >
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold transition-colors py-2 border-b border-white/5",
                                    pathname === "/" ? "text-primary" : "text-white"
                                )}
                            >
                                Home
                            </Link>

                            {/* Mobile Services Accordion */}
                            <div className="py-2 border-b border-white/5">
                                <button
                                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                                    className="flex items-center justify-between w-full text-lg font-bold text-white py-1"
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
                                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all"
                                            >
                                                <div className="p-2 rounded-lg bg-white/5">
                                                    {getServiceIcon(service.iconType)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white truncate">
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
                                href="/#work"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-bold text-white py-2 border-b border-white/5"
                            >
                                Projects
                            </Link>
                            <Link
                                href="/about"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b border-white/5",
                                    pathname === "/about" ? "text-primary" : "text-white"
                                )}
                            >
                                About
                            </Link>
                            <Link
                                href="/blog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-bold py-2 border-b border-white/5",
                                    pathname.startsWith("/blog") ? "text-primary" : "text-white"
                                )}
                            >
                                Blog
                            </Link>
                            <Link
                                href="/#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-bold text-white py-2 border-b border-white/5"
                            >
                                Contact
                            </Link>

                            <div className="pt-4">
                                {isSpecialLanding ? (
                                    <Button 
                                        onClick={() => {
                                            document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-6 text-base shadow-[0_0_15px_rgba(34,211,238,0.4)] border-none"
                                    >
                                        Free Consultation
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
