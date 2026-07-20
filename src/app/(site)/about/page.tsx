import { About } from "@/components/sections/About";
import { TechDNA } from "@/components/sections/TechDNA";
import { SocialProofWall } from "@/components/sections/SocialProofWall";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Hazrat Ummar | RelayWorks",
    description: "Learn more about Hazrat Ummar Shaikh, the founder and lead developer at RelayWorks, specializing in custom Discord bots, APIs, and automation.",
    alternates: {
        canonical: '/about',
    }
};

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-0 pb-0 bg-[#090a0f]">
            <About />
            <TechDNA />
            <SocialProofWall />
        </div>
    );
}
