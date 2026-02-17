import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const microProofs = [
  "CNC cut + hinge drilled",
  "Premium boards (Laminex / Polytec)",
  "Instant quote from your design",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
      
      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Bower Cabinets — You Design, We Create
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Custom Flat‑Pack Cabinets, Cut&nbsp;to&nbsp;Size&nbsp;&&nbsp;Delivered
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Design your dream kitchen, laundry or bathroom online. We cut, drill and edge every panel to your exact specs — you assemble and save.
          </p>
          <ul className="flex flex-col gap-2 pt-1">
            {microProofs.map((proof) => (
              <li key={proof} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {proof}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/room-planner">
              <Button size="lg" className="font-semibold text-base px-8">
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
