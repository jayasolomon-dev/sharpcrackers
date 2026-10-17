-- ============================================================================
-- SHARP CRACKERS - CLOUDFLARE D1 SQL DATABASE SCHEMA
-- Free Tier: 5 GB Storage, 5 Million Reads/Day, 100,000 Writes/Day
-- Paste and run this in Cloudflare Dashboard -> D1 -> sharp-crackers-db -> Console
-- ============================================================================

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  grand_total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  data_json TEXT NOT NULL
);

-- Index for instant chronological ordering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 2. Deleted Orders Table (To prevent deleted orders from resurrecting during cross-device sync)
CREATE TABLE IF NOT EXISTS deleted_orders (
  order_id TEXT PRIMARY KEY,
  deleted_at TEXT NOT NULL
);

-- 3. Contact & Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  data_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

-- 4. Shop Settings Table (Banners, minimum order, contact phone, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
