import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogItem } from "@/types/board";
import { useLikeItem, useUnlikeItem, useLikedItems } from "@/hooks/useLikedItems";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  item: CatalogItem;
  onAddToBoard?: (item: CatalogItem) => void;
}

export function ProductCard({ item, onAddToBoard }: ProductCardProps) {
  const { data: likedItems = [] } = useLikedItems();
  const likeItem = useLikeItem();
  const unlikeItem = useUnlikeItem();
  
  const isLiked = likedItems.some((liked) => liked.catalog_item_id === item.id);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      unlikeItem.mutate(item.id);
    } else {
      likeItem.mutate(item.id);
    }
  };

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-white">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full transition-all",
            isLiked
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
          )}
        >
          <Heart
            className={cn("h-4 w-4", isLiked && "fill-current")}
          />
        </button>

        {/* Color Swatch Overlay */}
        {item.hex_color && (
          <div
            className="absolute bottom-2 left-2 w-6 h-6 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: item.hex_color }}
          />
        )}

        {/* Add to Board Button */}
        {onAddToBoard && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToBoard(item);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add to Board
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {item.supplier?.name}
          </span>
          {item.color && (
            <span className="text-xs text-muted-foreground">
              {item.color}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
