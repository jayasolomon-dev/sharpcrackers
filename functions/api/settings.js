// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/settings
// Handles shop configuration settings in Cloudflare D1
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
    return new Response(JSON.stringify({}), { status: 200, headers: corsHeaders });
  }

  try {
    const res = await env.DB.prepare('SELECT key, value_json FROM settings').all();
    const settings = {};
    (res.results || []).forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value_json);
      } catch {}
    });
    return new Response(JSON.stringify(settings), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env || !env.DB) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503, headers: corsHeaders });
  }

  try {
    const newSettings = await request.json();
    const updatedAt = new Date().toISOString();

    for (const [key, val] of Object.entries(newSettings)) {
      await env.DB.prepare(`
        INSERT INTO settings (key, value_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value_json = excluded.value_json,
          updated_at = excluded.updated_at
      `).bind(key, JSON.stringify(val), updatedAt).run();
    }

    return new Response(JSON.stringify({ success: true, settings: newSettings }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
}
