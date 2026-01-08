import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  name: string;
  image_url: string;
  color?: string;
  material?: string;
  finish_type?: string;
  hex_color?: string;
  range_name?: string;
  source_url: string;
  sku?: string;
  product_type?: string;
  thickness?: string;
  usage_types?: string[];
}

// Sub-brand configuration for suppliers with multiple product lines
interface SubBrandConfig {
  urlPattern: RegExp;
  namePattern?: RegExp;
  product_type: string;
  usage_types: string[];
  thickness?: string;
}

// Supplier-specific configuration
interface SupplierConfig {
  productUrlPatterns?: RegExp[];
  excludeUrlPatterns?: RegExp[];
  skipAuFilter?: boolean;
  mapFromRoot?: boolean;
  rootDomain?: string;
  useCrawlFallback?: boolean;
  imageSelectors?: string[];
  subBrands?: Record<string, SubBrandConfig>;
  seedUrls?: string[];  // Fallback URLs to scrape when no product URLs found
  subBrandExcludePatterns?: RegExp[];  // Extra patterns to exclude for sub-brands
  requireBrandInUrl?: boolean;  // For sub-brands: require the brand name to appear in URL
}

const SUPPLIER_CONFIGS: Record<string, SupplierConfig> = {
  'polytec': {
    productUrlPatterns: [/\/colours\//, /\/decors?\//, /\/ravine\//, /\/melamine\//, /\/laminate\//],
    excludeUrlPatterns: [/\/stockists/, /\/contact/, /\/news/, /\/sustainability/, /\/moodboard/, /\/sample/],
  },
  'laminex': {
    productUrlPatterns: [/\/products\/.*\/colours/, /\/decorative-surfaces/, /\/colours\//, /\/benchtops\//, /\/essastone\//, /\/minerals\//],
    excludeUrlPatterns: [/\/location\//, /\/find-a-retailer/, /\/contact/, /\/sustainability/, /\/inspirations\//, /\/sample/],
    mapFromRoot: false,
  },
  'essastone': {
    mapFromRoot: true,
    rootDomain: 'https://www.laminex.com.au',
    productUrlPatterns: [
      /\/products\/benchtops\/essastone/,
      /\/essastone\/colours/i,
      /\/essastone\/collection/i,
      /brand=essastone/i,
      /\bessastone\b.*colour/i,
    ],
    excludeUrlPatterns: [
      /\/article\//,
      /\/news\//,
      /\/insights\//,
      /\/blog\//,
      /\/inspiration\//,
      /\/case-study\//,
      /\/sustainability\//,
      // CRITICAL: Exclude generic Laminex browse pages that don't have brand filter
      /\/browse\/product-type$/,
      /\/browse\/colour-texture$/,  
      /\/browse\/product-application$/,
      /\/next-generation-woodgrains/,
      /\/laminex-readyfit-benchtops/,
      /\/brands\/laminex\//,
    ],
    subBrandExcludePatterns: [
      /\/article\//,
      /\/news\//,
      /\/insights\//,
      /\/blog\//,
      // For sub-brands, require "essastone" to appear somewhere in the URL
    ],
    skipAuFilter: true,
    seedUrls: [
      '/products/benchtops/essastone',
    ],
    // Special flag: for sub-brand filtering, require brand name in URL
    requireBrandInUrl: true,
  },
  'forestone': {
    skipAuFilter: true,
    productUrlPatterns: [/\/products\//, /\/our-brands\//, /\/egger\//, /\/meganite\//, /\/range\//, /\/designer-ply\//, /\/antegra\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/sustainability/, /\/flooring\//, /\/structural\//, /\/marine\//],
    subBrands: {
      'meganite': {
        urlPattern: /meganite/i,
        namePattern: /meganite/i,
        product_type: 'solid_surface',
        usage_types: ['bench_tops'],
        thickness: '12mm',
      },
      'egger': {
        urlPattern: /egger|eurodekor|perfectsense/i,
        namePattern: /^[UH]\d{3,4}|EPD|EHD|ST\d{2}/,
        product_type: 'board',
        usage_types: ['doors', 'panels'],
        thickness: '18mm',
      },
      'designer-ply': {
        urlPattern: /designer-ply/i,
        namePattern: /ply|plywood/i,
        product_type: 'veneer',
        usage_types: ['doors', 'panels'],
      },
      'antegra': {
        urlPattern: /antegra/i,
        product_type: 'compact_laminate',
        usage_types: ['bench_tops', 'kicks'],
        thickness: '13mm',
      },
    },
  },
  'designerone': {
    skipAuFilter: true,
    productUrlPatterns: [/\/products\//, /\/colours\//, /\/range\//],
  },
'hafele': {
    useCrawlFallback: true,
    productUrlPatterns: [
      /\/products\/furniture-door-handles\//,
      /\/P-\d+/,  // Individual product pages like P-00875707
      /SearchParameter.*handles/i,  // Filtered category URLs
    ],
    excludeUrlPatterns: [
      /\/cart/i,
      /\/checkout/i,
      /\/account/i,
      /\/login/i,
      /\/register/i,
      /\/newsletter/i,
      /\/contact/i,
      /\/about/i,
      /\.pdf$/i,
      /\/service/i,
      /\/showroom/i,
      /\/information\//i,
      // Exclude non-handle product categories
      /\/products\/furniture-fittings\//i,
      /\/products\/cabinet-hardware\//i,
      /\/products\/kitchen\//i,
      /\/products\/sliding/i,
      /\/products\/drawer/i,
      /\/products\/wardrobe/i,
      /\/products\/lighting/i,
      /\/products\/bathroom/i,
      /\/products\/architectural/i,
    ],
    imageSelectors: ['img[data-src]', 'img.product-image', 'img.lazyload'],
    skipAuFilter: true,
    seedUrls: [
      '/en/products/furniture-door-handles/10/',
    ],
  },
  'caesarstone': {
    productUrlPatterns: [/\/colours\//, /\/color\//, /\/collection\//, /\/products\//, /\/quartz\//],
    excludeUrlPatterns: [/\/find-a-retailer/, /\/contact/, /\/blog/, /\/professional/],
  },
  'dekton': {
    productUrlPatterns: [/\/colours\//, /\/colors\//, /\/collection\//, /dekton.*colour/, /\/surfaces\//],
    excludeUrlPatterns: [/\/find-/, /\/contact/, /\/professional/],
    skipAuFilter: true,
  },
'silestone': {
    productUrlPatterns: [/\/colours\//, /\/colors\//, /\/collection\//, /silestone.*colour/, /\/quartz\//, /\/silestone\//],
    excludeUrlPatterns: [/\/find-/, /\/contact/, /\/professional/, /\/blog/, /\/news/],
    skipAuFilter: true,
    mapFromRoot: true,
    rootDomain: 'https://www.cosentino.com',
    seedUrls: ['/en-au/silestone/colours/'],
  },
  'nikpol': {
    productUrlPatterns: [/\/product\//, /\/feelwood\//, /\/laminate\//, /\/board\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/news/],
  },
  'egger': {
    skipAuFilter: true,
    productUrlPatterns: [/\/decor\//, /\/products\//, /\/eurodekor\//, /\/perfectsense\//],
    excludeUrlPatterns: [/\/contact/, /\/company/, /\/career/],
  },
  // NEW SUPPLIER CONFIGS
'smartstone': {
    productUrlPatterns: [/\/stones\//, /\/colours\//, /\/collection\//, /\/quartz\//, /\/range\//, /\/category\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/blog/, /\/inspiration/, /\/favourites/, /\/find-/, /\/professional/, /\/showrooms\//, /\/information\//],
    skipAuFilter: true,
    useCrawlFallback: true,  // Nuxt.js SPA needs crawl
    seedUrls: ['/stones/', '/category/deluxe-price-range/', '/category/classic-price-range/', '/category/pure-price-range/'],
  },
  'navurban': {
    productUrlPatterns: [/\/navurban\//, /\/product\//, /\/colours\//, /\/range\//, /\/timber\//, /\/veneers\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/cart/, /\/checkout/, /\/blog/],
    skipAuFilter: true,  // newageveneer.com.au is Australian
    seedUrls: ['/navurban/'],  // Single-page catalog with all 33 products
  },
  'lithostone': {
    productUrlPatterns: [/\/lithostone\//, /\/compac\//, /\/sintered-stone\//, /\/colours\//, /\/quartz\//, /\/collection\//, /\/range\//, /\/product\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/blog/, /\/safety-facts/, /\/gallery\//, /\/care-and-maintenance/],
    skipAuFilter: true,  // lithostonequartzsurfaces.com.au
    seedUrls: ['/products/lithostone/', '/products/compac/', '/products/'],  // Main product pages
  },
  'ydl-stone': {
    productUrlPatterns: [
      /\/products\/mineral\//,
      /\/products\/porcelain\//,
      /\/products\/natural-stone\//,
      /\/products\/[^/]+\/[^/]+/,  // Product detail pages like /products/mineral/color-name
    ],
    excludeUrlPatterns: [
      /\/contact/i, /\/about/i, /\/blog/i, /\/news/i,
      /\/projects\/?$/i,  // Exclude /projects but not /products
      /\/care-maintenance/i,
      /\/request-sample/i,
      /\/make-a-booking/i,
      /\/sample-page/i,
      /\/showroom/i,
      /\/gallery/i,
      /^https:\/\/www\.ydlstone\.com\.au\/?$/,  // Exclude homepage
    ],
    skipAuFilter: true,
    seedUrls: ['/products/mineral/', '/products/porcelain/', '/products/natural-stone/'],
  },
  'ydl': {  // Alias for ydl-stone
    productUrlPatterns: [
      /\/products\/mineral\//,
      /\/products\/porcelain\//,
      /\/products\/natural-stone\//,
      /\/products\/[^/]+\/[^/]+/,
    ],
    excludeUrlPatterns: [
      /\/contact/i, /\/about/i, /\/blog/i, /\/news/i,
      /\/projects\/?$/i,
      /\/care-maintenance/i,
      /\/request-sample/i,
      /\/make-a-booking/i,
      /\/sample-page/i,
      /\/showroom/i,
      /\/gallery/i,
      /^https:\/\/www\.ydlstone\.com\.au\/?$/,
    ],
    skipAuFilter: true,
    seedUrls: ['/products/mineral/', '/products/porcelain/', '/products/natural-stone/'],
  },
  'lavistone': {
    productUrlPatterns: [/\/our-range\//, /\/product\//, /\/product-category\//, /\/quartz\//, /\/natural-stone\//, /\/gen-surface\//, /\/porcelain\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/cart/, /\/checkout/, /\/my-account/, /\/blog/],
    skipAuFilter: true,  // lavistone.com.au
    seedUrls: ['/our-range/', '/product-category/gen-surface/', '/product-category/natural-stone/', '/product-category/porcelain/'],
  },
  'quantum-quartz': {
    productUrlPatterns: [/\/colours\//, /\/collection\//, /\/quartz\//, /\/products\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/blog/],
  },
  'wk-stone': {
    productUrlPatterns: [/\/products\//, /\/colours\//, /\/range\//, /\/quartz\//],
    excludeUrlPatterns: [/\/contact/, /\/about/],
  },
};

// ============================================================================
// PRODUCT NAME VALIDATION - Filters out junk entries
// ============================================================================

function isValidProductName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  
  // Reject empty or extreme length names
  if (trimmedName.length < 2 || trimmedName.length > 100) return false;
  
  const invalidPatterns = [
    // Image filenames
    /\.jpg$/i, /\.jpeg$/i, /\.png$/i, /\.webp$/i, /\.gif$/i, /\.svg$/i,
    // URLs as names
    /^https?:\/\//i,
    // UI elements and buttons - EXPANDED
    /^(quick view|more info|add to|find out|view all|learn more|see more|click here|read more)/i,
    /^(download|upload|submit|cancel|close|open|back|next|previous|shop now)/i,
    /^(newsletter|print page|my account|sign in|sign up|log in|log out|register)/i,
    /^(share|email|print|copy link|bookmark|save|like|heart|favorite)/i,
    /^(zoom|expand|fullscreen|enlarge|magnify|lightbox)/i,
    /^(show more|show less|see all|view more|load more|expand all)/i,
    // Category/section labels (not products)
    /^(moodboard|sustainability|bathrooms|kitchens|laundry|outdoor|interior|exterior)$/i,
    /^(accents|minerals|woodgrains|whites|darks|neutrals|colours|colors|all colours)$/i,
    /^(featured|popular|new|trending|best seller|on sale|new arrival)$/i,
    // Navigation items
    /^(home|about|contact|menu|search|filter|sort|category|categories|browse)$/i,
    // Too generic
    /^(product|item|image|photo|picture|sample|swatch|view|details)$/i,
    // Promotional text
    /^(free|save|discount|offer|deal|limited|exclusive|special)/i,
    // Contains only numbers or special chars
    /^[\d\s\-_.]+$/,
    // Looks like a code without sufficient context (too short)
    /^[A-Z]{1,2}\d{1,2}$/,
    // Common junk patterns from scraping
    /^(loading|please wait|error|undefined|null|NaN)$/i,
    /^\d+x\d+$/i,  // Dimensions like "1200x800"
    /^(prev|next|left|right|up|down|arrow)$/i,
    // Common UI elements that Hafele and other sites show
    /^(add to cart|add to basket|buy now|order now|request quote)/i,
    /^(facebook|twitter|instagram|linkedin|youtube|pinterest|social)/i,
    /^(cookie|privacy|terms|conditions|policy|legal|copyright)/i,
    /^(footer|header|sidebar|menu|nav|navigation)$/i,
    
    // YouTube/video junk
    /^(full\s*screen|unavailable|watch\s*on\s*youtube|play\s*video)/i,
    /^[A-Z][a-z]+\s+(AU|US|UK|NZ)$/,  // "Laminex AU", "Brand UK" etc.
    
    // Browse/category labels specific to Laminex
    /^(browse\s*products|browse\s*by|view\s*range|our\s*range)/i,
    /^(whites?\s*&?\s*neutrals?|minerals?|woodgrains?|accents?|solids?)$/i,
    
    // Generic product TYPE names (categories, not colors)
    /^(adhesive|adhesives)$/i,
    /^(aquapanel|aquapanel\s*sheets?)$/i,
    /^(architectural\s*panels?)$/i,
    /^(cabinetry\s*panels?)$/i,
    /^(compact\s*laminate)$/i,
    /^(composite\s*solid\s*surface)$/i,
    /^(craftwood)$/i,
    /^(decorated\s*mdf)$/i,
    /^(decorated\s*panels?)$/i,
    /^(decorated\s*particleboard)$/i,
    /^(easyfit\s*benchtop)$/i,
    /^(edging)$/i,
    /^(fireguard)$/i,
    /^(formica)$/i,
    /^(himacs)$/i,
    /^(laminate\s*hpl)$/i,
    /^(low\s*pressure\s*laminate)$/i,
    /^(mdf)$/i,
    /^(metaline)$/i,
    /^(particleboard)$/i,
    /^(plywood)$/i,
    /^(pvc\s*panels?)$/i,
    /^(raw\s*mdf)$/i,
    /^(sinks?|basins?)$/i,
    /^(wall\s*panels?)$/i,
    /^(white\s*board|whiteboard)$/i,
    /^(substrate)$/i,
    /^(flooring)$/i,
    /^(mouldings?)$/i,
    /^(sheets?)$/i,
    /^(panels?)$/i,
    /^(accessories)$/i,
    /^(benchtops?)$/i,
    
    // === NEW PATTERNS FOR JUNK CLEANUP ===
    
    // File name artifacts with underscores/dimensions
    /_CU_/,
    /_[Rr]ender/,
    /_landscape/i,
    /_Moodboard/i,
    /\d{3,}x\d{3,}/,  // Dimensions like 1920x1080
    /_$/,  // Trailing underscore
    
    // Promotional/marketing text
    /\bfind out more\b/i,
    /\bintroducing\b/i,
    /\btradehub\b/i,
    /\btrends\b/i,
    /\bpage media\b/i,
    /\brepresentative\b/i,
    /\bcustomer\b/i,
    /\binteriors addict\b/i,
    /\bkitchen designs?\b/i,
    /\bwarranty\b/i,
    /\bsustainability\b/i,
    /\bhomepage\b/i,
    /\bfinishes$/i,  // "Caesarstone finishes"
    /\blocations?\b/i,
    /\blogo\b/i,
    
    // Collection/marketing phrases
    /\bcollection\b.*\b(egger|meganite|flooring|decorative)\b/i,
    /\bresponsible specifier\b/i,
    /\bsample sheet\b/i,
    /\bcollectin\b/i,  // Typo variant
    /\bminerals and metallics kitchen\b/i,
    
    // Product category descriptors (too generic)
    /\bsheets and mouldings\b/i,
    /\bpanels and tiles\b/i,
    /\bpanels and boards\b/i,
    /^decorated (panel|particleboard|mdf)/i,
    /^(laminex|formica)\s+(compact laminate|laminate|decorated)/i,
    /\blaminate \(hpl\)/i,
    /\breadyfit benchtops?\b/i,
    /^bathroom with\b/i,
    
    // Brand-only names (not actual products)
    /^(laminex|caesarstone|polytec|cosentino|formica)$/i,
    
    // Image descriptions
    /\bimage\s*of\b.*\bin\b/i,
  ];
  
  // Also reject if it looks like a generic category name
  if (isGenericCategoryName(trimmedName)) {
    return false;
  }
  
  return !invalidPatterns.some(p => p.test(trimmedName));
}

// Detect generic category/product type names that aren't actual color/product names
function isGenericCategoryName(name: string): boolean {
  const lowerName = name.toLowerCase().trim();
  
  const genericCategoryNames = [
    'adhesive', 'adhesives', 'aquapanel', 'architectural panels', 'cabinetry panel',
    'compact laminate', 'composite solid surface', 'craftwood', 
    'decorated mdf', 'decorated panel', 'decorated particleboard',
    'easyfit benchtop', 'edging', 'fireguard', 'formica',
    'himacs', 'laminate hpl', 'low pressure laminate', 'mdf',
    'metaline', 'particleboard', 'plywood', 'pvc panels', 'raw mdf',
    'sinks', 'basins', 'wall panel', 'white board', 'whiteboard',
    'substrate', 'flooring', 'mouldings', 'sheets', 'panels',
    'accessories', 'benchtops', 'splashbacks', 'doors', 'carcass',
    // Laminex-specific product types that appear as "names"
    'readyfit benchtops', 'laminex readyfit', 'next generation woodgrains',
    'product type', 'product application', 'colour texture',
    // Additional category names from junk analysis
    'accents', 'minerals', 'woodgrains', 'solids', 'collections',
    'bathrooms', 'kitchens', 'downloads', 'blog', 'facades',
    'exteriors', 'interiors', 'whites', 'neutrals', 'whites & neutrals',
    'colours', 'colors', 'finishes',
  ];
  
  // Exact match
  if (genericCategoryNames.includes(lowerName)) {
    return true;
  }
  
  // Check if name is just a product type with no color qualifier
  // e.g. "Laminate HPL" is generic, "White Oak Laminate" is not
  for (const category of genericCategoryNames) {
    if (lowerName === category || lowerName === category + 's') {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// ERROR PAGE DETECTION - Skip 404s and maintenance pages
// ============================================================================

function isErrorPage(html: string): { isError: boolean; reason: string } {
  // Common error page patterns - must be SPECIFIC to avoid false positives
  const errorPatterns = [
    { pattern: /class="[^"]*page-?not-?found[^"]*"/i, reason: 'Page not found (404)' },
    { pattern: /class="[^"]*error-?page[^"]*"/i, reason: 'Error page detected' },
    { pattern: /class="[^"]*error-?404[^"]*"/i, reason: 'Error 404 page' },
    { pattern: /taken a wrong turn/i, reason: 'Wrong turn page (Smartstone)' },
    { pattern: /requested page cannot be found/i, reason: 'Requested page not found' },
    { pattern: /<title>[^<]*(?:404|not found|page error)[^<]*<\/title>/i, reason: '404 title detected' },
    { pattern: /<body[^>]*class="[^"]*error404[^"]*"/i, reason: 'WordPress error404 body class' },
    // Very specific maintenance page patterns (NOT general product pages mentioning maintenance)
    { pattern: /<h1[^>]*>.*(?:under maintenance|site maintenance|scheduled maintenance).*<\/h1>/i, reason: 'Maintenance page' },
    { pattern: /class="[^"]*maintenance-page[^"]*"/i, reason: 'Maintenance page class' },
  ];
  
  for (const { pattern, reason } of errorPatterns) {
    if (pattern.test(html)) {
      return { isError: true, reason };
    }
  }
  
  // Check if page has very little content (likely an error page)
  // But be more generous - 100 chars is enough for small error pages
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (textContent.length < 100) {
    return { isError: true, reason: 'Page has very little content' };
  }
  
  return { isError: false, reason: '' };
}

// ============================================================================
// MATERIAL DETECTION FROM PRODUCT NAME
// ============================================================================

function detectMaterialFromName(name: string): string | null {
  const lowerName = name.toLowerCase();
  
  // Timber/Wood species
  if (/\b(oak|walnut|birch|beech|ash|elm|maple|cherry|pine|cedar|teak|mahogany|hoop\s*pine)\b/.test(lowerName)) {
    return 'Timber';
  }
  
  // Stone types
  if (/\b(marble|granite|quartz|onyx|travertine|slate|limestone|calacatta|carrara|statuario)\b/.test(lowerName)) {
    return 'Stone';
  }
  
  // Concrete
  if (/\b(concrete|cement|terrazzo)\b/.test(lowerName)) {
    return 'Concrete';
  }
  
  // Laminate
  if (/\b(laminate|hpl|melamine|formica)\b/.test(lowerName)) {
    return 'Laminate';
  }
  
  // Veneer
  if (/\b(veneer)\b/.test(lowerName)) {
    return 'Veneer';
  }
  
  // Solid Surface
  if (/\b(acrylic|solid\s*surface|corian|meganite|hi-macs|staron)\b/.test(lowerName)) {
    return 'Solid Surface';
  }
  
  // Metal
  if (/\b(steel|aluminium|aluminum|copper|brass|bronze|metal|stainless|brushed\s*metal)\b/.test(lowerName)) {
    return 'Metal';
  }
  
  return null;
}

// ============================================================================
// ENHANCED PRODUCT CLASSIFICATION
// ============================================================================

function detectProductClassification(
  pageUrl: string, 
  productName: string, 
  supplier: { name: string; slug: string; category: string | null }
): { product_type: string; thickness: string | null; usage_types: string[] } {
  const lowerUrl = pageUrl.toLowerCase();
  const lowerName = productName.toLowerCase();
  const supplierSlug = supplier.slug?.toLowerCase() || '';
  const supplierName = supplier.name?.toLowerCase() || '';

  // Get supplier config
  const config = SUPPLIER_CONFIGS[supplierSlug];

  // Step 1: Check for sub-brand matches first (most specific)
  if (config?.subBrands) {
    for (const [, brandConfig] of Object.entries(config.subBrands)) {
      const urlMatch = brandConfig.urlPattern.test(lowerUrl);
      const nameMatch = brandConfig.namePattern ? brandConfig.namePattern.test(productName) : false;
      
      if (urlMatch || nameMatch) {
        return {
          product_type: brandConfig.product_type,
          thickness: brandConfig.thickness || null,
          usage_types: brandConfig.usage_types,
        };
      }
    }
  }

  // Step 2: Product name-based classification (high priority)
  
  // Plywood/Ply detection - always carcass
  if (/\b(plywood|hoop\s*pine\s*ply|birch\s*ply|marine\s*ply)\b/.test(lowerName)) {
    return { product_type: 'board', thickness: '18mm', usage_types: ['carcass'] };
  }
  
  // EGGER code detection (e.g., U999, H1234, EPD, EHD, ST19)
  if (/^[UH]\d{3,4}/.test(productName) || /\bEPD\b|\bEHD\b|\bST\d{2}\b/.test(productName)) {
    return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
  }
  
  // Solid surface keywords
  if (/\b(solid\s*surface|acrylic\s*surface|corian|meganite|hi-macs|staron)\b/.test(lowerName)) {
    return { product_type: 'solid_surface', thickness: '12mm', usage_types: ['bench_tops'] };
  }
  
  // Compact laminate keywords
  if (/\b(compact\s*laminate|hpl|high\s*pressure\s*laminate)\b/.test(lowerName)) {
    return { product_type: 'compact_laminate', thickness: '13mm', usage_types: ['bench_tops', 'kicks'] };
  }
  
  // Veneer keywords
  if (/\b(veneer|natural\s*veneer|timber\s*veneer|reconstituted\s*veneer)\b/.test(lowerName)) {
    return { product_type: 'veneer', thickness: null, usage_types: ['doors', 'panels'] };
  }
  
  // Engineered stone keywords
  if (/\b(quartz|engineered\s*stone)\b/.test(lowerName)) {
    return { product_type: 'engineered_stone', thickness: '20mm', usage_types: ['bench_tops'] };
  }

  // Step 3: Supplier-specific classification

  // Polytec detection
  if (supplierSlug === 'polytec' || supplierName.includes('polytec')) {
    if (lowerUrl.includes('18mm') || lowerUrl.includes('18-mm')) {
      return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
    }
    if (lowerUrl.includes('16mm') || lowerUrl.includes('16-mm')) {
      return { product_type: 'board', thickness: '16mm', usage_types: ['doors'] };
    }
    if (lowerUrl.includes('commercial') || lowerUrl.includes('laminate')) {
      return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops', 'kicks'] };
    }
    if (lowerUrl.includes('carcass')) {
      return { product_type: 'board', thickness: '16mm', usage_types: ['carcass'] };
    }
    // Default for Polytec - decorative boards
    if (/ravine|woodmatt|natural\s*oak|prime\s*oak|legato|ultraglaze|createc/.test(lowerName)) {
      return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
    }
  }

  // Laminex detection
  if (supplierSlug === 'laminex' || supplierName.includes('laminex')) {
    if (lowerUrl.includes('essastone') || lowerUrl.includes('minerals')) {
      return { product_type: 'engineered_stone', thickness: '20mm', usage_types: ['bench_tops'] };
    }
    if (lowerUrl.includes('benchtop') || lowerUrl.includes('compact')) {
      return { product_type: 'compact_laminate', thickness: null, usage_types: ['bench_tops'] };
    }
    if (lowerUrl.includes('laminate') && !lowerUrl.includes('board')) {
      return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops', 'kicks'] };
    }
    if (lowerUrl.includes('18mm')) {
      return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
    }
    if (lowerUrl.includes('16mm')) {
      return { product_type: 'board', thickness: '16mm', usage_types: ['doors'] };
    }
  }

  // Essastone detection
  if (supplierSlug === 'essastone' || lowerUrl.includes('essastone')) {
    return { product_type: 'engineered_stone', thickness: '20mm', usage_types: ['bench_tops'] };
  }

  // ForestOne / EGGER detection
  if (supplierSlug === 'forestone' || supplierSlug === 'egger' || 
      supplierName.includes('forest') || supplierName.includes('egger')) {
    if (lowerName.includes('meganite') || lowerUrl.includes('solid-surface') || lowerUrl.includes('meganite')) {
      return { product_type: 'solid_surface', thickness: '12mm', usage_types: ['bench_tops'] };
    }
    if (lowerUrl.includes('laminate') || lowerUrl.includes('hpl')) {
      return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops', 'kicks'] };
    }
    if (lowerUrl.includes('compact')) {
      return { product_type: 'compact_laminate', thickness: '13mm', usage_types: ['bench_tops'] };
    }
    if (lowerUrl.includes('veneer') || lowerUrl.includes('designer-ply')) {
      return { product_type: 'veneer', thickness: null, usage_types: ['doors', 'panels'] };
    }
    if (lowerUrl.includes('eurodekor') || lowerUrl.includes('perfectsense') || lowerUrl.includes('board')) {
      return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
    }
  }

  // Nikpol detection
  if (supplierSlug === 'nikpol' || supplierName.includes('nikpol')) {
    if (lowerUrl.includes('laminate')) {
      return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops', 'kicks'] };
    }
    if (lowerUrl.includes('feelwood') || lowerUrl.includes('board')) {
      return { product_type: 'board', thickness: '18mm', usage_types: ['doors'] };
    }
  }

  // Stone/quartz suppliers - bench tops only
  if (supplierSlug === 'caesarstone') {
    return { product_type: 'engineered_stone', thickness: '20mm', usage_types: ['bench_tops'] };
  }
  if (supplierSlug === 'dekton') {
    return { product_type: 'ultra_compact', thickness: '12mm', usage_types: ['bench_tops', 'splashbacks'] };
  }
  if (supplierSlug === 'silestone') {
    return { product_type: 'quartz', thickness: '20mm', usage_types: ['bench_tops'] };
  }

  // Step 4: Material-based detection from product name
  const material = detectMaterialFromName(productName);
  if (material === 'Stone') {
    return { product_type: 'engineered_stone', thickness: '20mm', usage_types: ['bench_tops'] };
  }
  if (material === 'Timber') {
    return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
  }
  if (material === 'Laminate') {
    return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops', 'kicks'] };
  }
  if (material === 'Veneer') {
    return { product_type: 'veneer', thickness: null, usage_types: ['doors', 'panels'] };
  }
  if (material === 'Solid Surface') {
    return { product_type: 'solid_surface', thickness: '12mm', usage_types: ['bench_tops'] };
  }

  // Step 5: URL-based fallbacks
  if (/\/benchtop|\/bench-top|\/worktop/.test(lowerUrl)) {
    return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops'] };
  }
  if (/\/door|\/cabinet|\/panel/.test(lowerUrl)) {
    return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
  }
  if (/\/splashback|\/splash-back/.test(lowerUrl)) {
    return { product_type: 'laminate', thickness: null, usage_types: ['splashbacks'] };
  }
  if (/\/kick|\/plinth/.test(lowerUrl)) {
    return { product_type: 'laminate', thickness: null, usage_types: ['kicks'] };
  }
  if (/\/carcass/.test(lowerUrl)) {
    return { product_type: 'board', thickness: '16mm', usage_types: ['carcass'] };
  }

  // Step 6: Default based on supplier category
  if (supplier.category === 'bench_tops') {
    return { product_type: 'laminate', thickness: null, usage_types: ['bench_tops'] };
  }
  if (supplier.category === 'doors_panels') {
    return { product_type: 'board', thickness: '18mm', usage_types: ['doors', 'panels'] };
  }
  if (supplier.category === 'hardware') {
    return { product_type: 'hardware', thickness: null, usage_types: [] };
  }

  // Ultimate default - decorative board
  return { product_type: 'board', thickness: null, usage_types: ['doors'] };
}

// Australian domain patterns
const AUSTRALIAN_PATTERNS = [
  '.com.au',
  '.au/',
  '/en-au/',
  '/au/',
  '/australia/',
];

// Known Australian domains without .com.au
const KNOWN_AUSTRALIAN_DOMAINS = [
  'forest.one',
  'designerone.com',
  'polytec.com',
];

// Check if URL is Australian
function isAustralianUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Check standard patterns
  if (AUSTRALIAN_PATTERNS.some(pattern => lowerUrl.includes(pattern))) {
    return true;
  }
  
  // Check known Australian domains
  if (KNOWN_AUSTRALIAN_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return true;
  }
  
  return false;
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 2000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status >= 500 && attempt < maxRetries - 1) {
        const data = await response.json().catch(() => ({}));
        console.log(`Attempt ${attempt + 1} failed with 5xx, retrying...`, data);
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Attempt ${attempt + 1} failed with error: ${lastError.message}`);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Extract product info from HTML - enhanced for various suppliers
function extractProductsFromHtml(html: string, pageUrl: string, baseUrl: string, supplierSlug?: string): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  
  // Helper to add product with validation
  const addProduct = (name: string, imageUrl: string, extras: Partial<ScrapedProduct> = {}) => {
    const trimmedName = name.trim();
    if (!isValidProductName(trimmedName)) return;
    if (!imageUrl) return;
    
    // Resolve image URL
    let resolvedUrl = imageUrl;
    if (!resolvedUrl.startsWith('http')) {
      if (resolvedUrl.startsWith('//')) {
        resolvedUrl = 'https:' + resolvedUrl;
      } else if (resolvedUrl.startsWith('/')) {
        resolvedUrl = baseUrl + resolvedUrl;
      } else {
        resolvedUrl = baseUrl + '/' + resolvedUrl;
      }
    }
    
    // Skip non-image URLs
    if (resolvedUrl.includes('.svg') || resolvedUrl.includes('data:image')) return;
    if (resolvedUrl.includes('logo') || resolvedUrl.includes('icon') || resolvedUrl.includes('sprite')) return;
    
    products.push({
      name: trimmedName,
      image_url: resolvedUrl,
      color: trimmedName,
      source_url: pageUrl,
      ...extras,
    });
  };
  
  // Enhanced patterns for different supplier formats
  const imgPatterns = [
    // Standard img with alt
    /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    /<img[^>]+alt=["']([^"']+)["'][^>]*src=["']([^"']+)["']/gi,
    // Data-src for lazy loading
    /<img[^>]+data-src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    /<img[^>]+alt=["']([^"']+)["'][^>]*data-src=["']([^"']+)["']/gi,
    // Srcset patterns
    /<img[^>]+srcset=["']([^"'\s]+)[^"']*["'][^>]*alt=["']([^"']+)["']/gi,
    // Picture source patterns
    /<source[^>]+srcset=["']([^"'\s]+)[^"']*["'][^>]*>[^<]*<img[^>]*alt=["']([^"']+)["']/gi,
    // Next.js / Nuxt lazy loading patterns
    /<img[^>]+(?:data-nimg|data-nuxt-img)[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    /<img[^>]+alt=["']([^"']+)["'][^>]*(?:data-nimg|data-nuxt-img)[^>]*src=["']([^"']+)["']/gi,
  ];
  
  // Cosentino-specific patterns (Dekton, Silestone) - CDN images
  if (supplierSlug === 'dekton' || supplierSlug === 'silestone') {
    // Pattern for Cosentino CDN images
    const cosentinoCdnPattern = /<img[^>]+src=["'](https:\/\/(?:assetstools|assets)\.cosentino\.com[^"']+)["'][^>]*(?:alt=["']([^"']+)["'])?/gi;
    for (const match of html.matchAll(cosentinoCdnPattern)) {
      if (match[1]) {
        const altText = match[2] || '';
        if (altText && altText.length > 2 && altText.length < 80) {
          addProduct(altText, match[1]);
        }
      }
    }
    
    // Cosentino data-lazy-src pattern (used in colour grid)
    const dataLazySrcPattern = /<img[^>]+data-lazy-src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi;
    for (const match of html.matchAll(dataLazySrcPattern)) {
      if (match[1] && match[2] && match[2].length > 2 && match[2].length < 80) {
        addProduct(match[2], match[1]);
      }
    }
    
    // Cosentino inspiration class pattern
    const inspirationPattern = /<div[^>]*class="[^"]*inspiration[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:data-lazy-src|src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi;
    for (const match of html.matchAll(inspirationPattern)) {
      if (match[1] && match[2] && match[2].length > 2 && match[2].length < 80) {
        addProduct(match[2], match[1]);
      }
    }
    
    // Cosentino colour/color card with title div
    const titleCardPattern = /<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{2,60})<\/div>[\s\S]*?<img[^>]+(?:src|data-lazy-src)=["']([^"']+)["']/gi;
    for (const match of html.matchAll(titleCardPattern)) {
      if (match[1] && match[2]) {
        addProduct(match[1], match[2]);
      }
    }
    
    // Reverse pattern: img before title
    const imgBeforeTitlePattern = /<img[^>]+(?:src|data-lazy-src)=["']([^"']+)["'][^>]*>[\s\S]*?<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{2,60})<\/div>/gi;
    for (const match of html.matchAll(imgBeforeTitlePattern)) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
    
    // Markdown-style images (for sites that return markdown-like content)
    const markdownImages = html.matchAll(/!\[([^\]]+)\]\((https:\/\/[^)]+)\)/g);
    for (const match of markdownImages) {
      if (match[1] && match[2]) {
        addProduct(match[1], match[2]);
      }
    }
    
    // Product cards with colour/color class
    const colourCards = html.matchAll(/<div[^>]*class="[^"]*(?:colour|color|swatch|product-card|product-item)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<(?:span|p|h[2-6]|div)[^>]*>([^<]{2,60})</gi);
    for (const match of colourCards) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
    
    // Structured product data
    const productDataMatches = html.matchAll(/data-product[^=]*=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/gi);
    for (const match of productDataMatches) {
      if (match[1] && match[2]) {
        try {
          const productData = JSON.parse(decodeURIComponent(match[1]));
          if (productData.name) {
            addProduct(productData.name, match[2]);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
  
  // Caesarstone patterns
  if (supplierSlug === 'caesarstone') {
    const caesarstonePatterns = [
      /<div[^>]*class="[^"]*(?:colour|color|product|swatch)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<(?:span|p|h[2-6])[^>]*>([^<]{2,60})</gi,
      /<a[^>]*href="[^"]*colour[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    ];
    for (const pattern of caesarstonePatterns) {
      for (const match of html.matchAll(pattern)) {
        if (match[1] && match[2]) {
          addProduct(match[2], match[1]);
        }
      }
    }
  }
  
  // Smartstone patterns (modern Next.js site)
  if (supplierSlug === 'smartstone') {
    const smartstonePatterns = [
      /<div[^>]*class="[^"]*(?:stone|colour|product|swatch|card)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src|srcset)=["']([^"'\s]+)[^"']*["'][^>]*(?:alt=["']([^"']+)["'])?/gi,
      /<a[^>]*href="[^"]*(?:stone|colour)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
      /<img[^>]+(?:data-nimg)[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    ];
    for (const pattern of smartstonePatterns) {
      for (const match of html.matchAll(pattern)) {
        if (match[1] && match[2]) {
          addProduct(match[2], match[1]);
        }
      }
    }
  }
  
  // Hafele hardware patterns
  if (supplierSlug === 'hafele') {
    const productCards = html.matchAll(/<div[^>]*class="[^"]*(?:product|item|handle|hardware)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>[\s\S]*?<(?:h[2-4]|span|div|a)[^>]*(?:class="[^"]*(?:name|title|product-name)[^"]*")?[^>]*>([^<]{3,80})</gi);
    for (const match of productCards) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
    
    // Also try anchor-based product links
    const productLinks = html.matchAll(/<a[^>]*href="[^"]*(?:product|handle|knob)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<[^>]*>([^<]{3,80})</gi);
    for (const match of productLinks) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
  }
  
  // Polytec/Laminex/Nikpol pattern - colour swatches
  if (supplierSlug === 'polytec' || supplierSlug === 'laminex' || supplierSlug === 'nikpol' || supplierSlug === 'essastone') {
    const swatchPatterns = [
      /<div[^>]*class="[^"]*(?:swatch|colour|decor|product|colour-item|color-item)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?(?:<span|<p|<h|<div)[^>]*>([^<]+)</gi,
      /<a[^>]*class="[^"]*(?:colour|color|swatch)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
      /<li[^>]*class="[^"]*(?:colour|color|decor)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<[^>]*>([^<]+)</gi,
    ];
    
    for (const swatchPattern of swatchPatterns) {
      const swatches = html.matchAll(swatchPattern);
      for (const match of swatches) {
        if (match[1] && match[2] && match[2].trim().length > 2 && match[2].trim().length < 80) {
          addProduct(match[2], match[1]);
        }
      }
    }
  }
  
  // ForestOne / EGGER patterns
  if (supplierSlug === 'forestone' || supplierSlug === 'egger' || supplierSlug === 'designerone') {
    const brandPatterns = [
      /<div[^>]*class="[^"]*(?:decor|product|range-item|brand-item)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<[^>]*>([^<]+)</gi,
      /<article[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    ];
    
    for (const pattern of brandPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          addProduct(match[2], match[1]);
        }
      }
    }
  }
  
  // Navurban patterns - unique single-page catalog with background images
  if (supplierSlug === 'navurban') {
    // Pattern 1: div.sample with background-image and h3.product-title
    const navurbanSamplePattern = /<div[^>]*id="([^"]+)"[^>]*class="[^"]*sample[^"]*"[^>]*>[\s\S]*?style="background-image:\s*url\(([^)]+)\)"[\s\S]*?<(?:h3|p)[^>]*class="[^"]*product-title[^"]*"[^>]*>\s*([^<]+)/gi;
    for (const match of html.matchAll(navurbanSamplePattern)) {
      const imageUrl = match[2].replace(/['"]/g, '');
      const name = match[3].trim();
      if (imageUrl && name && !name.includes('NAVURBAN')) {
        addProduct(name, imageUrl);
      }
    }
    
    // Pattern 2: data-main-image attribute with product-title
    const dataImagePattern = /data-main-image="([^"]+)"[\s\S]*?<(?:h3|p)[^>]*class="[^"]*product-title[^"]*"[^>]*>\s*([^<]+)/gi;
    for (const match of html.matchAll(dataImagePattern)) {
      const name = match[2].trim();
      if (match[1] && name && !name.includes('NAVURBAN')) {
        addProduct(name, match[1]);
      }
    }
  }
  
  // Lavistone WooCommerce/Elementor patterns
  if (supplierSlug === 'lavistone') {
    // Pattern 1: uc_post_grid_style_one_item with img and uc_title
    const lavistonPattern = /<div[^>]*class="[^"]*uc_post_grid_style_one_item[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<div[^>]*class="[^"]*uc_title[^"]*"[^>]*>\s*<a[^>]*>([^<]+)/gi;
    for (const match of html.matchAll(lavistonPattern)) {
      const imageUrl = match[1];
      const name = match[3]?.trim() || match[2]?.trim();
      if (imageUrl && name) {
        addProduct(name, imageUrl);
      }
    }
    
    // Pattern 2: Fallback to simpler WooCommerce product structure
    const wooPattern = /<div[^>]*class="[^"]*uc_post_image[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/gi;
    for (const match of html.matchAll(wooPattern)) {
      if (match[1] && match[2]) {
        // Clean up alt text which often contains "Lavistone Natural Stone" suffix
        let name = match[2].replace(/\s*Lavistone\s*Natural\s*Stone\s*\d*/gi, '').trim();
        if (name) {
          addProduct(name, match[1]);
        }
      }
    }
  }
  
  // Stone supplier patterns (Lithostone, YDL, Quantum Quartz, WK Stone)
  if (['lithostone', 'ydl', 'quantum-quartz', 'wk-stone'].includes(supplierSlug || '')) {
    const stonePatterns = [
      /<div[^>]*class="[^"]*(?:product|colour|stone|quartz|swatch|collection)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*(?:alt=["']([^"']+)["'])?[\s\S]*?<(?:h[2-6]|span|p|div)[^>]*>([^<]{2,60})</gi,
      /<a[^>]*href="[^"]*(?:product|colour|stone)[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
      /<figure[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
      // WPBakery/Visual Composer pattern (used by Lithostone)
      /<figure[^>]*class="[^"]*vc_figure[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*title="([^"]+)"/gi,
    ];
    for (const pattern of stonePatterns) {
      for (const match of html.matchAll(pattern)) {
        const name = match[3] || match[2];
        const imageUrl = match[1];
        if (imageUrl && name) {
          addProduct(name, imageUrl);
        }
      }
    }
  }
  
  // Background images in inline styles (for some modern sites)
  const bgImagePattern = /style="[^"]*background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)[^"]*"[^>]*>[\s\S]*?<[^>]*(?:class="[^"]*(?:name|title)[^"]*")?[^>]*>([^<]{2,60})</gi;
  for (const match of html.matchAll(bgImagePattern)) {
    if (match[1] && match[2]) {
      addProduct(match[2], match[1]);
    }
  }
  
  // Standard image extraction for any remaining products
  for (const pattern of imgPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      // Handle different match ordering
      let imageUrl: string;
      let altText: string;
      
      if (pattern.source.indexOf('src=') < pattern.source.indexOf('alt=')) {
        imageUrl = match[1];
        altText = match[2];
      } else {
        altText = match[1];
        imageUrl = match[2];
      }
      
      if (!imageUrl || !altText) continue;
      if (altText.length < 3 || altText.length > 100) continue;
      
      // Skip non-product alt text
      const skipWords = ['menu', 'navigation', 'banner', 'hero', 'slider', 'button', 'close', 'search', 'arrow', 'loading', 'placeholder', 'logo', 'icon'];
      if (skipWords.some(word => altText.toLowerCase().includes(word))) continue;
      
      const isProduct = 
        imageUrl.includes('product') || 
        imageUrl.includes('colour') ||
        imageUrl.includes('color') ||
        imageUrl.includes('swatch') ||
        imageUrl.includes('decor') ||
        imageUrl.includes('laminate') ||
        imageUrl.includes('timber') ||
        imageUrl.includes('veneer') ||
        imageUrl.includes('stone') ||
        imageUrl.includes('quartz') ||
        imageUrl.includes('surface') ||
        imageUrl.includes('handle') ||
        imageUrl.includes('hardware') ||
        /\d{3,}/.test(imageUrl) ||
        /[A-Z]{2,}\d{3,}/.test(altText) || // SKU pattern
        altText.toLowerCase().includes('oak') ||
        altText.toLowerCase().includes('walnut') ||
        altText.toLowerCase().includes('white') ||
        altText.toLowerCase().includes('grey') ||
        altText.toLowerCase().includes('gray') ||
        altText.toLowerCase().includes('marble') ||
        altText.toLowerCase().includes('concrete') ||
        altText.toLowerCase().includes('calacatta') ||
        altText.toLowerCase().includes('carrara') ||
        altText.toLowerCase().includes('brushed') ||
        altText.toLowerCase().includes('matt') ||
        altText.toLowerCase().includes('gloss');
        
      if (!isProduct) continue;
      
      // Extract finish type from name
      let finishType: string | undefined;
      const finishPatterns = ['matt', 'matte', 'gloss', 'satin', 'textured', 'natural', 'polished', 'honed'];
      for (const finish of finishPatterns) {
        if (altText.toLowerCase().includes(finish)) {
          finishType = finish.charAt(0).toUpperCase() + finish.slice(1);
          break;
        }
      }
      
      // Try to extract hex color from nearby HTML
      const hexMatch = html.match(new RegExp(`${altText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^#]*#([0-9a-fA-F]{6})`));
      
      addProduct(altText, imageUrl, {
        hex_color: hexMatch ? `#${hexMatch[1]}` : undefined,
        finish_type: finishType,
      });
    }
  }
  
  // Deduplicate by name before returning
  const seen = new Set<string>();
  return products.filter(p => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Filter URLs to find product pages with supplier-specific configuration
function filterProductUrls(urls: string[], baseUrl: string, supplierSlug: string, requireAustralian: boolean = true): string[] {
  const config = SUPPLIER_CONFIGS[supplierSlug];
  
  const genericProductKeywords = [
    'product', 'colour', 'color', 'colours', 'colors', 'decor', 'range', 'collection',
    'laminate', 'veneer', 'timber', 'stone', 'surface', 'finish',
    'swatch', 'sample', 'melamine', 'compact', 'acrylic', 'benchtop',
    'door', 'panel', 'board', 'woodgrain', 'solid-colour', 'metallic',
    'handle', 'knob', 'pull', 'hardware', 'eurodekor', 'perfectsense',
    'meganite', 'egger', 'feelwood',
    // Additional keywords for stone suppliers
    'stone-benchtops', 'quartz-surfaces', 'sintered', 'engineered-stone',
    'calacatta', 'carrara', 'statuario', 'marble', 'granite', 'quartz',
    'navurban', 'silestone', 'dekton'
  ];
  
  const genericExcludeKeywords = [
    'blog', 'news', 'contact', 'about', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'support', 'career', 'job',
    'pdf', 'download', 'document', 'warranty', 'sustainability',
    'video', 'instagram', 'facebook', 'twitter', 'linkedin', 'youtube',
    'subscribe', 'newsletter', 'sitemap', 'search', 'account', 'location',
    'find-a-retailer', 'stockists', 'inspirations', 'professional',
    'favourites', 'favorites', 'wishlist', 'compare'
  ];
  
  return urls.filter(url => {
    const lowerUrl = url.toLowerCase();
    
    // Check Australian requirement (skip if supplier config says to)
    if (requireAustralian && !config?.skipAuFilter && !isAustralianUrl(url)) {
      if (!isAustralianUrl(baseUrl)) {
        return false;
      }
    }
    
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);
      // Allow same domain or subdomains
      const baseDomain = baseObj.hostname.replace('www.', '');
      const urlDomain = urlObj.hostname.replace('www.', '');
      if (!urlDomain.endsWith(baseDomain) && !baseDomain.endsWith(urlDomain)) {
        return false;
      }
    } catch {
      return false;
    }
    
    // Use supplier-specific patterns if available
    if (config) {
      // Check exclude patterns first
      if (config.excludeUrlPatterns?.some(p => p.test(lowerUrl))) {
        return false;
      }
      // Check include patterns
      if (config.productUrlPatterns?.some(p => p.test(lowerUrl))) {
        return true;
      }
    }
    
    // Generic filtering
    if (genericExcludeKeywords.some(kw => lowerUrl.includes(kw))) return false;
    if (genericProductKeywords.some(kw => lowerUrl.includes(kw))) return true;
    if (/\/[a-z]{2,3}\d{3,}/.test(lowerUrl)) return true;
    
    return false;
  });
}

// Crawl fallback when map returns no results
async function crawlFallback(url: string, firecrawlKey: string, limit: number = 100, maxDepth: number = 3): Promise<string[]> {
  console.log(`Using crawl fallback for ${url} (limit: ${limit}, depth: ${maxDepth})`);
  
  try {
    const crawlResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        limit,
        maxDepth,
        scrapeOptions: {
          formats: ['links'],
        },
      }),
    }, 2, 3000);
    
    const crawlData = await crawlResponse.json();
    
    if (crawlResponse.ok && crawlData.data) {
      const allLinks: string[] = [];
      for (const page of crawlData.data) {
        if (page.links && Array.isArray(page.links)) {
          allLinks.push(...page.links);
        }
        if (page.metadata?.sourceURL) {
          allLinks.push(page.metadata.sourceURL);
        }
      }
      console.log(`Crawl fallback found ${allLinks.length} URLs`);
      return [...new Set(allLinks)];
    }
    
    console.log('Crawl fallback failed:', crawlData.error || 'Unknown error');
    return [];
  } catch (error) {
    console.error('Crawl fallback error:', error);
    return [];
  }
}

// Link-scrape fallback: scrape a page and extract internal links when map/crawl fail
async function linkScrapeFallback(url: string, firecrawlKey: string, baseUrl: string): Promise<string[]> {
  console.log(`Using link-scrape fallback for ${url}`);
  
  try {
    const scrapeResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html', 'links'],
        onlyMainContent: false,
      }),
    }, 2, 3000);
    
    const scrapeData = await scrapeResponse.json();
    const links: string[] = [];
    
    if (scrapeResponse.ok && scrapeData.data) {
      // Get links directly from response
      if (scrapeData.data.links && Array.isArray(scrapeData.data.links)) {
        links.push(...scrapeData.data.links);
      }
      
      // Also extract links from HTML if available
      if (scrapeData.data.html) {
        const hrefPattern = /href=["']([^"']+)["']/gi;
        for (const match of scrapeData.data.html.matchAll(hrefPattern)) {
          const href = match[1];
          if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            // Resolve relative URLs
            if (href.startsWith('/')) {
              links.push(baseUrl + href);
            } else if (href.startsWith('http')) {
              links.push(href);
            }
          }
        }
      }
    }
    
    const uniqueLinks = [...new Set(links)];
    console.log(`Link-scrape fallback found ${uniqueLinks.length} URLs`);
    return uniqueLinks;
  } catch (error) {
    console.error('Link-scrape fallback error:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  let jobId: string | null = null;

  try {
    const { supplierId, url, options } = await req.json();

    if (!supplierId || !url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supplier ID and URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get supplier info
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();

    if (supplierError || !supplier) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supplier not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supplierSlug = supplier.slug?.toLowerCase() || '';
    const config = SUPPLIER_CONFIGS[supplierSlug] || {};

    // Create scrape job for progress tracking
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .insert({
        supplier_id: supplierId,
        status: 'mapping',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create job:', jobError);
    } else {
      jobId = job.id;
    }

    // Helper to update job progress
    const updateJob = async (updates: Record<string, any>) => {
      if (!jobId) return;
      await supabase
        .from('scrape_jobs')
        .update(updates)
        .eq('id', jobId);
    };

    // Parse base URL
    let baseUrl: string;
    try {
      const urlObj = new URL(url);
      baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      baseUrl = url;
    }

    // Determine URL to map (may be different for sub-brands)
    let urlToMap = url;
    if (config.mapFromRoot && config.rootDomain) {
      urlToMap = config.rootDomain;
      console.log(`Using root domain for mapping: ${urlToMap}`);
    }

    // Check if base URL is Australian
    const isAustraliaSite = isAustralianUrl(url) || config.skipAuFilter === true;
    console.log(`Starting catalog scrape for ${supplier.name} from ${url} (Australian: ${isAustraliaSite}, slug: ${supplierSlug})`);

    // Step 1: Map the entire website
    console.log('Step 1: Mapping website...');
    await updateJob({ status: 'mapping', current_url: urlToMap });
    
    let allUrls: string[] = [];
    
    try {
      const mapResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToMap,
          limit: options?.mapLimit || 3000,
          includeSubdomains: false,
        }),
      });

      const mapData = await mapResponse.json();
      
      if (mapResponse.ok && mapData.links && mapData.links.length > 0) {
        allUrls = mapData.links;
        console.log(`Found ${allUrls.length} total URLs on website`);
        await updateJob({ urls_mapped: allUrls.length });
      } else {
        console.error('Map failed or returned no URLs:', mapData);
        
        // Try crawl fallback if configured or if map returned nothing
        if (config.useCrawlFallback || allUrls.length === 0) {
          allUrls = await crawlFallback(url, firecrawlKey, 50);
          if (allUrls.length === 0) {
            allUrls = [url];
          }
        } else {
          allUrls = [url];
        }
        await updateJob({ urls_mapped: allUrls.length });
      }
    } catch (error) {
      console.error('Map request failed:', error);
      
      // Try crawl fallback
      if (config.useCrawlFallback) {
        allUrls = await crawlFallback(url, firecrawlKey, 50);
        if (allUrls.length === 0) {
          allUrls = [url];
        }
      } else {
        allUrls = [url];
      }
      await updateJob({ urls_mapped: allUrls.length });
    }

    // If we mapped from root domain for a sub-brand, filter to relevant URLs
    if (config.mapFromRoot && config.rootDomain) {
      const originalUrl = new URL(url);
      const pathPrefix = originalUrl.pathname;
      allUrls = allUrls.filter(u => {
        try {
          const parsed = new URL(u);
          // Apply sub-brand exclude patterns first
          if (config.subBrandExcludePatterns?.some(p => p.test(u))) {
            return false;
          }
          // Also apply regular exclude patterns
          if (config.excludeUrlPatterns?.some(p => p.test(u))) {
            return false;
          }
          
          // For sub-brands that require brand name in URL (e.g., essastone)
          // Only include URLs that explicitly contain the supplier slug
          if (config.requireBrandInUrl) {
            const urlLower = u.toLowerCase();
            if (!urlLower.includes(supplierSlug) && !urlLower.includes('brand=' + supplierSlug)) {
              return false;
            }
          }
          
          return parsed.pathname.startsWith(pathPrefix) || 
                 config.productUrlPatterns?.some(p => p.test(u));
        } catch {
          return false;
        }
      });
      console.log(`Filtered to ${allUrls.length} URLs for sub-brand path: ${pathPrefix}`);
    }

    // Step 2: Filter to product-related URLs
    const requireAustralian = !isAustraliaSite;
    let productUrls = filterProductUrls(allUrls, baseUrl, supplierSlug, requireAustralian);
    console.log(`Filtered to ${productUrls.length} product-related URLs (AU filter: ${requireAustralian})`);
    
    // Fallback: If no product URLs found, try link-scrape fallback
    if (productUrls.length === 0) {
      console.log('No product URLs found, trying link-scrape fallback...');
      const fallbackLinks = await linkScrapeFallback(url, firecrawlKey, baseUrl);
      if (fallbackLinks.length > 0) {
        productUrls = filterProductUrls(fallbackLinks, baseUrl, supplierSlug, requireAustralian);
        console.log(`Link-scrape fallback yielded ${productUrls.length} product URLs`);
      }
    }
    
    // For sub-brands with requireBrandInUrl, ALWAYS scrape the original URL first
    // since it likely contains all products filtered by brand (e.g., ?brand=Essastone)
    if (config.requireBrandInUrl) {
      console.log(`Sub-brand detected (${supplierSlug}), prioritizing original URL: ${url}`);
      // Filter productUrls to only those containing the brand name
      productUrls = productUrls.filter(u => {
        const urlLower = u.toLowerCase();
        return urlLower.includes(supplierSlug) || urlLower.includes('brand=' + supplierSlug);
      });
      console.log(`After brand filter: ${productUrls.length} URLs contain brand name`);
      
      // Always include the original URL at the beginning
      if (!productUrls.includes(url)) {
        productUrls.unshift(url);
      }
    }
    
    // Fallback: Use seedUrls if configured and still no product URLs
    if (productUrls.length === 0 && config.seedUrls && config.seedUrls.length > 0) {
      console.log(`Using seedUrls fallback: ${config.seedUrls.join(', ')}`);
      for (const seedPath of config.seedUrls) {
        const seedUrl = seedPath.startsWith('http') ? seedPath : baseUrl + seedPath;
        if (!productUrls.includes(seedUrl)) {
          productUrls.push(seedUrl);
        }
      }
    }
    
    // Ultimate fallback: scrape the original URL directly
    if (productUrls.length === 0) {
      console.log('No product URLs found, falling back to original URL');
      productUrls = [url];
    }
    
    const maxPages = options?.maxPages || 50;
    const urlsToScrape = productUrls.slice(0, maxPages);
    
    await updateJob({ 
      status: 'scraping', 
      urls_to_scrape: urlsToScrape.length,
      urls_mapped: allUrls.length
    });

    // Supplier-specific extraction prompts for better accuracy
    const SUPPLIER_PROMPTS: Record<string, string> = {
      'essastone': 'Extract all Essastone engineered stone colour swatches from this page. Look for colour/color cards with names like "Pure White", "Ash Grey", "Silver Pearl". Each should have a name and image URL.',
      'laminex': 'Extract all Laminex decor colours including laminate, Formica, and board colours. Look for colour swatches or product tiles.',
      'polytec': 'Extract all Polytec decor colours including Ravine, Woodmatt, and standard colours. Look for colour swatches or decor cards.',
      'smartstone': 'Extract all Smartstone engineered quartz stone colours from this page. Look in the Deluxe, Classic, and Pure price range categories. Each stone has a name (like "Athena", "Absolute Blanc", "Naxos") and a swatch/sample image. Return ALL colours visible.',
      'navurban': 'Extract all NAVURBAN timber veneer decors from this New Age Veneers page. There are 33 decors with species names like "Blackened American Oak", "Classic American Oak", "Scarborough", "Ironbark". Each has a product-title and a swatch image. Return ALL timber veneers.',
      'lavistone': 'Extract all Lavistone surface products from this WooCommerce product grid. Products include Gen Surface, Natural Stone, and Porcelain ranges. Each has a product code and name (like "LVNS1026 ARABESCATO VAGLI VERDE") and a product image. Return ALL products visible.',
      'lithostone': 'Extract all Lithostone quartz surface colours from this page. Products include Lithostone quartz and Compac ranges. Look for colour swatches with names like "Bianco", "Calacatta", "Carrara". Return ALL colours.',
      'ydl': 'Extract all YDL Stone surface colours from this page. Products include Mineral (silica-free), Porcelain, and Natural Stone ranges. Each colour has a name and product image. Return ALL colours visible.',
      'ydl-stone': 'Extract all YDL Stone surface colours from this page. Products include Mineral (silica-free), Porcelain, and Natural Stone ranges. Each colour has a name and product image. Return ALL colours visible.',
      'hafele': 'Extract all Hafele hardware products from this page including handles, knobs, pulls, and furniture fittings. Each product has a name (like "D Handle Matt Black 160mm") and a product image. Return ALL hardware products visible.',
      'silestone': 'Extract all Silestone quartz surface colours from this Cosentino page. Look for colour cards with titles like "Evergrey", "Misty Silver", "Eternal Calacatta Gold". Each has a colour image and name. Return ALL Silestone colours visible.',
      'caesarstone': 'Extract all Caesarstone quartz colours from this page. Look for colour swatches with names like "Pure White", "Calacatta Nuvo". Return ALL colours.',
      'dekton': 'Extract all Dekton ultra-compact surface colours from this page. Look for colour cards with names and swatch images.',
      'forestone': 'Extract all product colours including Meganite, Egger, and other brands.',
    };

    const extractionPrompt = SUPPLIER_PROMPTS[supplierSlug] || 
      `Extract all product colours, finishes, or stone colours from this ${supplier.name} catalogue page. Look for colour swatches, product tiles, colour cards, or sample images. Each product should have a name (the colour/finish name) and the image URL.`;

    // Step 3: Scrape each product page using JSON extraction (with HTML fallback)
    const allProducts: ScrapedProduct[] = [];
    const scrapedUrls: string[] = [];
    const failedUrls: string[] = [];
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const pageUrl = urlsToScrape[i];
      console.log(`Scraping (${i + 1}/${urlsToScrape.length}): ${pageUrl}`);
      
      await updateJob({
        current_url: pageUrl,
        pages_scraped: scrapedUrls.length,
        pages_failed: failedUrls.length,
        products_found: allProducts.length,
      });
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try JSON extraction first (more reliable with LLM understanding)
        console.log(`  Attempting JSON extraction...`);
        const jsonResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: pageUrl,
            formats: ['json'],
            jsonOptions: {
              schema: {
                type: 'object',
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Product or colour/color name' },
                        image_url: { type: 'string', description: 'URL of product image or swatch' },
                        color: { type: 'string', description: 'Color name if different from product name' },
                        material: { type: 'string', description: 'Material type (e.g., quartz, laminate, timber, stone)' },
                      },
                      required: ['name', 'image_url']
                    },
                    description: 'List of products/colours found on the page'
                  }
                },
                required: ['products']
              },
              prompt: extractionPrompt
            },
          }),
        }, 2, 3000);

        const jsonData = await jsonResponse.json();
        let extractedProducts: ScrapedProduct[] = [];
        
        if (jsonResponse.ok && jsonData.data?.json?.products) {
          const jsonProducts = jsonData.data.json.products;
          console.log(`  JSON extraction found ${jsonProducts.length} products`);
          
          for (const p of jsonProducts) {
            if (p.name && p.image_url) {
              // Resolve relative URLs
              let imageUrl = p.image_url;
              if (!imageUrl.startsWith('http')) {
                imageUrl = baseUrl + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
              }
              
              extractedProducts.push({
                name: p.name,
                image_url: imageUrl,
                color: p.color || p.name,
                material: p.material,
                source_url: pageUrl,
              });
            }
          }
        } else {
          console.log(`  JSON extraction failed or returned no products:`, jsonData.error || 'empty response');
        }
        
        // If JSON extraction returned few/no products, try HTML fallback
        if (extractedProducts.length < 3) {
          console.log(`  JSON found ${extractedProducts.length}, trying HTML fallback...`);
          
          const htmlResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: pageUrl,
              formats: ['html'],
              onlyMainContent: false,
            }),
          }, 2, 3000);

          const htmlData = await htmlResponse.json();
          
          if (htmlResponse.ok && htmlData.data?.html) {
            const html = htmlData.data.html;
            
            // Check if this is an error page
            const errorCheck = isErrorPage(html);
            if (errorCheck.isError) {
              console.log(`  Skipping error page ${pageUrl}: ${errorCheck.reason}`);
              failedUrls.push(pageUrl);
              continue;
            }
            
            const htmlProducts = extractProductsFromHtml(html, pageUrl, baseUrl, supplierSlug);
            console.log(`  HTML fallback found ${htmlProducts.length} products`);
            
            // Use HTML products if we got more than JSON
            if (htmlProducts.length > extractedProducts.length) {
              extractedProducts = htmlProducts;
            }
          }
        }
        
        if (extractedProducts.length > 0) {
          console.log(`  Final: ${extractedProducts.length} products from ${pageUrl}`);
          allProducts.push(...extractedProducts);
          scrapedUrls.push(pageUrl);
        } else {
          console.log(`  No products found on ${pageUrl}`);
          failedUrls.push(pageUrl);
        }
      } catch (error) {
        console.error(`  Error scraping ${pageUrl}:`, error);
        failedUrls.push(pageUrl);
      }
    }

    await updateJob({
      status: 'inserting',
      pages_scraped: scrapedUrls.length,
      pages_failed: failedUrls.length,
      products_found: allProducts.length,
      current_url: null,
    });

    // Step 4: Deduplicate and validate products by name (case-insensitive)
    const seenProducts = new Set<string>();
    const uniqueProducts = allProducts.filter(p => {
      // Apply validation filter
      if (!isValidProductName(p.name)) {
        console.log(`  Filtered out invalid product name: "${p.name}"`);
        return false;
      }
      
      // Supplier-specific product filtering
      if (supplier.slug === 'hafele') {
        const nameLower = p.name.toLowerCase();
        const isHandle = nameLower.includes('handle') || nameLower.includes('pull') || nameLower.includes('knob');
        if (!isHandle) {
          console.log(`  Filtered out non-handle Hafele product: "${p.name}"`);
          return false;
        }
      }
      
      const key = p.name.toLowerCase().trim();
      if (seenProducts.has(key)) return false;
      seenProducts.add(key);
      return true;
    });
    
    console.log(`Unique products after dedup: ${uniqueProducts.length}`);

    // Step 5: Upsert products into catalog_items (prevents duplicates by name per supplier)
    const insertedProducts: any[] = [];
    const insertLimit = options?.insertLimit || 500;
    
    for (const product of uniqueProducts.slice(0, insertLimit)) {
      try {
        // Detect product classification
        const classification = detectProductClassification(
          product.source_url,
          product.name,
          supplier
        );

        const { data, error } = await supabase
          .from('catalog_items')
          .upsert({
            supplier_id: supplierId,
            name: product.name,
            image_url: product.image_url,
            color: product.color,
            material: product.material,
            finish_type: product.finish_type,
            hex_color: product.hex_color,
            source_url: product.source_url,
            sku: product.sku,
            product_type: classification.product_type,
            thickness: classification.thickness,
            usage_types: classification.usage_types,
            is_active: true,
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: 'supplier_id,name',
            ignoreDuplicates: false,
          })
          .select()
          .single();

        if (!error && data) {
          insertedProducts.push(data);
          
          // Update progress every 10 inserts
          if (insertedProducts.length % 10 === 0) {
            await updateJob({ products_inserted: insertedProducts.length });
          }
        }
      } catch (err) {
        console.error(`Failed to insert ${product.name}:`, err);
      }
    }

    console.log(`Inserted ${insertedProducts.length} products into catalog`);

    // Mark job as complete
    await updateJob({
      status: 'completed',
      completed_at: new Date().toISOString(),
      pages_scraped: scrapedUrls.length,
      pages_failed: failedUrls.length,
      products_found: uniqueProducts.length,
      products_inserted: insertedProducts.length,
      current_url: null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        supplier: supplier.name,
        isAustralianSite: isAustraliaSite,
        supplierConfig: config ? 'custom' : 'generic',
        stats: {
          urlsMapped: allUrls.length,
          productUrlsFound: productUrls.length,
          pagesScraped: scrapedUrls.length,
          pagesFailed: failedUrls.length,
          productsExtracted: allProducts.length,
          uniqueProducts: uniqueProducts.length,
          productsInserted: insertedProducts.length,
        },
        scrapedUrls,
        failedUrls,
        sampleProducts: insertedProducts.slice(0, 10),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in catalog scrape:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Mark job as failed
    if (jobId) {
      await supabase
        .from('scrape_jobs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, jobId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
