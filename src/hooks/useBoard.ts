import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BoardItem, CatalogItem } from "@/types/board";
import { toast } from "sonner";

const BOARD_STORAGE_KEY = "bower_board_builder_state";

interface StoredBoardState {
  items: BoardItem[];
  background: string;
  style: string;
}

export function useBoard() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [background, setBackground] = useState("clean white marble surface");
  const [style, setStyle] = useState("soft natural daylight with gentle shadows");

  const addItem = useCallback((catalogItem: CatalogItem) => {
    setItems((prev) => {
      const newItem: BoardItem = {
        id: `${catalogItem.id}-${Date.now()}`,
        catalogItem,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: 120,
        height: 120,
        rotation: 0,
        zIndex: prev.length + 1,
      };

      return [...prev, newItem];
    });

    toast.success(`Added ${catalogItem.name} to board`);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<BoardItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const clearBoard = useCallback(() => {
    setItems([]);
    setSelectedId(null);
    toast.message("Board cleared");
  }, []);

  const bringToFront = useCallback((id: string) => {
    setItems((prev) => {
      const maxZ = Math.max(0, ...prev.map((i) => i.zIndex));
      return prev.map((item) => (item.id === id ? { ...item, zIndex: maxZ + 1 } : item));
    });
  }, []);

  const saveBoard = useCallback(() => {
    const payload: StoredBoardState = { items, background, style };
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload));
    toast.success("Board saved to this browser");
  }, [items, background, style]);

  const loadBoard = useCallback(() => {
    const raw = localStorage.getItem(BOARD_STORAGE_KEY);
    if (!raw) {
      toast.error("No saved board found on this browser");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredBoardState;
      setItems(parsed.items || []);
      setBackground(parsed.background || "clean white marble surface");
      setStyle(parsed.style || "soft natural daylight with gentle shadows");
      setSelectedId(null);
      toast.success("Saved board loaded");
    } catch {
      toast.error("Saved board data is invalid");
    }
  }, []);

  const generateFlatlayMutation = useMutation({
    mutationFn: async () => {
      if (!items.length) {
        throw new Error("Add at least one item before generating a flat-lay");
      }

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
    onSuccess: () => {
      toast.success("Flat-lay generated successfully");
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
    saveBoard,
    loadBoard,
    generateFlatlay: generateFlatlayMutation.mutate,
    isGenerating: generateFlatlayMutation.isPending,
    generatedImage: generateFlatlayMutation.data?.image,
  };
}
