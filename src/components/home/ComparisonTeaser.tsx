import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const pricingExamples = [
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=500&h=350&fit=crop",
    title: "Small Laundry",
    price: "From $950",
  },
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=350&fit=crop",
    title: "L-Shaped Kitchen",
    price: "From $2,950",
  },
];

const bowerAdvantages = ["Custom Sizes", "Premium Materials", "Pro-Grade Hardware"];

export function ComparisonTeaser() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl md:text-4xl text-primary mb-5">Example Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              {pricingExamples.map((ex) => (
                <div key={ex.title} className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={ex.image} alt={ex.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-primary">{ex.title}</h3>
                    <p className="text-accent font-bold text-xl">{ex.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl md:text-4xl text-primary mb-5">Better Than Big-Box Stores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary p-5 space-y-3 text-white">
                {bowerAdvantages.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="h-5 w-5 text-accent" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
                <Link to="/pricing" className="inline-block pt-2">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    Compare Pricing <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="rounded-lg overflow-hidden bg-muted min-h-[220px]">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=500&fit=crop"
                  alt="Premium kitchen"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
