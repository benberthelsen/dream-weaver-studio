import { useState, useEffect } from "react";
import { 
  useSuppliersWithCounts, 
  useScrapeSupplierCatalog,
  useAddSupplier,
  useDeleteSupplier,
  useUpdateSupplier
} from "@/hooks/useSuppliers";
import { useCatalogItems } from "@/hooks/useCatalog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle
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

interface SupplierWithCount extends Supplier {
  productCount: number;
}

export default function AdminPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);

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
          <div className="flex items-center justify-between mb-6">
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

            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          <TabsContent value="suppliers" className="mt-0">
            <SuppliersList />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductsList />
          </TabsContent>
        </Tabs>
      </main>

      <AddSupplierDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}

function AddSupplierDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const { mutate: addSupplier, isPending } = useAddSupplier();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }

    addSupplier(
      { name: name.trim(), website_url: websiteUrl.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Added ${name} to suppliers`);
          setName("");
          setWebsiteUrl("");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(`Failed to add supplier: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Add a new brand or supplier to import products from.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Polytec"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <Input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SuppliersList() {
  const { data: suppliers, isLoading } = useSuppliersWithCounts();

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

function SupplierCard({ supplier }: { supplier: SupplierWithCount }) {
  const [scrapeUrl, setScrapeUrl] = useState(supplier.website_url || "");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<ScrapeJob | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const { mutate: scrapeCatalog, isPending } = useScrapeSupplierCatalog();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  // Subscribe to realtime updates for the active job
  useEffect(() => {
    if (!activeJobId) return;

    // Fetch initial job state
    const fetchJob = async () => {
      const { data } = await supabase
        .from("scrape_jobs")
        .select("*")
        .eq("id", activeJobId)
        .single();
      
      if (data) {
        setJobProgress(data as ScrapeJob);
      }
    };
    fetchJob();

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
            const job = payload.new as ScrapeJob;
            setJobProgress(job);
            
            if (job.status === 'completed') {
              toast.success(`Import complete! Added ${job.products_inserted} products.`);
            } else if (job.status === 'failed') {
              toast.error(`Import failed: ${job.error_message}`);
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

    setShowProgressDialog(true);

    scrapeCatalog(
      { supplierId: supplier.id, url: scrapeUrl, options: { maxPages: 10 } },
      {
        onSuccess: (data) => {
          if (data.jobId) {
            setActiveJobId(data.jobId);
          } else {
            // If no job ID returned, show results directly
            toast.success(`Imported ${data.stats?.productsInserted || 0} products`);
            setShowProgressDialog(false);
          }
        },
        onError: (error) => {
          toast.error(`Failed to start import: ${error.message}`);
          setShowProgressDialog(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteSupplier(supplier.id, {
      onSuccess: () => {
        toast.success(`Deleted ${supplier.name} and all its products`);
      },
      onError: (error) => {
        toast.error(`Failed to delete: ${error.message}`);
      },
    });
  };

  const closeProgressDialog = () => {
    setShowProgressDialog(false);
    setActiveJobId(null);
    setJobProgress(null);
  };

  const isJobComplete = jobProgress?.status === 'completed' || jobProgress?.status === 'failed';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {supplier.name}
                {supplier.is_active ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1 space-y-1">
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
                <p className="text-sm">
                  <span className="font-medium">{supplier.productCount}</span> products
                </p>
              </CardDescription>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {supplier.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this supplier and all {supplier.productCount} associated products. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
      <Dialog open={showProgressDialog} onOpenChange={(open) => {
        if (!open && isJobComplete) {
          closeProgressDialog();
        }
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
          if (!isJobComplete) e.preventDefault();
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {jobProgress?.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : jobProgress?.status === 'failed' ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              Importing {supplier.name} Catalog
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={
                jobProgress?.status === 'completed' ? 'default' :
                jobProgress?.status === 'failed' ? 'destructive' : 'secondary'
              }>
                {jobProgress?.status === 'mapping' && '🔍 Discovering pages...'}
                {jobProgress?.status === 'scraping' && '📄 Scraping products...'}
                {jobProgress?.status === 'inserting' && '💾 Saving products...'}
                {jobProgress?.status === 'completed' && '✅ Complete'}
                {jobProgress?.status === 'failed' && '❌ Failed'}
                {jobProgress?.status === 'pending' && '⏳ Starting...'}
                {!jobProgress && '⏳ Initializing...'}
              </Badge>
            </div>

            {/* Progress Steps */}
            <div className="space-y-5">
              {/* Step 1: Mapping */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-full ${jobProgress?.status === 'mapping' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Website Mapping</p>
                    <p className="text-muted-foreground text-xs">Discovering product pages</p>
                  </div>
                  <span className="font-mono text-sm font-medium">
                    {jobProgress?.urls_mapped || 0}
                  </span>
                </div>
                {jobProgress?.status === 'mapping' && (
                  <div className="ml-11">
                    <Progress value={undefined} className="h-1.5" />
                  </div>
                )}
              </div>

              {/* Step 2: Scraping */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-full ${jobProgress?.status === 'scraping' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <FileSearch className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Scraping Pages</p>
                    <p className="text-muted-foreground text-xs">Extracting product data</p>
                  </div>
                  <span className="font-mono text-sm font-medium">
                    {jobProgress?.pages_scraped || 0} / {jobProgress?.urls_to_scrape || 0}
                  </span>
                </div>
                {(jobProgress?.urls_to_scrape || 0) > 0 && (
                  <div className="ml-11">
                    <Progress 
                      value={((jobProgress?.pages_scraped || 0) / (jobProgress?.urls_to_scrape || 1)) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}
                {jobProgress?.current_url && jobProgress.status === 'scraping' && (
                  <p className="ml-11 text-xs text-muted-foreground truncate max-w-[280px]">
                    {jobProgress.current_url}
                  </p>
                )}
              </div>

              {/* Step 3: Products Found */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-full ${(jobProgress?.products_found || 0) > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Products Found</p>
                    <p className="text-muted-foreground text-xs">Unique products discovered</p>
                  </div>
                  <span className="font-mono text-sm font-medium text-primary">
                    {jobProgress?.products_found || 0}
                  </span>
                </div>
              </div>

              {/* Step 4: Inserting */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-full ${jobProgress?.status === 'inserting' || jobProgress?.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Products Saved</p>
                    <p className="text-muted-foreground text-xs">Added to catalog</p>
                  </div>
                  <span className="font-mono text-sm font-medium text-green-600">
                    {jobProgress?.products_inserted || 0}
                  </span>
                </div>
                {jobProgress?.status === 'inserting' && (
                  <div className="ml-11">
                    <Progress value={undefined} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Errors */}
            {(jobProgress?.pages_failed || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{jobProgress?.pages_failed} pages failed to scrape</span>
              </div>
            )}

            {jobProgress?.error_message && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {jobProgress.error_message}
              </div>
            )}

            {/* Close button when done */}
            {isJobComplete && (
              <Button onClick={closeProgressDialog} className="w-full">
                {jobProgress?.status === 'completed' ? 'Done' : 'Close'}
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
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
