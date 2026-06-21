import React from "react";
import Script from "next/script";
import { BlogNavbar } from "@/components/layout/BlogNavbar";
import { BlogFooter } from "@/components/layout/BlogFooter";

export const dynamic = 'force-dynamic';

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="dark flex flex-col min-h-screen bg-background text-foreground">

            {/* Custom Blog Navigation Bar */}
            <BlogNavbar />
            
            {/* Blog Page Content */}
            <main className="flex-grow pt-28 pb-10">
                {children}
            </main>

            {/* Custom Blog Footer */}
            <BlogFooter />
        </div>
    );
}
