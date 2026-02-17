import { useState } from "react";
import { Link } from "react-router-dom";
import { useInspirationGallery } from "@/hooks/useInspiration";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Grid3X3 } from "lucide-react";

const styleFilters = [
  { value: "all", label: "All Styles" },
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "industrial", label: "Industrial" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "coastal", label: "Coastal" },
];

const colorFilters = [
  { value: "all", label: "All Colors" },
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm Tones" },
  { value: "cool", label: "Cool Tones" },
  { value: "bold", label: "Bold Colors" },
];

export default function FlatlaysPage() {
  const { data: items, isLoading } = useInspirationGallery();
  const [searchTerm, setSearchTerm] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");

  const filteredItems = items?.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = styleFilter === "all" || item.style_tags.includes(styleFilter);
    const matchesColor = colorFilter === "all" || item.color_palette.includes(colorFilter);
    return matchesSearch && matchesStyle && matchesColor;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/gallery" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-light">Flat-Lay Gallery</h1>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flat lays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styleFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={colorFilter} onValueChange={setColorFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                {colorFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="group relative aspect-square overflow-hidden bg-muted cursor-pointer rounded-lg"
              >
                <img 
                  src={item.image_url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-end">
                    <Button size="sm" variant="secondary">
                      Create Similar
                    </Button>
                  </div>
                  <div className="text-white">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm opacity-80 line-clamp-2">{item.description}</p>
                    )}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Grid3X3 className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-medium mb-3">No Flat Lays Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchTerm || styleFilter !== "all" || colorFilter !== "all"
                ? "Try adjusting your filters to find more results"
                : "Create your first flat lay to start building your gallery"}
            </p>
            <Link to="/board">
              <Button size="lg">Create Your First Flat Lay</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
