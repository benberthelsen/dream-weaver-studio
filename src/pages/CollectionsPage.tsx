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

export default function CollectionsPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliersWithCounts();
  
  const { data: items = [], isLoading: itemsLoading } = useCatalogItems({
    supplierId: selectedSupplier || undefined,
    search: searchTerm || undefined,
  });

  // Map category tabs to usage_types
  const usageTypeMap: Record<string, string[]> = {
    bench_tops: ['bench_tops'],
    doors_panels: ['doors', 'panels'],
    kick_finishes: ['kicks'],
    hardware: [],
  };

  // Filter items by usage_types based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    
    if (selectedCategory === "hardware") {
      // Hardware is still supplier-category based
      return items.filter(item => {
        const supplierCategory = suppliers.find(s => s.id === item.supplier_id)?.category;
        return supplierCategory === "hardware";
      });
    }
    
    // Filter by usage_types
    const usageTypes = usageTypeMap[selectedCategory] || [];
    return items.filter(item => {
      const itemUsages = (item as any).usage_types || [];
      return usageTypes.some(usage => itemUsages.includes(usage));
    });
  }, [items, selectedCategory, suppliers]);

  // Calculate category counts based on usage_types
  const categoryCounts = useMemo(() => {
    const counts = {
      all: items.length,
      bench_tops: 0,
      doors_panels: 0,
      kick_finishes: 0,
      hardware: 0,
    };
    
    items.forEach((item) => {
      const usages = (item as any).usage_types || [];
      const supplierCategory = suppliers.find(s => s.id === item.supplier_id)?.category;
      
      if (usages.includes('bench_tops')) counts.bench_tops++;
      if (usages.includes('doors') || usages.includes('panels')) counts.doors_panels++;
      if (usages.includes('kicks')) counts.kick_finishes++;
      if (supplierCategory === 'hardware') counts.hardware++;
    });
    
    return counts;
  }, [items, suppliers]);

  // Filter suppliers based on selected category (for display purposes)
  const filteredSuppliers = useMemo(() => {
    if (selectedCategory === "all") return suppliers;
    if (selectedCategory === "hardware") {
      return suppliers.filter((s) => (s as any).category === "hardware");
    }
    // For other categories, show suppliers that have products with matching usage_types
    const usageTypes = usageTypeMap[selectedCategory] || [];
    const supplierIdsWithProducts = new Set(
      filteredItems.map(item => item.supplier_id).filter(Boolean)
    );
    return suppliers.filter(s => supplierIdsWithProducts.has(s.id) || !(s as any).category);
  }, [suppliers, selectedCategory, filteredItems]);

  const handleSupplierClick = (supplierId: string) => {
    setSelectedSupplier(selectedSupplier === supplierId ? null : supplierId);
  };

  const clearFilters = () => {
    setSelectedSupplier(null);
    setSearchTerm("");
  };

  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier);

  // Get category label for title
  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'bench_tops': return 'Bench Tops';
      case 'doors_panels': return 'Doors & Panels';
      case 'kick_finishes': return 'Kick Finishes';
      case 'hardware': return 'Hardware';
      default: return 'All Products';
    }
  };

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
            onCategoryChange={setSelectedCategory}
            counts={categoryCounts}
          />
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
              {selectedSupplierData
                ? `${selectedSupplierData.name} Products`
                : getCategoryLabel()}
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
