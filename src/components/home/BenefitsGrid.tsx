import { DollarSign, Gem, Cpu, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: DollarSign,
    title: "Save Thousands",
    description: "DIY flat‑pack means you control installation costs and can reallocate budget to finishes.",
  },
  {
    icon: Gem,
    title: "Quality Materials",
    description: "Trade‑quality components from premium Australian suppliers with instant cost estimates.",
  },
  {
    icon: Cpu,
    title: "Precision Made",
    description: "Designed online, manufactured to spec on state-of-the-art CNC machinery.",
  },
  {
    icon: Truck,
    title: "Delivered to You",
    description: "Flat-packed, carefully protected, and delivered to your door within our service area.",
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-14">
          Why Choose Bower Cabinets?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <b.icon className="h-6 w-6 text-primary" />
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
