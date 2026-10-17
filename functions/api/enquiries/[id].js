// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/enquiries/[id]
// Handles DELETE enquiry in Cloudflare D1
// ============================================================================

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestDelete({ params, env }) {
  if (!env || !env.DB) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503, headers: corsHeaders });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: corsHeaders });
  }

  try {
    await env.DB.prepare('DELETE FROM enquiries WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
