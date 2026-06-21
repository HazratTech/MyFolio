import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-0 pb-0">
      <Hero />
      <About />
      <Projects />
      <Services />
      <Testimonials />
      <Contact />
    </div>
  );
};
