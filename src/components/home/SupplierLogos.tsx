export function SupplierLogos() {
  const suppliers = [
    "Laminex", "Polytec", "Hettich", "Blum", "Formica", "Caesarstone",
  ];

  return (
    <section className="py-16 bg-secondary/20 border-y border-border/40">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Premium Suppliers We Work With
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
          {suppliers.map((name) => (
            <span
              key={name}
              className="text-lg md:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
