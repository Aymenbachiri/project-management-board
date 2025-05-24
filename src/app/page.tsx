import type { JSX } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { CtaSection } from "@/components/home/cta-section";
import { Header } from "@/components/home/header";
import { FeaturesSection } from "@/components/home/features-section";
import { TaskManagementDemo } from "@/components/home/task-management-demo";
import { AnalyticsPreview } from "@/components/home/analytics-preview";
import { Footer } from "@/components/home/footer";

export default function Home(): JSX.Element {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TaskManagementDemo />
        <AnalyticsPreview />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
