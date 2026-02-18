import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Assembly was straightforward and every panel lined up perfectly. It looked custom-built from day one.",
    name: "Sarah M.",
    project: "Kitchen Renovation",
  },
  {
    quote: "Great value compared with big-box options, and the quality felt much better across doors and hardware.",
    name: "James T.",
    project: "Laundry Remodel",
  },
  {
    quote: "The online planner and support team made the whole project easier than expected for a first DIY build.",
    name: "Emma L.",
    project: "Bathroom Upgrade",
  },
];

export function TestimonialCards() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#8a5a44] to-[#6f4737] text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl text-center mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-white/20 bg-white text-foreground">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">“{t.quote}”</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
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
