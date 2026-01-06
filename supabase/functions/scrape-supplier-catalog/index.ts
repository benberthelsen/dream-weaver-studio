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

    console.log(`Starting catalog scrape for ${supplier.name} from ${url}`);

    // Step 1: Map the website to find all product URLs
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        search: options?.search || 'colour color product',
        limit: options?.limit || 500,
      }),
    });

    const mapData = await mapResponse.json();
    
    if (!mapResponse.ok) {
      console.error('Map failed:', mapData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to map website', details: mapData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const productUrls = mapData.links || [];
    console.log(`Found ${productUrls.length} URLs to process`);

    // Step 2: Scrape the main page for product data
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok) {
      console.error('Scrape failed:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to scrape page', details: scrapeData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract product information from the scraped content
    const products: ScrapedProduct[] = [];
    const html = scrapeData.data?.html || '';
    const links = scrapeData.data?.links || [];

    // Find image links that look like product images
    const imageMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi);
    for (const match of imageMatches) {
      const imageUrl = match[1];
      const altText = match[2];
      
      // Filter for product-like images (not icons, logos, etc.)
      if (imageUrl && altText && 
          !imageUrl.includes('logo') && 
          !imageUrl.includes('icon') &&
          (imageUrl.includes('product') || imageUrl.includes('colour') || imageUrl.includes('swatch') || altText.length > 3)) {
        products.push({
          name: altText.trim(),
          image_url: imageUrl.startsWith('http') ? imageUrl : `${url}${imageUrl}`,
          source_url: url,
        });
      }
    }

    console.log(`Extracted ${products.length} products from page`);

    // Step 3: Insert products into catalog_items
    const insertedProducts = [];
    for (const product of products.slice(0, 100)) { // Limit to 100 per scrape
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
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select();

      if (!error && data) {
        insertedProducts.push(data[0]);
      }
    }

    console.log(`Inserted ${insertedProducts.length} products into catalog`);

    return new Response(
      JSON.stringify({
        success: true,
        supplier: supplier.name,
        urlsFound: productUrls.length,
        productsExtracted: products.length,
        productsInserted: insertedProducts.length,
        products: insertedProducts.slice(0, 10), // Return first 10 as sample
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
