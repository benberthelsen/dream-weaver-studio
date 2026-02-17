import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    title: "Save Thousands",
    description: "DIY flat‑pack means you control installation costs and can reallocate budget to finishes.",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    title: "Quality Materials",
    description: "Trade‑quality components from premium Australian suppliers with instant cost estimates.",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=400&h=300&fit=crop",
    title: "Precision Made",
    description: "Designed online, manufactured to spec on state-of-the-art CNC machinery.",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
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
            <Card key={b.title} className="border-border bg-card hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="pt-5 pb-5 px-5 space-y-2">
                <h3 className="text-base font-bold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
