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
            <Projects />
            <CaseStudyTicker />
        </div>
    );
}
