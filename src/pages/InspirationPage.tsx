import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const roomFilters = ["All", "Kitchen", "Laundry", "Bathroom", "Wardrobe"];

const groupedGallery: Record<string, { title: string; spec: string; image: string }[]> = {
  Kitchen: [
    { title: "Modern White Kitchen", spec: "White shaker + black handles + 20mm stone look top", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900" },
    { title: "L-Shape Kitchen", spec: "Two-tone: charcoal base + white overhead", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900" },
    { title: "Pantry Run", spec: "White HMR + pull-out wire baskets", image: "https://images.unsplash.com/photo-1600607687920-4e03cf20e5d1?w=900" },
    { title: "Timber Feature Kitchen", spec: "Warm woodgrain + matte white overheads", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900" },
    { title: "Family Kitchen Layout", spec: "Island bench with high storage wall", image: "https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=900" },
    { title: "Compact Apartment Kitchen", spec: "Small-space full-height storage", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900" },
  ],
  Laundry: [
    { title: "Coastal Laundry", spec: "Polytec Ravine Natural Oak + brushed nickel pulls", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900" },
    { title: "Compact Laundry", spec: "White HMR + overhead storage + broom cabinet", image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=900" },
    { title: "European Laundry", spec: "Sliding door cabinet enclosure", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=900" },
    { title: "Laundry + Linen", spec: "Tall cabinet storage and bench run", image: "https://images.unsplash.com/photo-1630702914979-58de8d6f5f6b?w=900" },
    { title: "Modern Laundry Nook", spec: "Slimline cabinetry around washer/dryer", image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=900" },
    { title: "Laundry Utility Wall", spec: "Open shelving + closed cabinet mix", image: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=900" },
  ],
  Bathroom: [
    { title: "Floating Bathroom Vanity", spec: "Laminex Driftwood + soft-close Blum hinges", image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=900" },
    { title: "Double Vanity", spec: "Polytec Natural Oak + twin basins", image: "https://images.unsplash.com/photo-1556909172-89cf0b30d9ac?w=900" },
    { title: "Wall-Hung Vanity", spec: "Handleless white front with shadow line", image: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=900" },
    { title: "Stone Vanity Top", spec: "Engineered stone with drawer storage", image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=900" },
    { title: "Narrow Bathroom Layout", spec: "Full-height mirror cabinet solution", image: "https://images.unsplash.com/photo-1564540574859-0dfb639859f0?w=900" },
    { title: "Natural Timber Vanity", spec: "Warm timber tones and matte black hardware", image: "https://images.unsplash.com/photo-1595514535415-dae4f6ee7f19?w=900" },
  ],
  Wardrobe: [
    { title: "Walk-in Wardrobe", spec: "Classic White + adjustable shelving", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900" },
    { title: "Reach-in Wardrobe", spec: "Sliding doors + internal drawers", image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=900" },
    { title: "Open Closet Layout", spec: "Display shelving + hanging rails", image: "https://images.unsplash.com/photo-1616594039964-3d0cc6f92f19?w=900" },
    { title: "Master Wardrobe Fitout", spec: "Island drawer unit + full-height cabinets", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=900" },
    { title: "Corner Wardrobe Plan", spec: "L-shape cabinetry with mirror doors", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=900" },
    { title: "Wardrobe + Study Nook", spec: "Hybrid storage and desk setup", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900" },
  ],
};

export default function InspirationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRoom = searchParams.get("room");
  const initialFilter = requestedRoom && roomFilters.includes(requestedRoom) ? requestedRoom : "All";
  const [filter, setFilter] = useState(initialFilter);

  const visibleRooms = useMemo(() => {
    if (filter === "All") return ["Kitchen", "Laundry", "Bathroom", "Wardrobe"];
    return [filter];
  }, [filter]);

  const handleFilter = (next: string) => {
    setFilter(next);
    if (next === "All") {
      searchParams.delete("room");
    } else {
      searchParams.set("room", next);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-foreground mb-6">Kitchen, Laundry, Bathroom & Wardrobe Inspiration</h1>
          <p className="text-lg text-muted-foreground">Open each room tab to view full image sets and layout ideas for that space.</p>
        </div>
      </section>

      <section className="py-6">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {roomFilters.map((r) => (
              <Button
                key={r}
                variant={filter === r ? "default" : "outline"}
                onClick={() => handleFilter(r)}
                className={filter === r ? "bg-primary text-primary-foreground hover:bg-primary/90" : "font-semibold text-xs border-border text-foreground hover:bg-secondary"}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Accordion type="multiple" className="space-y-4" defaultValue={visibleRooms}>
            {visibleRooms.map((room) => {
              const items = groupedGallery[room] || [];
              return (
                <AccordionItem key={room} value={room} className="border border-border rounded-xl bg-card px-5">
                  <AccordionTrigger className="text-xl font-bold text-primary hover:no-underline">{room} Inspiration</AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {items.map((item) => (
                        <div key={item.title} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                            <p className="text-xs text-white/80 mt-0.5">{item.spec}</p>
                            <Link to="/room-planner" className="inline-flex items-center gap-1 text-xs font-medium mt-2 text-accent">
                              Build this look <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl mb-4">Ready to Design Yours?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">Start with one cabinet or design the whole room.</p>
          <Link to="/room-planner">
            <Button size="lg" className="font-semibold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90">
              Start Designing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
