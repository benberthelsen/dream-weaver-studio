import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "Custom sizes", bower: "To the millimetre", box: "Selected items only" },
  { feature: "Material choice", bower: "500+ colours & finishes", box: "Limited range" },
  { feature: "Board quality", bower: "Premium HMR, MR MDF", box: "Basic melamine" },
  { feature: "Hardware", bower: "Blum / Hettich soft-close", box: "Generic" },
  { feature: "Edge finishing", bower: "ABS or matching 2mm edging", box: "Paper or PVC" },
  { feature: "CNC machining", bower: "Precision drilled, hinge-ready", box: "Pre-drilled standard" },
];

export function ComparisonTeaser() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Compare</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Better Than Off‑the‑Shelf</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Big-box store cabinets come in standard sizes that rarely fit your space. Our custom flat-pack cabinets are made to your exact measurements with trade-grade materials.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-left py-3 px-4 font-bold text-accent">Bower Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Big‑Box Store</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-foreground flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent shrink-0" /> {row.bower}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{row.box}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <Link to="/pricing">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                Compare Full Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
