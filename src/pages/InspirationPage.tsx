import { useState } from "react";
import { Link } from "react-router-dom";
import { useInspirationGallery } from "@/hooks/useInspiration";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Layers, Palette, Grid3X3, ArrowRight } from "lucide-react";

export default function InspirationPage() {
  const { data: featuredItems, isLoading } = useInspirationGallery(true);
  const { data: allItems } = useInspirationGallery();

  const categories = [
    {
      title: "Mood Boards",
      description: "Curated collections of complementary materials",
      icon: <Layers className="h-8 w-8" />,
      link: "/inspiration/mood-boards",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
    },
    {
      title: "Flat Lays",
      description: "Professional product photography layouts",
      icon: <Grid3X3 className="h-8 w-8" />,
      link: "/inspiration/flatlays",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    },
    {
      title: "Color Palettes",
      description: "Explore our curated color combinations",
      icon: <Palette className="h-8 w-8" />,
      link: "/collections",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            Get Inspired
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 mb-8">
            Explore stunning material combinations for your next project
          </p>
          <Link 
            to="/board"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-lg font-medium hover:bg-white/90 transition-colors"
          >
            Create Your Board
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-light text-center mb-12">Explore By Category</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.title}
              to={category.link}
              className="group relative aspect-[4/5] overflow-hidden bg-muted"
            >
              <img 
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-3 opacity-80">{category.icon}</div>
                <h3 className="text-2xl font-medium mb-2">{category.title}</h3>
                <p className="text-sm opacity-80">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Flat Lays Grid */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-light">Featured Flat Lays</h2>
            <Link 
              to="/inspiration/flatlays"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : allItems && allItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.slice(0, 6).map((item) => (
                <div 
                  key={item.id}
                  className="group relative aspect-square overflow-hidden bg-muted cursor-pointer"
                >
                  <img 
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    {item.style_tags.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {item.style_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/50 rounded-lg">
              <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Inspirations Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first flat lay to start building your inspiration gallery
              </p>
              <Link 
                to="/board"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Board
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-light mb-6">Ready to Create?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse products from 12+ suppliers and create stunning flat lay compositions
          </p>
          <Link 
            to="/board"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            Start Building
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
