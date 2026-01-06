import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier, ProductRange } from "@/types/board";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useProductRanges(supplierId?: string) {
  return useQuery({
    queryKey: ["product-ranges", supplierId],
    queryFn: async () => {
      let query = supabase
        .from("product_ranges")
        .select(`*, supplier:suppliers(*)`)
        .order("name");
      
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as (ProductRange & { supplier: Supplier })[];
    },
  });
}

export function useScrapeSupplierCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, url, options }: { 
      supplierId: string; 
      url: string; 
      options?: { search?: string; limit?: number } 
    }) => {
      const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
        body: { supplierId, url, options },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
    },
  });
}
