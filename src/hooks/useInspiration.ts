import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InspirationItem, SavedBoard, BoardItem } from "@/types/board";

export function useInspirationGallery(featured?: boolean) {
  return useQuery({
    queryKey: ["inspiration-gallery", featured],
    queryFn: async () => {
      let query = supabase
        .from("inspiration_gallery")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (featured !== undefined) {
        query = query.eq("featured", featured);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as InspirationItem[];
    },
  });
}

export function useSavedBoards() {
  return useQuery({
    queryKey: ["saved-boards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_boards")
        .select("*")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      
      // Parse canvas_data from JSON
      return data.map(board => ({
        ...board,
        canvas_data: board.canvas_data as unknown as BoardItem[],
      })) as SavedBoard[];
    },
  });
}

export function useSaveBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (board: Omit<SavedBoard, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("saved_boards")
        .insert([{
          name: board.name,
          description: board.description,
          canvas_data: JSON.parse(JSON.stringify(board.canvas_data)),
          preview_image_url: board.preview_image_url,
          background: board.background,
          style: board.style,
          is_public: board.is_public,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-boards"] });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedBoard> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.canvas_data) {
        updateData.canvas_data = JSON.parse(JSON.stringify(updates.canvas_data));
      }
      
      const { data, error } = await supabase
        .from("saved_boards")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-boards"] });
    },
  });
}
