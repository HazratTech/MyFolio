import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  }
};

export default function Home() {
  return <LandingPage />;
}
