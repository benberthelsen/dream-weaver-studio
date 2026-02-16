import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PencilRuler, Palette, Eye, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: PencilRuler,
    number: "01",
    title: "Plan & Design",
    description:
      "Design your kitchen, pantry, wardrobe, vanity, shelves, or custom cabinets using our online program.",
    cta: { label: "Launch Room Planner", to: "/room-planner" },
  },
  {
    icon: Palette,
    number: "02",
    title: "Choose Materials & Options",
    description:
      "Select board colours, edging, and hardware from the ranges available in our portal and tools.",
    cta: { label: "Browse Materials", to: "/collections" },
  },
  {
    icon: Eye,
    number: "03",
    title: "Get Your Quote",
    description:
      "See pricing as you build, print or save a quote, and review job details before submitting.",
    cta: null,
  },
  {
    icon: Truck,
    number: "04",
    title: "We Manufacture & Deliver",
    description:
      "After you submit, we review and process your job. Typical processing time is approximately 3 weeks (project dependent).",
    cta: null,
  },
];

const HowItWorksPage = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            How It Works
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Idea to Installed Cabinetry in Four Simple Steps
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No tradesperson needed. Design your custom cabinetry online, and we'll manufacture every panel to your exact specs — delivered flat-pack to your door.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-20">
        <div className="container mx-auto px-4 space-y-8 max-w-4xl">
          {steps.map((step) => (
            <Card key={step.number} className="border-border bg-card">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex items-start gap-4">
                  <span className="text-3xl font-bold text-primary/30 font-sans">{step.number}</span>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  {step.cta && (
                    <Link to={step.cta.to}>
                      <Button variant="outline" size="sm" className="mt-2 border-primary/50 text-primary hover:bg-primary/10">
                        {step.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Start with one cabinet or design the whole room.
          </p>
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8">
              Start Designing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default HowItWorksPage;
