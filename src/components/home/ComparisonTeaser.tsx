import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const bowerPoints = ["Custom Fit", "Premium Quality", "Affordable Price"];
const bigBoxPoints = ["Standard Sizes", "Basic Melamine", "Higher Cost"];

export function ComparisonTeaser() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-10">
          Better Than Off‑the‑Shelf
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-sm">
          {/* Bower side */}
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              alt="Custom Bower kitchen"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/80" />
            <div className="relative p-8 text-primary-foreground min-h-[280px] flex flex-col justify-center">
              <h3 className="text-lg font-bold mb-6">Bower Cabinets</h3>
              <ul className="space-y-4">
                {bowerPoints.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Big box side */}
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop"
              alt="Standard big box kitchen"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-card/90" />
            <div className="relative p-8 text-foreground min-h-[280px] flex flex-col justify-center">
              <h3 className="text-lg font-bold mb-6 text-muted-foreground">Big Box Stores</h3>
              <ul className="space-y-4">
                {bigBoxPoints.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <X className="h-5 w-5 text-destructive/60 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/pricing">
            <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              Compare Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
