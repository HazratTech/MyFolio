import { Contact } from "@/components/sections/Contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Our Engineering Team | RelayWorks",
    description: "Get in touch with RelayWorks to discuss your next custom software, automation tool, or Discord bot project. Get a professional quote today.",
    alternates: {
        canonical: '/contact',
    }
};

export default function ContactPage() {
    return (
        <div className="flex flex-col gap-0 pb-0 bg-[#090a0f]">
            <Contact />
        </div>
    );
}
