// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/enquiries
// Handles Contact Us messages in Cloudflare D1
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

export async function onRequestGet({ env }) {
  if (!env || !env.DB) {
    return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
  }

  try {
    const res = await env.DB.prepare(
      'SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500'
    ).all();

    const enquiries = (res.results || []).map(r => {
      try { return JSON.parse(r.data_json); } catch { return null; }
    }).filter(Boolean);

    return new Response(JSON.stringify(enquiries), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env || !env.DB) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const id = body.id || `ENQ-${Date.now()}`;
    const createdAt = body.createdAt || new Date().toISOString();
    const name = String(body.name || 'Anonymous');
    const phone = String(body.phone || '');
    const email = String(body.email || '');
    const message = String(body.message || '');
    const dataJson = JSON.stringify({ ...body, id, createdAt });

    await env.DB.prepare(`
      INSERT INTO enquiries (id, created_at, name, phone, email, message, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        message = excluded.message,
        data_json = excluded.data_json
    `).bind(id, createdAt, name, phone, email, message, dataJson).run();

    return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
}
