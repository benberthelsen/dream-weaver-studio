import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { BenefitsGrid } from "@/components/home/BenefitsGrid";
import { ComparisonTeaser } from "@/components/home/ComparisonTeaser";
import { SupplierLogos } from "@/components/home/SupplierLogos";
import { TestimonialCards } from "@/components/home/TestimonialCards";
import { CTABanner } from "@/components/home/CTABanner";

const HomePage = () => {
  return (
    <SiteLayout>
      <HeroSection />
      <ProcessSteps />
      <BenefitsGrid />
      <ComparisonTeaser />
      <SupplierLogos />
      <TestimonialCards />
      <CTABanner />
    </SiteLayout>
  );
};

export default HomePage;
