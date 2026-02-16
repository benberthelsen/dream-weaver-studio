import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ComparisonTeaser() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Compare</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Better Than Off‑the‑Shelf</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Many big‑box systems are modular by default. Some ranges offer cut‑to‑measure on selected items, but you can still run into compromises on layout, finish options, and workflow. We focus on a custom‑to‑spec online process from the start.
          </p>
          <Link to="/pricing">
            <Button className="font-semibold mt-4">
              Compare Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
