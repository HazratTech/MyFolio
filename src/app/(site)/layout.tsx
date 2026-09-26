import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollController } from "@/components/layout/ScrollController";
import { SiteThemeController } from "@/components/layout/SiteThemeController";

export const dynamic = 'force-dynamic';

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-600 selection:text-white relative">
            <SiteThemeController />
            <ScrollController />
            <Navbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
