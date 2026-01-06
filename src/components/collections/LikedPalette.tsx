import { useState } from "react";
import { Heart, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLikedItems, useUnlikeItem, useClearLikedItems } from "@/hooks/useLikedItems";
import { cn } from "@/lib/utils";

export function LikedPalette() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: likedItems = [], isLoading } = useLikedItems();
  const unlikeItem = useUnlikeItem();
  const clearAll = useClearLikedItems();

  const handleUnlike = (catalogItemId: string) => {
    unlikeItem.mutate(catalogItemId);
  };

  const handleClearAll = () => {
    if (confirm("Remove all items from your palette?")) {
      clearAll.mutate();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded Panel */}
      <div
        className={cn(
          "bg-background border rounded-xl shadow-2xl transition-all duration-300 overflow-hidden",
          isExpanded ? "w-80 max-h-[70vh] mb-2" : "w-0 h-0 opacity-0"
        )}
      >
        {isExpanded && (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary fill-primary" />
                <h3 className="font-semibold">Liked Palette</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {likedItems.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {likedItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(70vh-80px)]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : likedItems.length === 0 ? (
                <div className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No colors saved yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Click the heart on any product to add it here
                  </p>
                </div>
              ) : (
                <div className="p-3 grid grid-cols-4 gap-2">
                  <TooltipProvider>
                    {likedItems.map((item) => {
                      const catalogItem = item.catalog_item;
                      const bgColor = catalogItem?.hex_color || "#e5e5e5";
                      
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <div className="relative group">
                              <div
                                className="aspect-square rounded-lg border-2 border-border cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                                style={{ backgroundColor: bgColor }}
                              />
                              <button
                                onClick={() => handleUnlike(item.catalog_item_id)}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <div className="text-sm">
                              <p className="font-medium">{catalogItem?.name}</p>
                              {catalogItem?.supplier && (
                                <p className="text-xs text-muted-foreground">
                                  {catalogItem.supplier.name}
                                </p>
                              )}
                              {catalogItem?.color && (
                                <p className="text-xs text-muted-foreground">
                                  {catalogItem.color}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>

      {/* Floating Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all",
          likedItems.length > 0 ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/90"
        )}
        variant="ghost"
      >
        <div className="relative">
          <Heart
            className={cn(
              "h-6 w-6",
              likedItems.length > 0 ? "fill-primary-foreground text-primary-foreground" : "text-muted-foreground"
            )}
          />
          {likedItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {likedItems.length > 99 ? "99+" : likedItems.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 absolute bottom-1 text-primary-foreground/50" />
        ) : (
          <ChevronUp className="h-4 w-4 absolute bottom-1 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  );
}
