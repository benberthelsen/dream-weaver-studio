import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliersWithCounts } from "@/hooks/useSuppliers";
import { useCatalogItems } from "@/hooks/useCatalog";
import { CategoryTabs, SupplierCategory } from "@/components/collections/CategoryTabs";
import { LikedPalette } from "@/components/collections/LikedPalette";
import { ProductCard } from "@/components/collections/ProductCard";
import { SupplierCard } from "@/components/collections/SupplierCard";
import { cn } from "@/lib/utils";

export default function CollectionsPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [kickMode, setKickMode] = useState<"standard" | "match_door">("standard");

  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliersWithCounts();
  
  // For kick finishes "match to door" mode, fetch door panel products
  const effectiveSupplierCategory = selectedCategory === "kick_finishes" && kickMode === "match_door" 
    ? "doors_panels" 
    : undefined;
  
  const { data: items = [], isLoading: itemsLoading } = useCatalogItems({
    supplierId: selectedSupplier || undefined,
    search: searchTerm || undefined,
  });

  // Filter items by supplier category when in kick_finishes match mode
  const filteredItems = useMemo(() => {
    if (selectedCategory === "kick_finishes" && kickMode === "match_door") {
      // Show door panel products
      return items.filter(item => {
        const supplierCategory = suppliers.find(s => s.id === item.supplier_id)?.category;
        return supplierCategory === "doors_panels";
      });
    }
    if (selectedCategory === "kick_finishes" && kickMode === "standard") {
      // Show only kick finishes suppliers
      return items.filter(item => {
        const supplierCategory = suppliers.find(s => s.id === item.supplier_id)?.category;
        return supplierCategory === "kick_finishes";
      });
    }
    return items;
  }, [items, selectedCategory, kickMode, suppliers]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: suppliers.length,
      bench_tops: 0,
      doors_panels: 0,
      kick_finishes: 0,
      hardware: 0,
    };
    
    suppliers.forEach((s) => {
      const cat = (s as any).category || "doors_panels";
      if (cat === "bench_tops") counts.bench_tops++;
      else if (cat === "kick_finishes") counts.kick_finishes++;
      else if (cat === "hardware") counts.hardware++;
      else counts.doors_panels++;
    });
    
    return counts;
  }, [suppliers]);

  // Filter suppliers by category
  const filteredSuppliers = useMemo(() => {
    if (selectedCategory === "all") return suppliers;
    // In kick_finishes match_door mode, show door panel suppliers
    if (selectedCategory === "kick_finishes" && kickMode === "match_door") {
      return suppliers.filter((s) => (s as any).category === "doors_panels");
    }
    return suppliers.filter((s) => {
      const cat = (s as any).category || "doors_panels";
      return cat === selectedCategory;
    });
  }, [suppliers, selectedCategory, kickMode]);

  const handleSupplierClick = (supplierId: string) => {
    setSelectedSupplier(selectedSupplier === supplierId ? null : supplierId);
  };

  const clearFilters = () => {
    setSelectedSupplier(null);
    setSearchTerm("");
  };

  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <h1 className="text-xl font-bold">Collections</h1>
                <p className="text-sm text-muted-foreground">
                  Browse products from our suppliers
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="mb-6">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setKickMode("standard"); // Reset kick mode when changing categories
            }}
            counts={categoryCounts}
          />
          
          {/* Kick Finishes Mode Toggle */}
          {selectedCategory === "kick_finishes" && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setKickMode("standard")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  kickMode === "standard"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Standard Metallic
              </button>
              <button
                onClick={() => setKickMode("match_door")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  kickMode === "match_door"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Match to Door
              </button>
            </div>
          )}
        </div>

        {/* Suppliers Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Suppliers</h2>
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
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  isSelected={selectedSupplier === supplier.id}
                  onClick={() => handleSupplierClick(supplier.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedCategory === "kick_finishes" && kickMode === "match_door"
                ? "Door Panels (use as kick)"
                : selectedSupplierData
                ? `${selectedSupplierData.name} Products`
                : "All Products"}
              {filteredItems.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({filteredItems.length})
                </span>
              )}
            </h2>
          </div>

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
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Liked Palette Floating Panel */}
      <LikedPalette />
    </div>
  );
}
