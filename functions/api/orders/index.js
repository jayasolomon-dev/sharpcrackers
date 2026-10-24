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
    const order = await request.json();
    let orderId = String(order.orderId || '').trim();

    // Check if an order with this ID already exists in D1
    let isExisting = false;
    if (orderId && !orderId.includes('DRAFT') && !orderId.includes('TEMP')) {
      const check = await env.DB.prepare('SELECT order_id FROM orders WHERE order_id = ?').bind(orderId).first().catch(() => null);
      if (check) isExisting = true;
    }

    // If orderId is missing, temporary, or already taken, allocate next continuous sequence
    if (!orderId || isExisting || orderId.includes('DRAFT') || orderId.includes('TEMP')) {
      const maxRow = await env.DB.prepare(`
        SELECT order_id FROM orders 
        WHERE order_id LIKE 'SC-%' 
        ORDER BY created_at DESC 
        LIMIT 500
      `).all().catch(() => ({ results: [] }));
      
      let maxSeq = 0; // Starts sequence at 0001 (nextSeq = 1)
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
      console.warn('Pages function stock deduction error:', stockDeductErr);
    }

    return new Response(JSON.stringify({ success: true, orderId, order: fullOrder }), { status: 201, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to save order to D1', message: err.message }), 
      { status: 400, headers: corsHeaders }
    );
  }
}
