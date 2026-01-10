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

// Brand mapping for suppliers with multiple brands
interface BrandMapping {
  pattern: RegExp;  // Matches URL or product name
  brand: string;    // Brand name to assign
}

const BRAND_MAPPINGS: Record<string, BrandMapping[]> = {
  'forestone': [
    { pattern: /\/our-brands\/egger|\/egger\//i, brand: 'EGGER' },
    { pattern: /\/our-brands\/meganite|\/meganite\//i, brand: 'Meganite' },
    { pattern: /\/our-brands\/antegra|\/antegra\//i, brand: 'Antegra' },
    { pattern: /\/our-brands\/designer-ply|\/designer-ply\//i, brand: 'Designer Ply' },
    { pattern: /\/our-brands\/designer-one|\/designerone\//i, brand: 'DesignerONE' },
    { pattern: /\/our-brands\/designer-osb|\/designer-osb\//i, brand: 'Designer OSB' },
    { pattern: /\/our-brands\/designergroove|\/designergroove\//i, brand: 'Designer Groove' },
    { pattern: /\/our-brands\/wallart|\/wallart\//i, brand: 'WallART' },
    { pattern: /\/our-brands\/austral|\/austral\//i, brand: 'Austral Plywoods' },
    { pattern: /\/our-brands\/selex|\/selex\//i, brand: 'Selex' },
    { pattern: /\/our-brands\/weathertex|\/weathertex\//i, brand: 'Weathertex' },
    { pattern: /\/our-brands\/shadowclad|\/shadowclad\//i, brand: 'ShadowClad' },
    // EGGER product codes: U702, H1212 ST33, etc.
    { pattern: /^[UH]\d{3,4}\s|ST\d{2}$/i, brand: 'EGGER' },
  ],
  'laminex': [
    { pattern: /formica/i, brand: 'Formica' },
    { pattern: /essastone/i, brand: 'Essastone' },
    // Default will be 'Laminex'
  ],
  'polytec': [
    { pattern: /ravine/i, brand: 'Ravine' },
    { pattern: /createc/i, brand: 'Createc' },
    { pattern: /seratone/i, brand: 'Seratone' },
    { pattern: /venette/i, brand: 'Venette' },
    { pattern: /prime\s*oak|primeoak/i, brand: 'Prime Oak' },
    { pattern: /woodmatt/i, brand: 'Woodmatt' },
    // Default will be 'Polytec Melamine'
  ],
  'hafele': [
    // Hafele is a single brand
    { pattern: /.*/, brand: 'Häfele' },
  ],
  'caesarstone': [
    { pattern: /.*/, brand: 'Caesarstone' },
  ],
  'dekton': [
    { pattern: /.*/, brand: 'Dekton' },
  ],
  'silestone': [
    { pattern: /.*/, brand: 'Silestone' },
  ],
  'smartstone': [
    { pattern: /.*/, brand: 'Smartstone' },
  ],
};

// Extract brand from source URL and product name
function extractBrand(sourceUrl: string, productName: string, supplierSlug: string, supplierName: string): string {
  const mappings = BRAND_MAPPINGS[supplierSlug];
  if (!mappings) {
    // No specific mappings, use supplier name as brand
    return supplierName;
  }
  
  const combined = `${sourceUrl} ${productName}`;
  
  for (const mapping of mappings) {
    if (mapping.pattern.test(combined)) {
      return mapping.brand;
    }
  }
  
  // Default brands for suppliers with multiple brands
  if (supplierSlug === 'laminex') return 'Laminex';
  if (supplierSlug === 'polytec') return 'Polytec Melamine';
  if (supplierSlug === 'forestone') return 'ForestOne';
  
  // Fallback to supplier name
  return supplierName;
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
  scrapeOptions?: {  // Firecrawl options for JS-heavy/cookie-gated sites
    waitFor?: number;
    headers?: Record<string, string>;
    actions?: Array<{ type: string; selector?: string; text?: string }>;
  };
  // Product filtering - remove rubbish scrapes
  requiredNamePatterns?: RegExp[];  // Product name must match at least one
  excludeNamePatterns?: RegExp[];   // Filter out products matching these
}

const SUPPLIER_CONFIGS: Record<string, SupplierConfig> = {
  'polytec': {
    productUrlPatterns: [/\/colours\//, /\/decors?\//, /\/ravine\//, /\/melamine\//, /\/laminate\//],
    excludeUrlPatterns: [/\/stockists/, /\/contact/, /\/news/, /\/sustainability/, /\/moodboard/, /\/sample/],
    requiredNamePatterns: [/ravine|melamine|createc|seratone|venette|woodmatt|prime|oak|walnut|grey|white|black|natural/i],
    excludeNamePatterns: [/showroom|samples|brochure|download|pdf/i],
  },
  'laminex': {
    productUrlPatterns: [/\/products\/.*\/colours/, /\/decorative-surfaces/, /\/colours\//, /\/benchtops\//, /\/essastone\//, /\/minerals\//],
    excludeUrlPatterns: [/\/location\//, /\/find-a-retailer/, /\/contact/, /\/sustainability/, /\/inspirations\//, /\/sample/],
    mapFromRoot: false,
    requiredNamePatterns: [/colour|decor|woodgrain|mineral|solid|white|grey|oak|walnut|charcoal/i],
    excludeNamePatterns: [/sustainability|blog|news|location|brochure/i],
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
    ],
    skipAuFilter: true,
    seedUrls: [
      '/products/benchtops/essastone',
    ],
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
      /\/product\/.*\/P-\d+/,
      /\/P-\d+/,
      /SearchParameter.*handles/i,
      /handles_knobs_product_type/i,
      /furniture-handles-knobs\/11/,
      /door-handles\/13/,
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
      /\/compare\//i,
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
    imageSelectors: ['img[data-src]', 'img.product-image', 'img.lazyload', '.product-listing-tile img'],
    skipAuFilter: true,
    seedUrls: [
      // Focus ONLY on Furniture Handles & Knobs category (category 11)
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=1',
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=2',
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=3',
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=4',
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=5',
      '/en/products/furniture-door-handles/furniture-handles-knobs/11/?PageSize=48&PageNumber=6',
    ],
    scrapeOptions: {
      waitFor: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    },
    // STRICT filtering - must contain furniture handle keywords
    requiredNamePatterns: [
      /furniture\s+handle/i,
      /handle\s+profile/i, 
      /flush\s+handle/i,
      /bar\s+pull/i,
      /bow\s+pull/i,
      /cup\s+pull/i,
      /wire\s+pull/i,
      /pull\s+handle/i,
      /d\s+pull/i,
      /knob/i,
      /mortise\s+pull/i,
      /finger\s+pull/i,
    ],
    // Exclude non-handle products
    excludeNamePatterns: [
      /drawer\s+system/i,
      /hinge/i,
      /runner/i,
      /slide/i,
      /fitting/i,
      /lock/i,
      /latch/i,
      /bracket/i,
      /connector/i,
      /stay/i,
      /damper/i,
      /lift/i,
      /carousel/i,
      /bin/i,
      /basket/i,
      /shelf/i,
      /organiser/i,
      /organizer/i,
      /led/i,
      /light/i,
      /sensor/i,
      /switch/i,
    ],
  },
  'caesarstone': {
    productUrlPatterns: [
      /\/colours\/\d+-[a-z]/i,           // /colours/544-auralux
      /\/collections-gallery\/\d+-[a-z]/i, // /collections-gallery/4011-cloudburst-concrete
    ],
    excludeUrlPatterns: [
      /\/find-a-retailer/i,
      /\/contact/i,
      /\/blog/i,
      /\/professional/i,
      /\/cookies/i,
      /\/announcements/i,
      /\/cs-connect/i,
      /\/training/i,
      /\/about/i,
      /\/sustainability/i,
      /\/warranty/i,
      /\/care-maintenance/i,
      /\/faq/i,
      /\/showroom/i,
      /\/sample/i,
      /\/perfect-pairings/i,
      /\/privacy/i,
      /\/terms/i,
      /\/fabricator/i,
      /\/architect/i,
      /\/designer/i,
    ],
    seedUrls: ['/colours/'],
    // No requiredNamePatterns - we rely on URL filtering and custom validation
  },
  'dekton': {
    productUrlPatterns: [/\/colours\//, /\/colors\//, /\/collection\//, /dekton.*colour/, /\/surfaces\//],
    excludeUrlPatterns: [/\/find-/, /\/contact/, /\/professional/],
    skipAuFilter: true,
    requiredNamePatterns: [/dekton|sintered|porcelain|stone|marble|concrete/i],
  },
  'silestone': {
    productUrlPatterns: [/\/colours\//, /\/colors\//, /\/collection\//, /silestone.*colour/, /\/quartz\//, /\/silestone\//],
    excludeUrlPatterns: [/\/find-/, /\/contact/, /\/professional/, /\/blog/, /\/news/],
    skipAuFilter: true,
    mapFromRoot: true,
    rootDomain: 'https://www.cosentino.com',
    seedUrls: ['/en-au/silestone/colours/'],
    requiredNamePatterns: [/silestone|quartz|marble|calacatta|white|grey|eternal/i],
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
  'smartstone': {
    productUrlPatterns: [/\/stones\//, /\/colours\//, /\/collection\//, /\/quartz\//, /\/range\//, /\/category\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/blog/, /\/inspiration/, /\/favourites/, /\/find-/, /\/professional/, /\/showrooms\//, /\/information\//],
    skipAuFilter: true,
    useCrawlFallback: true,
    seedUrls: ['/stones/', '/category/deluxe-price-range/', '/category/classic-price-range/', '/category/pure-price-range/'],
    requiredNamePatterns: [/quartz|stone|marble|calacatta|carrara|athena|blanc|naxos/i],
  },
  'navurban': {
    productUrlPatterns: [/\/navurban\//, /\/product\//, /\/colours\//, /\/range\//, /\/timber\//, /\/veneers\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/cart/, /\/checkout/, /\/blog/],
    skipAuFilter: true,
    seedUrls: ['/navurban/'],
  },
  'lithostone': {
    productUrlPatterns: [/\/lithostone\//, /\/compac\//, /\/sintered-stone\//, /\/colours\//, /\/quartz\//, /\/collection\//, /\/range\//, /\/product\//],
    excludeUrlPatterns: [/\/contact/, /\/about/, /\/blog/, /\/safety-facts/, /\/gallery\//, /\/care-and-maintenance/],
    skipAuFilter: true,
    seedUrls: ['/products/lithostone/', '/products/compac/', '/products/'],
  },
  'ydl-stone': {
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
  'ydl': {
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
    skipAuFilter: true,
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
// IMAGE URL OPTIMIZATION - Get full-size images for all suppliers
// ============================================================================

function optimizeImageUrl(imageUrl: string, supplierSlug: string): string {
  if (!imageUrl) return imageUrl;
  
  let optimized = imageUrl;
  
  switch (supplierSlug) {
    case 'hafele':
      // Hafele: /category_view/, /normal/, /thumbnail/ -> /huge/ for full product images
      optimized = optimized.replace('/category_view/', '/huge/');
      optimized = optimized.replace('/normal/', '/huge/');
      optimized = optimized.replace('/thumbnail/', '/huge/');
      optimized = optimized.replace('/medium/', '/huge/');
      optimized = optimized.replace('/small/', '/huge/');
      break;
      
    case 'polytec':
    case 'laminex':
    case 'essastone':
    case 'nikpol':
      // Remove thumbnail suffixes and size constraints
      optimized = optimized.replace(/_thumb\./i, '.');
      optimized = optimized.replace(/_small\./i, '.');
      optimized = optimized.replace(/_medium\./i, '.');
      optimized = optimized.replace(/-thumb\./i, '.');
      optimized = optimized.replace(/-small\./i, '.');
      // Remove dimension query params, use larger sizes
      optimized = optimized.replace(/\?w=\d+(&h=\d+)?/i, '');
      optimized = optimized.replace(/\?width=\d+(&height=\d+)?/i, '');
      // If has resize params, bump them up
      optimized = optimized.replace(/\/w_\d+,/i, '/w_800,');
      optimized = optimized.replace(/\/h_\d+,/i, '/h_800,');
      break;
      
    case 'caesarstone':
    case 'smartstone':
      // Cloudinary/CDN size transforms
      optimized = optimized.replace(/\/w_\d+,/i, '/w_800,');
      optimized = optimized.replace(/\/h_\d+,/i, '/h_800,');
      optimized = optimized.replace(/\/c_thumb,/i, '/c_fill,');
      optimized = optimized.replace(/\/c_scale,w_\d+/i, '/c_scale,w_800');
      break;
      
    case 'dekton':
    case 'silestone':
      // Cosentino CDN - use larger image sizes
      optimized = optimized.replace(/width=\d+/i, 'width=800');
      optimized = optimized.replace(/height=\d+/i, 'height=800');
      optimized = optimized.replace(/\/w_\d+/i, '/w_800');
      break;
      
    case 'forestone':
    case 'egger':
      // EGGER often uses thumbnail paths
      optimized = optimized.replace(/\/thumbnails\//i, '/images/');
      optimized = optimized.replace(/_tn\./i, '.');
      optimized = optimized.replace(/_thumb\./i, '.');
      break;
      
    case 'navurban':
    case 'lavistone':
    case 'lithostone':
      // WooCommerce/WordPress thumbnail patterns
      optimized = optimized.replace(/-\d+x\d+\./i, '.'); // Remove -300x300. etc
      optimized = optimized.replace(/-scaled\./i, '.');
      optimized = optimized.replace(/-thumbnail\./i, '.');
      break;
      
    default:
      // Generic optimizations
      optimized = optimized.replace(/_thumb\./i, '.');
      optimized = optimized.replace(/_small\./i, '.');
      optimized = optimized.replace(/-thumb\./i, '.');
      optimized = optimized.replace(/-\d+x\d+\./i, '.');
  }
  
  return optimized;
}

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
    
    // === ADDITIONAL JUNK PATTERNS ===
    
    // Cookie consent / GDPR
    /^accept\s*(all\s*)?(cookies?)?$/i,
    /^cookie\s*(preferences?|settings?|policy)?$/i,
    /^manage\s*cookies?$/i,
    /^reject\s*(all\s*)?cookies?$/i,
    
    // Cart/checkout elements
    /^(view|go\s*to|proceed\s*to)\s*(cart|basket|checkout)$/i,
    /^(added|add)\s*to\s*(cart|basket|wishlist)$/i,
    /^remove\s*from\s*(cart|basket|wishlist)$/i,
    /^(empty|clear)\s*(cart|basket)$/i,
    /^continue\s*shopping$/i,
    
    // Form elements
    /^subscribe(\s*now)?$/i,
    /^request\s*a?\s*(quote|sample|callback|brochure)$/i,
    /^get\s*(in\s*touch|started|quote)$/i,
    /^send\s*(message|enquiry|request)$/i,
    /^submit(\s*form)?$/i,
    
    // Social media prompts
    /^follow\s*us(\s*on)?$/i,
    /^share\s*(on|via|this)$/i,
    /^connect\s*with\s*us$/i,
    /^join\s*(our\s*)?(newsletter|mailing\s*list)$/i,
    
    // Video/media controls
    /^play(\s*video)?$/i,
    /^watch\s*(now|video)$/i,
    /^pause$/i,
    /^mute$/i,
    /^unmute$/i,
    
    // Navigation breadcrumbs
    /^(you\s*are\s*here|breadcrumb)$/i,
    /^back\s*to\s*(top|home|products)$/i,
    
    // Loading states
    /^(loading|fetching|please\s*wait)\.{0,3}$/i,
    /^processing\.{0,3}$/i,
    
    // Price-only strings
    /^\$[\d,]+(\.\d{2})?$/,
    /^(from\s*)?\$[\d,]+/i,
    /^(rrp|was|now|save)\s*\$[\d,]+/i,
    
    // SKU-only (no descriptive name)
    /^[A-Z]{2,5}-?\d{4,}$/,
    /^\d{5,}$/,
    
    // Common website UI text
    /^(skip\s*to|go\s*to)\s*(main\s*)?content$/i,
    /^(toggle|open|close)\s*(menu|nav|sidebar)$/i,
    /^(select|choose)\s*(an?\s*)?(option|colour|color|size)$/i,
    /^(sort|filter)\s*by$/i,
    /^showing\s*\d+\s*(of|-)?\s*\d+/i,
    /^page\s*\d+(\s*of\s*\d+)?$/i,
    /^\d+\s*(items?|products?|results?)$/i,
    /^no\s*(results?|products?)\s*found$/i,
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
  for (const category of genericCategoryNames) {
    if (lowerName === category || lowerName === category + 's') {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// SUPPLIER-SPECIFIC PRODUCT VALIDATION
// ============================================================================

function isValidProductForSupplier(product: ScrapedProduct, supplierSlug: string, config?: SupplierConfig): boolean {
  const nameLower = product.name.toLowerCase();
  const urlLower = (product.source_url || '').toLowerCase();
  
  // Check exclude patterns first (these override includes)
  if (config?.excludeNamePatterns) {
    if (config.excludeNamePatterns.some(p => p.test(nameLower))) {
      console.log(`Product excluded by excludeNamePatterns: ${product.name}`);
      return false;
    }
  }
  
  // Caesarstone-specific: Accept products from colour pages with product codes
  if (supplierSlug === 'caesarstone') {
    // Caesarstone products typically have a 3-4 digit code at the start (e.g., "516 Locura")
    const hasProductCode = /^\d{3,4}\s/.test(product.name);
    const isFromColourPage = urlLower.includes('/colours/') || urlLower.includes('/collections-gallery/');
    
    // Reject generic UI elements regardless of page
    const caesarstoneExclusions = [
      /^view\s/i, /^add\s/i, /^compare/i, /^download/i,
      /^request/i, /^order/i, /^find\s/i, /^explore/i,
      /^cookie/i, /^privacy/i, /^terms/i, /^see\s/i,
      /^get\s/i, /^contact/i, /^subscribe/i, /^sign\s/i,
      /^browse/i, /^filter/i, /^sort/i, /^search/i,
    ];
    
    if (caesarstoneExclusions.some(p => p.test(nameLower))) {
      console.log(`Caesarstone product rejected by exclusion: ${product.name}`);
      return false;
    }
    
    if (hasProductCode || isFromColourPage) {
      console.log(`Caesarstone product accepted: ${product.name}`);
      return true;
    }
    
    console.log(`Caesarstone product rejected - not from colour page: ${product.name}`);
    return false;
  }
  
  // Hafele-specific: STRICT filtering - must be a furniture handle product
  if (supplierSlug === 'hafele') {
    // Must contain handle-related keywords in name
    const isHandleProduct = /furniture\s*handle|handle\s*profile|flush\s*handle|bar\s*pull|bow\s*pull|cup\s*pull|wire\s*pull|pull\s*handle|d\s*pull|knob|mortise\s*pull|finger\s*pull|extruded\s*pull|t-knob|recessed\s*grip/i.test(nameLower);
    
    if (!isHandleProduct) {
      // Fallback: check for simpler patterns but only from valid categories
      const simpleHandleMatch = /handle|pull|knob|grip|lever|flush/i.test(nameLower);
      const urlIsHandleCategory = urlLower.includes('furniture-handles') || 
                                   urlLower.includes('handles-knobs') ||
                                   urlLower.includes('/11/');
      
      if (!simpleHandleMatch || !urlIsHandleCategory) {
        console.log(`Hafele product rejected - not a furniture handle: ${product.name}`);
        return false;
      }
    }
    
    // Extra exclusions for Hafele - things that appear on handle pages but aren't handles
    const hafelExclusions = [
      /drawer\s*system/i, /hinge/i, /runner/i, /slide/i,
      /fitting/i, /lock/i, /latch/i, /bracket/i, /connector/i,
      /stay/i, /damper/i, /lift/i, /carousel/i, /bin/i,
      /basket/i, /shelf/i, /organiser/i, /organizer/i,
      /led/i, /light/i, /sensor/i, /switch/i, /seal/i,
      /^view\s/i, /^add\s/i, /^compare/i, /^show\s/i,
      /article/i, /product\s*photo/i,
    ];
    
    if (hafelExclusions.some(p => p.test(nameLower))) {
      console.log(`Hafele product rejected by exclusion: ${product.name}`);
      return false;
    }
    
    console.log(`Hafele product accepted: ${product.name}`);
    return true;
  }
  
  // Check required patterns (if specified, at least one must match)
  if (config?.requiredNamePatterns && config.requiredNamePatterns.length > 0) {
    const matchesRequired = config.requiredNamePatterns.some(p => p.test(nameLower));
    // For URLs that match product category, we're more lenient
    const urlMatchesProductPattern = config.productUrlPatterns?.some(p => p.test(urlLower)) || false;
    
    if (!matchesRequired && !urlMatchesProductPattern) {
      return false;
    }
  }
  
  return true;
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
    { pattern: /<h1[^>]*>.*(?:under maintenance|site maintenance|scheduled maintenance).*<\/h1>/i, reason: 'Maintenance page' },
    { pattern: /class="[^"]*maintenance-page[^"]*"/i, reason: 'Maintenance page class' },
  ];
  
  for (const { pattern, reason } of errorPatterns) {
    if (pattern.test(html)) {
      return { isError: true, reason };
    }
  }
  
  // Check if page has very little content (likely an error page)
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
    
    // Optimize image URL for this supplier
    resolvedUrl = optimizeImageUrl(resolvedUrl, supplierSlug || '');
    
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
        const imageUrl = match[1];
        // Try to extract name from URL path
        let name = match[2] || '';
        if (!name) {
          const pathParts = imageUrl.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          name = lastPart.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        if (name && name.length > 2) {
          addProduct(name, imageUrl);
        }
      }
    }
    
    // Pattern for colour cards with title attributes
    const colourCardPattern = /<a[^>]*class="[^"]*colour[^"]*"[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<(?:h[2-4]|span|div|p)[^>]*>([^<]+)</gi;
    for (const match of html.matchAll(colourCardPattern)) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
  }
  
  // Smartstone patterns - Nuxt.js SPA with unique structure
  if (supplierSlug === 'smartstone') {
    // Pattern 1: data-v- attributes with links to stones
    const smartstonePattern = /<a[^>]*href="\/stones\/[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*(?:alt=["']([^"']+)["'])?[\s\S]*?<(?:h[2-4]|span|div)[^>]*class="[^"]*(?:name|title)[^"]*"[^>]*>([^<]+)</gi;
    for (const match of html.matchAll(smartstonePattern)) {
      const name = match[3] || match[2];
      if (match[1] && name) {
        addProduct(name, match[1]);
      }
    }
    
    // Pattern 2: Stone cards with nuxt-link
    const stoneCardPattern = /<nuxt-link[^>]*to="\/stones\/[^"]*"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>[\s\S]*?<[^>]*>([^<]{2,50})</gi;
    for (const match of html.matchAll(stoneCardPattern)) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
  }
  
  // YDL Stone patterns - WordPress/Elementor
  if (supplierSlug === 'ydl' || supplierSlug === 'ydl-stone') {
    // Pattern 1: Elementor product cards
    const ydlPattern = /<div[^>]*class="[^"]*elementor-widget-image[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[\s\S]*?<(?:h[2-4]|div)[^>]*class="[^"]*(?:title|heading)[^"]*"[^>]*>([^<]+)</gi;
    for (const match of html.matchAll(ydlPattern)) {
      const name = match[3] || match[2];
      if (match[1] && name) {
        addProduct(name, match[1]);
      }
    }
    
    // Pattern 2: Product grid items
    const gridPattern = /<div[^>]*class="[^"]*jet-listing-grid__item[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/gi;
    for (const match of html.matchAll(gridPattern)) {
      if (match[1] && match[2]) {
        addProduct(match[2], match[1]);
      }
    }
  }
  
  // Hafele hardware patterns - IMPROVED to extract proper handle names
  if (supplierSlug === 'hafele') {
    console.log('Hafele: Starting product extraction from HTML');
    
    // Pattern 1: Extract from H3 links with title attributes (primary source for names)
    // Format: ### [Product Name](url "Product Name")
    const h3LinkPattern = /###\s*\[([^\]]+)\]\([^)]+\s+"([^"]+)"\)/gi;
    for (const match of html.matchAll(h3LinkPattern)) {
      // Use the title attribute value which is the clean product name
      const productName = match[2] || match[1];
      if (productName && /handle|pull|knob|grip|lever|flush|profile/i.test(productName)) {
        console.log(`Hafele H3 pattern found: ${productName}`);
        // Find associated image - look for category_view images
        const imagePattern = new RegExp(`\\[!\\[[^\\]]*\\]\\((https://www\\.hafele\\.com\\.au/[^)]+category_view[^)]+)\\)\\]\\([^)]+/${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[^/]*')}`, 'i');
        const imageMatch = html.match(imagePattern);
        if (imageMatch) {
          addProduct(productName, imageMatch[1]);
        }
      }
    }
    
    // Pattern 2: Simpler H3 pattern without title attribute
    // Format: ### [Product Name](url)
    const h3SimpleLinkPattern = /###\s*\[([^\]]+)\]\([^)]+\)/gi;
    for (const match of html.matchAll(h3SimpleLinkPattern)) {
      const productName = match[1].trim();
      if (productName && /handle|pull|knob|grip|lever|flush|profile/i.test(productName)) {
        // Avoid duplicates - check if already added
        const existingProduct = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (!existingProduct) {
          console.log(`Hafele H3 simple pattern found: ${productName}`);
          // We'll find images in the next pass
        }
      }
    }
    
    // Pattern 3: Extract product image URLs and names together
    // Format: [![P-XXXXX product photo](imageUrl)](productUrl)
    // Followed by: ### [Product Name](url)
    const productBlockPattern = /\[!\[[^\]]*product\s*photo[^\]]*\]\(([^)]+)\)\][^\[]*###\s*\[([^\]]+)\]/gi;
    for (const match of html.matchAll(productBlockPattern)) {
      const imageUrl = match[1];
      const productName = match[2].trim();
      if (imageUrl && productName && /handle|pull|knob|grip|lever|flush|profile/i.test(productName)) {
        console.log(`Hafele block pattern found: ${productName} -> ${imageUrl.substring(0, 60)}...`);
        addProduct(productName, imageUrl);
      }
    }
    
    // Pattern 4: Fallback - look for category_view images with alt text containing product info
    const categoryViewPattern = /\[!\[([^\]]+)\]\((https:\/\/www\.hafele\.com\.au\/[^)]+category_view[^)]+)\)/gi;
    for (const match of html.matchAll(categoryViewPattern)) {
      const altText = match[1];
      const imageUrl = match[2];
      // The alt text is like "P-01318428 product photo" - not useful
      // But we can try to find the product name nearby
      if (imageUrl) {
        // Look for the associated product name after this image
        const afterImage = html.slice(html.indexOf(imageUrl) + imageUrl.length, html.indexOf(imageUrl) + 500);
        const nameMatch = afterImage.match(/###\s*\[([^\]]+)\]/);
        if (nameMatch && nameMatch[1] && /handle|pull|knob|grip|lever|flush|profile/i.test(nameMatch[1])) {
          const productName = nameMatch[1].trim();
          // Check if not already added
          const key = productName.toLowerCase();
          if (!products.find(p => p.name.toLowerCase() === key)) {
            console.log(`Hafele category_view pattern found: ${productName}`);
            addProduct(productName, imageUrl);
          }
        }
      }
    }
    
    // Pattern 5: Direct HTML patterns for the actual rendered page (not markdown)
    const htmlProductCards = html.matchAll(/<a[^>]*href="[^"]*\/product\/[^"]*"[^>]*title="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi);
    for (const match of htmlProductCards) {
      const productName = match[1];
      const imageUrl = match[2];
      if (productName && imageUrl && /handle|pull|knob|grip|lever|flush|profile/i.test(productName)) {
        console.log(`Hafele HTML pattern found: ${productName}`);
        addProduct(productName, imageUrl);
      }
    }
    
    // Pattern 6: Another HTML variant with image first then title
    const htmlProductCards2 = html.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+category_view[^"']+)["'][^>]*>[\s\S]*?<h3[^>]*>\s*<a[^>]*>([^<]+)</gi);
    for (const match of htmlProductCards2) {
      const imageUrl = match[1];
      const productName = match[2].trim();
      if (imageUrl && productName && /handle|pull|knob|grip|lever|flush|profile/i.test(productName)) {
        console.log(`Hafele HTML h3 pattern found: ${productName}`);
        addProduct(productName, imageUrl);
      }
    }
    
    console.log(`Hafele: Extracted ${products.length} furniture handle products`);
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

// ============================================================================
// CLEANUP OLD PRODUCTS - Delete old items before re-scraping
// ============================================================================

async function cleanupOldProducts(supabase: any, supplierId: string, supplierName: string): Promise<number> {
  console.log(`Cleaning up old products for supplier ${supplierName} (${supplierId})`);
  
  try {
    // Count existing products first
    const { count: existingCount } = await supabase
      .from('catalog_items')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId);
    
    console.log(`Found ${existingCount || 0} existing products to delete`);
    
    if (existingCount && existingCount > 0) {
      // Delete all existing products for this supplier
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('supplier_id', supplierId);
      
      if (error) {
        console.error('Error deleting old products:', error);
        return 0;
      }
      
      console.log(`Successfully deleted ${existingCount} old products`);
      return existingCount;
    }
    
    return 0;
  } catch (error) {
    console.error('Error in cleanupOldProducts:', error);
    return 0;
  }
}

// ============================================================================
// WORK MODE HANDLER - Process batch of queued URLs
// ============================================================================

async function handleWorkMode(
  supabase: any,
  jobId: string,
  batchSize: number,
  supplier: any,
  supplierSlug: string,
  config: SupplierConfig,
  firecrawlKey: string
): Promise<Response> {
  console.log(`WORK MODE: Processing batch of ${batchSize} URLs for job ${jobId}`);
  
  // Get job info
  const { data: job, error: jobError } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  
  if (jobError || !job) {
    return new Response(
      JSON.stringify({ success: false, error: 'Job not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check if job is cancelled
  if (job.status === 'cancelled') {
    return new Response(
      JSON.stringify({ success: false, error: 'Job was cancelled', jobId }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Get next batch of pending URLs
  const { data: pendingUrls, error: urlsError } = await supabase
    .from('scrape_job_urls')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .order('created_at')
    .limit(batchSize);
  
  if (urlsError) {
    console.error('Failed to get pending URLs:', urlsError);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get pending URLs' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (!pendingUrls || pendingUrls.length === 0) {
    // If another invocation is currently processing URLs, don't mark the job as completed.
    const { data: processingUrls } = await supabase
      .from('scrape_job_urls')
      .select('id')
      .eq('job_id', jobId)
      .eq('status', 'processing')
      .limit(1);
    
    if (processingUrls && processingUrls.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          jobId,
          status: 'in_progress',
          message: 'Another batch is still processing',
          batchProcessed: 0,
          urlsRemaining: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Mark job as completed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    
    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        status: 'completed',
        message: 'All URLs have been processed',
        batchProcessed: 0,
        urlsRemaining: 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Parse base URL from first URL
  let baseUrl: string;
  try {
    const urlObj = new URL(pendingUrls[0].url);
    baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    baseUrl = '';
  }
  
  // Category mapping
  const CATEGORY_IDS = {
    stoneBenchtops: '33f04a97-fba7-4a67-9ea7-84da822334ae',
    handles: 'cd6ca340-a52e-409f-80e9-e969ba285944',
    laminates: 'cf281fc3-3de5-4579-84e0-0913baad7cef',
    edgeProfiles: 'a1795291-c26e-4244-9111-b7b3b40c71d9',
  };
  
  const getCategoryId = (slug: string, supplierCategory: string | null, productType: string, usageTypes: string[]) => {
    if (['caesarstone', 'essastone', 'dekton', 'silestone', 'smartstone', 'lithostone', 'quantum-quartz', 'wk-stone', 'ydl-stone', 'ydl', 'lavistone'].includes(slug)) {
      return CATEGORY_IDS.stoneBenchtops;
    }
    if (slug === 'hafele' || supplierCategory === 'hardware' || productType === 'hardware') {
      return CATEGORY_IDS.handles;
    }
    if (['engineered_stone', 'quartz', 'ultra_compact', 'solid_surface'].includes(productType) || usageTypes.includes('bench_tops')) {
      return CATEGORY_IDS.stoneBenchtops;
    }
    if (usageTypes.includes('kicks') || usageTypes.includes('splashbacks')) {
      return CATEGORY_IDS.edgeProfiles;
    }
    return CATEGORY_IDS.laminates;
  };
  
  let batchInserted = 0;
  let batchProcessed = 0;
  let batchFailed = 0;
  
  // Process each URL in the batch
  for (const urlRecord of pendingUrls) {
    const pageUrl = urlRecord.url;
    console.log(`Processing: ${pageUrl}`);
    
    // Mark as processing
    await supabase
      .from('scrape_job_urls')
      .update({ status: 'processing' })
      .eq('id', urlRecord.id);
    
    await supabase
      .from('scrape_jobs')
      .update({ current_url: pageUrl })
      .eq('id', jobId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try JSON extraction first
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
                      name: { type: 'string' },
                      image_url: { type: 'string' },
                      color: { type: 'string' },
                      material: { type: 'string' },
                    },
                    required: ['name', 'image_url']
                  },
                }
              },
              required: ['products']
            },
            prompt: `Extract all product colours or finishes from this ${supplier.name} catalogue page.`
          },
        }),
      }, 2, 3000);

      const jsonData = await jsonResponse.json();
      let extractedProducts: ScrapedProduct[] = [];
      
      if (jsonResponse.ok && jsonData.data?.json?.products) {
        for (const p of jsonData.data.json.products) {
          if (p.name && p.image_url) {
            let imageUrl = p.image_url;
            if (!imageUrl.startsWith('http')) {
              imageUrl = baseUrl + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
            }
            // Optimize image URL
            imageUrl = optimizeImageUrl(imageUrl, supplierSlug);
            extractedProducts.push({
              name: p.name,
              image_url: imageUrl,
              color: p.color || p.name,
              material: p.material,
              source_url: pageUrl,
            });
          }
        }
      }
      
      // HTML fallback if needed
      if (extractedProducts.length < 3) {
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
            waitFor: config.scrapeOptions?.waitFor,
            headers: config.scrapeOptions?.headers,
          }),
        }, 2, 3000);

        const htmlData = await htmlResponse.json();
        if (htmlResponse.ok && htmlData.data?.html) {
          const htmlProducts = extractProductsFromHtml(htmlData.data.html, pageUrl, baseUrl, supplierSlug);
          if (htmlProducts.length > extractedProducts.length) {
            extractedProducts = htmlProducts;
          }
        }
      }
      
      // Filter and insert products
      let urlInserted = 0;
      for (const product of extractedProducts) {
        if (!isValidProductName(product.name)) continue;
        
        // Apply supplier-specific filtering
        if (!isValidProductForSupplier(product, supplierSlug, config)) {
          console.log(`  Filtered out product: "${product.name}" (doesn't match supplier requirements)`);
          continue;
        }
        
        // Image URL is already optimized in extractProductsFromHtml
        const finalImageUrl = product.image_url;
        
        const classification = detectProductClassification(product.source_url, product.name, supplier);
        const categoryId = getCategoryId(supplierSlug, supplier.category, classification.product_type, classification.usage_types);
        
        // Extract brand
        const brand = extractBrand(product.source_url, product.name, supplierSlug, supplier.name);
        
        const { error } = await supabase
          .from('catalog_items')
          .upsert({
            supplier_id: supplier.id,
            category_id: categoryId,
            name: product.name,
            image_url: finalImageUrl,
            brand: brand,
            color: product.color,
            material: product.material,
            source_url: product.source_url,
            product_type: classification.product_type,
            thickness: classification.thickness,
            usage_types: classification.usage_types,
            is_active: true,
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: 'supplier_id,name',
            ignoreDuplicates: false,
          });
        
        if (!error) urlInserted++;
      }
      
      // Mark URL as completed
      await supabase
        .from('scrape_job_urls')
        .update({
          status: 'completed',
          products_found: extractedProducts.length,
          products_inserted: urlInserted,
          processed_at: new Date().toISOString(),
        })
        .eq('id', urlRecord.id);
      
      batchInserted += urlInserted;
      batchProcessed++;
      
    } catch (error) {
      console.error(`Error processing ${pageUrl}:`, error);
      await supabase
        .from('scrape_job_urls')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString(),
        })
        .eq('id', urlRecord.id);
      batchFailed++;
    }
  }
  
  // Update job stats
  const { data: remainingUrls } = await supabase
    .from('scrape_job_urls')
    .select('id')
    .eq('job_id', jobId)
    .eq('status', 'pending');
  
  const urlsRemaining = remainingUrls?.length || 0;
  
  // Update job stats and mark as completed if no URLs remain
  const isComplete = urlsRemaining === 0;
  
  await supabase
    .from('scrape_jobs')
    .update({
      pages_scraped: (job.pages_scraped || 0) + batchProcessed,
      pages_failed: (job.pages_failed || 0) + batchFailed,
      products_inserted: (job.products_inserted || 0) + batchInserted,
      urls_completed: (job.urls_completed || 0) + batchProcessed + batchFailed,
      ...(isComplete ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', jobId);
  
  console.log(`[WORK] Batch complete: ${batchProcessed} processed, ${batchFailed} failed, ${batchInserted} inserted, ${urlsRemaining} remaining${isComplete ? ' - JOB COMPLETED' : ''}`);
  
  return new Response(
    JSON.stringify({
      success: true,
      jobId,
      status: isComplete ? 'completed' : 'in_progress',
      batchProcessed,
      batchFailed,
      batchInserted,
      urlsRemaining,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// BACKGROUND SCRAPING TASK - Runs the actual scraping after returning jobId
// ============================================================================

async function runScrapingTask(
  supabase: any,
  jobId: string,
  supplierId: string,
  url: string,
  supplier: any,
  supplierSlug: string,
  config: SupplierConfig,
  firecrawlKey: string,
  options: any,
  deletedCount: number
): Promise<void> {
  const isAustraliaSite = isAustralianUrl(url) || config.skipAuFilter === true;
  
  // Helper to update job progress
  const updateJob = async (updates: Record<string, any>) => {
    await supabase
      .from('scrape_jobs')
      .update(updates)
      .eq('id', jobId);
  };

  try {
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

    console.log(`[BG] Starting catalog scrape for ${supplier.name} from ${url} (Australian: ${isAustraliaSite}, slug: ${supplierSlug})`);
    if (deletedCount > 0) {
      console.log(`[BG] Cleaned up ${deletedCount} old products before scraping`);
    }

    // Step 1: Map the entire website
    console.log('[BG] Step 1: Mapping website...');
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
        console.log(`[BG] Found ${allUrls.length} total URLs on website`);
        await updateJob({ urls_mapped: allUrls.length });
      } else {
        console.error('[BG] Map failed or returned no URLs:', mapData);
        
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
      console.error('[BG] Map request failed:', error);
      
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

    // Hafele special: mapping often returns only the start URL due to cookie/session gating.
    if (supplierSlug === 'hafele' && config.seedUrls && config.seedUrls.length > 0) {
      const seedAbsoluteUrls = config.seedUrls.map(p => (p.startsWith('http') ? p : baseUrl + p));
      allUrls = [...new Set([...allUrls, ...seedAbsoluteUrls])];
      console.log(`[BG] Hafele: Added ${seedAbsoluteUrls.length} seed pages; now have ${allUrls.length} total URLs`);
      await updateJob({ urls_mapped: allUrls.length });
    }

    // If we mapped from root domain for a sub-brand, filter to relevant URLs
    if (config.mapFromRoot && config.rootDomain) {
      const originalUrl = new URL(url);
      const pathPrefix = originalUrl.pathname;
      allUrls = allUrls.filter(u => {
        try {
          const parsed = new URL(u);
          if (config.subBrandExcludePatterns?.some(p => p.test(u))) {
            return false;
          }
          if (config.excludeUrlPatterns?.some(p => p.test(u))) {
            return false;
          }
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
      console.log(`[BG] Filtered to ${allUrls.length} URLs matching sub-brand path: ${pathPrefix}`);
    }

    // Step 2: Filter to product URLs
    console.log('[BG] Step 2: Filtering to product URLs...');
    let productUrls = filterProductUrls(allUrls, baseUrl, supplierSlug, !isAustraliaSite);
    console.log(`[BG] Found ${productUrls.length} potential product URLs`);
    
    // For sub-brands, apply stricter filtering
    if (config.requireBrandInUrl) {
      console.log(`[BG] Sub-brand detected (${supplierSlug}), prioritizing original URL: ${url}`);
      productUrls = productUrls.filter(u => {
        const urlLower = u.toLowerCase();
        return urlLower.includes(supplierSlug) || urlLower.includes('brand=' + supplierSlug);
      });
      console.log(`[BG] After brand filter: ${productUrls.length} URLs contain brand name`);
      
      if (!productUrls.includes(url)) {
        productUrls.unshift(url);
      }
    }
    
    // Fallback: Use seedUrls if configured
    const seedMinCount = supplierSlug === 'hafele' ? 5 : 0;
    if ((productUrls.length === 0 || (seedMinCount > 0 && productUrls.length < seedMinCount)) && config.seedUrls && config.seedUrls.length > 0) {
      console.log(`[BG] Using seedUrls fallback: ${config.seedUrls.join(', ')}`);
      for (const seedPath of config.seedUrls) {
        const seedUrl = seedPath.startsWith('http') ? seedPath : baseUrl + seedPath;
        if (!productUrls.includes(seedUrl)) {
          productUrls.push(seedUrl);
        }
      }
    }
    
    // Ultimate fallback: scrape the original URL directly
    if (productUrls.length === 0) {
      console.log('[BG] No product URLs found, falling back to original URL');
      productUrls = [url];
    }

    // Hafele: prefer scraping product detail pages
    if (supplierSlug === 'hafele') {
      const detailUrls = productUrls.filter(u => /\/product\//i.test(u) && /\/P-\d+/i.test(u));
      if (detailUrls.length > 0) {
        productUrls = [...new Set(detailUrls)];
        console.log(`[BG] Hafele: narrowed to ${productUrls.length} product detail URLs`);
      }
    }

    const defaultMaxPages = supplierSlug === 'hafele' ? 500 : 50;
    const maxPages = options?.maxPages || defaultMaxPages;
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

    // Category mapping for incremental inserts
    const CATEGORY_IDS = {
      stoneBenchtops: '33f04a97-fba7-4a67-9ea7-84da822334ae',
      handles: 'cd6ca340-a52e-409f-80e9-e969ba285944',
      laminates: 'cf281fc3-3de5-4579-84e0-0913baad7cef',
      edgeProfiles: 'a1795291-c26e-4244-9111-b7b3b40c71d9',
    };
    
    const getCategoryId = (slug: string, supplierCategory: string | null, productType: string, usageTypes: string[]) => {
      if (['caesarstone', 'essastone', 'dekton', 'silestone', 'smartstone', 'lithostone', 'quantum-quartz', 'wk-stone', 'ydl-stone', 'ydl', 'lavistone'].includes(slug)) {
        return CATEGORY_IDS.stoneBenchtops;
      }
      if (slug === 'hafele' || supplierCategory === 'hardware' || productType === 'hardware') {
        return CATEGORY_IDS.handles;
      }
      if (['engineered_stone', 'quartz', 'ultra_compact', 'solid_surface'].includes(productType) || usageTypes.includes('bench_tops')) {
        return CATEGORY_IDS.stoneBenchtops;
      }
      if (usageTypes.includes('kicks') || usageTypes.includes('splashbacks')) {
        return CATEGORY_IDS.edgeProfiles;
      }
      return CATEGORY_IDS.laminates;
    };

    // Step 3: Scrape each product page and INSERT IMMEDIATELY
    const seenNames = new Set<string>();
    const seenImages = new Set<string>();
    let totalInserted = 0;
    let totalProductsFound = 0;
    const scrapedUrls: string[] = [];
    const failedUrls: string[] = [];
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const pageUrl = urlsToScrape[i];
      console.log(`[BG] Scraping (${i + 1}/${urlsToScrape.length}): ${pageUrl}`);
      
      await updateJob({
        current_url: pageUrl,
        pages_scraped: scrapedUrls.length,
        pages_failed: failedUrls.length,
        products_found: totalProductsFound,
        products_inserted: totalInserted,
      });
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try JSON extraction first
        console.log(`[BG]   Attempting JSON extraction...`);
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
          console.log(`[BG]   JSON extraction found ${jsonProducts.length} products`);
          
          for (const p of jsonProducts) {
            if (p.name && p.image_url) {
              let imageUrl = p.image_url;
              if (!imageUrl.startsWith('http')) {
                imageUrl = baseUrl + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
              }
              imageUrl = optimizeImageUrl(imageUrl, supplierSlug);
              
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
          console.log(`[BG]   JSON extraction failed or returned no products:`, jsonData.error || 'empty response');
        }
        
        // If JSON extraction returned few/no products, try HTML fallback
        if (extractedProducts.length < 3) {
          console.log(`[BG]   JSON found ${extractedProducts.length}, trying HTML fallback...`);
          
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
            
            const errorCheck = isErrorPage(html);
            if (errorCheck.isError) {
              console.log(`[BG]   Skipping error page ${pageUrl}: ${errorCheck.reason}`);
              failedUrls.push(pageUrl);
              continue;
            }
            
            const htmlProducts = extractProductsFromHtml(html, pageUrl, baseUrl, supplierSlug);
            console.log(`[BG]   HTML fallback found ${htmlProducts.length} products`);
            
            if (htmlProducts.length > extractedProducts.length) {
              extractedProducts = htmlProducts;
            }
          }
        }
        
        // INSERT PRODUCTS IMMEDIATELY after each page scrape
        if (extractedProducts.length > 0) {
          console.log(`[BG]   Inserting ${extractedProducts.length} products from ${pageUrl}...`);
          let pageInserted = 0;
          
          for (const product of extractedProducts) {
            // Validate and dedupe
            if (!isValidProductName(product.name)) continue;
            if (!isValidProductForSupplier(product, supplierSlug, config)) continue;
            
            const nameKey = product.name.toLowerCase().trim();
            if (seenNames.has(nameKey)) continue;
            
            const imageKey = product.image_url.split('?')[0].toLowerCase();
            if (seenImages.has(imageKey)) continue;
            
            seenNames.add(nameKey);
            seenImages.add(imageKey);
            
            // Insert immediately
            const classification = detectProductClassification(product.source_url, product.name, supplier);
            const categoryId = getCategoryId(supplierSlug, supplier.category, classification.product_type, classification.usage_types);
            const brand = extractBrand(product.source_url, product.name, supplierSlug, supplier.name);
            
            const { error } = await supabase
              .from('catalog_items')
              .upsert({
                supplier_id: supplierId,
                category_id: categoryId,
                name: product.name,
                image_url: product.image_url,
                brand: brand,
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
              });
            
            if (!error) {
              pageInserted++;
              totalInserted++;
            }
          }
          
          totalProductsFound += extractedProducts.length;
          console.log(`[BG]   Inserted ${pageInserted} new products (total: ${totalInserted})`);
          scrapedUrls.push(pageUrl);
          
          // Update job progress after each page
          await updateJob({
            products_found: totalProductsFound,
            products_inserted: totalInserted,
          });
        } else {
          console.log(`[BG]   No products found on ${pageUrl}`);
          failedUrls.push(pageUrl);
        }
      } catch (error) {
        console.error(`[BG]   Error scraping ${pageUrl}:`, error);
        failedUrls.push(pageUrl);
      }
    }

    // Mark job as complete
    console.log(`[BG] Scraping complete. Total: ${totalInserted} products inserted from ${scrapedUrls.length} pages`);
    
    await updateJob({
      status: 'completed',
      completed_at: new Date().toISOString(),
      pages_scraped: scrapedUrls.length,
      pages_failed: failedUrls.length,
      products_found: totalProductsFound,
      products_inserted: totalInserted,
      current_url: null,
    });

    console.log(`[BG] Job ${jobId} completed successfully: ${totalInserted} products inserted`);

  } catch (error) {
    console.error('[BG] Error in background scraping task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { supplierId, url, options } = await req.json();
    const isDryRun = options?.dryRun === true;
    const mode = options?.mode || 'full';  // 'full', 'plan', or 'work'
    const existingJobId = options?.jobId;  // For 'work' mode
    const batchSize = options?.batchSize || 10;
    const skipCleanup = options?.skipCleanup === true;

    if (!supplierId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supplier ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (mode === 'work' && !existingJobId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Job ID is required for work mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if ((mode === 'full' || mode === 'plan') && !url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Starting ${isDryRun ? 'DRY RUN' : mode.toUpperCase()} scrape for supplierId=${supplierId}`);

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

    // =========================================================================
    // WORK MODE: Process next batch of URLs from existing job (synchronous)
    // =========================================================================
    if (mode === 'work') {
      // Set job status to 'scraping' if not already terminal
      const { data: currentJob } = await supabase
        .from('scrape_jobs')
        .select('status')
        .eq('id', existingJobId)
        .single();
      
      if (currentJob && !['completed', 'failed', 'cancelled'].includes(currentJob.status)) {
        await supabase
          .from('scrape_jobs')
          .update({ status: 'scraping' })
          .eq('id', existingJobId);
      }
      
      return await handleWorkMode(supabase, existingJobId, batchSize, supplier, supplierSlug, config, firecrawlKey);
    }

    // =========================================================================
    // PLAN MODE: Map URLs, filter, queue in scrape_job_urls, return immediately
    // =========================================================================
    if (mode === 'plan') {
      console.log(`PLAN MODE: Creating job and queuing URLs for ${supplier.name}`);
      
      // Cleanup old products first (synchronous)
      let deletedCount = 0;
      if (!skipCleanup) {
        deletedCount = await cleanupOldProducts(supabase, supplierId, supplier.name);
      }

      // Create scrape job
      const { data: job, error: jobError } = await supabase
        .from('scrape_jobs')
        .insert({
          supplier_id: supplierId,
          status: 'mapping',
          mode: 'plan',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError || !job) {
        console.error('Failed to create job:', jobError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create scrape job' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const jobId = job.id;
      console.log(`Created plan job ${jobId} for ${supplier.name}`);

      try {
        // Parse base URL
        let baseUrl: string;
        try {
          const urlObj = new URL(url);
          baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
        } catch {
          baseUrl = url;
        }

        // Determine URL to map
        let urlToMap = url;
        if (config.mapFromRoot && config.rootDomain) {
          urlToMap = config.rootDomain;
          console.log(`Using root domain for mapping: ${urlToMap}`);
        }

        const isAustraliaSite = isAustralianUrl(url) || config.skipAuFilter === true;

        // Step 1: Map the website
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
            console.log(`[PLAN] Found ${allUrls.length} total URLs on website`);
          } else {
            console.log('[PLAN] Map failed or returned no URLs, trying fallbacks');
            
            if (config.useCrawlFallback) {
              allUrls = await crawlFallback(url, firecrawlKey, 50);
            }
            if (allUrls.length === 0) {
              allUrls = await linkScrapeFallback(url, firecrawlKey, baseUrl);
            }
            if (allUrls.length === 0) {
              allUrls = [url];
            }
          }
        } catch (error) {
          console.error('[PLAN] Map request failed:', error);
          
          if (config.useCrawlFallback) {
            allUrls = await crawlFallback(url, firecrawlKey, 50);
          }
          if (allUrls.length === 0) {
            allUrls = [url];
          }
        }

        await supabase
          .from('scrape_jobs')
          .update({ urls_mapped: allUrls.length })
          .eq('id', jobId);

        // Step 2: Filter to product URLs
        let productUrls = filterProductUrls(allUrls, baseUrl, supplierSlug, !isAustraliaSite);
        console.log(`[PLAN] Filtered to ${productUrls.length} product URLs`);

        // Add seed URLs if configured and we have few results
        if (config.seedUrls && config.seedUrls.length > 0 && productUrls.length < 10) {
          const seedAbsoluteUrls = config.seedUrls.map(p => p.startsWith('http') ? p : baseUrl + p);
          for (const seedUrl of seedAbsoluteUrls) {
            if (!productUrls.includes(seedUrl)) {
              productUrls.push(seedUrl);
            }
          }
          console.log(`[PLAN] Added seed URLs, now have ${productUrls.length} URLs`);
        }

        // Apply max pages limit
        const maxPages = options?.maxPages || 50;
        if (productUrls.length > maxPages) {
          productUrls = productUrls.slice(0, maxPages);
          console.log(`[PLAN] Limited to ${maxPages} pages`);
        }

        // Step 3: Insert URLs into scrape_job_urls table
        if (productUrls.length > 0) {
          const urlRecords = productUrls.map(u => ({
            job_id: jobId,
            url: u,
            status: 'pending',
          }));

          // Insert in batches of 100
          for (let i = 0; i < urlRecords.length; i += 100) {
            const batch = urlRecords.slice(i, i + 100);
            const { error: insertError } = await supabase
              .from('scrape_job_urls')
              .insert(batch);
            
            if (insertError) {
              console.error('[PLAN] Error inserting URL batch:', insertError);
            }
          }
        }

        // Step 4: Update job status to 'planned'
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'planned',
            urls_to_scrape: productUrls.length,
            urls_queued: productUrls.length,
            urls_completed: 0,
            products_found: 0,
            products_inserted: 0,
            pages_scraped: 0,
            pages_failed: 0,
            current_url: null,
          })
          .eq('id', jobId);

        console.log(`[PLAN] Job ${jobId} planned with ${productUrls.length} URLs queued`);

        return new Response(
          JSON.stringify({
            success: true,
            jobId: jobId,
            mode: 'plan',
            supplier: supplier.name,
            urlsMapped: allUrls.length,
            urlsQueued: productUrls.length,
            oldProductsDeleted: deletedCount,
            message: `Planned ${productUrls.length} URLs. Call with mode='work' to process.`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('[PLAN] Error during planning:', error);
        
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Planning failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        return new Response(
          JSON.stringify({ success: false, error: 'Planning failed', jobId }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // =========================================================================
    // DRY RUN MODE: Return diagnostics without inserting data (synchronous)
    // =========================================================================
    if (isDryRun) {
      // Parse base URL
      let baseUrl: string;
      try {
        const urlObj = new URL(url);
        baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
      } catch {
        baseUrl = url;
      }

      let urlToMap = url;
      if (config.mapFromRoot && config.rootDomain) {
        urlToMap = config.rootDomain;
      }

      const isAustraliaSite = isAustralianUrl(url) || config.skipAuFilter === true;
      
      // Map website
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
        if (mapResponse.ok && mapData.links) {
          allUrls = mapData.links;
        }
      } catch (error) {
        console.error('Map failed:', error);
        allUrls = [url];
      }

      const productUrls = filterProductUrls(allUrls, baseUrl, supplierSlug, !isAustraliaSite);
      const urlsToScrape = productUrls.slice(0, 3);

      // Sample extraction
      const sampleProducts: ScrapedProduct[] = [];
      const sampleWarnings: string[] = [];
      
      for (const pageUrl of urlsToScrape) {
        try {
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
            const htmlProducts = extractProductsFromHtml(htmlData.data.html, pageUrl, baseUrl, supplierSlug);
            sampleProducts.push(...htmlProducts.slice(0, 10));
          }
        } catch (error) {
          sampleWarnings.push(`Error sampling ${pageUrl}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          supplier: supplier.name,
          supplierSlug,
          urlDiscovery: {
            totalDiscovered: allUrls.length,
            productUrlsKept: productUrls.length,
          },
          extraction: {
            productsFound: sampleProducts.length,
            productsSample: sampleProducts.slice(0, 20).map(p => ({
              name: p.name,
              image_url: p.image_url,
              source_url: p.source_url,
            })),
          },
          warnings: sampleWarnings,
          recommendation: sampleProducts.length > 0 
            ? `✅ Ready to import. Found ${sampleProducts.length} sample products.`
            : `❌ No products found. Check URL patterns or seed URLs.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // FULL MODE: Create job, cleanup, then run scraping in background
    // =========================================================================
    
    // Cleanup old products first (synchronous, before returning)
    let deletedCount = 0;
    if (!skipCleanup) {
      deletedCount = await cleanupOldProducts(supabase, supplierId, supplier.name);
    }

    // Create scrape job for progress tracking
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .insert({
        supplier_id: supplierId,
        status: 'starting',
        mode: mode,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create job:', jobError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create scrape job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobId = job.id;
    console.log(`Created job ${jobId} for ${supplier.name}, returning immediately and running scrape in background`);

    // Run the actual scraping in background using EdgeRuntime.waitUntil
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      runScrapingTask(
        supabase,
        jobId,
        supplierId,
        url,
        supplier,
        supplierSlug,
        config,
        firecrawlKey,
        options,
        deletedCount
      )
    );

    // Return immediately with the job ID - the UI will poll for updates via realtime subscription
    return new Response(
      JSON.stringify({
        success: true,
        jobId: jobId,
        supplier: supplier.name,
        message: 'Scraping started in background. Monitor progress via job updates.',
        oldProductsDeleted: deletedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in catalog scrape:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
