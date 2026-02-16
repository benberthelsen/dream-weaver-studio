import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
      
      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            You Design, We Create
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Custom Flat‑Pack Cabinets, Delivered to Your Door
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Design your dream kitchen, laundry or bathroom online. We cut, drill and edge every panel to your exact specs — you assemble and save thousands.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/room-planner">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8">
                Start Designing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8">
                See Example Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
