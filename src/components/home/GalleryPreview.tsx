import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const galleryItems = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
    title: "Modern White Kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    title: "Timber-Look Laundry",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=600",
    title: "Coastal Bathroom Vanity",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    title: "Pantry Run",
  },
  {
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600",
    title: "U-Shape Kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1556909172-89cf0b30d9ac?w=600",
    title: "Walk-in Wardrobe",
  },
];

export function GalleryPreview() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-12">
          Get Inspired
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-semibold text-sm">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button variant="outline" className="font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All Inspiration <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
