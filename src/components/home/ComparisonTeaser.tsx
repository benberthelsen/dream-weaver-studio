import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const bowerPoints = ["Custom Fit", "Premium Quality", "Affordable Price"];
const bigBoxPoints = ["Standard Sizes", "Basic Melamine", "Higher Cost"];

export function ComparisonTeaser() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-10">
          Better Than Off‑the‑Shelf
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border shadow-sm">
          {/* Bower side */}
          <div className="bg-primary p-8 text-primary-foreground">
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
          {/* Big box side */}
          <div className="bg-card p-8 text-foreground">
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
