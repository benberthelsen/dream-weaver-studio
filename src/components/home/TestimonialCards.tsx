import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "We saved over $8,000 compared to a local kitchen installer. The quality is fantastic and the assembly was straightforward.",
    name: "Sarah M.",
    project: "Kitchen Renovation",
    stars: 5,
  },
  {
    quote: "The 3D planner made it so easy to visualise our laundry. Panels arrived perfectly cut and everything lined up first go.",
    name: "James T.",
    project: "Laundry Fit-Out",
    stars: 5,
  },
  {
    quote: "As a DIYer, I was nervous about building my own cabinets. The instructions were clear and the Blum hardware is top-notch.",
    name: "Rebecca L.",
    project: "Bathroom Vanity",
    stars: 5,
  },
];

export function TestimonialCards() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border/60 bg-card">
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.project}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
