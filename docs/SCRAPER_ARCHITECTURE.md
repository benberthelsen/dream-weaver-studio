# Firecrawl Scraper Architecture & Optimizations

This document explains the optimizations implemented in the supplier catalog scraper for reuse in other applications.

## Overview

The scraper uses [Firecrawl](https://firecrawl.dev) to discover and extract product data from supplier websites. It handles diverse site structures, JavaScript-heavy pages, and Australian supplier requirements.

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCRAPER EDGE FUNCTION                        │
├─────────────────────────────────────────────────────────────────┤
│  1. SUPPLIER CONFIGS    - Per-supplier URL patterns & rules    │
│  2. URL DISCOVERY       - Map → Filter → Prioritize            │
│  3. PRODUCT EXTRACTION  - HTML parsing with multiple patterns  │
│  4. DATA NORMALIZATION  - Brand mapping, finish extraction     │
│  5. VALIDATION          - Filter junk, validate names          │
│  6. DATABASE UPSERT     - Deduplicate on name+supplier         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Optimizations

### 1. Supplier-Specific Configuration System

Instead of one-size-fits-all scraping, each supplier has custom configuration:

```typescript
interface SupplierConfig {
  // URL patterns that contain products
  productUrlPatterns?: RegExp[];
  
  // URLs to exclude (contact, about, cart, etc.)
  excludeUrlPatterns?: RegExp[];
  
  // Skip Australian domain filtering (for .one, .com domains)
  skipAuFilter?: boolean;
  
  // Map from root domain instead of sub-page
  mapFromRoot?: boolean;
  rootDomain?: string;
  
  // Use crawl when map returns 0 results
  useCrawlFallback?: boolean;
  
  // Starting URLs when map fails to discover products
  seedUrls?: string[];
  
  // Firecrawl options for JS-heavy sites
  scrapeOptions?: {
    waitFor?: number;  // Wait for JS to render (ms)
    headers?: Record<string, string>;  // Custom headers
  };
  
  // Product name validation
  requiredNamePatterns?: RegExp[];  // Must match at least one
  excludeNamePatterns?: RegExp[];   // Filter these out
  
  // Sub-brand classification
  subBrands?: Record<string, SubBrandConfig>;
}
```

**Example configuration:**

```typescript
const SUPPLIER_CONFIGS = {
  'laminex': {
    // Target individual product pages with finish in URL
    productUrlPatterns: [
      /\/products\/[^/]+\/[^/]+\/p\/[A-Z]{2}\d+/i,  // /products/{name}/{finish}/p/{code}
      /\/p\/AU\d+/i,
    ],
    excludeUrlPatterns: [
      /\/location\//, /\/contact/, /\/cart/, /\.pdf$/,
    ],
    mapFromRoot: true,
    skipAuFilter: true,
    seedUrls: [
      '/browse/brands/laminex',
      '/browse/brands?categoryCode=range&q=R_ABSOLUTEMATTE',
    ],
    requiredNamePatterns: [
      /colour|decor|woodgrain|marble|white|grey/i,
    ],
  },
};
```

### 2. Australian URL Filtering with Skip Option

Many Australian suppliers have non-.com.au domains (e.g., `forest.one`). The filter can be disabled per-supplier:

```typescript
function filterProductUrls(urls: string[], supplierSlug: string) {
  const config = SUPPLIER_CONFIGS[supplierSlug];
  
  return urls.filter(url => {
    // Skip Australian filter if configured
    if (!config?.skipAuFilter) {
      const isAustraliaSite = url.includes('.com.au') || 
                              url.includes('.au/');
      if (!isAustraliaSite) return false;
    }
    // ... rest of filtering
  });
}
```

### 3. Root Domain Mapping for Sub-Brands

When a supplier URL is a sub-page (e.g., `/products/benchtops/essastone`), map from root:

```typescript
let urlToMap = supplierUrl;

if (config.mapFromRoot && config.rootDomain) {
  urlToMap = config.rootDomain;
  console.log(`Mapping from root: ${urlToMap}`);
}

const mapResponse = await firecrawl.map(urlToMap);

// After mapping, filter back to relevant section
if (config.mapFromRoot) {
  productUrls = productUrls.filter(u => 
    u.includes(originalPath) || 
    u.toLowerCase().includes(supplierSlug)
  );
}
```

### 4. URL Prioritization

For suppliers like Laminex, individual product pages (with finish info in URL) should be scraped before browse pages:

```typescript
if (supplierSlug === 'laminex') {
  productUrls.sort((a, b) => {
    const aIsProductPage = /\/p\/[A-Z]{2}\d+/i.test(a);
    const bIsProductPage = /\/p\/[A-Z]{2}\d+/i.test(b);
    if (aIsProductPage && !bIsProductPage) return -1;
    if (!aIsProductPage && bIsProductPage) return 1;
    return 0;
  });
}
```

### 5. Seed URLs as Fallback

When URL discovery fails, use predefined seed URLs:

```typescript
if (productUrls.length === 0 && config?.seedUrls) {
  console.log('No URLs found, using seed URLs');
  productUrls = config.seedUrls.map(path => 
    path.startsWith('http') ? path : `${baseUrl}${path}`
  );
}
```

### 6. Crawl Fallback for Blocked Sites

Some sites block the `/map` endpoint. Fall back to `/crawl`:

```typescript
if (allUrls.length === 0 && config?.useCrawlFallback) {
  console.log('Map returned 0 URLs, using crawl fallback');
  
  const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      url: supplierUrl,
      limit: 50,
      maxDepth: 2,
      scrapeOptions: { formats: ['html'] },
    }),
  });
  
  const crawlData = await crawlResponse.json();
  allUrls = crawlData.data.map(page => page.metadata?.sourceURL);
}
```

### 7. Page Limits Per Supplier

Different suppliers have different catalog sizes:

```typescript
const SUPPLIER_PAGE_LIMITS: Record<string, number> = {
  'laminex': 500,      // Large catalog with finish variations
  'hafele': 300,       // Many handle products
  'caesarstone': 150,
  'polytec': 200,
  'default': 100,
};

const limit = SUPPLIER_PAGE_LIMITS[supplierSlug] || SUPPLIER_PAGE_LIMITS.default;
```

### 8. Brand Mapping

Extract brand from URL/product name for multi-brand suppliers:

```typescript
const BRAND_MAPPINGS = {
  'laminex': [
    { pattern: /\/brands\/formica|formica/i, brand: 'Formica' },
    { pattern: /\/brands\/hi-macs|himacs/i, brand: 'HIMACS' },
    { pattern: /essastone/i, brand: 'Essastone' },
  ],
  'forestone': [
    { pattern: /\/our-brands\/egger/i, brand: 'EGGER' },
    { pattern: /\/our-brands\/meganite/i, brand: 'Meganite' },
  ],
};

function extractBrand(sourceUrl: string, productName: string, supplierSlug: string) {
  const mappings = BRAND_MAPPINGS[supplierSlug];
  if (!mappings) return supplierName;
  
  const combined = `${sourceUrl} ${productName}`;
  for (const mapping of mappings) {
    if (mapping.pattern.test(combined)) {
      return mapping.brand;
    }
  }
  return defaultBrand;
}
```

### 9. Finish Type Extraction (Laminex-specific)

Extract finish from URL and append to product name for uniqueness:

```typescript
function extractLaminexFinish(url: string): string | undefined {
  // URL format: /products/{colour-name}/{FINISH}/p/{code}
  const match = url.match(/\/products\/[^/]+\/([^/]+)\/p\//i);
  if (match) {
    const finishMap = {
      'absolutematte': 'AbsoluteMatte',
      'absolutegrain': 'AbsoluteGrain',
      'natural': 'Natural',
      'nuance': 'Nuance',
    };
    return finishMap[match[1].toLowerCase()] || match[1];
  }
}

// Usage: Create unique products per finish
if (supplierSlug === 'laminex') {
  const finish = extractLaminexFinish(product.source_url);
  if (finish) {
    product.finish_type = finish;
    product.name = `${product.name} ${finish}`;  // "Polar White" → "Polar White AbsoluteMatte"
  }
}
```

### 10. Image URL Optimization

Convert thumbnail URLs to full-size images:

```typescript
function optimizeImageUrl(imageUrl: string, supplierSlug: string): string {
  switch (supplierSlug) {
    case 'hafele':
      // /thumbnail/ → /huge/
      return imageUrl.replace('/thumbnail/', '/huge/')
                     .replace('/category_view/', '/huge/');
    
    case 'laminex':
      // Remove size constraints
      return imageUrl.replace(/_thumb\./i, '.')
                     .replace(/\?w=\d+/i, '');
    
    case 'caesarstone':
      // Cloudinary transforms
      return imageUrl.replace(/\/w_\d+,/i, '/w_800,');
    
    default:
      return imageUrl.replace(/-\d+x\d+\./i, '.');  // WordPress thumbnails
  }
}
```

### 11. Product Name Validation

Filter out junk scrapes with comprehensive validation:

```typescript
function isValidProductName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 100) return false;
  
  const invalidPatterns = [
    // UI elements
    /^(quick view|more info|add to cart|learn more)/i,
    /^(download|subscribe|newsletter|sign in)/i,
    
    // Category names (not products)
    /^(accents|minerals|woodgrains|colours)$/i,
    /^(mdf|particleboard|laminate|substrate)$/i,
    
    // Image filenames
    /\.jpg$/i, /\.png$/i, /\.webp$/i,
    
    // Loading/error states
    /^(loading|please wait|error|undefined)$/i,
    
    // Price strings
    /^\$[\d,]+/,
    
    // SKU-only (no descriptive name)
    /^[A-Z]{2,5}-?\d{4,}$/,
  ];
  
  return !invalidPatterns.some(p => p.test(name.trim()));
}
```

### 12. Supplier-Specific Product Validation

Additional validation per supplier:

```typescript
function isValidProductForSupplier(product, supplierSlug, config) {
  // Check required patterns (must match at least one)
  if (config?.requiredNamePatterns) {
    const matchesRequired = config.requiredNamePatterns.some(p => 
      p.test(product.name)
    );
    if (!matchesRequired) return false;
  }
  
  // Check exclude patterns
  if (config?.excludeNamePatterns) {
    const matchesExclude = config.excludeNamePatterns.some(p => 
      p.test(product.name)
    );
    if (matchesExclude) return false;
  }
  
  return true;
}
```

### 13. Database Deduplication

Use upsert with unique constraint on `supplier_id + name`:

```typescript
const { error } = await supabase
  .from('catalog_items')
  .upsert(products, {
    onConflict: 'supplier_id,name',
    ignoreDuplicates: false,  // Update existing
  });
```

### 14. JavaScript-Heavy Sites

For sites requiring JS rendering, use Firecrawl's `waitFor`:

```typescript
const SUPPLIER_CONFIGS = {
  'hafele': {
    scrapeOptions: {
      waitFor: 3000,  // Wait 3 seconds for JS
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    },
  },
};
```

## Database Schema

```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  source_url TEXT,
  brand TEXT,
  finish_type TEXT,
  color TEXT,
  material TEXT,
  product_type TEXT,
  usage_types TEXT[],
  thickness TEXT,
  hex_color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  
  UNIQUE(supplier_id, name)
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website_url TEXT,
  category TEXT,
  scrape_config JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  urls_mapped INTEGER,
  urls_to_scrape INTEGER,
  pages_scraped INTEGER,
  products_found INTEGER,
  products_inserted INTEGER,
  error_message TEXT
);
```

## Implementation Checklist for New App

1. **Create Edge Function** with Firecrawl API integration
2. **Add Supplier Configs** for each target website
3. **Implement URL Filtering** with pattern matching
4. **Add HTML Extraction** with multiple fallback patterns
5. **Implement Validation** to filter junk
6. **Add Image Optimization** per supplier
7. **Create Database Tables** with unique constraints
8. **Add Job Tracking** for monitoring progress
9. **Test Each Supplier** individually
10. **Monitor Logs** and refine patterns

## Environment Variables

```bash
FIRECRAWL_API_KEY=fc-xxx        # Firecrawl API key
SUPABASE_URL=https://xxx        # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=xxx   # Service role key for DB access
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Map returns 0 URLs | Use `useCrawlFallback: true` |
| Products from wrong country | Use `skipAuFilter: true` for .one/.com Australian sites |
| Sub-brand products not found | Use `mapFromRoot: true` with `rootDomain` |
| All finish_type null | Extract finish from URL, append to name |
| Duplicate products | Use upsert with unique constraint |
| Thumbnail images | Use `optimizeImageUrl()` per supplier |
| Junk product names | Add patterns to `excludeNamePatterns` |
