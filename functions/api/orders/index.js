// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/orders
// Handles GET (fetch all orders) & POST (create new order) using Cloudflare D1
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

// GET /api/orders - Fetch all orders from Cloudflare D1
export async function onRequestGet({ env }) {
  if (!env || !env.DB) {
    return new Response(
      JSON.stringify({ 
        error: 'Cloudflare D1 database binding (DB) not configured yet. Please bind DB in Cloudflare Pages settings.',
        orders: [] 
      }), 
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const result = await env.DB.prepare(
      'SELECT data_json FROM orders ORDER BY created_at DESC LIMIT 1000'
    ).all();

    const orders = (result.results || []).map(row => {
      try {
        return JSON.parse(row.data_json);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return new Response(JSON.stringify(orders), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to query orders from D1', message: err.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/orders - Place a new order into Cloudflare D1
export async function onRequestPost({ request, env }) {
  if (!env || !env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database binding (DB) not configured yet.' }), 
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const newOrder = await request.json();

    if (!newOrder.orderId) {
      newOrder.orderId = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!newOrder.createdAt) {
      newOrder.createdAt = new Date().toISOString();
    }
    if (!newOrder.status) {
      newOrder.status = 'Pending';
    }

    const orderId = String(newOrder.orderId);
    const createdAt = String(newOrder.createdAt);
    const updatedAt = newOrder.updatedAt ? String(newOrder.updatedAt) : createdAt;
    const customerName = String(newOrder.customer?.name || 'Customer');
    const customerPhone = String(newOrder.customer?.phone || '');
    const grandTotal = Number(newOrder.grandTotal || newOrder.subtotal || 0);
    const status = String(newOrder.status || 'Pending');
    const dataJson = JSON.stringify(newOrder);

    // Insert or replace into Cloudflare D1 SQL table
    await env.DB.prepare(`
      INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, grand_total, status, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(order_id) DO UPDATE SET
        updated_at = excluded.updated_at,
        customer_name = excluded.customer_name,
        customer_phone = excluded.customer_phone,
        grand_total = excluded.grand_total,
        status = excluded.status,
        data_json = excluded.data_json
    `).bind(
      orderId,
      createdAt,
      updatedAt,
      customerName,
      customerPhone,
      grandTotal,
      status,
      dataJson
    ).run();

    return new Response(JSON.stringify(newOrder), { status: 201, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to save order to D1', message: err.message }), 
      { status: 400, headers: corsHeaders }
    );
  }
}
