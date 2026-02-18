import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-14 bg-primary text-primary-foreground border-t border-primary/70">
      <div className="container mx-auto px-4 text-center space-y-5">
        <h2 className="text-3xl md:text-5xl">Ready to Start Your Project?</h2>
        <p className="text-primary-foreground/75 max-w-lg mx-auto">Design your cabinets online today. Get an instant quote. No obligation.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-1">
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90">
              Start Designing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="font-semibold text-base px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
