"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Target, FolderKanban, MessageSquare, LogOut, User, Menu, X, FileText, Command, Image as ImageIcon, Globe } from "lucide-react";
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
        { name: "Lead Radar", href: "/admin/leads", icon: Target },
        { name: "Projects", href: "/admin/projects", icon: FolderKanban },
        { name: "Blog Posts", href: "/admin/blog", icon: FileText },
        { name: "Categories", href: "/admin/categories", icon: Command },
        { name: "Media", href: "/admin/media", icon: ImageIcon },
        { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
        { name: "Socials", href: "/admin/socials", icon: User },
        { name: "View Live Site", href: "/", icon: Globe },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white text-slate-900">
            <div className="p-6 border-b border-slate-200">
                <Link href="/" className="text-2xl font-bold font-heading tracking-tighter text-slate-950">
                    Relay<span className="text-blue-600">Works</span>
                </Link>
                <p className="text-xs text-slate-500 mt-1 font-medium">Admin Panel</p>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            target={item.href === "/" ? "_blank" : undefined}
                            rel={item.href === "/" ? "noopener noreferrer" : undefined}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${isActive
                                ? "bg-slate-950 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 px-3.5 py-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">Admin</p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">{adminEmail}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 rounded-xl"
                    onClick={handleLogout}
                >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
            {/* Mobile Header & Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold font-heading tracking-tighter text-slate-950">
                    Relay<span className="text-blue-600">Works</span>
                </Link>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open sidebar menu">
                            <Menu className="w-5 h-5 text-slate-700" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 bg-white border-r border-slate-200">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 pt-20 md:pt-8 text-slate-900">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
