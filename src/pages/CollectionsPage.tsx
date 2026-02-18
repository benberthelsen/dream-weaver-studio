import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, X, Sparkles, Wand2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSuppliersWithCounts } from "@/hooks/useSuppliers";
import { useCatalogItems, useBrandsForSupplier } from "@/hooks/useCatalog";
import { CategoryTabs, SupplierCategory } from "@/components/collections/CategoryTabs";
import { LikedPalette } from "@/components/collections/LikedPalette";
import { ProductCard } from "@/components/collections/ProductCard";
import { SupplierCard } from "@/components/collections/SupplierCard";
import { useLikedItems } from "@/hooks/useLikedItems";
import type { CatalogItem, Supplier, UsageType } from "@/types/board";

const usageTypeMap: Record<Exclude<SupplierCategory, "all" | "hardware">, UsageType[]> = {
  bench_tops: ["bench_tops"],
  doors_panels: ["doors", "panels"],
  kick_finishes: ["kicks"],
};

export default function CollectionsPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory>("all");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliersWithCounts();
  const { data: likedItems = [] } = useLikedItems();

  const { data: brandsForSupplier = [] } = useBrandsForSupplier(selectedSupplier || undefined);

  const { data: items = [], isLoading: itemsLoading } = useCatalogItems({
    supplierId: selectedSupplier || undefined,
    brand: selectedBrand || undefined,
    search: searchTerm || undefined,
  });

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;

    if (selectedCategory === "hardware") {
      return items.filter((item) => item.supplier?.category === "hardware");
    }

    const usageTypes = usageTypeMap[selectedCategory] || [];
    return items.filter((item) => usageTypes.some((usage) => item.usage_types?.includes(usage)));
  }, [items, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: items.length,
      bench_tops: 0,
      doors_panels: 0,
      kick_finishes: 0,
      hardware: 0,
    };

    items.forEach((item) => {
      if (item.usage_types.includes("bench_tops")) counts.bench_tops++;
      if (item.usage_types.includes("doors") || item.usage_types.includes("panels")) counts.doors_panels++;
      if (item.usage_types.includes("kicks")) counts.kick_finishes++;
      if (item.supplier?.category === "hardware") counts.hardware++;
    });

    return counts;
  }, [items]);

  const filteredSuppliers = useMemo(() => {
    if (selectedCategory === "all") return suppliers;

    if (selectedCategory === "hardware") {
      return suppliers.filter((supplier) => supplier.category === "hardware");
    }

    const supplierIdsWithProducts = new Set(filteredItems.map((item) => item.supplier_id).filter(Boolean));
    return suppliers.filter((supplier) => supplierIdsWithProducts.has(supplier.id));
  }, [suppliers, selectedCategory, filteredItems]);

  const showroomStats = useMemo(() => {
    const uniqueBrands = new Set(items.map((item) => item.brand).filter(Boolean));
    return {
      suppliers: suppliers.length,
      products: items.length,
      brands: uniqueBrands.size,
    };
  }, [suppliers.length, items]);

  const handleSupplierClick = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setSelectedBrand(null);
    setTimeout(() => {
      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const clearFilters = () => {
    setSelectedSupplier(null);
    setSelectedBrand(null);
    setSearchTerm("");
  };

  const selectedSupplierData = suppliers.find((supplier) => supplier.id === selectedSupplier);

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case "bench_tops":
        return "Bench Tops";
      case "doors_panels":
        return "Doors & Panels";
      case "kick_finishes":
        return "Kick Finishes";
      case "hardware":
        return "Hardware";
      default:
        return "All Products";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Collections Showroom</h1>
                <p className="text-sm text-muted-foreground">Explore materials by purpose, save favorites, and send them to Flat-Lay Builder.</p>
              </div>
            </div>

            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products, materials, colors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-10" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" /> Virtual Showroom
              </div>
              <h2 className="text-3xl md:text-4xl text-primary">Build Your Favorites Board Across Collections + Flat-Lay</h2>
              <p className="text-muted-foreground max-w-2xl">
                Like finishes in Collections, then load your favorites directly into the Flat-Lay Generator. This keeps your inspiration consistent from browsing to mood-board output.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link to="/board?fromFavorites=1">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Wand2 className="h-4 w-4 mr-2" /> Open Favorites in Flat-Lay
                  </Button>
                </Link>
                <Badge variant="outline" className="h-10 px-4 text-sm">{likedItems.length} favorites saved</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">{showroomStats.suppliers}</p>
                <p className="text-xs text-muted-foreground">Suppliers</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">{showroomStats.products}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">{showroomStats.brands}</p>
                <p className="text-xs text-muted-foreground">Brands</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6">
          <CategoryTabs selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} counts={categoryCounts} />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Supplier Showroom</h2>
            {selectedSupplier && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear filter
              </Button>
            )}
          </div>

          {suppliersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier as Supplier & { productCount?: number }} isSelected={selectedSupplier === supplier.id} onClick={() => handleSupplierClick(supplier.id)} />
              ))}
            </div>
          )}
        </div>

        <div id="products-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">
                {selectedBrand ? selectedBrand : selectedSupplierData ? `${selectedSupplierData.name} Products` : getCategoryLabel()}
                {filteredItems.length > 0 && <span className="text-muted-foreground font-normal ml-2">({filteredItems.length})</span>}
              </h2>
              {selectedBrand && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedBrand(null)} className="h-6 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear brand
                </Button>
              )}
            </div>
            <Link to="/board?fromFavorites=1">
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4 mr-2" /> Use Favorites in Generator
              </Button>
            </Link>
          </div>

          {selectedSupplier && brandsForSupplier.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={selectedBrand === null ? "default" : "outline"} className="cursor-pointer hover:bg-primary/80 transition-colors" onClick={() => setSelectedBrand(null)}>
                All Brands
              </Badge>
              {brandsForSupplier.map((brand) => (
                <Badge key={brand} variant={selectedBrand === brand ? "default" : "outline"} className="cursor-pointer hover:bg-primary/80 transition-colors" onClick={() => setSelectedBrand(brand)}>
                  {brand}
                </Badge>
              ))}
            </div>
          )}

          {itemsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              {(searchTerm || selectedSupplier) && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item: CatalogItem) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <LikedPalette />
    </div>
  );
}
