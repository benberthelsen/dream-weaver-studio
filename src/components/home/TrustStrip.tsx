import { Drill, Phone, Clock, PackageCheck } from "lucide-react";

const trustItems = [
  {
    icon: Drill,
    text: "Pre-drilled. Labelled parts. Assembly guide included.",
  },
  {
    icon: Phone,
    text: "Phone support during planning + build.",
  },
  {
    icon: Clock,
    text: "Lead time: approx. 3 weeks (project dependent).",
  },
  {
    icon: PackageCheck,
    text: "Flat-packed & protected for safe delivery.",
  },
];

export function TrustStrip() {
  return (
    <section className="py-8 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
