import { Monitor, Factory, Package, Check } from "lucide-react";

const steps = [
  {
    icon: Monitor,
    title: "You Design",
    description: "Plan your space online in our 3D room planner.",
    points: ["Kitchen, laundry, bathroom, wardrobe", "Live quote as you build"],
  },
  {
    icon: Factory,
    title: "We Manufacture",
    description: "Every panel is CNC-cut and drilled to your specs.",
    points: ["Precision cut and labelled", "Premium board + hardware"],
  },
  {
    icon: Package,
    title: "You Assemble",
    description: "Flat-pack kits arrive ready to build with guides.",
    points: ["Simple step-by-step instructions", "Phone support when you need it"],
  },
];

export function ProcessSteps() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-10">3 Easy Steps to Your New Cabinets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="p-7 rounded-xl border border-border bg-card shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              <div className="space-y-2">
                {step.points.map((point) => (
                  <p key={point} className="text-sm text-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    {point}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
