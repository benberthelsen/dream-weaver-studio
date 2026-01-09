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
  brand?: string;
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
      
      if (options?.brand) {
        query = query.eq("brand", options.brand);
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

// Get unique brands for a supplier
export function useBrandsForSupplier(supplierId?: string) {
  return useQuery({
    queryKey: ["brands-for-supplier", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
        .from("catalog_items")
        .select("brand")
        .eq("supplier_id", supplierId)
        .eq("is_active", true)
        .not("brand", "is", null);
      
      if (error) throw error;
      
      // Get unique brands
      const uniqueBrands = [...new Set(data.map(item => item.brand))].filter(Boolean).sort();
      return uniqueBrands as string[];
    },
    enabled: !!supplierId,
  });
}
