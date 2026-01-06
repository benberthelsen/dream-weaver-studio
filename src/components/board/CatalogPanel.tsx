import { useState } from "react";
import { useCategories, useCatalogItems } from "@/hooks/useCatalog";
import type { CatalogItem } from "@/types/board";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, GripVertical, Square, Ruler } from "lucide-react";

interface CatalogPanelProps {
  onAddItem: (item: CatalogItem) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  layers: <Layers className="h-4 w-4" />,
  "grip-vertical": <GripVertical className="h-4 w-4" />,
  square: <Square className="h-4 w-4" />,
  ruler: <Ruler className="h-4 w-4" />,
};

export function CatalogPanel({ onAddItem }: CatalogPanelProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: items, isLoading: itemsLoading } = useCatalogItems(selectedCategory);

  if (categoriesLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Catalog</h2>
        <p className="text-sm text-muted-foreground">Drag items to the board</p>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedCategory || "all"}
        onValueChange={(v) => setSelectedCategory(v === "all" ? undefined : v)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 mt-2 grid grid-cols-5">
          <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
          {categories?.slice(0, 4).map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2">
              {iconMap[cat.icon || ""] || <Layers className="h-4 w-4" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value={selectedCategory || "all"} className="mt-0">
            {itemsLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {items?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onAddItem(item)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all bg-muted"
                  >
                    <img
                      src={item.thumbnail_url || item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">
                        {item.name}
                      </p>
                      {item.brand && (
                        <p className="text-[10px] text-white/70">{item.brand}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
