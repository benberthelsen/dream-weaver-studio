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
      
      // If we get a 5xx error, it might be transient - retry
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

// Extract product info from HTML
function extractProductsFromHtml(html: string, pageUrl: string, baseUrl: string): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  
  // Pattern 1: Look for product images with alt text
  const imgPatterns = [
    /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi,
    /<img[^>]+alt=["']([^"']+)["'][^>]*src=["']([^"']+)["']/gi,
  ];
  
  for (const pattern of imgPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      let imageUrl = pattern === imgPatterns[0] ? match[1] : match[2];
      let altText = pattern === imgPatterns[0] ? match[2] : match[1];
      
      // Skip small images, icons, logos
      if (!imageUrl || !altText) continue;
      if (imageUrl.includes('logo') || imageUrl.includes('icon') || imageUrl.includes('sprite')) continue;
      if (imageUrl.includes('.svg') || imageUrl.includes('data:image')) continue;
      if (altText.length < 3) continue;
      
      // Check if it looks like a product image
      const isProduct = 
        imageUrl.includes('product') || 
        imageUrl.includes('colour') ||
        imageUrl.includes('color') ||
        imageUrl.includes('swatch') ||
        imageUrl.includes('decor') ||
        imageUrl.includes('laminate') ||
        imageUrl.includes('timber') ||
        imageUrl.includes('veneer') ||
        /\d{3,}/.test(imageUrl) || // Has product codes
        altText.toLowerCase().includes('oak') ||
        altText.toLowerCase().includes('walnut') ||
        altText.toLowerCase().includes('white') ||
        altText.toLowerCase().includes('grey') ||
        altText.toLowerCase().includes('gray');
        
      if (!isProduct) continue;
      
      // Normalize image URL
      if (!imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = baseUrl + imageUrl;
        } else {
          imageUrl = baseUrl + '/' + imageUrl;
        }
      }
      
      // Extract color from alt text or filename
      let color = altText;
      const hexMatch = html.match(new RegExp(`${altText}[^#]*#([0-9a-fA-F]{6})`));
      
      products.push({
        name: altText.trim(),
        image_url: imageUrl,
        color: color,
        hex_color: hexMatch ? `#${hexMatch[1]}` : undefined,
        source_url: pageUrl,
      });
    }
  }
  
  // Pattern 2: Look for product cards/divs with data attributes
  const cardPatterns = [
    /data-product-name=["']([^"']+)["'][^>]*data-image=["']([^"']+)["']/gi,
    /class=["'][^"']*product[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][\s\S]*?<[^>]*>([^<]+)</gi,
  ];
  
  for (const pattern of cardPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const name = match[2]?.trim() || match[1]?.trim();
      let imageUrl = match[1]?.includes('.') ? match[1] : match[2];
      
      if (!name || !imageUrl || name.length < 3) continue;
      
      if (!imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = baseUrl + imageUrl;
        }
      }
      
      products.push({
        name: name,
        image_url: imageUrl,
        source_url: pageUrl,
      });
    }
  }
  
  return products;
}

// Filter URLs to find product pages
function filterProductUrls(urls: string[], baseUrl: string): string[] {
  const productKeywords = [
    'product', 'colour', 'color', 'decor', 'range', 'collection',
    'laminate', 'veneer', 'timber', 'stone', 'surface', 'finish',
    'swatch', 'sample', 'melamine', 'compact', 'acrylic'
  ];
  
  const excludeKeywords = [
    'blog', 'news', 'contact', 'about', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'support', 'career', 'job',
    'pdf', 'download', 'document', 'warranty', 'sustainability'
  ];
  
  return urls.filter(url => {
    const lowerUrl = url.toLowerCase();
    
    // Must be from same domain
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);
      if (urlObj.hostname !== baseObj.hostname) return false;
    } catch {
      return false;
    }
    
    // Exclude non-product pages
    if (excludeKeywords.some(kw => lowerUrl.includes(kw))) return false;
    
    // Include if has product keywords
    if (productKeywords.some(kw => lowerUrl.includes(kw))) return true;
    
    // Include pages that look like they have product codes
    if (/\/[a-z]{2,3}\d{3,}/.test(lowerUrl)) return true;
    
    return false;
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Parse base URL
    let baseUrl: string;
    try {
      const urlObj = new URL(url);
      baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      baseUrl = url;
    }

    console.log(`Starting full catalog scrape for ${supplier.name} from ${url}`);

    // Step 1: Map the entire website to find all URLs
    console.log('Step 1: Mapping website...');
    let allUrls: string[] = [];
    
    try {
      const mapResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          limit: options?.mapLimit || 1000,
          includeSubdomains: false,
        }),
      });

      const mapData = await mapResponse.json();
      
      if (mapResponse.ok && mapData.links) {
        allUrls = mapData.links;
        console.log(`Found ${allUrls.length} total URLs on website`);
      } else {
        console.error('Map failed:', mapData);
        // Continue with just the provided URL
        allUrls = [url];
      }
    } catch (error) {
      console.error('Map request failed:', error);
      allUrls = [url];
    }

    // Step 2: Filter to product-related URLs
    const productUrls = filterProductUrls(allUrls, baseUrl);
    console.log(`Filtered to ${productUrls.length} product-related URLs`);
    
    // Limit how many pages to scrape
    const maxPages = options?.maxPages || 20;
    const urlsToScrape = productUrls.slice(0, maxPages);
    console.log(`Will scrape ${urlsToScrape.length} pages`);

    // Step 3: Scrape each product page
    const allProducts: ScrapedProduct[] = [];
    const scrapedUrls: string[] = [];
    const failedUrls: string[] = [];
    
    for (const pageUrl of urlsToScrape) {
      console.log(`Scraping: ${pageUrl}`);
      
      try {
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const scrapeResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: pageUrl,
            formats: ['html'],
            onlyMainContent: false, // Get full page for better product extraction
          }),
        }, 2, 3000); // Fewer retries, longer delay

        const scrapeData = await scrapeResponse.json();
        
        if (scrapeResponse.ok && scrapeData.data?.html) {
          const products = extractProductsFromHtml(scrapeData.data.html, pageUrl, baseUrl);
          console.log(`  Found ${products.length} products on ${pageUrl}`);
          allProducts.push(...products);
          scrapedUrls.push(pageUrl);
        } else {
          console.log(`  Failed to scrape ${pageUrl}:`, scrapeData.error);
          failedUrls.push(pageUrl);
        }
      } catch (error) {
        console.error(`  Error scraping ${pageUrl}:`, error);
        failedUrls.push(pageUrl);
      }
    }

    console.log(`Total products extracted: ${allProducts.length}`);

    // Step 4: Deduplicate products by name+image
    const seenProducts = new Set<string>();
    const uniqueProducts = allProducts.filter(p => {
      const key = `${p.name.toLowerCase()}|${p.image_url}`;
      if (seenProducts.has(key)) return false;
      seenProducts.add(key);
      return true;
    });
    
    console.log(`Unique products after dedup: ${uniqueProducts.length}`);

    // Step 5: Insert products into catalog_items
    const insertedProducts: any[] = [];
    const insertLimit = options?.insertLimit || 200;
    
    for (const product of uniqueProducts.slice(0, insertLimit)) {
      try {
        const { data, error } = await supabase
          .from('catalog_items')
          .insert({
            supplier_id: supplierId,
            name: product.name,
            image_url: product.image_url,
            color: product.color,
            material: product.material,
            finish_type: product.finish_type,
            hex_color: product.hex_color,
            source_url: product.source_url,
            sku: product.sku,
            is_active: true,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          insertedProducts.push(data);
        } else if (error) {
          // Might be duplicate, try upsert based on name+supplier
          console.log(`Insert failed for ${product.name}: ${error.message}`);
        }
      } catch (err) {
        console.error(`Failed to insert ${product.name}:`, err);
      }
    }

    console.log(`Inserted ${insertedProducts.length} products into catalog`);

    return new Response(
      JSON.stringify({
        success: true,
        supplier: supplier.name,
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
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
