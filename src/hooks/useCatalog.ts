import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, CatalogItem } from "@/types/board";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCatalogItems(categoryId?: string) {
  return useQuery({
    queryKey: ["catalog-items", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("catalog_items")
        .select(`
          *,
          category:categories(*)
        `)
        .order("name");
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as (CatalogItem & { category: Category })[];
    },
  });
}
