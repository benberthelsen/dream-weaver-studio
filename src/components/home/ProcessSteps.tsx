import { PencilRuler, Cpu, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: PencilRuler,
    title: "You Design",
    description: "Use our free 3D room planner to lay out your space and choose your finishes.",
  },
  {
    icon: Cpu,
    title: "We Manufacture",
    description: "Panels are produced using computerised machinery and trade‑quality components for accurate fit and consistent quality.",
  },
  {
    icon: Wrench,
    title: "You Assemble",
    description: "Flat‑pack cabinets arrive ready to assemble with minimal tools. If you need help, we're here every step of the way.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Three Simple Steps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <Card key={step.title} className="relative border-border/60 bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="absolute top-4 left-4 text-xs font-bold text-muted-foreground/40">0{i + 1}</span>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
