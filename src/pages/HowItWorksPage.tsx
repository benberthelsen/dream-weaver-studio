import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, PencilRuler, Eye, ShoppingCart, Truck, Wrench, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Sign Up & Start Planning",
    description:
      "Create your free account to access our 3D room planner. Enter your room dimensions, choose your layout style, and start placing cabinets in minutes.",
    details: [
      "Free account — no credit card required",
      "Enter room dimensions or upload a floor plan",
      "Choose from kitchen, laundry, bathroom or wardrobe templates",
    ],
  },
  {
    icon: PencilRuler,
    number: "02",
    title: "Design Your Cabinets Online",
    description:
      "Use our drag-and-drop 3D planner to customise every detail. Choose door styles, colours, handles and internal fittings from Australia's leading brands.",
    details: [
      "500+ colours & finishes from Laminex, Polytec & more",
      "Blum & Hettich soft-close hardware options",
      "Customise to the millimetre — no standard sizes",
    ],
  },
  {
    icon: Eye,
    number: "03",
    title: "See Live Pricing",
    description:
      "As you design, the price updates in real time. Every panel, hinge, drawer runner and edge finish is itemised so there are zero surprises at checkout.",
    details: [
      "Transparent, itemised pricing — no hidden costs",
      "Compare material options side by side",
      "Save multiple versions of your design",
    ],
  },
  {
    icon: ShoppingCart,
    number: "04",
    title: "Place Your Order",
    description:
      "Once you're happy with your design, submit your order. Our team reviews every job for accuracy before sending it to our CNC machines.",
    details: [
      "Quality check by our cabinetry team",
      "Secure online payment",
      "Order confirmation with manufacturing timeline",
    ],
  },
  {
    icon: Truck,
    number: "05",
    title: "Delivered to Your Door",
    description:
      "Every panel is precision-cut, edged and drilled, then carefully packed and delivered flat-pack to your home anywhere in our service area.",
    details: [
      "Precision CNC-cut panels — ready to assemble",
      "Flat-packed for easy handling",
      "Delivery throughout South East Queensland",
    ],
  },
  {
    icon: Wrench,
    number: "06",
    title: "Build & Enjoy",
    description:
      "Follow our clear assembly instructions to build your cabinets. No special tools required — just a drill, a level and a helping hand.",
    details: [
      "Step-by-step assembly guide included",
      "Video tutorials available",
      "Support from our team if you get stuck",
    ],
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
            From Design to Delivery in Six Simple Steps
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
                  <ul className="space-y-1.5">
                    {step.details.map((d) => (
                      <li key={d} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span> {d}
                      </li>
                    ))}
                  </ul>
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
            Create your free account and start designing your custom cabinets today.
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
