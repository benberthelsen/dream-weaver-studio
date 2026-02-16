import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const exampleKitchens = [
  {
    name: "Small Galley Kitchen",
    size: "~2.4m × 1.2m",
    cabinets: "6 cabinets",
    bowerPrice: "$3,200",
    bigBoxPrice: "$5,500",
    installerPrice: "$9,000+",
  },
  {
    name: "Standard L-Shape Kitchen",
    size: "~3.6m × 2.4m",
    cabinets: "12 cabinets",
    bowerPrice: "$6,800",
    bigBoxPrice: "$9,500",
    installerPrice: "$16,000+",
  },
  {
    name: "Large U-Shape Kitchen",
    size: "~4.8m × 3.0m",
    cabinets: "18 cabinets",
    bowerPrice: "$10,500",
    bigBoxPrice: "$14,000",
    installerPrice: "$24,000+",
  },
];

const whatsIncluded = [
  "Premium HMR board (moisture resistant)",
  "Blum or Hettich soft-close hinges",
  "ABS or matching 2mm edge banding",
  "CNC-drilled hinge & shelf holes",
  "Assembly hardware & cam locks",
  "Step-by-step assembly instructions",
];

const PricingPage = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Save Thousands on Custom Cabinetry
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our prices are transparent and itemised. Here are some example kitchen costs to give you a ballpark — your exact price depends on your design.
          </p>
        </div>
      </section>

      {/* Example pricing cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {exampleKitchens.map((k) => (
              <Card key={k.name} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{k.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{k.size} · {k.cabinets}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-primary">Bower Building</span>
                      <span className="text-2xl font-bold text-primary">{k.bowerPrice}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm text-muted-foreground">
                      <span>Big-box store</span>
                      <span className="line-through">{k.bigBoxPrice}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm text-muted-foreground">
                      <span>Local installer</span>
                      <span className="line-through">{k.installerPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 bg-card border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            What's Included in Every Order
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatsIncluded.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-sm text-muted-foreground mb-8">
            Prices are indicative and based on standard configurations with white melamine carcass and laminate doors. 
            Actual pricing depends on your chosen materials, sizes, and hardware. Delivery is additional and varies by location.
          </p>
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8">
              Design & Get Your Price <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PricingPage;
