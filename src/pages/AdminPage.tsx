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
  XCircle,
  Play,
  Square,
  ListPlus
} from "lucide-react";
import type { Supplier } from "@/types/board";

interface ScrapeJob {
  id: string;
  supplier_id: string;
  status: string;
  mode: string | null;
  urls_mapped: number;
  urls_to_scrape: number;
  urls_queued: number;
  urls_completed: number;
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
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  // Check for existing active job on mount - only new pipeline jobs with queued URLs
  useEffect(() => {
    const checkActiveJob = async () => {
      const { data } = await supabase
        .from("scrape_jobs")
        .select("*")
        .eq("supplier_id", supplier.id)
        .in("status", ["planned", "working", "scraping"])
        .gt("urls_queued", 0)  // Only jobs with queued URLs (new pipeline)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setActiveJobId(data[0].id);
        setJobProgress(data[0] as ScrapeJob);
        setShowProgressDialog(true);
      }
    };
    checkActiveJob();
  }, [supplier.id]);

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
              setIsWorking(false);
              toast.success(`Import complete! Added ${job.products_inserted} products.`);
            } else if (job.status === 'failed') {
              setIsWorking(false);
              toast.error(`Import failed: ${job.error_message}`);
            } else if (job.status === 'cancelled') {
              setIsWorking(false);
              setIsStopping(false);
              toast.info('Import cancelled');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  // Auto-run work batches when in working mode
  useEffect(() => {
    if (!isWorking || !activeJobId || !jobProgress) return;
    
    // Stop if job is in a terminal state
    if (['completed', 'failed', 'cancelled'].includes(jobProgress.status)) {
      setIsWorking(false);
      return;
    }

    // Only run work batches on 'planned' or 'scraping' status
    if (!['planned', 'scraping'].includes(jobProgress.status)) {
      return;
    }

    // Only continue if there are queued URLs left
    const queuedLeft = (jobProgress.urls_queued || 0) - (jobProgress.urls_completed || 0);
    if (queuedLeft <= 0 && jobProgress.status === 'scraping') {
      return;
    }

    const runNextBatch = async () => {
      // Re-check conditions before calling (could have been cancelled or state changed)
      if (!isWorking || !activeJobId || !jobProgress) {
        console.log('runNextBatch skipped - conditions not met:', { isWorking, activeJobId: !!activeJobId, jobProgress: !!jobProgress });
        return;
      }
      
      // Double-check urls_queued is valid
      if ((jobProgress.urls_queued || 0) <= 0) {
        console.log('runNextBatch skipped - no URLs queued');
        setIsWorking(false);
        return;
      }
      
      try {
        console.log('Running work batch for job:', activeJobId);
        const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
          body: { 
            supplierId: supplier.id,
            jobId: activeJobId,
            options: { mode: 'work', batchSize: 5 }
          },
        });

        // Handle cancelled job gracefully
        if (error?.message?.includes('cancelled') || data?.error?.includes('cancelled')) {
          setIsWorking(false);
          return;
        }

        if (error) {
          console.error('Work batch failed:', error);
          // Don't stop on individual batch errors, the job will track them
        }

        // Check if we should continue based on response
        if (data?.status === 'completed' || data?.urlsRemaining === 0) {
          setIsWorking(false);
        }
      } catch (err) {
        console.error('Work batch error:', err);
        // Stop on network errors
        setIsWorking(false);
      }
    };

    // Run next batch after a short delay
    const timer = setTimeout(runNextBatch, 1500);
    return () => clearTimeout(timer);
  }, [isWorking, activeJobId, jobProgress?.urls_completed, jobProgress?.status]);

  const handlePlanImport = async () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    setIsPlanning(true);
    setShowProgressDialog(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
        body: { 
          supplierId: supplier.id, 
          url: scrapeUrl,
          options: { mode: 'plan', maxPages: 50 }
        },
      });

      if (error) throw error;

      if (data.jobId) {
        setActiveJobId(data.jobId);
        toast.success(`Planned ${data.urlsQueued || 0} URLs to scrape`);
      }
    } catch (error) {
      toast.error(`Failed to plan import: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowProgressDialog(false);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleRunImport = () => {
    if (!activeJobId) {
      toast.error("No job to run - plan an import first");
      return;
    }
    setIsWorking(true);
    toast.info('Starting batch processing...');
  };

  const handleStopImport = async () => {
    if (!activeJobId) return;
    
    setIsStopping(true);
    setIsWorking(false);

    try {
      // Update job status to cancelled
      await supabase
        .from('scrape_jobs')
        .update({ status: 'cancelled', completed_at: new Date().toISOString() })
        .eq('id', activeJobId);

      // Mark pending URLs as skipped
      await supabase
        .from('scrape_job_urls')
        .update({ status: 'skipped' })
        .eq('job_id', activeJobId)
        .eq('status', 'pending');

      toast.info('Import stopped');
    } catch (error) {
      console.error('Failed to stop import:', error);
      toast.error('Failed to stop import');
    } finally {
      setIsStopping(false);
    }
  };

  const handleTestScrape = async () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to test");
      return;
    }

    setIsTesting(true);
    setTestResults(null);
    setShowTestDialog(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-supplier-catalog', {
        body: { 
          supplierId: supplier.id, 
          url: scrapeUrl,
          options: { dryRun: true, maxPages: 3 }
        },
      });

      if (error) throw error;
      setTestResults(data);
    } catch (error) {
      console.error('Test scrape failed:', error);
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsTesting(false);
    }
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
    setIsWorking(false);
  };

  const isJobComplete = jobProgress?.status === 'completed' || jobProgress?.status === 'failed' || jobProgress?.status === 'cancelled';
  const isJobPlanned = jobProgress?.status === 'planned';
  const isJobRunning = jobProgress?.status === 'working' || jobProgress?.status === 'scraping';
  const hasActiveJob = activeJobId && !isJobComplete;

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
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleTestScrape}
              disabled={isTesting || !scrapeUrl}
              size="sm"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
            </Button>
            
            {!hasActiveJob ? (
              <Button 
                onClick={handlePlanImport}
                disabled={isPlanning || !scrapeUrl}
                className="flex-1"
              >
                {isPlanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Planning...
                  </>
                ) : (
                  <>
                    <ListPlus className="h-4 w-4 mr-2" />
                    Plan Import
                  </>
                )}
              </Button>
            ) : (
              <>
                {isJobPlanned && !isWorking && (
                  <Button 
                    onClick={handleRunImport}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Import ({jobProgress?.urls_queued || 0} URLs)
                  </Button>
                )}
                {(isWorking || isJobRunning) && (
                  <Button 
                    variant="destructive"
                    onClick={handleStopImport}
                    disabled={isStopping}
                    className="flex-1"
                  >
                    {isStopping ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    Stop
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setShowProgressDialog(true)}
                  size="sm"
                >
                  View Progress
                </Button>
              </>
            )}
          </div>

          {/* Mini progress indicator when job is active */}
          {hasActiveJob && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>
                  {jobProgress?.status === 'planned' && '📋 Planned'}
                  {jobProgress?.status === 'working' && '⚙️ Working...'}
                  {jobProgress?.status === 'scraping' && '📄 Scraping...'}
                </span>
                <span>
                  {jobProgress?.urls_completed || 0} / {jobProgress?.urls_queued || 0} URLs
                </span>
              </div>
              <Progress 
                value={jobProgress?.urls_queued ? ((jobProgress?.urls_completed || 0) / jobProgress.urls_queued) * 100 : 0} 
                className="h-1" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Test Scrape Results - {supplier.name}
            </DialogTitle>
            <DialogDescription>
              Dry run diagnostics (no data saved)
            </DialogDescription>
          </DialogHeader>

          {isTesting ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : testResults ? (
            <div className="space-y-4 py-2">
              {/* Recommendation */}
              <div className={`p-3 rounded-lg text-sm ${
                testResults.recommendation?.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                testResults.recommendation?.startsWith('⚠️') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResults.recommendation || testResults.error || 'Unknown result'}
              </div>

              {/* Config Status */}
              {testResults.hasConfig !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  {testResults.hasConfig ? (
                    <Badge variant="default" className="bg-green-500">Has Config</Badge>
                  ) : (
                    <Badge variant="secondary">Generic Config</Badge>
                  )}
                  <span className="text-muted-foreground">Supplier: {testResults.supplierSlug}</span>
                </div>
              )}

              {/* URL Discovery Stats */}
              {testResults.urlDiscovery && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      URL Discovery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{testResults.urlDiscovery.totalDiscovered}</div>
                        <div className="text-xs text-muted-foreground">Total Found</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{testResults.urlDiscovery.productUrlsKept}</div>
                        <div className="text-xs text-muted-foreground">Product URLs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-muted-foreground">{testResults.urlDiscovery.rejectedCount}</div>
                        <div className="text-xs text-muted-foreground">Rejected</div>
                      </div>
                    </div>
                    {testResults.urlDiscovery.productUrlsSample?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">Sample Product URLs:</p>
                        <div className="max-h-24 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                          {testResults.urlDiscovery.productUrlsSample.slice(0, 10).map((url: string, i: number) => (
                            <div key={i} className="truncate">{url}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Extraction Stats */}
              {testResults.extraction && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Product Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{testResults.extraction.urlsSampled}</div>
                        <div className="text-xs text-muted-foreground">Pages Tested</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{testResults.extraction.successfulPages}</div>
                        <div className="text-xs text-muted-foreground">Successful</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{testResults.extraction.productsFound}</div>
                        <div className="text-xs text-muted-foreground">Products Found</div>
                      </div>
                    </div>
                    {testResults.extraction.productsSample?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">Sample Products:</p>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {testResults.extraction.productsSample.slice(0, 8).map((product: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                              {product.image_url && (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-8 h-8 object-cover rounded"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                              <span className="truncate flex-1">{product.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {testResults.warnings?.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Warnings ({testResults.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-xs text-amber-700">
                      {testResults.warnings.map((warning: string, i: number) => (
                        <div key={i}>{warning}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Close
            </Button>
            {testResults?.recommendation?.startsWith('✅') && (
              <Button onClick={() => { setShowTestDialog(false); handlePlanImport(); }}>
                Plan Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              ) : jobProgress?.status === 'cancelled' ? (
                <Square className="h-5 w-5 text-muted-foreground" />
              ) : isWorking ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ListPlus className="h-5 w-5 text-primary" />
              )}
              {supplier.name} Import
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={
                jobProgress?.status === 'completed' ? 'default' :
                jobProgress?.status === 'failed' ? 'destructive' :
                jobProgress?.status === 'cancelled' ? 'secondary' : 'outline'
              }>
                {jobProgress?.status === 'planned' && '📋 Planned'}
                {jobProgress?.status === 'working' && '⚙️ Processing...'}
                {jobProgress?.status === 'scraping' && '📄 Scraping...'}
                {jobProgress?.status === 'completed' && '✅ Complete'}
                {jobProgress?.status === 'failed' && '❌ Failed'}
                {jobProgress?.status === 'cancelled' && '⏹️ Cancelled'}
                {jobProgress?.status === 'pending' && '⏳ Starting...'}
                {jobProgress?.status === 'mapping' && '🔍 Mapping...'}
                {!jobProgress && '⏳ Initializing...'}
              </Badge>
            </div>

            {/* URL Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">URLs Processed</span>
                <span className="font-mono font-medium">
                  {jobProgress?.urls_completed || 0} / {jobProgress?.urls_queued || 0}
                </span>
              </div>
              <Progress 
                value={jobProgress?.urls_queued ? ((jobProgress?.urls_completed || 0) / jobProgress.urls_queued) * 100 : 0} 
                className="h-2" 
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-primary">{jobProgress?.products_found || 0}</div>
                <div className="text-xs text-muted-foreground">Found</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{jobProgress?.products_inserted || 0}</div>
                <div className="text-xs text-muted-foreground">Saved</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-amber-600">{jobProgress?.pages_failed || 0}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            {/* Current URL */}
            {jobProgress?.current_url && (isWorking || jobProgress?.status === 'scraping' || jobProgress?.status === 'working') && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Current: </span>
                <span className="truncate block">{jobProgress.current_url}</span>
              </div>
            )}

            {/* Error Message */}
            {jobProgress?.error_message && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {jobProgress.error_message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {isJobComplete ? (
                <Button onClick={closeProgressDialog} className="w-full">
                  {jobProgress?.status === 'completed' ? 'Done' : 'Close'}
                </Button>
              ) : isJobPlanned && !isWorking ? (
                <>
                  <Button onClick={handleRunImport} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Run Import
                  </Button>
                  <Button variant="outline" onClick={closeProgressDialog}>
                    Later
                  </Button>
                </>
              ) : isWorking || isJobRunning ? (
                <Button 
                  variant="destructive" 
                  onClick={handleStopImport}
                  disabled={isStopping}
                  className="w-full"
                >
                  {isStopping ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Stop Import
                </Button>
              ) : (
                <Button variant="outline" onClick={closeProgressDialog} className="w-full">
                  Close
                </Button>
              )}
            </div>
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
