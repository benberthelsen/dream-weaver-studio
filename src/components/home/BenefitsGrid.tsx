import { Card, CardContent } from "@/components/ui/card";
import { BadgeDollarSign, Box, Cog, Truck } from "lucide-react";

const benefits = [
  {
    icon: BadgeDollarSign,
    title: "Save Thousands",
    bullets: ["DIY-ready flat-pack solution", "Competitive custom pricing"],
  },
  {
    icon: Box,
    title: "Quality Materials",
    bullets: ["Premium board suppliers", "Pro-grade hardware options"],
  },
  {
    icon: Cog,
    title: "Precision Made",
    bullets: ["CNC cut and drilled", "Labelled for faster assembly"],
  },
  {
    icon: Truck,
    title: "Delivered to You",
    bullets: ["Carefully packed orders", "Service-area delivery support"],
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl text-center text-foreground mb-10">Why Choose Bower Cabinets?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <b.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl text-primary mb-3">{b.title}</h3>
                <ul className="space-y-1.5 list-disc pl-4 text-sm text-muted-foreground">
                  {b.bullets.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
