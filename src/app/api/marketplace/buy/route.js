import { supabase } from '@/lib/supabase/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, buyer } = body || {};
    if (!id || !buyer) return new Response(JSON.stringify({ error: 'Missing id or buyer' }), { status: 400 });

    // Get the listing from Supabase
    const { data: listing, error: fetchError } = await supabase
      .from('marketplace')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (fetchError || !listing) {
      return new Response(JSON.stringify({ error: 'Listing not found or already sold' }), { status: 404 });
    }

    // Check if buyer is trying to buy their own listing
    if (listing.seller.toLowerCase() === buyer.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'You cannot buy your own listing' }), { status: 400 });
    }

    // For now, we'll update the listing status to sold
    // In a real implementation, this would be handled by the execute-purchase endpoint
    // which would perform the actual blockchain transaction
    
    try {
      // Update listing status to sold
      const { error: updateError } = await supabase
        .from('marketplace')
        .update({ 
          status: 'sold', 
          buyer: buyer,
          sold_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update listing status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to complete purchase' }), { status: 500 });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Purchase completed successfully',
        listing: { ...listing, status: 'sold', buyer, sold_at: new Date().toISOString() },
        note: 'This is a simplified purchase. For real blockchain transactions, use the execute-purchase endpoint.'
      }), { status: 200 });

    } catch (error) {
      console.error('Purchase error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to complete purchase. Please try again.' 
      }), { status: 500 });
    }

  } catch (err) {
    console.error('Buy route error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
