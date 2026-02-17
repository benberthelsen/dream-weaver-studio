import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Info } from "lucide-react";

const exampleCabinets = [
  { type: "Base cabinet (2 door)", dims: "900w × 720h × 560d", material: "White HMR", price: "$185" },
  { type: "Overhead cabinet", dims: "900w × 720h × 300d", material: "White HMR", price: "$135" },
  { type: "Pantry cabinet", dims: "600w × 2100h × 560d", material: "White HMR", price: "$310" },
  { type: "Drawer base (3 drawer)", dims: "600w × 720h × 560d", material: "White HMR", price: "$245" },
  { type: "Corner base", dims: "900w × 720h × 900d", material: "White HMR", price: "$265" },
];

const examplePacks = [
  { title: "Small Laundry", description: "Base + overhead + tall broom cabinet.", from: "$950", items: "3 cabinets" },
  { title: "L-Shape Kitchen", description: "6 base units, 4 overheads, 1 pantry, 1 corner.", from: "$2,950", items: "12 cabinets" },
  { title: "Pantry Run", description: "3 full-height pantries with adjustable shelves.", from: "$930", items: "3 cabinets" },
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
  { feature: "Size flexibility", bower: "Custom‑to‑spec workflow", box: "Modular by default; cut‑to‑measure on selected items" },
  { feature: "Quote visibility", bower: "Instant cost estimates as you design", box: "Itemised retail pricing per module" },
  { feature: "Materials / hardware", bower: "Trade‑quality components", box: "Kaboodle range per catalogue" },
  { feature: "Support", bower: "Phone support during planning + build", box: "DIY resources and assembly guidance" },
];

const whatsIncluded = [
  "Premium HMR board (moisture resistant)",
  "Blum or Hettich soft-close hinges",
  "ABS or matching 2mm edge banding",
  "CNC-drilled hinge & shelf holes",
  "Assembly hardware & cam locks",
  "Step-by-step assembly instructions",
];

const priceDrivers = [
  { label: "Board colour / brand", effect: "Standard white is lowest; woodgrain or solid colours add $10–$40 per cabinet" },
  { label: "Hardware (hinges + runners)", effect: "Soft-close Blum upgrades vs standard fittings" },
  { label: "Drawers vs doors", effect: "Drawer bases cost more due to runner hardware" },
  { label: "Cabinet size", effect: "Larger panels = more material cost" },
];

const PricingPage = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-foreground mb-6">Example Cabinet Pricing</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See what custom flat‑pack cabinets can cost. For an exact quote, design in the room planner.
          </p>
        </div>
      </section>

      {/* Example packs */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl text-foreground mb-8">Real Example Packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {examplePacks.map((pack) => (
              <Card key={pack.title} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pack.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                  <p className="text-xs text-muted-foreground">{pack.items}</p>
                  <p className="text-2xl font-bold text-accent">From {pack.from}</p>
                  <Link to="/room-planner">
                    <Button size="sm" className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                      Design & Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Price drivers */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-accent shrink-0" />
              <h3 className="font-bold text-foreground">What changes the price?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {priceDrivers.map((d) => (
                <div key={d.label}>
                  <p className="text-sm font-semibold text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.effect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Individual cabinet table */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl text-foreground mb-6">Individual Cabinet Pricing</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Cabinet Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Example Dimensions</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Material</th>
                  <th className="text-right py-3 px-4 font-bold text-accent">Price From</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {exampleCabinets.map((c) => (
                  <tr key={c.type} className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">{c.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.dims}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.material}</td>
                    <td className="py-3 px-4 text-right font-bold text-accent">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Prices are indicative and vary based on material selection and hardware.</p>
        </div>
      </section>

      {/* Bunnings comparison */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl text-foreground mb-2">Big‑Box Price Examples</h2>
          <p className="text-xs text-muted-foreground mb-6">Bunnings Kaboodle — public prices as at 17 Feb 2026.</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price (AUD)</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {bunningsExamples.map((b) => (
                  <tr key={b.item} className="border-t border-border">
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
          <h2 className="text-2xl text-foreground mb-6">How We Compare</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-left py-3 px-4 font-bold text-primary">Bower Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Big‑Box (Kaboodle)</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-foreground">
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent shrink-0" /> {row.bower}
                      </span>
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
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">What's Included in Every Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {whatsIncluded.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl mb-4">Get Your Exact Price in Minutes</h2>
          <p className="text-sm text-primary-foreground/70 mb-8">Actual pricing depends on your chosen materials, sizes, and hardware.</p>
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90">
              Design & Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PricingPage;
