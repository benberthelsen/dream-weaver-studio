import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const galleryItems = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
    title: "Modern White Kitchen",
    spec: "White shaker + black handles + stone benchtop",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    title: "Timber-Look Laundry",
    spec: "Polytec Ravine + brushed nickel pulls",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=600",
    title: "Coastal Bathroom Vanity",
    spec: "Laminex Driftwood + soft-close Blum hinges",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    title: "Pantry Run",
    spec: "White HMR + pull-out wire baskets",
  },
  {
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600",
    title: "U-Shape Kitchen",
    spec: "Two-tone: charcoal base + white overhead",
  },
  {
    image: "https://images.unsplash.com/photo-1556909172-89cf0b30d9ac?w=600",
    title: "Walk-in Wardrobe",
    spec: "Polytec Classic White + adjustable shelving",
  },
];

export function GalleryPreview() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Gallery</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Get Inspired</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {galleryItems.map((item) => (
            <Link
              key={item.title}
              to="/room-planner"
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs opacity-80 mt-0.5">{item.spec}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  Build this look <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-semibold">
              View All Inspiration <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
