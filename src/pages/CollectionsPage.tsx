import { useState } from "react";
import { Link } from "react-router-dom";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useCatalogItems } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Plus, ExternalLink } from "lucide-react";
import type { Supplier, CatalogItem } from "@/types/board";

export default function CollectionsPage() {
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: items, isLoading: itemsLoading } = useCatalogItems({
    supplierId: selectedSupplier,
    search: searchTerm || undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/inspiration" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-light">Collections</h1>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {suppliersLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <Tabs value={selectedSupplier || "all"} onValueChange={(v) => setSelectedSupplier(v === "all" ? undefined : v)}>
            {/* Supplier Tabs */}
            <div className="mb-8 overflow-x-auto">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50">
                <TabsTrigger value="all" className="px-4 py-2">
                  All Suppliers
                </TabsTrigger>
                {suppliers?.map((supplier) => (
                  <TabsTrigger key={supplier.id} value={supplier.id} className="px-4 py-2">
                    {supplier.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Products Grid */}
            <TabsContent value={selectedSupplier || "all"} className="mt-0">
              {itemsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : items && items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/30 rounded-lg">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm
                        ? "Try a different search term"
                        : "Import products from supplier websites to get started"}
                    </p>
                    <Link to="/admin">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Import Products
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Supplier Cards (when "All" is selected) */}
        {!selectedSupplier && suppliers && suppliers.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-light mb-8">Browse by Supplier</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <SupplierCard 
                  key={supplier.id} 
                  supplier={supplier}
                  onClick={() => setSelectedSupplier(supplier.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item }: { item: CatalogItem }) {
  return (
    <div className="group relative">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={item.thumbnail_url || item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Board
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium truncate">{item.name}</p>
        {item.supplier && (
          <p className="text-xs text-muted-foreground">{item.supplier.name}</p>
        )}
        {item.hex_color && (
          <div 
            className="mt-1 h-3 w-8 rounded-sm border"
            style={{ backgroundColor: item.hex_color }}
          />
        )}
      </div>
    </div>
  );
}

function SupplierCard({ supplier, onClick }: { supplier: Supplier; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-6 border rounded-lg hover:border-primary transition-colors bg-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-medium">{supplier.name}</h3>
          {supplier.website_url && (
            <a 
              href={supplier.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {supplier.logo_url && (
          <img 
            src={supplier.logo_url}
            alt={supplier.name}
            className="h-10 w-auto object-contain"
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Browse {supplier.name} products →
      </p>
    </button>
  );
}
