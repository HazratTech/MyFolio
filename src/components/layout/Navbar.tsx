"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen } from "lucide-react";
import { navLinks } from "@/data/portfolio";
import { HireMeModal } from "@/components/modals/HireMeModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isDiscordBotPage = pathname === "/discord-bot";
    const links = isDiscordBotPage
        ? [
              { name: "Problems", href: "#problems" },
              { name: "Services", href: "#services" },
              { name: "Comparison", href: "#comparison" },
              { name: "Demo", href: "#demo" },
              { name: "Portfolio", href: "#portfolio" },
              { name: "Pricing", href: "#pricing" },
              { name: "FAQ", href: "#faq" },
          ]
        : navLinks;

    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (isDiscordBotPage && href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.replace("#", "");
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                setIsMobileMenuOpen(false);
            }
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
                        ? isDiscordBotPage
                            ? "bg-[#111214]/90 backdrop-blur-md border-b border-white/10 py-4"
                            : "bg-background/80 backdrop-blur-md border-b border-white/10 py-4"
                        : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className={cn(
                            "text-xl font-bold font-heading tracking-tighter hover:opacity-90 transition-opacity",
                            isDiscordBotPage ? "text-[#f2f3f5]" : "text-foreground"
                        )}>
                            Relay<span className="text-primary">Works</span>
                        </Link>
                        <span className={cn("text-foreground/20", isDiscordBotPage && "text-white/20")}>|</span>
                        <Link href="/blog" className={cn(
                            "flex items-center gap-1.5 text-sm border px-2.5 py-0.5 rounded-full font-medium",
                            isDiscordBotPage 
                                ? "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20" 
                                : "bg-primary/10 text-primary border-primary/20"
                        )}>
                            <BookOpen className="w-3.5 h-3.5" />
                            Blog
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                scroll={!isDiscordBotPage}
                                onClick={(e) => handleNavLinkClick(e, link.href)}
                                className={cn(
                                    "text-sm font-medium transition-colors relative group",
                                    (isDiscordBotPage ? false : pathname === link.href) 
                                        ? "text-primary" 
                                        : isDiscordBotPage
                                            ? "text-[#dbdee1] hover:text-[#5865F2]"
                                            : "text-muted-foreground hover:text-primary"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all group-hover:w-full",
                                    (isDiscordBotPage ? false : pathname === link.href) ? "w-full" : "w-0"
                                )} />
                            </Link>
                        ))}
                        <HireMeModal>
                            <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                Hire Me
                            </Button>
                        </HireMeModal>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={cn("md:hidden", isDiscordBotPage ? "text-[#dbdee1]" : "text-foreground")}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </m.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "fixed inset-0 z-40 pt-24 px-6 md:hidden",
                            isDiscordBotPage ? "bg-[#111214]/95" : "bg-background/95 backdrop-blur-xl"
                        )}
                    >
                        <div className="flex flex-col space-y-6">
                            {links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    scroll={!isDiscordBotPage}
                                    onClick={(e) => handleNavLinkClick(e, link.href)}
                                    className={cn(
                                        "text-2xl font-bold transition-colors",
                                        (isDiscordBotPage ? false : pathname === link.href) 
                                            ? "text-primary" 
                                            : isDiscordBotPage
                                                ? "text-[#dbdee1] hover:text-[#5865F2]"
                                                : "text-foreground hover:text-primary"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <HireMeModal>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    Hire Me
                                </Button>
                            </HireMeModal>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </LazyMotion>
    );
};
