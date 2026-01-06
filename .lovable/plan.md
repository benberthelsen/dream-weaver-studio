# Scraper Improvement Plan - Fix Product Detection Issues

## Problem Analysis

The current scraper fails to find products on many supplier sites due to 6 distinct issues:

### Issue 1: Incorrect Australian URL Filtering
**Affected**: ForestOne, Designerone
- `forest.one` is Australian but doesn't have `.com.au` domain
- The filter `requireAustralian = !isAustraliaSite` incorrectly filters out all their product URLs

### Issue 2: Sub-URL Mapping Limitation
**Affected**: Essastone, Designerone
- When supplier URL is a sub-page (e.g., `/products/benchtops/essastone`), map only returns that single URL
- Need to map from the root domain and filter to the relevant section

### Issue 3: Product URL Filter Too Restrictive
**Affected**: Laminex, ForestOne
- `/location/` pages pass the filter but contain no products
- Missing common product URL patterns like `/gallery/`, `/range/`

### Issue 4: Sites Blocking Map Endpoint
**Affected**: Hafele
- Some sites block Firecrawl's map endpoint entirely (returns 0 URLs)
- Need fallback strategy using crawl or direct page scraping

### Issue 5: HTML Extraction Patterns Too Limited
**Affected**: Multiple sites
- Only extracts from `<img>` tags with specific patterns
- Modern sites use data attributes, CSS backgrounds, lazy loading
- Need supplier-specific extraction patterns

### Issue 6: Missing Supplier-Specific Configurations
**Affected**: Dekton, Silestone, Hafele
- Each supplier has unique HTML structure
- Need configurable extraction rules per supplier

## Solution

### Step 1: Create Supplier Configuration System

Add a `supplier_scrape_config` table or inline config that defines per-supplier settings:

```sql
-- Option A: Database table for flexibility
CREATE TABLE supplier_scrape_config (
  supplier_id uuid PRIMARY KEY REFERENCES suppliers(id),
  map_from_root boolean DEFAULT true,
  product_url_patterns text[] DEFAULT '{}',
  exclude_url_patterns text[] DEFAULT '{}',
  extraction_selectors jsonb DEFAULT '{}',
  requires_javascript boolean DEFAULT false,
  custom_headers jsonb DEFAULT '{}'
);

-- Option B: Inline config in the edge function (simpler, chosen approach)
```

### Step 2: Update Edge Function with Supplier-Specific Rules

Modify `supabase/functions/scrape-supplier-catalog/index.ts`:

#### 2.1 Add Supplier Configuration Object

```javascript
const SUPPLIER_CONFIGS: Record<string, {
  mapFromRoot?: boolean;
  rootDomain?: string;
  productUrlPatterns: RegExp[];
  excludeUrlPatterns: RegExp[];
  skipAuFilter?: boolean;
  extractionRules?: {
    productContainer?: string;
    nameSelector?: string;
    imageSelector?: string;
  };
}> = {
  // Polytec - well structured Australian site
  'polytec': {
    productUrlPatterns: [/\\/colours\\//, /\\/decors\\//, /\\/products\\/.*\\/[a-z-]+$/],
    excludeUrlPatterns: [/\\/stockists/, /\\/contact/, /\\/brochure/],
  },
  
  // Laminex - Australian, avoid location pages
  'laminex': {
    productUrlPatterns: [/\\/products\\/.*\\/colours/, /\\/products\\/.*\\/range/, /\\/decorative-surfaces/],
    excludeUrlPatterns: [/\\/location\\//, /\\/find-a-retailer/, /\\/sample-order/],
  },
  
  // ForestOne - Australian company, non-.com.au domain
  'forestone': {
    skipAuFilter: true,
    productUrlPatterns: [/\\/products\\//, /\\/our-brands\\//, /\\/colour/],
    excludeUrlPatterns: [/\\/contact/, /\\/about/, /\\/news/],
  },
  
  // Designerone - sub-brand of ForestOne
  'designerone': {
    mapFromRoot: true,
    rootDomain: 'https://www.forest.one',
    skipAuFilter: true,
    productUrlPatterns: [/designer-one.*colour/, /designer-one.*product/],
    excludeUrlPatterns: [/\\/contact/],
  },
  
  // Essastone - sub-brand of Laminex
  'essastone': {
    mapFromRoot: true,
    rootDomain: 'https://www.laminex.com.au',
    productUrlPatterns: [/\\/essastone\\/colours/, /\\/essastone.*[a-z-]+$/],
    excludeUrlPatterns: [/\\/sample/, /\\/order/],
  },
  
  // Hafele - JavaScript heavy, needs different approach
  'hafele': {
    productUrlPatterns: [/\\/products\\/.*-[a-z]+-/, /\\/article/],
    excludeUrlPatterns: [/\\/login/, /\\/cart/],
    extractionRules: {
      productContainer: '.product-teaser, .article-teaser',
      nameSelector: '.teaser__title, .article-title',
      imageSelector: 'img[data-src], img.lazyload',
    },
  },
  
  // Caesarstone - working well, keep patterns
  'caesarstone': {
    productUrlPatterns: [/\\/collections-gallery\\//, /\\/colours\\//],
    excludeUrlPatterns: [/\\/announcements/, /\\/training/],
  },
  
  // Cosentino brands - Dekton, Silestone
  'dekton': {
    productUrlPatterns: [/\\/dekton\\/colours\\//, /\\/dekton\\/[a-z-]+$/],
    excludeUrlPatterns: [/\\/contact/, /\\/sample/],
  },
  
  'silestone': {
    productUrlPatterns: [/\\/silestone\\/colours\\//, /\\/silestone\\/[a-z-]+$/],
    excludeUrlPatterns: [/\\/contact/, /\\/sample/],
  },
  
  // Nikpol - working, refine patterns
  'nikpol': {
    productUrlPatterns: [/\\/colour/, /\\/product/, /\\/range/],
    excludeUrlPatterns: [/\\/stockist/, /\\/contact/],
  },
  
  // Stone suppliers
  'smartstone': {
    productUrlPatterns: [/\\/colour/, /\\/product/, /\\/collection/],
    excludeUrlPatterns: [/\\/blog/, /\\/news/],
  },
  
  'lavistone': {
    productUrlPatterns: [/\\/colour/, /\\/product/],
    excludeUrlPatterns: [/\\/contact/],
  },
};
```

#### 2.2 Update filterProductUrls Function

Replace the current function with a config-aware version:

```javascript
function filterProductUrls(
  urls: string[], 
  baseUrl: string, 
  supplierSlug: string,
  config?: typeof SUPPLIER_CONFIGS[string]
): string[] {
  // If supplier has custom config, use it
  if (config) {
    return urls.filter(url => {
      const lowerUrl = url.toLowerCase();
      
      // Check against exclude patterns first
      if (config.excludeUrlPatterns?.some(pattern => pattern.test(lowerUrl))) {
        return false;
      }
      
      // Check against include patterns
      if (config.productUrlPatterns?.some(pattern => pattern.test(lowerUrl))) {
        return true;
      }
      
      return false;
    });
  }
  
  // Fallback to generic patterns (current logic)
  // ... existing code ...
}
```

#### 2.3 Update Main Function to Use Root Domain

When a supplier has `mapFromRoot: true`, map from the root domain instead of the sub-URL:

```javascript
// Get supplier config
const config = SUPPLIER_CONFIGS[supplier.slug] || {};

// Determine URL to map from
let urlToMap = url;
if (config.mapFromRoot && config.rootDomain) {
  urlToMap = config.rootDomain;
  console.log(`Mapping from root domain: ${urlToMap} instead of ${url}`);
}

// Map the website
const mapResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/map', {
  // ...
  body: JSON.stringify({
    url: urlToMap,
    limit: options?.mapLimit || 3000,
    includeSubdomains: false,
  }),
});

// Filter URLs - for sub-brand suppliers, only keep URLs containing the original path
let productUrls = filterProductUrls(allUrls, baseUrl, supplier.slug, config);

if (config.mapFromRoot) {
  const originalPath = new URL(url).pathname;
  productUrls = productUrls.filter(u => u.includes(originalPath) || 
    u.toLowerCase().includes(supplier.slug));
}
```

#### 2.4 Add Fallback for Blocked Sites

When map returns 0 URLs, try alternative approaches:

```javascript
if (allUrls.length === 0) {
  console.log('Map returned 0 URLs, attempting crawl fallback...');
  
  // Try crawl endpoint instead
  try {
    const crawlResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        limit: 50,
        maxDepth: 2,
        scrapeOptions: { formats: ['html'] },
      }),
    });
    
    const crawlData = await crawlResponse.json();
    if (crawlData.data) {
      // Extract URLs from crawled pages
      allUrls = crawlData.data.map((page: any) => page.metadata?.sourceURL).filter(Boolean);
    }
  } catch (error) {
    console.error('Crawl fallback failed:', error);
  }
}
```

#### 2.5 Enhanced HTML Extraction

Add more robust extraction patterns:

```javascript
function extractProductsFromHtml(
  html: string, 
  pageUrl: string, 
  baseUrl: string, 
  supplierSlug: string,
  config?: typeof SUPPLIER_CONFIGS[string]
): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  
  // Use supplier-specific extraction if configured
  if (config?.extractionRules) {
    // ... custom extraction logic
  }
  
  // Enhanced generic patterns
  const patterns = [
    // Product cards with data attributes
    /<[^>]+data-product[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<[^>]*class="[^"]*(?:name|title)[^"]*"[^>]*>([^<]+)</gi,
    
    // Lazy loading images
    /<img[^>]+data-src=["']([^"']+)["'][^>]*(?:alt|title)=["']([^"']+)["']/gi,
    /<img[^>]+data-lazy=["']([^"']+)["'][^>]*(?:alt|title)=["']([^"']+)["']/gi,
    
    // Background images in style
    /<div[^>]+style="[^"]*background-image:\s*url\(['"]?([^'")]+)['"]?\)[^"]*"[^>]*>[\s\S]*?<[^>]*>([^<]+)</gi,
    
    // srcset for responsive images
    /<img[^>]+srcset=["']([^"'\s]+)[^"']*["'][^>]*alt=["']([^"']+)["']/gi,
    
    // Picture element sources
    /<picture[^>]*>[\s\S]*?<source[^>]+srcset=["']([^"'\s]+)[^"']*["'][^>]*>[\s\S]*?<img[^>]+alt=["']([^"']+)["']/gi,
  ];
  
  // ... extraction logic with all patterns
  
  return products;
}
```

### Step 3: Add Debugging and Logging

Improve logging to help diagnose issues:

```javascript
console.log(`Supplier config: ${JSON.stringify(config || 'default')}`);
console.log(`URLs before filter: ${allUrls.slice(0, 10).join('\n')}`);
console.log(`URLs after filter: ${productUrls.slice(0, 10).join('\n')}`);
```

### Step 4: Update Admin Page with Supplier Status

Add a status indicator showing which suppliers have working scrape configs:

```typescript
const SCRAPE_STATUS: Record<string, 'working' | 'needs-config' | 'blocked'> = {
  'caesarstone': 'working',
  'polytec': 'working', 
  'nikpol': 'working',
  'laminex': 'needs-config',
  'forestone': 'needs-config',
  'hafele': 'blocked',
  // ...
};
```

## Files to Modify

1. **supabase/functions/scrape-supplier-catalog/index.ts** - Main scraper improvements
   - Add `SUPPLIER_CONFIGS` object
   - Update `filterProductUrls` function
   - Add root domain mapping logic
   - Add crawl fallback
   - Enhance HTML extraction patterns

2. **src/pages/AdminPage.tsx** (optional)
   - Add supplier scrape status indicator
   - Show last scrape result details

## Implementation Order

1. Add supplier configuration object with patterns
2. Fix AU filter logic (skip for non-.com.au Australian companies)
3. Add root domain mapping for sub-brand suppliers
4. Enhance URL filtering with supplier-specific patterns
5. Add crawl fallback for blocked sites
6. Improve HTML extraction patterns
7. Add better logging for debugging
8. Test each supplier individually

## Expected Results After Fix

| Supplier | Before | After |
|----------|--------|-------|
| Caesarstone | 102 products | ~102 products (no change) |
| Polytec | 214 products | ~200+ products (working) |
| Nikpol | 98 products | ~100+ products (working) |
| Laminex | 8 products | ~150+ products |
| ForestOne | 0 products | ~50+ products |
| Designerone | 0 products | ~30+ products |
| Essastone | 0 products | ~40+ products |
| Hafele | 0 products | ~100+ products (with crawl fallback) |
| Dekton | 0 products | ~50+ products |
| Silestone | 0 products | ~50+ products |

## Critical Files for Implementation

- `supabase/functions/scrape-supplier-catalog/index.ts` - Core scraper logic with all fixes
- `src/pages/AdminPage.tsx` - Optional status indicators
- `src/types/board.ts` - Types if adding scrape config table
