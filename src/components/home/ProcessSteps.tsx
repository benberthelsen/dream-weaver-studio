import { Monitor, Factory, Package } from "lucide-react";

const steps = [
  {
    icon: Monitor,
    title: "You Design",
    description: "Plan your space using our free 3D Room Planner.",
  },
  {
    icon: Factory,
    title: "We Manufacture",
    description: "Precision cut and drilled to your exact specs.",
  },
  {
    icon: Package,
    title: "You Assemble",
    description: "Flat-pack delivered with hardware and guides.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-14 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="rounded-xl border border-border bg-background p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl md:text-4xl text-center text-primary mb-8">3 Easy Steps to Your New Cabinets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
