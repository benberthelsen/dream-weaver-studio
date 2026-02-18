import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { TrustStrip } from "@/components/home/TrustStrip";
import { BenefitsGrid } from "@/components/home/BenefitsGrid";
import { ComparisonTeaser } from "@/components/home/ComparisonTeaser";
import { SupplierLogos } from "@/components/home/SupplierLogos";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { TestimonialCards } from "@/components/home/TestimonialCards";
import { CTABanner } from "@/components/home/CTABanner";

const HomePage = () => {
  return (
    <SiteLayout>
      <HeroSection />
      <ProcessSteps />
      <TrustStrip />
      <BenefitsGrid />
      <ComparisonTeaser />
      <SupplierLogos />
      <GalleryPreview />
      <TestimonialCards />
      <CTABanner />
    </SiteLayout>
  );
};

export default HomePage;
