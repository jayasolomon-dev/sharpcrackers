// ============================================================================
// SHARP CRACKERS - CLOUDFLARE WORKER ENTRY POINT
// Connects Cloudflare Static Assets (SPA) + Cloudflare D1 SQL Database (/api/*)
// ============================================================================

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Route API calls to Cloudflare D1 Database
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    // 3. Fallback to Cloudflare Static Assets (Single Page App)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleApiRequest(request, env, url) {
  if (!env || !env.DB) {
    return jsonResponse({ 
      error: 'Cloudflare D1 Database (DB) binding is not connected to this Worker.',
      tip: 'Ensure DB binding is configured in wrangler.json and Cloudflare Dashboard.' 
    }, 503);
  }

  const { pathname } = url;
  const method = request.method;

  try {
    // -------------------------------------------------------------
    // POST /api/sync - Smart Bi-directional Sync
    // -------------------------------------------------------------
    if (pathname === '/api/sync' && method === 'POST') {
      const payload = await request.json().catch(() => ({}));
      const clientOrders = Array.isArray(payload.orders) ? payload.orders : [];
      const clientDeletedIds = Array.isArray(payload.deletedOrderIds) ? payload.deletedOrderIds : [];

      // 1. Fetch server deleted order IDs
      const deletedRes = await env.DB.prepare('SELECT order_id FROM deleted_orders').all();
      const serverDeletedIds = (deletedRes.results || []).map(r => r.order_id);
      const allDeletedSet = new Set([...serverDeletedIds, ...clientDeletedIds]);

      // Record newly discovered deleted IDs into D1
      const newDeletions = clientDeletedIds.filter(id => !serverDeletedIds.includes(id));
      for (const delId of newDeletions) {
        await env.DB.prepare('INSERT OR IGNORE INTO deleted_orders (order_id, deleted_at) VALUES (?, ?)')
          .bind(delId, new Date().toISOString()).run();
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
      const enquiriesRes = await env.DB.prepare('SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500').all();
      const serverEnquiries = (enquiriesRes.results || []).map(r => {
        try { return JSON.parse(r.data_json); } catch { return null; }
      }).filter(Boolean);

      // 6. Settings sync
      const settingsRes = await env.DB.prepare('SELECT key, value_json FROM settings').all();
      const serverSettings = {};
      (settingsRes.results || []).forEach(r => {
        try { serverSettings[r.key] = JSON.parse(r.value_json); } catch {}
      });

      return jsonResponse({
        orders: unifiedOrders,
        enquiries: serverEnquiries,
        settings: serverSettings,
        deletedOrderIds: Array.from(allDeletedSet)
      });
    }

    // -------------------------------------------------------------
    // /api/orders (GET all, POST new order)
    // -------------------------------------------------------------
    if (pathname === '/api/orders') {
      if (method === 'GET') {
        const result = await env.DB.prepare('SELECT data_json FROM orders ORDER BY created_at DESC LIMIT 1000').all();
        const orders = (result.results || []).map(row => {
          try { return JSON.parse(row.data_json); } catch { return null; }
        }).filter(Boolean);
        return jsonResponse(orders);
      }

      if (method === 'POST') {
        const order = await request.json();
        const orderId = String(order.orderId || `SC-${Date.now()}`);
        const createdAt = String(order.createdAt || new Date().toISOString());
        const customerName = String(order.customer?.name || 'Customer');
        const customerPhone = String(order.customer?.phone || '');
        const grandTotal = Number(order.grandTotal || order.subtotal || 0);
        const status = String(order.status || 'Pending');
        const dataJson = JSON.stringify({ ...order, orderId, createdAt });

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
        `).bind(orderId, createdAt, createdAt, customerName, customerPhone, grandTotal, status, dataJson).run();

        return jsonResponse({ success: true, orderId }, 201);
      }
    }

    // -------------------------------------------------------------
    // /api/orders/:id (PUT update, DELETE delete)
    // -------------------------------------------------------------
    const orderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
    if (orderMatch) {
      const orderId = decodeURIComponent(orderMatch[1]);

      if (method === 'PUT') {
        const body = await request.json();
        const newStatus = body.status;
        const updatedAt = body.updatedAt || new Date().toISOString();

        const existing = await env.DB.prepare('SELECT data_json FROM orders WHERE order_id = ?').bind(orderId).first();
        if (!existing) {
          return jsonResponse({ error: 'Order not found' }, 404);
        }

        const orderObj = JSON.parse(existing.data_json);
        orderObj.status = newStatus || orderObj.status;
        orderObj.updatedAt = updatedAt;

        await env.DB.prepare('UPDATE orders SET status = ?, updated_at = ?, data_json = ? WHERE order_id = ?')
          .bind(orderObj.status, updatedAt, JSON.stringify(orderObj), orderId).run();

        return jsonResponse(orderObj);
      }

      if (method === 'DELETE') {
        const deletedAt = new Date().toISOString();
        await env.DB.prepare('DELETE FROM orders WHERE order_id = ?').bind(orderId).run();
        await env.DB.prepare(`
          INSERT INTO deleted_orders (order_id, deleted_at) VALUES (?, ?)
          ON CONFLICT(order_id) DO UPDATE SET deleted_at = excluded.deleted_at
        `).bind(orderId, deletedAt).run();

        return jsonResponse({ success: true, deletedOrderId: orderId });
      }
    }

    // -------------------------------------------------------------
    // /api/enquiries (GET all, POST new)
    // -------------------------------------------------------------
    if (pathname === '/api/enquiries') {
      if (method === 'GET') {
        const res = await env.DB.prepare('SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500').all();
        const enquiries = (res.results || []).map(r => {
          try { return JSON.parse(r.data_json); } catch { return null; }
        }).filter(Boolean);
        return jsonResponse(enquiries);
      }

      if (method === 'POST') {
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

        return jsonResponse({ success: true, id }, 201);
      }
    }

    // -------------------------------------------------------------
    // /api/settings (GET, POST)
    // -------------------------------------------------------------
    if (pathname === '/api/settings') {
      if (method === 'GET') {
        const res = await env.DB.prepare('SELECT key, value_json FROM settings').all();
        const settings = {};
        (res.results || []).forEach(r => {
          try { settings[r.key] = JSON.parse(r.value_json); } catch {}
        });
        return jsonResponse(settings);
      }

      if (method === 'POST') {
        const newSettings = await request.json();
        const updatedAt = new Date().toISOString();

        for (const [key, val] of Object.entries(newSettings)) {
          await env.DB.prepare(`
            INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
          `).bind(key, JSON.stringify(val), updatedAt).run();
        }

        return jsonResponse({ success: true, settings: newSettings });
      }
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  } catch (err) {
    return jsonResponse({ error: 'Internal Server Error', message: err.message }, 500);
  }
}
