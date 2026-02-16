import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-20 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Project?</h2>
        <p className="text-primary-foreground/70 max-w-md mx-auto">
          Design your cabinets online in minutes. Get an instant quote. No obligation.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/room-planner">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8">
              Start Designing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-white/10 font-semibold text-base px-8">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
