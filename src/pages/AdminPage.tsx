import { useState } from "react";
import { useSuppliers, useScrapeSupplierCatalog } from "@/hooks/useSuppliers";
import { useCatalogItems } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Package,
  Building2
} from "lucide-react";
import type { Supplier } from "@/types/board";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-light">Catalog Administration</h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers and import product catalogs
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="suppliers">
          <TabsList>
            <TabsTrigger value="suppliers">
              <Building2 className="h-4 w-4 mr-2" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="mt-6">
            <SuppliersList />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SuppliersList() {
  const { data: suppliers, isLoading } = useSuppliers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers?.map((supplier) => (
        <SupplierCard key={supplier.id} supplier={supplier} />
      ))}
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const [scrapeUrl, setScrapeUrl] = useState(supplier.website_url || "");
  const { mutate: scrapeCatalog, isPending } = useScrapeSupplierCatalog();

  const handleScrape = () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    scrapeCatalog(
      { supplierId: supplier.id, url: scrapeUrl },
      {
        onSuccess: (data) => {
          toast.success(`Imported ${data.productsInserted} products from ${supplier.name}`);
        },
        onError: (error) => {
          toast.error(`Failed to scrape: ${error.message}`);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {supplier.name}
              {supplier.is_active ? (
                <Badge variant="default" className="text-xs">Active</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {supplier.website_url && (
                <a 
                  href={supplier.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  {new URL(supplier.website_url).hostname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Scrape URL</label>
          <Input
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://example.com/products"
          />
        </div>
        <Button 
          onClick={handleScrape}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Import Catalog
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductsList() {
  const { data: items, isLoading } = useCatalogItems({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="outline">{filteredItems?.length || 0} products</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium">Product</th>
              <th className="text-left p-3 text-sm font-medium">Supplier</th>
              <th className="text-left p-3 text-sm font-medium">Color</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems?.slice(0, 50).map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                      <img 
                        src={item.thumbnail_url || item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {item.supplier?.name || "-"}
                </td>
                <td className="p-3">
                  {item.hex_color ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 rounded border"
                        style={{ backgroundColor: item.hex_color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.hex_color}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3">
                  {item.is_active ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
