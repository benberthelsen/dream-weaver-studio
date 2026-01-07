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
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);

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

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-import All
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
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
      <BulkImportDialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog} />
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

interface BulkImportState {
  isRunning: boolean;
  currentSupplierIndex: number;
  totalSuppliers: number;
  currentSupplierName: string;
  completedSuppliers: { name: string; products: number; success: boolean }[];
  currentJob: ScrapeJob | null;
}

function BulkImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: suppliers } = useSuppliersWithCounts();
  const [state, setState] = useState<BulkImportState>({
    isRunning: false,
    currentSupplierIndex: 0,
    totalSuppliers: 0,
    currentSupplierName: '',
    completedSuppliers: [],
    currentJob: null,
  });
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Subscribe to job updates
  useEffect(() => {
    if (!activeJobId) return;

    const fetchJob = async () => {
      const { data } = await supabase
        .from("scrape_jobs")
        .select("*")
        .eq("id", activeJobId)
        .single();
      
      if (data) {
        setState(prev => ({ ...prev, currentJob: data as ScrapeJob }));
      }
    };
    fetchJob();

    const channel = supabase
      .channel(`bulk-scrape-job-${activeJobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrape_jobs',
          filter: `id=eq.${activeJobId}`,
        },
        (payload) => {
          if (payload.new) {
            setState(prev => ({ ...prev, currentJob: payload.new as ScrapeJob }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  // Process next supplier when current job completes
  useEffect(() => {
    if (!state.isRunning || !state.currentJob) return;

    if (state.currentJob.status === 'completed' || state.currentJob.status === 'failed') {
      // Record result
      const result = {
        name: state.currentSupplierName,
        products: state.currentJob.products_inserted || 0,
        success: state.currentJob.status === 'completed',
      };

      setState(prev => ({
        ...prev,
        completedSuppliers: [...prev.completedSuppliers, result],
        currentJob: null,
      }));

      setActiveJobId(null);

      // Process next supplier after a short delay
      setTimeout(() => {
        processNextSupplier();
      }, 1000);
    }
  }, [state.currentJob?.status]);

  const suppliersWithUrls = suppliers?.filter(s => s.website_url) || [];

  const processNextSupplier = async () => {
    const nextIndex = state.completedSuppliers.length;
    
    if (nextIndex >= suppliersWithUrls.length) {
      // All done
      setState(prev => ({ ...prev, isRunning: false }));
      toast.success(`Bulk import complete! Processed ${suppliersWithUrls.length} suppliers.`);
      return;
    }

    const supplier = suppliersWithUrls[nextIndex];
    
    setState(prev => ({
      ...prev,
      currentSupplierIndex: nextIndex,
      currentSupplierName: supplier.name,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
        body: { 
          supplierId: supplier.id, 
          url: supplier.website_url,
          options: { maxPages: 30 }
        },
      });

      if (error) throw error;

      if (data.jobId) {
        setActiveJobId(data.jobId);
      } else {
        // No job ID, record as complete
        setState(prev => ({
          ...prev,
          completedSuppliers: [...prev.completedSuppliers, {
            name: supplier.name,
            products: data.stats?.productsInserted || 0,
            success: true,
          }],
        }));
        setTimeout(() => processNextSupplier(), 500);
      }
    } catch (error) {
      console.error(`Failed to scrape ${supplier.name}:`, error);
      setState(prev => ({
        ...prev,
        completedSuppliers: [...prev.completedSuppliers, {
          name: supplier.name,
          products: 0,
          success: false,
        }],
      }));
      setTimeout(() => processNextSupplier(), 500);
    }
  };

  const startBulkImport = () => {
    setState({
      isRunning: true,
      currentSupplierIndex: 0,
      totalSuppliers: suppliersWithUrls.length,
      currentSupplierName: '',
      completedSuppliers: [],
      currentJob: null,
    });
    processNextSupplier();
  };

  const handleClose = () => {
    if (!state.isRunning) {
      setState({
        isRunning: false,
        currentSupplierIndex: 0,
        totalSuppliers: 0,
        currentSupplierName: '',
        completedSuppliers: [],
        currentJob: null,
      });
      onOpenChange(false);
    }
  };

  const overallProgress = suppliersWithUrls.length > 0 
    ? (state.completedSuppliers.length / suppliersWithUrls.length) * 100 
    : 0;

  const isComplete = state.completedSuppliers.length === suppliersWithUrls.length && !state.isRunning;
  const totalProducts = state.completedSuppliers.reduce((sum, s) => sum + s.products, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
        if (state.isRunning) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {state.isRunning ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            Bulk Catalog Import
          </DialogTitle>
          <DialogDescription>
            {state.isRunning 
              ? `Importing catalogs from all ${suppliersWithUrls.length} suppliers with website URLs.`
              : isComplete
              ? `Successfully imported ${totalProducts} products from ${state.completedSuppliers.filter(s => s.success).length} suppliers.`
              : `This will re-import catalogs from all ${suppliersWithUrls.length} suppliers with website URLs configured.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Overall Progress */}
          {(state.isRunning || isComplete) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {state.completedSuppliers.length} / {suppliersWithUrls.length} suppliers
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Current Supplier */}
          {state.isRunning && state.currentSupplierName && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{state.currentSupplierName}</span>
                  <Badge variant="secondary">
                    {state.currentJob?.status === 'mapping' && '🔍 Mapping...'}
                    {state.currentJob?.status === 'scraping' && '📄 Scraping...'}
                    {state.currentJob?.status === 'inserting' && '💾 Saving...'}
                    {!state.currentJob && '⏳ Starting...'}
                  </Badge>
                </div>
                {state.currentJob && (
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>Pages: {state.currentJob.pages_scraped || 0}</div>
                    <div>Found: {state.currentJob.products_found || 0}</div>
                    <div>Saved: {state.currentJob.products_inserted || 0}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Completed Suppliers List */}
          {state.completedSuppliers.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {state.completedSuppliers.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    {s.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>{s.name}</span>
                  </div>
                  <span className="text-muted-foreground">{s.products} products</span>
                </div>
              ))}
            </div>
          )}

          {/* Suppliers without URLs warning */}
          {!state.isRunning && !isComplete && suppliers && (
            <div className="text-sm text-muted-foreground">
              {suppliers.length - suppliersWithUrls.length > 0 && (
                <p className="text-amber-600">
                  ⚠️ {suppliers.length - suppliersWithUrls.length} suppliers don't have website URLs and will be skipped.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!state.isRunning && !isComplete && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={startBulkImport} disabled={suppliersWithUrls.length === 0}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Import ({suppliersWithUrls.length} suppliers)
              </Button>
            </>
          )}
          {isComplete && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
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
  // Keep scrapeUrl in sync with supplier.website_url
  const [scrapeUrl, setScrapeUrl] = useState(supplier.website_url || "");
  useEffect(() => {
    if (supplier.website_url) {
      setScrapeUrl(supplier.website_url);
    }
  }, [supplier.website_url]);
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

const USAGE_TYPE_OPTIONS = [
  { value: 'doors', label: 'Doors' },
  { value: 'panels', label: 'Panels' },
  { value: 'kicks', label: 'Kicks' },
  { value: 'bench_tops', label: 'Bench Tops' },
  { value: 'carcass', label: 'Carcass' },
  { value: 'splashbacks', label: 'Splashbacks' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: 'board', label: 'Board' },
  { value: 'laminate', label: 'Laminate (HPL)' },
  { value: 'compact_laminate', label: 'Compact Laminate' },
  { value: 'solid_surface', label: 'Solid Surface' },
  { value: 'veneer', label: 'Veneer' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'metallic', label: 'Metallic' },
];

function ProductsList() {
  const { data: items, isLoading, refetch } = useCatalogItems({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    product_type: string;
    thickness: string;
    usage_types: string[];
  }>({ product_type: 'board', thickness: '', usage_types: [] });

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: any) => {
    setEditingItem(item.id);
    setEditValues({
      product_type: item.product_type || 'board',
      thickness: item.thickness || '',
      usage_types: item.usage_types || [],
    });
  };

  const handleSave = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('catalog_items')
        .update({
          product_type: editValues.product_type,
          thickness: editValues.thickness || null,
          usage_types: editValues.usage_types,
        })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Product updated');
      setEditingItem(null);
      refetch();
    } catch (err) {
      toast.error('Failed to update product');
      console.error(err);
    }
  };

  const toggleUsageType = (value: string) => {
    setEditValues(prev => ({
      ...prev,
      usage_types: prev.usage_types.includes(value)
        ? prev.usage_types.filter(t => t !== value)
        : [...prev.usage_types, value],
    }));
  };

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
              <th className="text-left p-3 text-sm font-medium">Type</th>
              <th className="text-left p-3 text-sm font-medium">Usage Types</th>
              <th className="text-left p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems?.slice(0, 100).map((item) => {
              const isEditing = editingItem === item.id;
              const itemUsageTypes = (item as any).usage_types || [];
              const itemProductType = (item as any).product_type || 'board';
              const itemThickness = (item as any).thickness || '';

              return (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img 
                          src={item.thumbnail_url || item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium block truncate">{item.name}</span>
                        {itemThickness && (
                          <span className="text-xs text-muted-foreground">{itemThickness}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {item.supplier?.name || "-"}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={editValues.product_type}
                        onChange={(e) => setEditValues(prev => ({ ...prev, product_type: e.target.value }))}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {PRODUCT_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {itemProductType.replace('_', ' ')}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1">
                        {USAGE_TYPE_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => toggleUsageType(opt.value)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              editValues.usage_types.includes(opt.value)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:bg-muted'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {itemUsageTypes.length > 0 ? (
                          itemUsageTypes.map((usage: string) => (
                            <Badge key={usage} variant="secondary" className="text-xs capitalize">
                              {usage.replace('_', ' ')}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleSave(item.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
