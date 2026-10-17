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
    const clientDeletedIds = Array.isArray(payload.deletedOrderIds) ? payload.deletedOrderIds : [];

    // 1. Fetch server deleted order IDs
    const deletedRes = await env.DB.prepare('SELECT order_id FROM deleted_orders').all();
    const serverDeletedIds = (deletedRes.results || []).map(r => r.order_id);
    const allDeletedSet = new Set([...serverDeletedIds, ...clientDeletedIds]);

    // Record newly discovered deleted IDs into D1
    const newDeletions = clientDeletedIds.filter(id => !serverDeletedIds.includes(id));
    for (const delId of newDeletions) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO deleted_orders (order_id, deleted_at) VALUES (?, ?)'
      ).bind(delId, new Date().toISOString()).run();
      await env.DB.prepare('DELETE FROM orders WHERE order_id = ?').bind(delId).run();
    }

    // 2. Fetch all current orders from D1
    const currentOrdersRes = await env.DB.prepare('SELECT order_id, data_json FROM orders').all();
    const ordersMap = new Map();
    (currentOrdersRes.results || []).forEach(row => {
      try {
        const parsed = JSON.parse(row.data_json);
        if (parsed && parsed.orderId && !allDeletedSet.has(parsed.orderId)) {
          ordersMap.set(parsed.orderId, parsed);
        }
      } catch {}
    });

    // 3. Reconcile with incoming client orders
    const toInsertOrUpdate = [];
    for (const co of clientOrders) {
      if (!co || !co.orderId || allDeletedSet.has(co.orderId)) continue;
      const existing = ordersMap.get(co.orderId);
      if (!existing) {
        ordersMap.set(co.orderId, co);
        toInsertOrUpdate.push(co);
      } else {
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const clientTime = new Date(co.updatedAt || co.createdAt || 0).getTime();
        if (clientTime > existingTime) {
          const merged = { ...existing, ...co };
          ordersMap.set(co.orderId, merged);
          toInsertOrUpdate.push(merged);
        }
      }
    }

    // Write any new/updated client orders to D1
    for (const o of toInsertOrUpdate) {
      const orderId = String(o.orderId);
      const createdAt = String(o.createdAt || new Date().toISOString());
      const updatedAt = String(o.updatedAt || createdAt);
      const customerName = String(o.customer?.name || 'Customer');
      const customerPhone = String(o.customer?.phone || '');
      const grandTotal = Number(o.grandTotal || o.subtotal || 0);
      const status = String(o.status || 'Pending');
      const dataJson = JSON.stringify(o);

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
      `).bind(orderId, createdAt, updatedAt, customerName, customerPhone, grandTotal, status, dataJson).run();
    }

    // 4. Return sorted unified list
    const unifiedOrders = Array.from(ordersMap.values()).sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    // 5. Enquiries sync
    const enquiriesRes = await env.DB.prepare(
      'SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500'
    ).all();
    const serverEnquiries = (enquiriesRes.results || []).map(r => {
      try { return JSON.parse(r.data_json); } catch { return null; }
    }).filter(Boolean);

    // 6. Settings sync
    const settingsRes = await env.DB.prepare('SELECT key, value_json FROM settings').all();
    const serverSettings = {};
    (settingsRes.results || []).forEach(r => {
      try { serverSettings[r.key] = JSON.parse(r.value_json); } catch {}
    });

    return new Response(JSON.stringify({
      orders: unifiedOrders,
      enquiries: serverEnquiries,
      settings: serverSettings,
      deletedOrderIds: Array.from(allDeletedSet)
    }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Sync failed', message: err.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
}
