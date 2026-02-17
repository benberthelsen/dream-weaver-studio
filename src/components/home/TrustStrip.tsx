import { Drill, BookOpen, Headphones, Truck } from "lucide-react";

const trustItems = [
  { icon: Drill, text: "Pre-Drilled & Labelled Parts" },
  { icon: BookOpen, text: "Full Assembly Guides" },
  { icon: Headphones, text: "Aussie Support Team" },
  { icon: Truck, text: "Fast Delivery, Carefully Packed" },
];

export function TrustStrip() {
  return (
    <section className="py-5 bg-secondary border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
