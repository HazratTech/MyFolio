"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, MessageSquare, LogOut, User, Menu, X, FileText, Command, Image as ImageIcon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [adminEmail, setAdminEmail] = useState("hazratummar9@gmail.com");

    useEffect(() => {
        if (pathname !== "/admin/login") {
            fetch("/api/auth/me")
                .then(res => res.json())
                .then(data => {
                    if (data.email) {
                        setAdminEmail(data.email);
                    }
                })
                .catch(() => {});
        }
    }, [pathname]);

    // Don't show layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Projects", href: "/admin/projects", icon: FolderKanban },
        { name: "Blog Posts", href: "/admin/blog", icon: FileText },
        { name: "Categories", href: "/admin/categories", icon: Command },
        { name: "Media", href: "/admin/media", icon: ImageIcon },
        { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
        { name: "Socials", href: "/admin/socials", icon: User },
        { name: "View Live Site", href: "/", icon: Globe },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="text-2xl font-bold font-heading tracking-tighter">
                    Relay<span className="text-primary">Works</span>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            target={item.href === "/" ? "_blank" : undefined}
                            rel={item.href === "/" ? "noopener noreferrer" : undefined}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">Admin</p>
                        <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Mobile Header & Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold font-heading tracking-tighter">
                    Relay<span className="text-primary">Works</span>
                </Link>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open sidebar menu">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 bg-card border-r border-white/10">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-white/10 bg-card/30 backdrop-blur-md flex-col">
                <SidebarContent />
            </aside>


            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black/20 p-4 md:p-8 pt-20 md:pt-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
