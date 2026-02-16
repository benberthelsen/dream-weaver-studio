import { DollarSign, Gem, Cpu, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: DollarSign,
    title: "Save Thousands",
    description: "Custom cabinetry at a fraction of the cost. No tradesperson markup, no compromise on quality.",
  },
  {
    icon: Gem,
    title: "Premium Materials",
    description: "Choose from Australia's top brands including Laminex, Polytec, and more — the same materials professionals use.",
  },
  {
    icon: Cpu,
    title: "Precision Manufacturing",
    description: "Every panel is cut on state-of-the-art CNC machinery for a perfect fit, every time.",
  },
  {
    icon: Truck,
    title: "Delivered to You",
    description: "Flat-pack or assembled. Delivered direct to your home anywhere in our service area.",
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Why Choose Us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Better Cabinets for Less</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border/60 bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
