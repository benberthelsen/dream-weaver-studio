import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Heart } from "lucide-react";
import type { CatalogItem } from "@/types/board";

interface GalleryShowroomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
}

export function GalleryShowroom({ open, onOpenChange, items, onAddItem }: GalleryShowroomProps) {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Virtual Showroom</DialogTitle>
          <p className="text-muted-foreground">
            Browse our collection and add items to your mood board
          </p>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    {item.brand && (
                      <p className="text-white/70 text-xs">{item.brand}</p>
                    )}
                  </div>
                  <button
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem(item);
                    }}
                  >
                    <Heart className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedItem && (
            <div className="w-80 border-l p-6 flex flex-col bg-muted/30">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 flex-1">
                {selectedItem.brand && (
                  <div>
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="font-medium">{selectedItem.brand}</p>
                  </div>
                )}
                {selectedItem.material && (
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="font-medium">{selectedItem.material}</p>
                  </div>
                )}
                {selectedItem.color && (
                  <div>
                    <p className="text-xs text-muted-foreground">Color</p>
                    <Badge variant="secondary">{selectedItem.color}</Badge>
                  </div>
                )}
                {selectedItem.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => {
                  onAddItem(selectedItem);
                  setSelectedItem(null);
                }}
              >
                Add to Board
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
