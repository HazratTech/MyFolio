import React from "react";
import Script from "next/script";
import { BlogNavbar } from "@/components/layout/BlogNavbar";
import { BlogFooter } from "@/components/layout/BlogFooter";
import { AdBanner } from "@/components/blog/AdBanner";

export const dynamic = 'force-dynamic';

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="dark flex flex-col min-h-screen bg-background text-foreground">
            {/* Load Google AdSense Script ONLY for /blog and its sub-pages */}
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2489956198626091"
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />

            {/* Custom Blog Navigation Bar */}
            <BlogNavbar />
            
            {/* Top Responsive Ad Banner Slot (above content, below navbar) */}
            <div className="pt-28 container mx-auto px-6 max-w-7xl">
                <AdBanner slot="7839951602" format="horizontal" />
            </div>

            {/* Blog Page Content */}
            <main className="flex-grow">
                {children}
            </main>
            
            {/* Bottom Responsive Ad Banner Slot (above footer) */}
            <div className="container mx-auto px-6 max-w-7xl pb-10">
                <AdBanner slot="4928817304" format="horizontal" />
            </div>

            {/* Custom Blog Footer */}
            <BlogFooter />
        </div>
    );
}
