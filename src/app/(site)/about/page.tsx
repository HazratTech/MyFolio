import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Hazrat Ummar | RelayWorks",
    description: "Learn more about Hazrat Ummar Shaikh, the founder and lead developer at RelayWorks, specializing in custom Discord bots, APIs, and automation.",
    alternates: {
        canonical: '/about',
    }
};

export default function AboutPage() {
    return <LandingPage />;
}
