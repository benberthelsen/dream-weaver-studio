import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-20 bg-card border-t border-border">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to Start Your Project?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Design your cabinets online, get an instant quote, then choose delivery and next steps.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8">
              Start Designing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
