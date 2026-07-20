import { Services } from "@/components/sections/Services";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { IntegrationBlueprint } from "@/components/sections/IntegrationBlueprint";
import { QuoteWizard } from "@/components/sections/QuoteWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Services: Custom Bots, APIs & DevOps | RelayWorks",
    description: "Explore our professional development services including bespoke Discord bots, backend APIs, workflow automations, and custom cloud integrations.",
    alternates: {
        canonical: '/services',
    }
};

export default function ServicesPage() {
    return (
        <div className="flex flex-col gap-0 pb-0 bg-[#090a0f]">
            <Services />
            <ServiceShowcase />
            <IntegrationBlueprint />
            <QuoteWizard />
        </div>
    );
}
