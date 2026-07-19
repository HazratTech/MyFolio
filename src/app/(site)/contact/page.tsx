import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Our Engineering Team | RelayWorks",
    description: "Get in touch with RelayWorks to discuss your next custom software, automation tool, or Discord bot project. Get a professional quote today.",
    alternates: {
        canonical: '/contact',
    }
};

export default function ContactPage() {
    return <LandingPage />;
}
