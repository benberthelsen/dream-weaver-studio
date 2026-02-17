import { Link } from "react-router-dom";

const suppliers = ["Laminex", "Polytec", "Hettich", "Blum", "Häfele", "Formica"];

export function SupplierLogos() {
  return (
    <section className="py-14 bg-card border-y border-border">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl text-foreground mb-8">Choose From 12+ Premium Suppliers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-6">
          {suppliers.map((name) => (
            <span
              key={name}
              className="px-4 py-3 rounded-md border border-border bg-background text-lg font-semibold text-primary shadow-sm tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
        <Link to="/collections" className="text-sm text-primary hover:text-accent transition-colors underline underline-offset-4">
          Browse Our Full Material Library →
        </Link>
      </div>
    </section>
  );
}
