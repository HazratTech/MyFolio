import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Work & Projects | RelayWorks",
    description: "Browse our portfolio of custom software, automation tools, and advanced Discord bots developed by RelayWorks.",
    alternates: {
        canonical: '/projects',
    }
};

export default function ProjectsPage() {
    return <LandingPage />;
}
