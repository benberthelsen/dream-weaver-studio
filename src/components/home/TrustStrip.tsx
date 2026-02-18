import { Drill, BookOpen, Headphones, Truck } from "lucide-react";

const trustItems = [
  { icon: Drill, text: "Pre-Drilled & Labelled Parts" },
  { icon: BookOpen, text: "Full Assembly Guides" },
  { icon: Headphones, text: "Aussie Support Team" },
  { icon: Truck, text: "Fast Delivery, Carefully Packed" },
];

export function TrustStrip() {
  return (
    <section className="py-6 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-5 md:gap-10">
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full border border-primary/25 bg-secondary flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </span>
              <span className="text-sm font-medium text-primary">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
