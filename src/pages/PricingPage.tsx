import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const exampleCabinets = [
  { type: "Base cabinet (2 door)", dims: "900w × 720h × 560d", material: "White HMR", price: "$185" },
  { type: "Overhead cabinet", dims: "900w × 720h × 300d", material: "White HMR", price: "$135" },
  { type: "Pantry cabinet", dims: "600w × 2100h × 560d", material: "White HMR", price: "$310" },
  { type: "Drawer base (3 drawer)", dims: "600w × 720h × 560d", material: "White HMR", price: "$245" },
  { type: "Corner base", dims: "900w × 720h × 900d", material: "White HMR", price: "$265" },
];

const bunningsExamples = [
  { item: "Kaboodle 900mm White Base Cabinet", price: "$199.00" },
  { item: "Kaboodle 900mm Wall Cabinet", price: "$165.65" },
  { item: "Kaboodle 600mm Kitchen Pantry", price: "$349.42" },
  { item: "Kaboodle 900mm White Pantry Base Cabinet", price: "$514.76" },
  { item: "Kaboodle 900mm White Corner Base Cabinet", price: "$247.77" },
];

const comparisonRows = [
  { feature: "Ordering experience", bower: "Online program + portal hand‑off", box: "Modular range + planning tools" },
  { feature: "Size flexibility", bower: "Custom‑to‑spec workflow (as designed in portal)", box: "Modular by default; cut‑to‑measure on selected items" },
  { feature: "Quote visibility", bower: "Instant cost estimates as you design", box: "Itemised retail pricing per module" },
  { feature: "Materials / hardware", bower: "Trade‑quality components; range shown in portal", box: "Kaboodle range (doors/colours/parts per catalogue)" },
  { feature: "Support", bower: "We're here every step of the way", box: "DIY resources and assembly guidance" },
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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Example Cabinet Pricing</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See what custom flat‑pack cabinets can cost. For an exact quote, use the room planner and portal.
          </p>
        </div>
      </section>

      {/* Bower example pricing table */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Bower Building — Indicative Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Cabinet Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Example Dimensions</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Material</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">Price From</th>
                </tr>
              </thead>
              <tbody>
                {exampleCabinets.map((c) => (
                  <tr key={c.type} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">{c.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.dims}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.material}</td>
                    <td className="py-3 px-4 text-right font-bold text-primary">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Prices are indicative and vary based on material selection and hardware. For an exact quote, use the room planner and portal.
          </p>
        </div>
      </section>

      {/* Bunnings comparison */}
      <section className="py-16 bg-card border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Big‑Box Price Examples</h2>
          <p className="text-xs text-muted-foreground mb-6">Bunnings Kaboodle — public prices as at 17 Feb 2026. Excludes doors/handles/installation where applicable.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price (AUD)</th>
                </tr>
              </thead>
              <tbody>
                {bunningsExamples.map((b) => (
                  <tr key={b.item} className="border-b border-border/50">
                    <td className="py-3 px-4 text-foreground">{b.item}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{b.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">How We Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-left py-3 px-4 font-bold text-primary">Bower Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Big‑Box (Kaboodle)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-foreground flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {row.bower}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{row.box}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get Your Exact Price in Minutes</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Prices are indicative. Actual pricing depends on your chosen materials, sizes, and hardware. Delivery varies by location.
          </p>
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8">
              Design & Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PricingPage;
