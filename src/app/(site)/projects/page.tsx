import { Projects } from "@/components/sections/Projects";
import { CaseStudyTicker } from "@/components/sections/CaseStudyTicker";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Work & Projects | RelayWorks",
    description: "Browse our portfolio of custom software, automation tools, and advanced Discord bots developed by RelayWorks.",
    alternates: {
        canonical: '/projects',
    }
};

export default function ProjectsPage() {
    return (
        <div className="flex flex-col gap-0 pb-0 bg-[#090a0f]">
            <header className="pt-28 pb-8 text-center px-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                    Production Portfolio
                </div>
                <h1 className="text-4xl sm:text-5xl font-black font-heading text-white tracking-tight mb-3">
                    Shipped Software & Engineering Systems
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                    Production native mobile applications, resilient backend microservices, and high-concurrency Discord platform automation.
                </p>
            </header>
            <Projects />
            <CaseStudyTicker />
        </div>
    );
}
