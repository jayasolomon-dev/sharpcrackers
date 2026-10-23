// ==========================================================================
// SHARP CRACKERS - ZERO-DEPENDENCY NODE.JS SERVER
// Serves Vite production build (dist/) + provides multi-device REST API
// Stores live orders and enquiries in local JSON files (No external DB needed!)
// ==========================================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { redisCache } from './src/services/redisService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BACKUP_ORDERS_FILE = path.join(DATA_DIR, 'orders_backup.json');
const DELETED_ORDERS_FILE = path.join(DATA_DIR, 'deleted_orders.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================================
// LIFETIME ORDERS & PERMANENT RETENTION SYSTEM
// Orders are kept permanently for lifetime without auto-expiration or purging
// ============================================================================
const ORDER_RETENTION_DAYS = 999999;
const ORDER_RETENTION_MS = Infinity;

const isOrderExpired = () => false;

const appendToBackupOrders = () => {};

const pruneExpiredOrders = (orders = []) => {
  return Array.isArray(orders) ? orders : [];
};

// Initial sample orders if file doesn't exist yet
const INITIAL_ORDERS = [
  {
    orderId: "SC-2026-1082",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      name: "Suresh Kumar",
      phone: "9876543210",
      email: "suresh.kumar@example.com",
      deliveryType: "delivery",
      address: "No. 12, Anna Nagar West, Madurai - 625020",
      notes: "Please deliver before Friday evening."
    },
    items: [
      { id: "prod-1", code: "SC-SP01", name: "10 cm Electric Sparklers", packDetails: "10 pcs / box", unitPrice: 45, quantity: 4, totalPrice: 180, image: "/images/product_sparkler_1791567639029.jpg" },
      { id: "prod-5", code: "SC-FP01", name: "Flower Pot Special (Standard)", packDetails: "10 pcs / box", unitPrice: 130, quantity: 2, totalPrice: 260, image: "/images/product_flowerpots.jpg" },
      { id: "prod-8", code: "SC-GC01", name: "Ground Chakkar Special", packDetails: "10 pcs / box", unitPrice: 90, quantity: 3, totalPrice: 270, image: "/images/product_chakkars.jpg" },
      { id: "prod-22", code: "SC-GB02", name: "Sharp Family Sparkle Pack (35 Items)", packDetails: "1 Mega Box", unitPrice: 1490, quantity: 1, totalPrice: 1490, image: "/images/product_giftpack_1791567665442.jpg" }
    ],
    subtotal: 2200,
    deliveryCharge: 150,
    grandTotal: 2350,
    status: "Pending"
  },
  {
    orderId: "SC-2026-1045",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      name: "Priya Sundaram",
      phone: "9842198421",
      email: "priya.sundar@gmail.com",
      deliveryType: "pickup",
      address: "Store Pickup - Sivakasi Showroom",
      notes: "Will pick up around 6 PM."
    },
    items: [
      { id: "prod-15", code: "SC-SD02", name: "1000 Wala Deluxe Garland (Ladi)", packDetails: "1 pc", unitPrice: 390, quantity: 2, totalPrice: 780, image: "/images/product_garland.jpg" },
      { id: "prod-19", code: "SC-FC03", name: "12 Shots Sky Wonder Repeater", packDetails: "1 box", unitPrice: 450, quantity: 2, totalPrice: 900, image: "/images/product_fountain_1791567652291.jpg" },
      { id: "prod-3", code: "SC-SP03", name: "30 cm Deluxe Golden Sparklers", packDetails: "5 pcs / box", unitPrice: 110, quantity: 5, totalPrice: 550, image: "/images/product_sparkler_1791567639029.jpg" }
    ],
    subtotal: 2230,
    deliveryCharge: 0,
    grandTotal: 2230,
    status: "Processing"
  },
  {
    orderId: "SC-2026-0988",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    customer: {
      name: "Murugan Enterprises",
      phone: "9443312345",
      email: "murugan.office@yahoo.com",
      deliveryType: "delivery",
      address: "Plot 88, SIDCO Industrial Estate, Coimbatore - 641021",
      notes: "Company staff Diwali gift packs."
    },
    items: [
      { id: "prod-23", code: "SC-GB03", name: "Sharp Royal Deluxe VIP Box (50 Items)", packDetails: "1 Luxury Trunk", unitPrice: 2750, quantity: 3, totalPrice: 8250, image: "/images/product_giftpack_1791567665442.jpg" },
      { id: "prod-16", code: "SC-SD03", name: "5000 Wala Royal Mega Garland", packDetails: "1 pc", unitPrice: 1950, quantity: 1, totalPrice: 1950, image: "/images/product_garland.jpg" }
    ],
    subtotal: 10200,
    deliveryCharge: 0,
    grandTotal: 10200,
    status: "Completed"
  }
];

// Helper to read JSON file safely
const readJsonFile = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Helper to write JSON file safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Initialize default files if missing
if (!fs.existsSync(ORDERS_FILE)) {
  writeJsonFile(ORDERS_FILE, INITIAL_ORDERS);
}
if (!fs.existsSync(BACKUP_ORDERS_FILE)) {
  writeJsonFile(BACKUP_ORDERS_FILE, []);
}
if (!fs.existsSync(DELETED_ORDERS_FILE)) {
  writeJsonFile(DELETED_ORDERS_FILE, []);
}
if (!fs.existsSync(ENQUIRIES_FILE)) {
  writeJsonFile(ENQUIRIES_FILE, []);
}
if (!fs.existsSync(SETTINGS_FILE)) {
  writeJsonFile(SETTINGS_FILE, {});
}

// Automatic background 30-day bill cleanup worker (runs every 1 hour)
setInterval(() => {
  try {
    const raw = readJsonFile(ORDERS_FILE, []);
    const active = pruneExpiredOrders(raw);
    if (active.length !== raw.length) {
      const purgedCount = raw.length - active.length;
      writeJsonFile(ORDERS_FILE, active);
      console.log(`[Auto-Retention 30-Days] Successfully purged ${purgedCount} expired bill(s). Active orders remaining: ${active.length}`);
    }
  } catch (err) {
    console.error('[Auto-Retention Error]', err);
  }
}, 3600000);

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper to parse JSON body from incoming HTTP request
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
};

// HTTP Server
const server = http.createServer(async (req, res) => {
  // Common CORS and security headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ------------------------------------------------------------------------
  // API ROUTES (/api/*)
  // ------------------------------------------------------------------------

  // 0. BIDIRECTIONAL SMART SYNC API (/api/sync)
  if (pathname === '/api/sync' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid sync payload: expected an object' }));
        return;
      }
      const clientOrders = Array.isArray(payload.orders) ? payload.orders : [];
      const clientDeletedIds = Array.isArray(payload.deletedOrderIds) ? payload.deletedOrderIds : [];

      // Read current server state and prune bills older than 30 days
      const now = Date.now();
      let serverOrders = pruneExpiredOrders(readJsonFile(ORDERS_FILE, INITIAL_ORDERS), now);
      let serverDeletedIds = readJsonFile(DELETED_ORDERS_FILE, []);

      // Merge deleted IDs (once deleted anywhere, stays deleted)
      const allDeletedSet = new Set([...serverDeletedIds, ...clientDeletedIds]);
      const mergedDeletedList = Array.from(allDeletedSet);
      writeJsonFile(DELETED_ORDERS_FILE, mergedDeletedList);

      // Reconcile and merge orders by orderId (strictly within 30-day window)
      const ordersMap = new Map();
      serverOrders.forEach(o => {
        if (o && o.orderId && !allDeletedSet.has(o.orderId)) {
          ordersMap.set(o.orderId, o);
        }
      });

      pruneExpiredOrders(clientOrders, now).forEach(co => {
        if (!co || !co.orderId || allDeletedSet.has(co.orderId)) return;
        const existing = ordersMap.get(co.orderId);
        if (!existing) {
          ordersMap.set(co.orderId, co);
        } else {
          // Keep the newer version or status update
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const clientTime = new Date(co.updatedAt || co.createdAt || 0).getTime();
          if (clientTime >= existingTime) {
            ordersMap.set(co.orderId, { ...existing, ...co });
          }
        }
      });

      // Sort newest first
      const mergedOrders = Array.from(ordersMap.values()).sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      writeJsonFile(ORDERS_FILE, mergedOrders);

      // Handle enquiries sync if provided
      let serverEnquiries = readJsonFile(ENQUIRIES_FILE, []);
      if (Array.isArray(payload.enquiries) && payload.enquiries.length > 0) {
        const enqMap = new Map();
        serverEnquiries.forEach(e => { if (e && e.id) enqMap.set(e.id, e); });
        payload.enquiries.forEach(ce => {
          if (ce && ce.id && !enqMap.has(ce.id)) {
            enqMap.set(ce.id, ce);
          }
        });
        serverEnquiries = Array.from(enqMap.values()).sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        writeJsonFile(ENQUIRIES_FILE, serverEnquiries);
      }

      // Handle settings sync
      let serverSettings = readJsonFile(SETTINGS_FILE, null);
      if (payload.settings && typeof payload.settings === 'object' && Object.keys(payload.settings).length > 0) {
        serverSettings = { ...(serverSettings || {}), ...payload.settings };
        writeJsonFile(SETTINGS_FILE, serverSettings);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        orders: mergedOrders,
        enquiries: serverEnquiries,
        settings: serverSettings || {},
        deletedOrderIds: mergedDeletedList
      }));
    } catch (err) {
      console.error('[API Sync Error]', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 1. ORDERS API
  if (pathname === '/api/orders' && req.method === 'GET') {
    const rawOrders = readJsonFile(ORDERS_FILE, INITIAL_ORDERS);
    const activeOrders = pruneExpiredOrders(rawOrders);
    if (activeOrders.length !== rawOrders.length) {
      writeJsonFile(ORDERS_FILE, activeOrders);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeOrders));
    return;
  }

  // Explicit purge endpoint for 30-day bill auto-cleaning
  if (pathname === '/api/orders/purge-expired' && req.method === 'POST') {
    const rawOrders = readJsonFile(ORDERS_FILE, []);
    const activeOrders = pruneExpiredOrders(rawOrders);
    const purgedCount = rawOrders.length - activeOrders.length;
    if (purgedCount > 0) {
      writeJsonFile(ORDERS_FILE, activeOrders);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, purgedCount, activeCount: activeOrders.length }));
    return;
  }

  // 1.1 BACKUP & ARCHIVE ORDERS API
  if (pathname === '/api/orders/backup' && req.method === 'GET') {
    const backupOrders = readJsonFile(BACKUP_ORDERS_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(backupOrders));
    return;
  }

  if (pathname === '/api/orders/backup' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      const incoming = Array.isArray(payload) ? payload : (Array.isArray(payload.orders) ? payload.orders : []);
      appendToBackupOrders(incoming);
      const currentBackup = readJsonFile(BACKUP_ORDERS_FILE, []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: currentBackup.length, backupOrders: currentBackup }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Restore order from backup storage back into active orders
  if (pathname === '/api/orders/restore' && req.method === 'POST') {
    try {
      const { orderId } = await parseRequestBody(req);
      if (!orderId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'orderId is required' }));
        return;
      }
      const backupList = readJsonFile(BACKUP_ORDERS_FILE, []);
      const target = backupList.find(o => o.orderId === orderId);
      if (!target) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Order not found in backup storage' }));
        return;
      }

      // Remove from backup list
      const updatedBackup = backupList.filter(o => o.orderId !== orderId);
      writeJsonFile(BACKUP_ORDERS_FILE, updatedBackup);

      // Restore into active orders with refreshed timestamp
      const restored = { ...target, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      delete restored.archivedAt;
      delete restored.isArchived;

      const activeOrders = readJsonFile(ORDERS_FILE, []);
      activeOrders.unshift(restored);
      writeJsonFile(ORDERS_FILE, activeOrders);

      console.log(`[Backup Archive] Restored order #${orderId} back to active orders!`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, restoredOrder: restored }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    try {
      const newOrder = await parseRequestBody(req);
      if (!newOrder || typeof newOrder !== 'object' || Array.isArray(newOrder)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid order data: expected object' }));
        return;
      }
      const rawOrders = readJsonFile(ORDERS_FILE, INITIAL_ORDERS);
      const orders = pruneExpiredOrders(rawOrders);

      // Verify and prepend order
      if (!newOrder.orderId) {
        newOrder.orderId = `SC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      }
      if (!newOrder.createdAt) {
        newOrder.createdAt = new Date().toISOString();
      }

      // Avoid duplicates
      const existingIdx = orders.findIndex(o => o.orderId === newOrder.orderId);
      if (existingIdx >= 0) {
        orders[existingIdx] = { ...orders[existingIdx], ...newOrder, updatedAt: new Date().toISOString() };
      } else {
        orders.unshift(newOrder);
      }

      writeJsonFile(ORDERS_FILE, orders);
      console.log(`[API] New Order Placed & Cloud-Stored: #${newOrder.orderId} by ${newOrder.customer?.name || 'Customer'} (Total: ₹${newOrder.grandTotal})`);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newOrder));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/orders/') && req.method === 'PUT') {
    const orderId = pathname.replace('/api/orders/', '');
    try {
      const updates = await parseRequestBody(req);
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid updates payload: expected object' }));
        return;
      }
      const orders = readJsonFile(ORDERS_FILE, INITIAL_ORDERS);
      const idx = orders.findIndex(o => o.orderId === orderId);
      if (idx >= 0) {
        orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
        writeJsonFile(ORDERS_FILE, orders);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(orders[idx]));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Order not found' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/orders/') && req.method === 'DELETE') {
    const orderId = pathname.replace('/api/orders/', '');
    const orders = readJsonFile(ORDERS_FILE, INITIAL_ORDERS);
    const filtered = orders.filter(o => o.orderId !== orderId);
    writeJsonFile(ORDERS_FILE, filtered);

    // Record deleted ID permanently
    const deletedList = readJsonFile(DELETED_ORDERS_FILE, []);
    if (!deletedList.includes(orderId)) {
      deletedList.push(orderId);
      writeJsonFile(DELETED_ORDERS_FILE, deletedList);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedOrderId: orderId }));
    return;
  }

  // 2. ENQUIRIES API (Contact Us Messages)
  if (pathname === '/api/enquiries' && req.method === 'GET') {
    const enquiries = readJsonFile(ENQUIRIES_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(enquiries));
    return;
  }

  if (pathname === '/api/enquiries' && req.method === 'POST') {
    try {
      const newEnquiry = await parseRequestBody(req);
      if (!newEnquiry || typeof newEnquiry !== 'object' || Array.isArray(newEnquiry)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid enquiry data: expected object' }));
        return;
      }
      if (!newEnquiry.name || !newEnquiry.phone) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Name and phone are required fields' }));
        return;
      }
      const enquiries = readJsonFile(ENQUIRIES_FILE, []);

      if (!newEnquiry.id) {
        newEnquiry.id = 'enq-' + Date.now();
      }
      if (!newEnquiry.enquiryNumber) {
        newEnquiry.enquiryNumber = `#ENQ-${Date.now().toString().slice(-6)}`;
      }
      if (!newEnquiry.createdAt) {
        newEnquiry.createdAt = new Date().toISOString();
      }

      enquiries.unshift(newEnquiry);
      writeJsonFile(ENQUIRIES_FILE, enquiries);
      console.log(`[API] New Contact Enquiry: ${newEnquiry.enquiryNumber} from ${newEnquiry.name} (${newEnquiry.phone})`);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newEnquiry));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/enquiries/') && req.method === 'DELETE') {
    const enquiryId = pathname.replace('/api/enquiries/', '');
    const enquiries = readJsonFile(ENQUIRIES_FILE, []);
    const filtered = enquiries.filter(e => e.id !== enquiryId);
    writeJsonFile(ENQUIRIES_FILE, filtered);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: enquiryId }));
    return;
  }

  // 3. SETTINGS API
  if (pathname === '/api/settings' && req.method === 'GET') {
    const settings = readJsonFile(SETTINGS_FILE, null);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(settings || {}));
    return;
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    try {
      const newSettings = await parseRequestBody(req);
      if (!newSettings || typeof newSettings !== 'object' || Array.isArray(newSettings)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid settings payload: expected object' }));
        return;
      }
      writeJsonFile(SETTINGS_FILE, newSettings);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newSettings));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ------------------------------------------------------------------------
  // 3.1 ADMIN AUTHENTICATION API (/api/auth/login)
  // ------------------------------------------------------------------------
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const user = (body.username || '').trim().toLowerCase();
      const pass = (body.password || '').trim();
      const adminPass = process.env.ADMIN_PASSWORD || 'sharp2026!';

      if ((user === 'admin' || user === 'sharp') && pass === adminPass) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: user === 'admin' ? 'Admin Manager' : 'Store Admin',
          token: `sharp_adm_${Date.now()}_${Math.random().toString(36).substring(2)}`
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid username or password' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ------------------------------------------------------------------------
  // 4. REDIS ACCELERATION & CACHE API
  // ------------------------------------------------------------------------
  if (pathname === '/api/redis/status' && req.method === 'GET') {
    const stats = await redisCache.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  if (pathname === '/api/redis/warm' && req.method === 'POST') {
    const pubDir = path.join(__dirname, 'public');
    const warmed = await redisCache.prewarm(pubDir);
    if (fs.existsSync(DIST_DIR)) await redisCache.prewarm(DIST_DIR);
    const stats = await redisCache.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, imagesWarmed: warmed, stats }));
    return;
  }

  if (pathname === '/api/redis/flush' && req.method === 'POST') {
    await redisCache.flushall();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Redis cache flushed' }));
    return;
  }

  // ------------------------------------------------------------------------
  // REDIS-ACCELERATED STATIC IMAGE SERVING (0ms RAM Delivery, 0 Network Overhead)
  // ------------------------------------------------------------------------
  if (pathname.startsWith('/images/')) {
    const ext = path.extname(pathname).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'image/jpeg';
    const redisKey = `img:${pathname}`;
    const cachedBuf = await redisCache.getBuffer(redisKey);

    if (cachedBuf) {
      const etag = `W/"${cachedBuf.length.toString(16)}"`;
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, { 'Cache-Control': 'public, max-age=31536000, immutable' });
        res.end();
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'X-Redis-Cache': 'HIT',
        'Content-Length': cachedBuf.length
      });
      res.end(cachedBuf);
      return;
    }
  }

  // ------------------------------------------------------------------------
  // STATIC ASSET SERVING & SPA FALLBACK (dist/)
  // ------------------------------------------------------------------------
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.resolve(DIST_DIR, '.' + safePath);

  // Security: Prevent Directory/Path Traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: Invalid file path');
    return;
  }

  // If path is root or a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If physical file exists, serve it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);

    // If it's an image not yet in Redis, cache it now
    if (pathname.startsWith('/images/')) {
      await redisCache.setBuffer(`img:${pathname}`, content);
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
    res.end(content);
    return;
  }

  // SPA Route Fallback: Serve dist/index.html for any frontend client routes
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
    return;
  }

  // Fallback if dist hasn't been built yet
  res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Application building or dist directory not found. Please run "npm run build".');
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 SHARP CRACKERS Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${DIST_DIR}`);
  console.log(`💾 Live JSON Storage path: ${DATA_DIR}`);

  // Prewarm Redis cache with all static images
  await redisCache.prewarm(path.join(__dirname, 'public'));
  if (fs.existsSync(DIST_DIR)) await redisCache.prewarm(DIST_DIR);
});
