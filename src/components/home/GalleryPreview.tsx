import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const filters = ["All", "Kitchen", "Laundry", "Bathroom", "Wardrobe"];

const galleryItems = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=500&fit=crop",
    title: "Modern White Kitchen",
    room: "Kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&h=500&fit=crop",
    title: "Timber Feature Kitchen",
    room: "Kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=700&h=500&fit=crop",
    title: "Compact Laundry",
    room: "Laundry",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=700&h=500&fit=crop",
    title: "Floating Bathroom Vanity",
    room: "Bathroom",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&h=500&fit=crop",
    title: "Walk-In Wardrobe",
    room: "Wardrobe",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687920-4e03cf20e5d1?w=700&h=500&fit=crop",
    title: "Pantry & Storage Wall",
    room: "Kitchen",
  },
];

export function GalleryPreview() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredItems = useMemo(() => (activeFilter === "All" ? galleryItems : galleryItems.filter((item) => item.room === activeFilter)).slice(0, 6), [activeFilter]);

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-4">Get Inspired</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "bg-accent text-accent-foreground hover:bg-accent/90" : "border-primary/20 text-primary hover:bg-secondary"}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <Link key={item.title} to="/gallery" className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-sm text-white">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              View All Inspiration <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
