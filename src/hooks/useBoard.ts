import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BoardItem, CatalogItem } from "@/types/board";
import { toast } from "sonner";

export function useBoard() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [background, setBackground] = useState("white marble surface");
  const [style, setStyle] = useState("soft natural lighting");

  const addItem = useCallback((catalogItem: CatalogItem) => {
    const newItem: BoardItem = {
      id: `${catalogItem.id}-${Date.now()}`,
      catalogItem,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 120,
      height: 120,
      rotation: 0,
      zIndex: items.length + 1,
    };
    setItems((prev) => [...prev, newItem]);
    toast.success(`Added ${catalogItem.name} to board`);
  }, [items.length]);

  const updateItem = useCallback((id: string, updates: Partial<BoardItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const clearBoard = useCallback(() => {
    setItems([]);
    setSelectedId(null);
  }, []);

  const bringToFront = useCallback((id: string) => {
    setItems((prev) => {
      const maxZ = Math.max(...prev.map((i) => i.zIndex));
      return prev.map((item) =>
        item.id === id ? { ...item, zIndex: maxZ + 1 } : item
      );
    });
  }, []);

  const generateFlatlayMutation = useMutation({
    mutationFn: async () => {
      const itemsData = items.map((item) => ({
        name: item.catalogItem.name,
        category: item.catalogItem.category?.name || "Product",
        color: item.catalogItem.color,
        material: item.catalogItem.material,
      }));

      const { data, error } = await supabase.functions.invoke("generate-flatlay", {
        body: { items: itemsData, background, style },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate flat-lay image");
    },
  });

  return {
    items,
    selectedId,
    setSelectedId,
    background,
    setBackground,
    style,
    setStyle,
    addItem,
    updateItem,
    removeItem,
    clearBoard,
    bringToFront,
    generateFlatlay: generateFlatlayMutation.mutate,
    isGenerating: generateFlatlayMutation.isPending,
    generatedImage: generateFlatlayMutation.data?.image,
  };
}
