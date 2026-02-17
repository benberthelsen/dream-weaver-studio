import { Link } from "react-router-dom";

const suppliers = ["Laminex", "Polytec", "Hettich", "Blum", "Häfele", "Formica"];

export function SupplierLogos() {
  return (
    <section className="py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl text-foreground mb-3">
          Choose From 12+ Premium Suppliers
        </h2>
        <p className="text-sm text-muted-foreground mb-10">
          <Link to="/collections" className="text-accent hover:underline font-medium">Browse Our Full Material Library →</Link>
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
          {suppliers.map((name) => (
            <span
              key={name}
              className="px-5 py-2.5 rounded-lg border border-border bg-card text-base md:text-lg font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
