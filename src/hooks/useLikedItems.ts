import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CatalogItem } from "@/types/board";
import { useEffect, useState } from "react";

// Generate or retrieve a persistent session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem('palette_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('palette_session_id', sessionId);
  }
  return sessionId;
}

export interface LikedItem {
  id: string;
  catalog_item_id: string;
  session_id: string;
  created_at: string;
  catalog_item?: CatalogItem;
}

export function useLikedItems() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  return useQuery({
    queryKey: ["liked-items", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from("liked_items")
        .select(`
          *,
          catalog_item:catalog_items(
            *,
            supplier:suppliers(*),
            category:categories(*)
          )
        `)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LikedItem[];
    },
    enabled: !!sessionId,
  });
}

export function useLikeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catalogItemId: string) => {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase
        .from("liked_items")
        .insert({
          catalog_item_id: catalogItemId,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-items"] });
    },
  });
}

export function useUnlikeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catalogItemId: string) => {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from("liked_items")
        .delete()
        .eq("catalog_item_id", catalogItemId)
        .eq("session_id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-items"] });
    },
  });
}

export function useClearLikedItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from("liked_items")
        .delete()
        .eq("session_id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-items"] });
    },
  });
}

export function useIsLiked(catalogItemId: string) {
  const { data: likedItems } = useLikedItems();
  return likedItems?.some(item => item.catalog_item_id === catalogItemId) ?? false;
}
