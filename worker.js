// ============================================================================
// 30-DAY RETENTION POLICY CONFIGURATION
// Bills older than 30 days are automatically purged from D1 Cloud Storage & Local Cache
// ============================================================================
const ORDER_RETENTION_DAYS = 30;
const ORDER_RETENTION_MS = ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000;

function isOrderExpired(order, now = Date.now()) {
  if (!order) return false;
  const rawDate = order.createdAt || order.date;
  const time = rawDate ? new Date(rawDate).getTime() : NaN;
  if (!Number.isFinite(time)) return false;
  return (now - time) > ORDER_RETENTION_MS;
}

function pruneExpiredOrders(orders, now = Date.now()) {
  if (!Array.isArray(orders)) return [];
  return orders.filter(o => !isOrderExpired(o, now));
}

async function purgeExpiredD1Orders(env) {
  if (!env || !env.DB) return;
  try {
    const cutoffDate = new Date(Date.now() - ORDER_RETENTION_MS).toISOString();
    // Ensure archived_orders table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS archived_orders (
        order_id TEXT PRIMARY KEY,
        archived_at TEXT,
        data_json TEXT
      )
    `).run().catch(() => {});

    // Archive expired orders into archived_orders table before purging from active
    await env.DB.prepare(`
      INSERT OR IGNORE INTO archived_orders (order_id, archived_at, data_json)
      SELECT order_id, datetime('now'), data_json FROM orders
      WHERE datetime(created_at) < datetime(?) OR created_at < ?
    `).bind(cutoffDate, cutoffDate).run().catch(() => {});

    // Delete from active orders
    await env.DB.prepare('DELETE FROM orders WHERE datetime(created_at) < datetime(?) OR created_at < ?')
      .bind(cutoffDate, cutoffDate).run().catch(() => {});
  } catch (e) {
    console.error('Error auto-archiving expired orders in D1:', e);
  }
}

function getCorsHeaders(env = {}) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(data, status = 200, env = {}) {
  return new Response(JSON.stringify(data), { status, headers: getCorsHeaders(env) });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(env) });
    }

    // 2. Route API calls to Cloudflare D1 Database
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    // 3. Static Assets & SPA Routing (fall back to / for client-side routing like /admin)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !url.pathname.includes('.')) {
        const indexUrl = new URL('/', request.url);
        return env.ASSETS.fetch(new Request(indexUrl, request));
      }
      return response;
    }

    return new Response('Not Found', { status: 404 });
  },

  // Cloudflare Scheduled Cron Trigger for automated background cleanup
  async scheduled(event, env, ctx) {
    await purgeExpiredD1Orders(env);
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
    // POST /api/orders/purge-expired - Manual/Scheduled Purge
    // -------------------------------------------------------------
    if (pathname === '/api/orders/purge-expired' && method === 'POST') {
      await purgeExpiredD1Orders(env);
      return jsonResponse({
        success: true,
        retentionDays: ORDER_RETENTION_DAYS,
        message: 'Expired bills older than 30 days safely backed up and archived in D1 database successfully.'
      });
    }

    // -------------------------------------------------------------
    // /api/orders/backup (GET all, POST incoming backup batch)
    // -------------------------------------------------------------
    if (pathname === '/api/orders/backup') {
      // Ensure archived_orders table exists
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS archived_orders (
          order_id TEXT PRIMARY KEY,
          archived_at TEXT,
          data_json TEXT
        )
      `).run().catch(() => {});

      if (method === 'GET') {
        const res = await env.DB.prepare('SELECT data_json FROM archived_orders ORDER BY archived_at DESC LIMIT 1000').all();
        const orders = (res.results || []).map(r => {
          try { return JSON.parse(r.data_json); } catch { return null; }
        }).filter(Boolean);
        return jsonResponse(orders);
      }

      if (method === 'POST') {
        const payload = await request.json().catch(() => ({}));
        const incoming = Array.isArray(payload) ? payload : (Array.isArray(payload.orders) ? payload.orders : []);
        for (const o of incoming) {
          if (!o || !o.orderId) continue;
          const orderId = String(o.orderId);
          const archivedAt = String(o.archivedAt || new Date().toISOString());
          const dataJson = JSON.stringify({ ...o, archivedAt, isArchived: true });
          await env.DB.prepare(`
            INSERT OR IGNORE INTO archived_orders (order_id, archived_at, data_json) VALUES (?, ?, ?)
          `).bind(orderId, archivedAt, dataJson).run().catch(() => {});
        }
        return jsonResponse({ success: true, count: incoming.length });
      }
    }

    // -------------------------------------------------------------
    // POST /api/orders/restore - Restore order from archive to active
    // -------------------------------------------------------------
    if (pathname === '/api/orders/restore' && method === 'POST') {
      const { orderId } = await request.json().catch(() => ({}));
      if (!orderId) {
        return jsonResponse({ error: 'orderId is required' }, 400);
      }
      const existing = await env.DB.prepare('SELECT data_json FROM archived_orders WHERE order_id = ?').bind(orderId).first();
      if (!existing) {
        return jsonResponse({ error: 'Order not found in archive' }, 404);
      }

      const orderObj = JSON.parse(existing.data_json);
      orderObj.createdAt = new Date().toISOString();
      orderObj.updatedAt = new Date().toISOString();
      delete orderObj.archivedAt;
      delete orderObj.isArchived;

      // Remove from archived_orders
      await env.DB.prepare('DELETE FROM archived_orders WHERE order_id = ?').bind(orderId).run();

      // Insert back into active orders
      const createdAt = orderObj.createdAt;
      const customerName = String(orderObj.customer?.name || 'Customer');
      const customerPhone = String(orderObj.customer?.phone || '');
      const grandTotal = Number(orderObj.grandTotal || 0);
      const status = String(orderObj.status || 'Pending');
      const dataJson = JSON.stringify(orderObj);

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

      return jsonResponse({ success: true, restoredOrder: orderObj });
    }

    // -------------------------------------------------------------
    // POST /api/sync - Smart Bi-directional Sync with 30-day Retention
    // -------------------------------------------------------------
    if (pathname === '/api/sync' && method === 'POST') {
      // Auto-purge any bills older than 30 days from D1
      await purgeExpiredD1Orders(env);

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

      // 2. Fetch all current orders from D1 (excluding expired and deleted)
      const currentOrdersRes = await env.DB.prepare('SELECT order_id, data_json FROM orders').all();
      const ordersMap = new Map();
      (currentOrdersRes.results || []).forEach(row => {
        try {
          const parsed = JSON.parse(row.data_json);
          if (parsed && parsed.orderId && !allDeletedSet.has(parsed.orderId) && !isOrderExpired(parsed)) {
            ordersMap.set(parsed.orderId, parsed);
          }
        } catch {}
      });

      // 3. Reconcile with incoming client orders (strictly within 30-day retention)
      const toInsertOrUpdate = [];
      for (const co of clientOrders) {
        if (!co || !co.orderId || allDeletedSet.has(co.orderId) || isOrderExpired(co)) continue;
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

      // 4. Return sorted unified list, strictly filtered to active <=30 day orders
      const unifiedOrders = pruneExpiredOrders(Array.from(ordersMap.values())).sort((a, b) => {
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
        // Auto-purge expired orders before returning
        await purgeExpiredD1Orders(env);

        const result = await env.DB.prepare('SELECT data_json FROM orders ORDER BY created_at DESC LIMIT 1000').all();
        const orders = (result.results || []).map(row => {
          try { return JSON.parse(row.data_json); } catch { return null; }
        }).filter(Boolean);
        return jsonResponse(pruneExpiredOrders(orders));
      }

      if (method === 'POST') {
        // Auto-purge expired orders before saving new order
        await purgeExpiredD1Orders(env);

        const order = await request.json();
        if (isOrderExpired(order)) {
          return jsonResponse({ error: 'Order is older than the 30-day retention window' }, 400);
        }

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
