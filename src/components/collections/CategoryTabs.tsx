import { cn } from "@/lib/utils";
import { Layers, Square, Footprints, GripVertical } from "lucide-react";

export type SupplierCategory = "all" | "bench_tops" | "doors_panels" | "kick_finishes" | "hardware";

interface CategoryTabsProps {
  selectedCategory: SupplierCategory;
  onCategoryChange: (category: SupplierCategory) => void;
  counts: {
    all: number;
    bench_tops: number;
    doors_panels: number;
    kick_finishes: number;
    hardware: number;
  };
}

const categories: { id: SupplierCategory; label: string; icon: typeof Layers }[] = [
  { id: "all", label: "All", icon: Layers },
  { id: "bench_tops", label: "Bench Tops", icon: Square },
  { id: "doors_panels", label: "Doors & Panels", icon: Layers },
  { id: "kick_finishes", label: "Kick Finishes", icon: Footprints },
  { id: "hardware", label: "Hardware", icon: GripVertical },
];

export function CategoryTabs({ selectedCategory, onCategoryChange, counts }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl">
      {categories.map((category) => {
        const Icon = category.icon;
        const count = counts[category.id];
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{category.label}</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
