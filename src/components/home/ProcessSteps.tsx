import { Monitor, Factory, Package } from "lucide-react";

const steps = [
  {
    icon: Monitor,
    number: "1",
    title: "You Design",
    description: "Plan your space using our free 3D Room Planner.",
    highlight: "3D Room Planner",
  },
  {
    icon: Factory,
    number: "2",
    title: "We Manufacture",
    description: "Precision cut and drilled to your specs.",
  },
  {
    icon: Package,
    number: "3",
    title: "You Assemble",
    description: "Flat-pack delivered with all hardware.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-12">
          3 Easy Steps to Your New Cabinets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.title}
              className="text-center space-y-4 p-8 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center relative">
                <step.icon className="h-9 w-9 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
