// ============================================================================
// CLOUDFLARE PAGES FUNCTION - /api/orders/[id]
// Handles PUT (update status) & DELETE (remove order) using Cloudflare D1
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

// PUT /api/orders/[id] - Update order status (Pending, Confirmed, Dispatched, Delivered, Cancelled)
export async function onRequestPut({ params, request, env }) {
  if (!env || !env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database binding (DB) not configured yet.' }), 
      { status: 503, headers: corsHeaders }
    );
  }

  const orderId = params.id;
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const newStatus = body.status;
    const updatedAt = body.updatedAt || new Date().toISOString();

    // 1. Fetch current order
    const existing = await env.DB.prepare(
      'SELECT data_json FROM orders WHERE order_id = ?'
    ).bind(orderId).first();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });
    }

    const orderObj = JSON.parse(existing.data_json);
    orderObj.status = newStatus || orderObj.status;
    orderObj.updatedAt = updatedAt;

    // 2. Update order record in D1
    await env.DB.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = ?, data_json = ? 
      WHERE order_id = ?
    `).bind(
      orderObj.status,
      updatedAt,
      JSON.stringify(orderObj),
      orderId
    ).run();

    return new Response(JSON.stringify(orderObj), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to update order in D1', message: err.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/orders/[id] - Remove order and permanently record in deleted_orders
export async function onRequestDelete({ params, env }) {
  if (!env || !env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database binding (DB) not configured yet.' }), 
      { status: 503, headers: corsHeaders }
    );
  }

  const orderId = params.id;
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400, headers: corsHeaders });
  }

  try {
    const deletedAt = new Date().toISOString();

    // 1. Delete from orders table
    await env.DB.prepare('DELETE FROM orders WHERE order_id = ?').bind(orderId).run();

    // 2. Insert into deleted_orders table to prevent resurrection
    await env.DB.prepare(`
      INSERT INTO deleted_orders (order_id, deleted_at) 
      VALUES (?, ?) 
      ON CONFLICT(order_id) DO UPDATE SET deleted_at = excluded.deleted_at
    `).bind(orderId, deletedAt).run();

    return new Response(JSON.stringify({ success: true, deletedOrderId: orderId }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete order from D1', message: err.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}
