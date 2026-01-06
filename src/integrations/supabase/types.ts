export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      boards: {
        Row: {
          canvas_data: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          preview_image_url: string | null
          updated_at: string
        }
        Insert: {
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          preview_image_url?: string | null
          updated_at?: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          preview_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          brand: string | null
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          finish_type: string | null
          hex_color: string | null
          id: string
          image_url: string
          is_active: boolean
          last_synced_at: string | null
          material: string | null
          metadata: Json | null
          name: string
          price: number | null
          product_type: string | null
          range_id: string | null
          sku: string | null
          source_url: string | null
          supplier_id: string | null
          thickness: string | null
          thumbnail_url: string | null
          usage_types: string[] | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          finish_type?: string | null
          hex_color?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          last_synced_at?: string | null
          material?: string | null
          metadata?: Json | null
          name: string
          price?: number | null
          product_type?: string | null
          range_id?: string | null
          sku?: string | null
          source_url?: string | null
          supplier_id?: string | null
          thickness?: string | null
          thumbnail_url?: string | null
          usage_types?: string[] | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          finish_type?: string | null
          hex_color?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          last_synced_at?: string | null
          material?: string | null
          metadata?: Json | null
          name?: string
          price?: number | null
          product_type?: string | null
          range_id?: string | null
          sku?: string | null
          source_url?: string | null
          supplier_id?: string | null
          thickness?: string | null
          thumbnail_url?: string | null
          usage_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_range_id_fkey"
            columns: ["range_id"]
            isOneToOne: false
            referencedRelation: "product_ranges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      inspiration_gallery: {
        Row: {
          color_palette: string[] | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string
          style_tags: string[] | null
          title: string
        }
        Insert: {
          color_palette?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url: string
          style_tags?: string[] | null
          title: string
        }
        Update: {
          color_palette?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string
          style_tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      liked_items: {
        Row: {
          catalog_item_id: string
          created_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          catalog_item_id: string
          created_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          catalog_item_id?: string
          created_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ranges: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ranges_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_boards: {
        Row: {
          background: string | null
          canvas_data: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          preview_image_url: string | null
          style: string | null
          updated_at: string
        }
        Insert: {
          background?: string | null
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          preview_image_url?: string | null
          style?: string | null
          updated_at?: string
        }
        Update: {
          background?: string | null
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          preview_image_url?: string | null
          style?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          current_url: string | null
          error_message: string | null
          id: string
          pages_failed: number | null
          pages_scraped: number | null
          products_found: number | null
          products_inserted: number | null
          started_at: string | null
          status: string
          supplier_id: string | null
          urls_mapped: number | null
          urls_to_scrape: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_url?: string | null
          error_message?: string | null
          id?: string
          pages_failed?: number | null
          pages_scraped?: number | null
          products_found?: number | null
          products_inserted?: number | null
          started_at?: string | null
          status?: string
          supplier_id?: string | null
          urls_mapped?: number | null
          urls_to_scrape?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_url?: string | null
          error_message?: string | null
          id?: string
          pages_failed?: number | null
          pages_scraped?: number | null
          products_found?: number | null
          products_inserted?: number | null
          started_at?: string | null
          status?: string
          supplier_id?: string | null
          urls_mapped?: number | null
          urls_to_scrape?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          scrape_config: Json | null
          slug: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          scrape_config?: Json | null
          slug: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          scrape_config?: Json | null
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
