import { SystemDashboardHero } from "@/components/sections/CommandLineHero";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { IntegrationBlueprint } from "@/components/sections/IntegrationBlueprint";
import { CaseStudyTicker } from "@/components/sections/CaseStudyTicker";
import { SocialProofWall } from "@/components/sections/SocialProofWall";
import { TechDNA } from "@/components/sections/TechDNA";
import { QuoteWizard } from "@/components/sections/QuoteWizard";

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-0 pb-0 bg-[#090a0f]">
      <SystemDashboardHero />
      <ServiceShowcase />
      <IntegrationBlueprint />
      <CaseStudyTicker />
      <SocialProofWall />
      <TechDNA />
      <QuoteWizard />
    </div>
  );
};
