import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "We saved over $8,000 compared to a local kitchen installer. The quality is fantastic and the assembly was straightforward.",
    name: "Sarah M.",
    project: "Kitchen Renovation",
    stars: 5,
    initials: "SM",
  },
  {
    quote: "The 3D planner made it so easy to visualise our laundry. Panels arrived perfectly cut and everything lined up first go.",
    name: "James T.",
    project: "Laundry Fit-Out",
    stars: 5,
    initials: "JT",
  },
  {
    quote: "As a DIYer, I was nervous about building my own cabinets. The instructions were clear and the Blum hardware is top-notch.",
    name: "Rebecca L.",
    project: "Bathroom Vanity",
    stars: 5,
    initials: "RL",
  },
];

export function TestimonialCards() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-14">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border bg-card">
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.project}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">"{t.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
