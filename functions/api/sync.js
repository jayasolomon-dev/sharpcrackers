// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/sync
// Bidirectional Smart Sync between device local state and Cloudflare D1
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

export async function onRequestPost({ request, env }) {
  if (!env || !env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database binding (DB) not configured yet.' }), 
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const payload = await request.json();
    const clientOrders = Array.isArray(payload.orders) ? payload.orders : [];

    // 1. Persist any incoming client orders that do not already exist in D1
    for (const co of clientOrders) {
      if (!co || !co.orderId) continue;
      const orderId = String(co.orderId);

      const existing = await env.DB.prepare('SELECT order_id FROM orders WHERE order_id = ?').bind(orderId).first().catch(() => null);
      if (!existing) {
        const createdAt = String(co.createdAt || new Date().toISOString());
        const updatedAt = String(co.updatedAt || createdAt);
        const customerName = String(co.customer?.name || 'Customer');
        const customerPhone = String(co.customer?.phone || '');
        const grandTotal = Number(co.grandTotal || co.subtotal || 0);
        const status = String(co.status || 'Pending');

        // Strip heavy base64 images
        const cleanOrder = { ...co };
        if (Array.isArray(cleanOrder.items)) {
          cleanOrder.items = cleanOrder.items.map(it => {
            let img = it.image || '';
            if (img.startsWith('data:')) {
              img = it.code ? `/images/products/${String(it.code).toLowerCase()}.jpg` : '';
            }
            return { ...it, image: img };
          });
        }

        const dataJson = JSON.stringify(cleanOrder);

        await env.DB.prepare(`
          INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, grand_total, status, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(orderId, createdAt, updatedAt, customerName, customerPhone, grandTotal, status, dataJson).run().catch(() => {});
      }
    }

    // 2. Fetch all live orders directly from D1 (ground truth for all devices)
    const currentOrdersRes = await env.DB.prepare("SELECT data_json, status, grand_total, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT 5000").all();
    const unifiedOrders = (currentOrdersRes.results || []).map(row => {
      try {
        const parsed = JSON.parse(row.data_json);
        if (row.status) parsed.status = row.status;
        return parsed;
      } catch { return null; }
    }).filter(o => o && o.orderId);

    // 3. Enquiries sync
    const enquiriesRes = await env.DB.prepare(
      'SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500'
    ).all();
    const serverEnquiries = (enquiriesRes.results || []).map(r => {
      try { return JSON.parse(r.data_json); } catch { return null; }
    }).filter(Boolean);

    // 4. Settings sync
    const settingsRes = await env.DB.prepare('SELECT key, value_json FROM settings').all();
    const serverSettings = {};
    (settingsRes.results || []).forEach(r => {
      try { serverSettings[r.key] = JSON.parse(r.value_json); } catch {}
    });

    return new Response(JSON.stringify({
      success: true,
      orders: unifiedOrders,
      enquiries: serverEnquiries,
      settings: serverSettings
    }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Sync failed', message: err.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}
