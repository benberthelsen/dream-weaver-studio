import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, CatalogItem, Supplier, ProductRange } from "@/types/board";

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

export function useCatalogItems(options?: { 
  categoryId?: string; 
  supplierId?: string; 
  rangeId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["catalog-items", options],
    queryFn: async () => {
      let query = supabase
        .from("catalog_items")
        .select(`
          *,
          category:categories(*),
          supplier:suppliers(*),
          range:product_ranges(*)
        `)
        .eq("is_active", true)
        .order("name");
      
      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }
      
      if (options?.supplierId) {
        query = query.eq("supplier_id", options.supplierId);
      }
      
      if (options?.rangeId) {
        query = query.eq("range_id", options.rangeId);
      }
      
      if (options?.search) {
        query = query.ilike("name", `%${options.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as (CatalogItem & { 
        category: Category | null; 
        supplier: Supplier | null;
        range: ProductRange | null;
      })[];
    },
  });
}
