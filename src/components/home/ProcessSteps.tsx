import { UserPlus, PencilRuler, Eye, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account to access our 3D room planner and start designing your space.",
  },
  {
    icon: PencilRuler,
    title: "Build Online",
    description: "Drag and drop cabinets, choose colours and materials, and see your design come to life in 3D.",
  },
  {
    icon: Eye,
    title: "See Live Pricing",
    description: "Get real-time pricing as you design. Every panel, hinge, and drawer runner is itemised — no surprises.",
  },
  {
    icon: ShoppingCart,
    title: "Place Your Order",
    description: "Submit your order and we'll manufacture every panel to spec. Delivered flat-packed to your door.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Four Simple Steps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Card key={step.title} className="relative border-border/60 bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-accent" />
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
