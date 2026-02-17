import { Monitor, Cpu, Wrench } from "lucide-react";

const steps = [
  {
    icon: Monitor,
    title: "You Design",
    description: "Plan your space using our free 3D Room Planner.",
  },
  {
    icon: Cpu,
    title: "We Manufacture",
    description: "Precision cut and drilled to your specs.",
  },
  {
    icon: Wrench,
    title: "You Assemble",
    description: "Flat-pack delivered with all hardware.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-12">
          3 Easy Steps to Your New Cabinets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
