import { useState } from "react";
import { Link } from "react-router-dom";
import { useInspirationGallery } from "@/hooks/useInspiration";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Grid3X3 } from "lucide-react";

const roomFilters = ["All", "Kitchen", "Laundry", "Bathroom", "Wardrobe"];

const staticGallery = [
  { title: "Modern White Kitchen", spec: "White shaker + black handles + 20mm stone look top", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", room: "Kitchen" },
  { title: "Coastal Laundry", spec: "Polytec Ravine Natural Oak + brushed nickel pulls", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600", room: "Laundry" },
  { title: "Floating Bathroom Vanity", spec: "Laminex Driftwood + soft-close Blum hinges + stone top", image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=600", room: "Bathroom" },
  { title: "Walk-in Wardrobe", spec: "Classic White + adjustable shelving + LED strip ready", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", room: "Wardrobe" },
  { title: "L-Shape Kitchen", spec: "Two-tone: charcoal base + white overhead cabinets", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600", room: "Kitchen" },
  { title: "Compact Laundry", spec: "White HMR + overhead storage + broom cabinet", image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600", room: "Laundry" },
  { title: "Double Vanity", spec: "Polytec Natural Oak + twin basins + mirror cabinet", image: "https://images.unsplash.com/photo-1556909172-89cf0b30d9ac?w=600", room: "Bathroom" },
  { title: "Pantry Run", spec: "White HMR + pull-out wire baskets + soft close", image: "https://images.unsplash.com/photo-1600607687920-4e03cf20e5d1?w=600", room: "Kitchen" },
];

export default function InspirationPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? staticGallery : staticGallery.filter((g) => g.room === filter);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Gallery</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Kitchen, Laundry & Bathroom Inspiration</h1>
          <p className="text-lg text-muted-foreground">Browse real project examples and start designing your own.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-6">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {roomFilters.map((r) => (
              <Button
                key={r}
                variant={filter === r ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(r)}
                className="font-semibold text-xs"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div key={item.title} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-white/80 mt-0.5">{item.spec}</p>
                  <Link to="/room-planner" className="inline-flex items-center gap-1 text-xs font-medium mt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Build this look <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Design Yours?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Start with one cabinet or design the whole room.
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
}
