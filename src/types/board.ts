export type SupplierCategory = 'bench_tops' | 'doors_panels' | 'kick_finishes' | 'hardware';

export interface Supplier {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  scrape_config: Record<string, unknown>;
  is_active: boolean;
  category: SupplierCategory | null;
  created_at: string;
}

export interface ProductRange {
  id: string;
  supplier_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  supplier?: Supplier;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export type ProductType = 'board' | 'laminate' | 'compact_laminate' | 'solid_surface' | 'veneer' | 'hardware' | 'metallic';
export type UsageType = 'doors' | 'panels' | 'kicks' | 'bench_tops' | 'carcass' | 'splashbacks';

export interface CatalogItem {
  id: string;
  category_id: string | null;
  supplier_id: string | null;
  range_id: string | null;
  name: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  brand: string | null;
  color: string | null;
  material: string | null;
  price: number | null;
  sku: string | null;
  finish_type: string | null;
  dimensions: string | null;
  hex_color: string | null;
  source_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  product_type: ProductType | null;
  thickness: string | null;
  usage_types: UsageType[];
  category?: Category;
  supplier?: Supplier;
  range?: ProductRange;
}

export interface BoardItem {
  id: string;
  catalogItem: CatalogItem;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  canvas_data: BoardItem[];
  preview_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedBoard {
  id: string;
  name: string;
  description: string | null;
  canvas_data: BoardItem[];
  preview_image_url: string | null;
  background: string;
  style: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  featured: boolean;
  style_tags: string[];
  color_palette: string[];
  created_at: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string;
  preview: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  background: string;
  style: string;
}
