import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Services: Custom Bots, APIs & DevOps | RelayWorks",
    description: "Explore our professional development services including bespoke Discord bots, backend APIs, workflow automations, and custom cloud integrations.",
    alternates: {
        canonical: '/services',
    }
};

export default function ServicesPage() {
    return <LandingPage />;
}
