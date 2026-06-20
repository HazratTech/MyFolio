"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowLeft, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const BlogNavbar = () => {
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

    const navLinks = [
        { name: "Blog Home", href: "/blog" },
        { name: "Portfolio", href: "/" },
        { name: "Contact Me", href: "/#contact" }
    ];

    return (
        <LazyMotion features={domAnimation}>
            <m.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-white/10 py-4"
                        : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-xl font-bold font-heading tracking-tighter hover:opacity-90 transition-opacity">
                            Hazrat<span className="text-primary">.dev</span>
                        </Link>
                        <span className="text-white/20">|</span>
                        <Link href="/blog" className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
                            <BookOpen className="w-3.5 h-3.5" />
                            Blog
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors relative group",
                                    pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all group-hover:w-full",
                                    pathname === link.href ? "w-full" : "w-0"
                                )} />
                            </Link>
                        ))}
                        
                        <Link href="/">
                            <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 gap-1.5">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Portfolio
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-foreground bg-white/5 border border-white/10 p-2 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col space-y-6">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-4" />
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                                    Visit Portfolio
                                </Button>
                            </Link>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </LazyMotion>
    );
};
