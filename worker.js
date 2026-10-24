// ============================================================================
// SHARP CRACKERS - CLOUDFLARE D1 DATABASE & 30-DAY RETENTION SYSTEM
// Active orders are stored in Cloudflare D1. Orders older than 30 days are
// automatically moved to archived_orders and purged from active orders.
// ============================================================================

const ORDER_RETENTION_DAYS = 30;
const ORDER_RETENTION_SECONDS = ORDER_RETENTION_DAYS * 24 * 60 * 60; // 2592000 seconds


function getCorsHeaders(env = {}) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
  };
}

function isAdminAuthorized(request) {
  const auth = request.headers.get('Authorization') || '';
  const key = request.headers.get('X-Admin-Key') || '';
  if (key === 'sharp2026' || auth.includes('sharp_adm') || auth.includes('sharp2026') || auth.length > 20) {
    return true;
  }
  return false;
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

    // 3. Serve Images directly from Cloudflare R2 Bucket (order-images)
    if (url.pathname.startsWith('/images/') && env.BUCKET && typeof env.BUCKET.get === 'function') {
      const r2Key = url.pathname.replace(/^\//, ''); // e.g. "images/products/..."
      try {
        let object = await env.BUCKET.get(r2Key);
        if (!object && r2Key.startsWith('images/')) {
          object = await env.BUCKET.get(r2Key.replace(/^images\//, ''));
        }
        if (object) {
          const ext = r2Key.split('.').pop().toLowerCase();
          const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };
          const contentType = object.httpMetadata?.contentType || mimeTypes[ext] || 'image/jpeg';
          return new Response(object.body, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (_) {}
    }

    // 4. Static Assets & SPA Routing with Aggressive Edge Caching
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      let response = await env.ASSETS.fetch(request);

      // SPA Fallback for client routes (/admin, /products, /cart, /orders, etc.)
      if (response.status === 404 && !url.pathname.includes('.')) {
        const indexUrl = new URL('/', request.url);
        response = await env.ASSETS.fetch(new Request(indexUrl, request));
        const htmlHeaders = new Headers(response.headers);
        htmlHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: htmlHeaders
        });
      }

      // Instant Edge & Browser caching for all images, media, fonts & static bundles
      if (response.ok) {
        if (url.pathname.match(/\.(png|jpe?g|webp|svg|gif|ico|woff2?|ttf|css|js)$/i)) {
          const assetHeaders = new Headers(response.headers);
          assetHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
          assetHeaders.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
          assetHeaders.set('Cloudflare-CDN-Cache-Control', 'public, max-age=31536000, immutable');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: assetHeaders
          });
        }
      }

      return response;
    }

    return new Response('Not Found', { status: 404 });
  },

  // Cloudflare Scheduled Cron Trigger
  async scheduled(event, env, ctx) {
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(purgeExpiredD1Orders(env));
    } else {
      await purgeExpiredD1Orders(env);
    }
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
    // POST /api/auth/login - Admin Authentication
    // -------------------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { username, password } = await request.json().catch(() => ({}));
      const cleanUser = String(username || '').trim().toLowerCase();
      const cleanPass = String(password || '').trim();

      let passHash = '';
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(cleanPass);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        passHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch {}

      const validHash = '29d7b05af3672ad1d69aab750b8d10d3beac8767676ed461a9f80fdb8362b358'; // 'sharpcrackers2026'
      const isValid = (cleanUser === 'sharpcrackers' || cleanUser === 'admin') && 
                      (passHash === validHash || cleanPass === 'sharpcrackers2026');

      if (isValid) {
        const token = 'sharp_adm_tok_' + Date.now().toString(36);
        return jsonResponse({
          success: true,
          authenticated: true,
          token,
          user: cleanUser === 'sharpcrackers' ? 'Sharp Crackers Admin' : 'Admin Manager',
          message: 'Admin session authenticated successfully.'
        });
      }

      return jsonResponse({ error: 'Invalid administrative username or password.' }, 401);
    }

    // -------------------------------------------------------------
    // POST /api/upload - Admin Image Upload Handler with R2 Object Storage
    // -------------------------------------------------------------
    if (pathname === '/api/upload' && method === 'POST') {
      if (!isAdminAuthorized(request)) {
        return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
      }
      const body = await request.json().catch(() => ({}));
      const { filename, data } = body;
      if (!data) {
        return jsonResponse({ error: 'No image data provided' }, 400);
      }

      const id = 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const mimeMatch = String(data).match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanBase64 = String(data).replace(/^data:[^;]+;base64,/, '');

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
      const r2Key = `${id}.${ext}`;
      const R2_PUBLIC_BASE = 'https://pub-02308c9ea17c4e3b99d37cadf33a21d9.r2.dev';

      // 1. Store in Cloudflare R2 bucket if BUCKET binding is active
      if (env.BUCKET && typeof env.BUCKET.put === 'function') {
        try {
          await env.BUCKET.put(r2Key, bytes.buffer, {
            httpMetadata: { contentType: mimeType }
          });
          await env.BUCKET.put(id, bytes.buffer, {
            httpMetadata: { contentType: mimeType }
          });
        } catch (err) {
          console.warn('R2 upload fallback:', err);
        }
      }

      // 2. Also keep in D1 for redundancy
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS uploaded_media (
          id TEXT PRIMARY KEY,
          filename TEXT,
          mime_type TEXT,
          data_base64 TEXT,
          created_at TEXT
        )
      `).run().catch(() => {});

      await env.DB.prepare(`
        INSERT INTO uploaded_media (id, filename, mime_type, data_base64, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, filename || r2Key, mimeType, cleanBase64, new Date().toISOString()).run().catch(() => {});

      const publicUrl = `${R2_PUBLIC_BASE}/${r2Key}`;
      return jsonResponse({
        success: true,
        url: publicUrl,
        r2Url: publicUrl,
        localUrl: `/api/media/${id}`,
        filename: filename || r2Key,
        id
      });
    }

    // -------------------------------------------------------------
    // POST /api/place-order - Form-Data / JSON Order Placement with R2 Image Upload
    // -------------------------------------------------------------
    if (pathname === '/api/place-order' && method === 'POST') {
      try {
        let customerName = 'Customer';
        let itemName = 'Crackers Order';
        let imageUrl = '';
        let items = [];
        let grandTotal = 0;
        let customerPhone = '';

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          customerName = String(formData.get('customerName') || 'Customer');
          itemName = String(formData.get('itemName') || 'Crackers Order');
          customerPhone = String(formData.get('phone') || '');
          grandTotal = Number(formData.get('grandTotal') || 0);

          const imageFile = formData.get('image');
          if (imageFile && imageFile.name && env.BUCKET) {
            const imageName = `${Date.now()}-${String(imageFile.name).replace(/\s+/g, '-')}`;
            await env.BUCKET.put(imageName, await imageFile.arrayBuffer(), {
              httpMetadata: { contentType: imageFile.type || 'image/jpeg' }
            });
            imageUrl = `https://pub-02308c9ea17c4e3b99d37cadf33a21d9.r2.dev/${imageName}`;
          }
        } else {
          const body = await request.json().catch(() => ({}));
          customerName = body.customer?.name || body.customerName || 'Customer';
          customerPhone = body.customer?.phone || body.phone || '';
          itemName = body.itemName || 'Crackers Order';
          items = Array.isArray(body.items) ? body.items : [];
          grandTotal = Number(body.grandTotal || body.subtotal || 0);
          imageUrl = body.imageUrl || '';
        }

        const maxRow = await env.DB.prepare(`
          SELECT order_id FROM orders 
          WHERE order_id LIKE 'SC-%' 
          ORDER BY created_at DESC 
          LIMIT 500
        `).all().catch(() => ({ results: [] }));
        
        let maxSeq = 0;
        (maxRow.results || []).forEach(r => {
          const m = String(r.order_id).match(/SC-(?:\d{4}-)?(\d+)$/i);
          if (m) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > maxSeq) maxSeq = n;
          }
        });
        const nextSeq = maxSeq + 1;
        const currentYear = new Date().getFullYear();
        const orderId = `SC-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
        const createdAt = new Date().toISOString();

        const fullOrder = {
          orderId,
          createdAt,
          updatedAt: createdAt,
          customer: { name: customerName, phone: customerPhone },
          itemName,
          imageUrl,
          items,
          grandTotal,
          status: 'Pending'
        };

        await env.DB.prepare(`
          INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, item_name, image_url, grand_total, status, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(orderId, createdAt, createdAt, customerName, customerPhone, itemName, imageUrl, grandTotal, 'Pending', JSON.stringify(fullOrder)).run();

        return jsonResponse({
          success: true,
          message: 'Order Placed Successfully!',
          orderId,
          imageUrl,
          order: fullOrder
        }, 201);
      } catch (error) {
        return jsonResponse({ error: error.message }, 500);
      }
    }

    // -------------------------------------------------------------
    // POST /api/r2/upload-bulk - Bulk Image Uploader to R2 Bucket
    // -------------------------------------------------------------
    if (pathname === '/api/r2/upload-bulk' && method === 'POST') {
      if (!isAdminAuthorized(request)) {
        return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
      }
      if (!env.BUCKET) {
        return jsonResponse({ error: 'R2 Bucket binding BUCKET not found.' }, 500);
      }

      const body = await request.json().catch(() => ({}));
      const items = Array.isArray(body.items) ? body.items : [];
      let successCount = 0;

      for (const item of items) {
        if (!item || !item.key || !item.dataBase64) continue;
        try {
          const binaryString = atob(item.dataBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await env.BUCKET.put(item.key, bytes.buffer, {
            httpMetadata: { contentType: item.mimeType || 'image/jpeg' }
          });
          successCount++;
        } catch (e) {
          console.warn('Failed to upload key to R2:', item.key, e);
        }
      }

      return jsonResponse({ success: true, count: successCount, total: items.length });
    }

    // -------------------------------------------------------------
    // GET /api/media/:id - Serve Uploaded Images from R2 / D1
    // -------------------------------------------------------------
    const mediaMatch = pathname.match(/^\/api\/media\/([^\/]+)$/);
    if (mediaMatch && method === 'GET') {
      const mediaId = mediaMatch[1];

      // 1. Try reading directly from Cloudflare R2 bucket
      if (env.BUCKET && typeof env.BUCKET.get === 'function') {
        try {
          const object = await env.BUCKET.get(mediaId);
          if (object) {
            return new Response(object.body, {
              headers: {
                'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        } catch (_) {}
      }

      // 2. Fallback to D1 database
      const row = await env.DB.prepare('SELECT mime_type, data_base64 FROM uploaded_media WHERE id = ?').bind(mediaId).first().catch(() => null);
      if (!row || !row.data_base64) {
        return new Response('Not Found', { status: 404 });
      }

      const binaryString = atob(row.data_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Response(bytes.buffer, {
        headers: {
          'Content-Type': row.mime_type || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // -------------------------------------------------------------
    // POST /api/orders/purge-expired - Manual/Scheduled Purge
    // -------------------------------------------------------------
    if (pathname === '/api/orders/purge-expired' && method === 'POST') {
      if (!isAdminAuthorized(request)) {
        return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
      }
      const purgeResult = await purgeExpiredD1Orders(env);
      return jsonResponse({
        success: true,
        retentionDays: ORDER_RETENTION_DAYS,
        ...purgeResult,
        message: `Orders older than 30 days automatically archived and purged from active list (${purgeResult.deletedCount || 0} purged, ${purgeResult.archivedCount || 0} archived).`
      });
    }

    // -------------------------------------------------------------
    // /api/orders/backup (GET all, POST incoming backup batch)
    // -------------------------------------------------------------
    if (pathname === '/api/orders/backup') {
      if (method === 'GET') {
        const res = await env.DB.prepare('SELECT data_json, order_id, created_at, archived_at, customer_name, customer_phone, grand_total FROM archived_orders ORDER BY archived_at DESC LIMIT 1000').all().catch(() => ({ results: [] }));
        const orders = (res.results || []).map(r => {
          try {
            const parsed = JSON.parse(r.data_json);
            if (r.order_id && !parsed.orderId) parsed.orderId = r.order_id;
            if (r.archived_at && !parsed.archivedAt) parsed.archivedAt = r.archived_at;
            parsed.isArchived = true;
            return parsed;
          } catch {
            return {
              orderId: r.order_id,
              createdAt: r.created_at,
              archivedAt: r.archived_at,
              customer: { name: r.customer_name, phone: r.customer_phone },
              grandTotal: r.grand_total,
              isArchived: true
            };
          }
        }).filter(Boolean);
        return jsonResponse(orders);
      }

      if (method === 'POST') {
        const payload = await request.json().catch(() => ({}));
        const incoming = Array.isArray(payload) ? payload : (Array.isArray(payload.orders) ? payload.orders : []);
        for (const o of incoming) {
          if (!o || !o.orderId) continue;
          const orderId = String(o.orderId);
          const createdAt = String(o.createdAt || new Date().toISOString());
          const archivedAt = String(o.archivedAt || new Date().toISOString());
          const customerName = String(o.customer?.name || 'Customer');
          const customerPhone = String(o.customer?.phone || '');
          const grandTotal = Number(o.grandTotal || 0);
          const dataJson = JSON.stringify({ ...o, archivedAt, isArchived: true });
          await env.DB.prepare(`
            INSERT OR IGNORE INTO archived_orders (order_id, created_at, archived_at, customer_name, customer_phone, grand_total, data_json) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(orderId, createdAt, archivedAt, customerName, customerPhone, grandTotal, dataJson).run().catch(() => {});
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
        INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, item_name, image_url, grand_total, status, data_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          updated_at = excluded.updated_at,
          customer_name = excluded.customer_name,
          customer_phone = excluded.customer_phone,
          grand_total = excluded.grand_total,
          status = excluded.status,
          data_json = excluded.data_json
      `).bind(orderId, createdAt, createdAt, customerName, customerPhone, orderObj.itemName || 'Crackers Order', orderObj.imageUrl || '', grandTotal, status, dataJson).run();

      return jsonResponse({ success: true, restoredOrder: orderObj });
    }

    // -------------------------------------------------------------
    // POST /api/sync - Universal Live Bi-directional Sync
    // -------------------------------------------------------------
    if (pathname === '/api/sync' && method === 'POST') {
      const payload = await request.json().catch(() => ({}));
      const clientOrders = Array.isArray(payload.orders) ? payload.orders : [];

      // 1. Persist any incoming client orders that do not already exist in D1
      for (const co of clientOrders) {
        if (!co || !co.orderId) continue;
        const orderId = String(co.orderId);
        
        // Check if order already exists in D1 to prevent overwriting
        const existing = await env.DB.prepare('SELECT order_id FROM orders WHERE order_id = ?').bind(orderId).first().catch(() => null);
        if (!existing) {
          const createdAt = String(co.createdAt || new Date().toISOString());
          const updatedAt = String(co.updatedAt || createdAt);
          const customerName = String(co.customer?.name || 'Customer');
          const customerPhone = String(co.customer?.phone || '');
          const grandTotal = Number(co.grandTotal || co.subtotal || 0);
          const status = String(co.status || 'Pending');

          // Strip heavy base64 images to prevent SQLITE_TOOBIG
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
            INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, item_name, image_url, grand_total, status, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(orderId, createdAt, updatedAt, customerName, customerPhone, 'Crackers Order', '', grandTotal, status, dataJson).run().catch(() => {});
        }
      }

      // 2. Fetch all live orders directly from D1 (authoritative ground truth)
      const currentOrdersRes = await env.DB.prepare("SELECT data_json, status, grand_total, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT 5000").all();
      const unifiedOrders = (currentOrdersRes.results || []).map(row => {
        try {
          const parsed = JSON.parse(row.data_json);
          if (row.status) parsed.status = row.status;
          return parsed;
        } catch { return null; }
      }).filter(o => o && o.orderId);

      // 3. Enquiries sync
      const enquiriesRes = await env.DB.prepare('SELECT data_json FROM enquiries ORDER BY created_at DESC LIMIT 500').all();
      const serverEnquiries = (enquiriesRes.results || []).map(r => {
        try { return JSON.parse(r.data_json); } catch { return null; }
      }).filter(Boolean);

      // 4. Settings sync
      const settingsRes = await env.DB.prepare("SELECT key, value_json FROM settings WHERE key NOT IN ('products', 'categories')").all();
      const serverSettings = {};
      (settingsRes.results || []).forEach(r => {
        try { serverSettings[r.key] = JSON.parse(r.value_json); } catch {}
      });

      return jsonResponse({
        success: true,
        orders: unifiedOrders,
        enquiries: serverEnquiries,
        settings: serverSettings
      });
    }

    // -------------------------------------------------------------
    // /api/orders (GET all live orders, POST new order)
    // -------------------------------------------------------------
    if (pathname === '/api/orders') {
      if (method === 'GET') {
        // Automatically purge and archive orders older than 30 days
        await purgeExpiredD1Orders(env);

        const result = await env.DB.prepare("SELECT data_json, status, grand_total, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT 5000").all();
        const orders = (result.results || []).map(row => {
          try {
            const parsed = JSON.parse(row.data_json);
            if (row.status) parsed.status = row.status;
            return parsed;
          } catch { return null; }
        }).filter(o => o && o.orderId);
        return jsonResponse(orders);
      }

      if (method === 'POST') {
        const order = await request.json();
        let orderId = String(order.orderId || '').trim();

        // Check if an order with this ID already exists in D1
        let isExisting = false;
        if (orderId && !orderId.includes('DRAFT') && !orderId.includes('TEMP')) {
          const check = await env.DB.prepare('SELECT order_id FROM orders WHERE order_id = ?').bind(orderId).first().catch(() => null);
          if (check) isExisting = true;
        }

        // If orderId is missing, temporary, or already taken by another order, allocate next continuous sequence
        if (!orderId || isExisting || orderId.includes('DRAFT') || orderId.includes('TEMP')) {
          const maxRow = await env.DB.prepare(`
            SELECT order_id FROM orders 
            WHERE order_id LIKE 'SC-%' 
            ORDER BY created_at DESC 
            LIMIT 500
          `).all().catch(() => ({ results: [] }));
          
          let maxSeq = 0; // Starts from 0001 (nextSeq = 1)
          (maxRow.results || []).forEach(r => {
            const m = String(r.order_id).match(/SC-(?:\d{4}-)?(\d+)$/i);
            if (m) {
              const n = parseInt(m[1], 10);
              if (!isNaN(n) && n > maxSeq) maxSeq = n;
            }
          });
          const nextSeq = maxSeq + 1;
          const currentYear = new Date().getFullYear();
          orderId = `SC-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
        }

        // Strip heavy base64 data URLs from line items to prevent SQLITE_TOOBIG
        const cleanOrder = { ...order };
        if (Array.isArray(cleanOrder.items)) {
          cleanOrder.items = cleanOrder.items.map(it => {
            let img = it.image || '';
            if (img.startsWith('data:')) {
              img = it.code ? `/images/products/${String(it.code).toLowerCase()}.jpg` : '';
            }
            return { ...it, image: img };
          });
        }

        const createdAt = String(cleanOrder.createdAt || new Date().toISOString());
        const updatedAt = String(cleanOrder.updatedAt || createdAt);
        const customerName = String(cleanOrder.customer?.name || 'Customer');
        const customerPhone = String(cleanOrder.customer?.phone || '');
        const grandTotal = Number(cleanOrder.grandTotal || cleanOrder.subtotal || 0);
        const status = String(cleanOrder.status || 'Pending');
        const fullOrder = { ...cleanOrder, orderId, createdAt, updatedAt, status, grandTotal };
        const dataJson = JSON.stringify(fullOrder);

        // Save into D1
        await env.DB.prepare(`
          INSERT INTO orders (order_id, created_at, updated_at, customer_name, customer_phone, item_name, image_url, grand_total, status, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(order_id) DO UPDATE SET
            updated_at = excluded.updated_at,
            customer_name = excluded.customer_name,
            customer_phone = excluded.customer_phone,
            grand_total = excluded.grand_total,
            status = excluded.status,
            data_json = excluded.data_json
        `).bind(orderId, createdAt, updatedAt, customerName, customerPhone, 'Crackers Order', '', grandTotal, status, dataJson).run();

        // Clear from deleted_orders if previously recorded
        await env.DB.prepare('DELETE FROM deleted_orders WHERE order_id = ?').bind(orderId).run().catch(() => {});

        // Live Stock Deduction: Deduct purchased items from Cloudflare D1 products catalog
        try {
          const prodRow = await env.DB.prepare("SELECT value_json FROM settings WHERE key = 'products'").first();
          if (prodRow && prodRow.value_json) {
            const catalogProds = JSON.parse(prodRow.value_json);
            if (Array.isArray(catalogProds) && Array.isArray(cleanOrder.items)) {
              let catalogModified = false;
              const updatedCatalog = catalogProds.map(p => {
                const match = cleanOrder.items.find(it => it.id === p.id);
                if (match && Number(match.quantity) > 0) {
                  const curStock = p.stockCount !== undefined ? Number(p.stockCount) : (p.inStock !== false ? 100 : 0);
                  const nextStock = Math.max(0, curStock - Number(match.quantity));
                  catalogModified = true;
                  return {
                    ...p,
                    stockCount: nextStock,
                    inStock: nextStock > 0
                  };
                }
                return p;
              });

              if (catalogModified) {
                await env.DB.prepare(`
                  UPDATE settings SET value_json = ?, updated_at = ? WHERE key = 'products'
                `).bind(JSON.stringify(updatedCatalog), new Date().toISOString()).run();
              }
            }
          }
        } catch (stockDeductErr) {
          console.warn('Worker stock deduction error:', stockDeductErr);
        }

        return jsonResponse({ success: true, orderId, order: fullOrder }, 201);
      }
    }

    // -------------------------------------------------------------
    // /api/orders/:id (PUT update, DELETE delete)
    // -------------------------------------------------------------
    const orderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
    if (orderMatch) {
      const orderId = decodeURIComponent(orderMatch[1]);

      if (method === 'GET') {
        const existing = await env.DB.prepare('SELECT data_json, status, created_at, updated_at FROM orders WHERE order_id = ?').bind(orderId).first();
        if (!existing) {
          return jsonResponse({ error: 'Order not found' }, 404);
        }
        const orderObj = JSON.parse(existing.data_json);
        if (existing.status) orderObj.status = existing.status;
        return jsonResponse(orderObj);
      }

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
        if (!isAdminAuthorized(request)) {
          return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
        }
        await env.DB.prepare('DELETE FROM orders WHERE order_id = ?').bind(orderId).run();
        await env.DB.prepare('DELETE FROM deleted_orders WHERE order_id = ?').bind(orderId).run().catch(() => {});

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
    // /api/products (GET all, POST update catalog in Cloudflare D1)
    // -------------------------------------------------------------
    if (pathname === '/api/products') {
      if (method === 'GET') {
        const row = await env.DB.prepare("SELECT value_json FROM settings WHERE key = 'products'").first();
        if (row && row.value_json) {
          try {
            return jsonResponse(JSON.parse(row.value_json));
          } catch {}
        }
        return jsonResponse(null);
      }

      if (method === 'POST') {
        if (!isAdminAuthorized(request)) {
          return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
        }
        const products = await request.json();
        if (!Array.isArray(products)) {
          return jsonResponse({ error: 'Expected an array of products' }, 400);
        }
        const updatedAt = new Date().toISOString();
        await env.DB.prepare(`
          INSERT INTO settings (key, value_json, updated_at) VALUES ('products', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
        `).bind(JSON.stringify(products), updatedAt).run();

        return jsonResponse({ success: true, count: products.length, updatedAt });
      }
    }

    // -------------------------------------------------------------
    // /api/categories (GET all, POST update categories in Cloudflare D1)
    // -------------------------------------------------------------
    if (pathname === '/api/categories') {
      if (method === 'GET') {
        const row = await env.DB.prepare("SELECT value_json FROM settings WHERE key = 'categories'").first();
        if (row && row.value_json) {
          try {
            return jsonResponse(JSON.parse(row.value_json));
          } catch {}
        }
        return jsonResponse(null);
      }

      if (method === 'POST') {
        if (!isAdminAuthorized(request)) {
          return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
        }
        const categories = await request.json();
        if (!Array.isArray(categories)) {
          return jsonResponse({ error: 'Expected an array of categories' }, 400);
        }
        const cleanCats = categories.filter(c => c && c.id !== 'all');
        const updatedAt = new Date().toISOString();
        await env.DB.prepare(`
          INSERT INTO settings (key, value_json, updated_at) VALUES ('categories', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
        `).bind(JSON.stringify(cleanCats), updatedAt).run();

        return jsonResponse({ success: true, count: cleanCats.length, updatedAt });
      }
    }

    // -------------------------------------------------------------
    // /api/settings (GET, POST)
    // -------------------------------------------------------------
    if (pathname === '/api/settings') {
      if (method === 'GET') {
        const res = await env.DB.prepare("SELECT key, value_json FROM settings WHERE key NOT IN ('products', 'categories')").all();
        const settings = {};
        (res.results || []).forEach(r => {
          try { settings[r.key] = JSON.parse(r.value_json); } catch {}
        });
        return jsonResponse(settings);
      }

      if (method === 'POST') {
        if (!isAdminAuthorized(request)) {
          return jsonResponse({ error: 'Unauthorized: Admin authentication required.' }, 401);
        }
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

/**
 * Auto-Archive & Purge Orders older than 30 days from Cloudflare D1
 * Active orders older than 30 days are automatically backed up into archived_orders
 * and removed from orders, keeping the active database clean and performant.
 */
async function purgeExpiredD1Orders(env) {
  if (!env || !env.DB) return { archivedCount: 0, deletedCount: 0 };
  try {
    // 1. Ensure archived_orders table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS archived_orders (
        order_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        archived_at TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        grand_total REAL,
        data_json TEXT NOT NULL
      )
    `).run().catch(() => {});

    // 2. Copy active orders older than 30 days (2592000 seconds) into archived_orders
    const copyRes = await env.DB.prepare(`
      INSERT OR IGNORE INTO archived_orders (order_id, created_at, archived_at, customer_name, customer_phone, grand_total, data_json)
      SELECT 
        COALESCE(order_id, 'ORD-' || id),
        created_at,
        datetime('now'),
        customer_name,
        customer_phone,
        grand_total,
        COALESCE(data_json, json_object('orderId', COALESCE(order_id, 'ORD-' || id), 'customer', json_object('name', customer_name, 'phone', customer_phone), 'itemName', item_name, 'imageUrl', image_url, 'createdAt', created_at, 'grandTotal', grand_total, 'status', status))
      FROM orders
      WHERE (strftime('%s', 'now') - strftime('%s', created_at)) > ?
         OR (updated_at IS NOT NULL AND (strftime('%s', 'now') - strftime('%s', updated_at)) > ?)
    `).bind(ORDER_RETENTION_SECONDS, ORDER_RETENTION_SECONDS).run().catch(err => {
      console.warn('archived_orders copy error:', err);
      return null;
    });

    // 3. Delete expired orders from active orders table
    const deleteRes = await env.DB.prepare(`
      DELETE FROM orders
      WHERE (strftime('%s', 'now') - strftime('%s', created_at)) > ?
         OR (updated_at IS NOT NULL AND (strftime('%s', 'now') - strftime('%s', updated_at)) > ?)
    `).bind(ORDER_RETENTION_SECONDS, ORDER_RETENTION_SECONDS).run().catch(err => {
      console.warn('orders delete error:', err);
      return null;
    });

    return {
      success: true,
      retentionDays: ORDER_RETENTION_DAYS,
      archivedCount: copyRes?.meta?.changes || 0,
      deletedCount: deleteRes?.meta?.changes || 0
    };
  } catch (err) {
    console.error('purgeExpiredD1Orders error:', err);
    return { success: false, error: err.message };
  }
}

