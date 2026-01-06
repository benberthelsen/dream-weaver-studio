import { useState, useEffect } from "react";
import { useSuppliers, useScrapeSupplierCatalog } from "@/hooks/useSuppliers";
import { useCatalogItems } from "@/hooks/useCatalog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Package,
  Building2,
  Globe,
  FileSearch,
  Database,
  X,
  CheckCircle2
} from "lucide-react";
import type { Supplier } from "@/types/board";

interface ScrapeJob {
  id: string;
  supplier_id: string;
  status: string;
  urls_mapped: number;
  urls_to_scrape: number;
  pages_scraped: number;
  pages_failed: number;
  products_found: number;
  products_inserted: number;
  current_url: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

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
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<ScrapeJob | null>(null);
  const { mutate: scrapeCatalog, isPending } = useScrapeSupplierCatalog();

  // Subscribe to realtime updates for the active job
  useEffect(() => {
    if (!activeJobId) return;

    const channel = supabase
      .channel(`scrape-job-${activeJobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrape_jobs',
          filter: `id=eq.${activeJobId}`,
        },
        (payload) => {
          console.log('Job update:', payload);
          if (payload.new) {
            setJobProgress(payload.new as ScrapeJob);
            
            // Close dialog when complete
            if ((payload.new as ScrapeJob).status === 'completed') {
              toast.success(`Import complete! Added ${(payload.new as ScrapeJob).products_inserted} products.`);
            } else if ((payload.new as ScrapeJob).status === 'failed') {
              toast.error(`Import failed: ${(payload.new as ScrapeJob).error_message}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  const handleScrape = () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    scrapeCatalog(
      { supplierId: supplier.id, url: scrapeUrl },
      {
        onSuccess: (data) => {
          if (data.jobId) {
            setActiveJobId(data.jobId);
            setJobProgress({
              id: data.jobId,
              supplier_id: supplier.id,
              status: 'starting',
              urls_mapped: 0,
              urls_to_scrape: 0,
              pages_scraped: 0,
              pages_failed: 0,
              products_found: 0,
              products_inserted: 0,
              current_url: null,
              error_message: null,
              started_at: new Date().toISOString(),
              completed_at: null,
            });
          }
        },
        onError: (error) => {
          toast.error(`Failed to start import: ${error.message}`);
        },
      }
    );
  };

  const closeProgressDialog = () => {
    setActiveJobId(null);
    setJobProgress(null);
  };

  return (
    <>
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
            disabled={isPending || !!activeJobId}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
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

      {/* Progress Dialog */}
      <Dialog open={!!activeJobId && !!jobProgress} onOpenChange={(open) => !open && closeProgressDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {jobProgress?.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : jobProgress?.status === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              Importing {supplier.name} Catalog
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={
                jobProgress?.status === 'completed' ? 'default' :
                jobProgress?.status === 'failed' ? 'destructive' : 'secondary'
              }>
                {jobProgress?.status === 'mapping' && 'Discovering pages...'}
                {jobProgress?.status === 'scraping' && 'Scraping products...'}
                {jobProgress?.status === 'inserting' && 'Saving products...'}
                {jobProgress?.status === 'completed' && 'Complete'}
                {jobProgress?.status === 'failed' && 'Failed'}
                {!['mapping', 'scraping', 'inserting', 'completed', 'failed'].includes(jobProgress?.status || '') && 'Starting...'}
              </Badge>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {/* Step 1: Mapping */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Website Mapping</span>
                  <span className="ml-auto font-mono text-muted-foreground">
                    {jobProgress?.urls_mapped || 0} URLs found
                  </span>
                </div>
                {jobProgress?.status === 'mapping' && (
                  <Progress value={undefined} className="h-1" />
                )}
              </div>

              {/* Step 2: Scraping */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <span>Scraping Pages</span>
                  <span className="ml-auto font-mono text-muted-foreground">
                    {jobProgress?.pages_scraped || 0} / {jobProgress?.urls_to_scrape || 0}
                  </span>
                </div>
                {(jobProgress?.urls_to_scrape || 0) > 0 && (
                  <Progress 
                    value={((jobProgress?.pages_scraped || 0) / (jobProgress?.urls_to_scrape || 1)) * 100} 
                    className="h-1" 
                  />
                )}
                {jobProgress?.current_url && (
                  <p className="text-xs text-muted-foreground truncate">
                    {jobProgress.current_url}
                  </p>
                )}
              </div>

              {/* Step 3: Products */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Products Found</span>
                  <span className="ml-auto font-mono text-muted-foreground">
                    {jobProgress?.products_found || 0}
                  </span>
                </div>
              </div>

              {/* Step 4: Inserting */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Products Saved</span>
                  <span className="ml-auto font-mono text-muted-foreground">
                    {jobProgress?.products_inserted || 0}
                  </span>
                </div>
                {jobProgress?.status === 'inserting' && (
                  <Progress value={undefined} className="h-1" />
                )}
              </div>
            </div>

            {/* Errors */}
            {(jobProgress?.pages_failed || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>{jobProgress?.pages_failed} pages failed to scrape</span>
              </div>
            )}

            {jobProgress?.error_message && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {jobProgress.error_message}
              </div>
            )}

            {/* Close button when done */}
            {(jobProgress?.status === 'completed' || jobProgress?.status === 'failed') && (
              <Button onClick={closeProgressDialog} className="w-full">
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
