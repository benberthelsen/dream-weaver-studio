import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const galleryItems = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop",
    title: "Modern White Kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=400&fit=crop",
    title: "Timber-Look Laundry",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753086-00f18f6b0049?w=500&h=400&fit=crop",
    title: "Coastal Bathroom Vanity",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=400&fit=crop",
    title: "Pantry Run",
  },
];

export function GalleryPreview() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-12">
          Get Inspired
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {galleryItems.map((item) => (
            <Link
              key={item.title}
              to="/gallery"
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
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
