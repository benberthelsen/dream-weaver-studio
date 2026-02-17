import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
      <img
        src={heroImage}
        alt="Modern flat-pack kitchen with white cabinets and timber accents"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/20" />

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-xl space-y-6 text-primary-foreground">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] leading-tight">
            Custom Flat‑Pack Cabinets,<br />Cut&nbsp;to&nbsp;Size&nbsp;&&nbsp;Delivered
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            Design your dream kitchen, laundry or bathroom online.
            We cut, drill, and label every panel to your exact specs — you assemble and save.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/room-planner">
              <Button size="lg" className="font-semibold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90">
                Start Designing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="font-semibold text-base px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                See Example Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
