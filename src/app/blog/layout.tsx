import React from "react";
import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogThemeController } from "@/components/layout/BlogThemeController";

export const dynamic = 'force-dynamic';

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
            <BlogThemeController />
            {/* AdSense Script */}
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2489956198626091"
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />

            {/* Unified Navigation Bar */}
            <Navbar />
            
            {/* Blog Page Content */}
            <main className="flex-grow pt-24 pb-0">
                {children}
            </main>

            {/* Unified Studio Footer */}
            <Footer />
        </div>
    );
}
