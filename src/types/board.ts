export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  brand: string | null;
  color: string | null;
  material: string | null;
  price: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  category?: Category;
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
