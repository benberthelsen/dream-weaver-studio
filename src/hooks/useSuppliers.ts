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

export function useSuppliersWithCounts() {
  return useQuery({
    queryKey: ["suppliers-with-counts"],
    queryFn: async () => {
      // Get suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      
      if (suppliersError) throw suppliersError;
      
      // Get product counts per supplier
      const { data: counts, error: countsError } = await supabase
        .from("catalog_items")
        .select("supplier_id");
      
      if (countsError) throw countsError;
      
      // Count products per supplier
      const countMap: Record<string, number> = {};
      counts?.forEach(item => {
        if (item.supplier_id) {
          countMap[item.supplier_id] = (countMap[item.supplier_id] || 0) + 1;
        }
      });
      
      return (suppliers as Supplier[]).map(s => ({
        ...s,
        productCount: countMap[s.id] || 0,
      }));
    },
  });
}

export function useAddSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, website_url }: { name: string; website_url?: string }) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name,
          slug,
          website_url,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-with-counts"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; website_url?: string; is_active?: boolean; logo_url?: string } }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-with-counts"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First delete all catalog items for this supplier
      await supabase
        .from("catalog_items")
        .delete()
        .eq("supplier_id", id);
      
      // Then delete the supplier
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
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
      options?: { search?: string; limit?: number; maxPages?: number } 
    }) => {
      const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
        body: { supplierId, url, options },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-with-counts"] });
    },
  });
}
