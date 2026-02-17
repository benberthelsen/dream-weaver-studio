import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const pricingExamples = [
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=400&h=300&fit=crop",
    title: "Small Laundry",
    price: "From $950",
  },
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    title: "L-Shaped Kitchen",
    price: "From $2,950",
  },
];

const bowerAdvantages = ["Custom Sizes", "Premium Materials", "Pro-Grade Hardware"];

export function ComparisonTeaser() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Example Pricing - Left */}
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Example Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              {pricingExamples.map((ex) => (
                <div key={ex.title} className="space-y-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={ex.image}
                      alt={ex.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-foreground text-center">{ex.title}</h3>
                  <p className="text-accent font-bold text-center">{ex.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Better Than Big-Box - Right */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-6">Better Than Big-Box Stores</h2>
              <div className="rounded-lg bg-accent/10 p-5 space-y-3 mb-6">
                {bowerAdvantages.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/pricing">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Compare Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="h-40 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=300&fit=crop"
                alt="Premium kitchen"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
