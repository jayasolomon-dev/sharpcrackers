import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { redisCache } from './src/services/redisService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const DELETED_ORDERS_FILE = path.join(DATA_DIR, 'deleted_orders.json')
const BACKUP_ORDERS_FILE = path.join(DATA_DIR, 'orders_backup.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json')

// 30-Day Bill Retention & Backup Archive System
const ORDER_RETENTION_DAYS = 30
const ORDER_RETENTION_MS = ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000

function isOrderExpired(order, now = Date.now()) {
  if (!order || !order.createdAt) return false
  const time = new Date(order.createdAt).getTime()
  if (isNaN(time)) return false
  return (now - time) > ORDER_RETENTION_MS
}

function appendToBackupOrders(expiredOrders = []) {
  if (!Array.isArray(expiredOrders) || expiredOrders.length === 0) return
  try {
    const existing = readJsonFile(BACKUP_ORDERS_FILE, [])
    const map = new Map()
    existing.forEach(o => { if (o && o.orderId) map.set(o.orderId, o) })
    const nowIso = new Date().toISOString()
    expiredOrders.forEach(o => {
      if (o && o.orderId && !map.has(o.orderId)) {
        map.set(o.orderId, { ...o, archivedAt: nowIso, isArchived: true })
      }
    })
    const updated = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    writeJsonFile(BACKUP_ORDERS_FILE, updated)
  } catch (err) {
    console.error('Failed to append to backup in vite config:', err)
  }
}

function pruneExpiredOrders(orders = [], now = Date.now()) {
  if (!Array.isArray(orders)) return []
  const active = []
  const expired = []
  for (const o of orders) {
    if (isOrderExpired(o, now)) {
      expired.push(o)
    } else {
      active.push(o)
    }
  }
  if (expired.length > 0) {
    appendToBackupOrders(expired)
  }
  return active
}

function readJsonFile(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8')
      return fallback
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      // Pre-warm Redis cache on dev server initialization
      redisCache.prewarm(path.join(__dirname, 'public')).catch(() => {})

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        // Redis-Accelerated Static Image Delivery (Instant RAM + 0 Network Traffic)
        if (pathname.startsWith('/images/')) {
          const redisKey = `img:${pathname}`
          const cachedBuf = await redisCache.getBuffer(redisKey)
          if (cachedBuf) {
            const ext = path.extname(pathname).toLowerCase()
            const contentType = ext === '.png' ? 'image/png' : 'image/jpeg'
            const etag = `W/"${cachedBuf.length.toString(16)}"`
            if (req.headers['if-none-match'] === etag) {
              res.statusCode = 304
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
              res.end()
              return
            }
            res.setHeader('Content-Type', contentType)
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
            res.setHeader('ETag', etag)
            res.setHeader('X-Redis-Cache', 'HIT')
            res.end(cachedBuf)
            return
          }
        }

        if (!req.url.startsWith('/api/')) return next()
        
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        // Redis API Endpoints
        if (pathname === '/api/redis/status' && req.method === 'GET') {
          const stats = await redisCache.getStats()
          res.end(JSON.stringify(stats))
          return
        }

        if (pathname === '/api/redis/warm' && req.method === 'POST') {
          const warmed = await redisCache.prewarm(path.join(__dirname, 'public'))
          const stats = await redisCache.getStats()
          res.end(JSON.stringify({ success: true, imagesWarmed: warmed, stats }))
          return
        }

        if (pathname === '/api/redis/flush' && req.method === 'POST') {
          await redisCache.flushall()
          res.end(JSON.stringify({ success: true, message: 'Redis cache flushed' }))
          return
        }

        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true })
        }

        // 1. SMART SYNC API
        if (pathname === '/api/sync' && req.method === 'POST') {
          try {
            const payload = await parseBody(req)
            const clientOrders = Array.isArray(payload.orders) ? payload.orders : []
            const clientDeletedIds = Array.isArray(payload.deletedOrderIds) ? payload.deletedOrderIds : []

            const now = Date.now()
            let serverOrders = pruneExpiredOrders(readJsonFile(ORDERS_FILE, []), now)
            let serverDeletedIds = readJsonFile(DELETED_ORDERS_FILE, [])

            const allDeletedSet = new Set([...serverDeletedIds, ...clientDeletedIds])
            const mergedDeletedList = Array.from(allDeletedSet)
            writeJsonFile(DELETED_ORDERS_FILE, mergedDeletedList)

            const ordersMap = new Map()
            serverOrders.forEach(o => {
              if (o && o.orderId && !allDeletedSet.has(o.orderId)) {
                ordersMap.set(o.orderId, o)
              }
            })

            pruneExpiredOrders(clientOrders, now).forEach(co => {
              if (!co || !co.orderId || allDeletedSet.has(co.orderId)) return
              const existing = ordersMap.get(co.orderId)
              if (!existing) {
                ordersMap.set(co.orderId, co)
              } else {
                const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime()
                const clientTime = new Date(co.updatedAt || co.createdAt || 0).getTime()
                if (clientTime >= existingTime) {
                  ordersMap.set(co.orderId, { ...existing, ...co })
                }
              }
            })

            const mergedOrders = Array.from(ordersMap.values()).sort((a, b) => {
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            })
            writeJsonFile(ORDERS_FILE, mergedOrders)

            let serverEnquiries = readJsonFile(ENQUIRIES_FILE, [])
            if (Array.isArray(payload.enquiries) && payload.enquiries.length > 0) {
              const enqMap = new Map()
              serverEnquiries.forEach(e => { if (e && e.id) enqMap.set(e.id, e) })
              payload.enquiries.forEach(ce => {
                if (ce && ce.id && !enqMap.has(ce.id)) enqMap.set(ce.id, ce)
              })
              serverEnquiries = Array.from(enqMap.values()).sort((a, b) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              })
              writeJsonFile(ENQUIRIES_FILE, serverEnquiries)
            }

            let serverSettings = readJsonFile(SETTINGS_FILE, {})
            if (payload.settings && typeof payload.settings === 'object' && Object.keys(payload.settings).length > 0) {
              serverSettings = { ...(serverSettings || {}), ...payload.settings }
              writeJsonFile(SETTINGS_FILE, serverSettings)
            }

            let serverProducts = readJsonFile(PRODUCTS_FILE, null)
            if (Array.isArray(payload.products) && payload.products.length > 0) {
              serverProducts = payload.products
              writeJsonFile(PRODUCTS_FILE, serverProducts)
            }

            let serverCategories = readJsonFile(CATEGORIES_FILE, null)
            if (Array.isArray(payload.categories) && payload.categories.length > 0) {
              serverCategories = payload.categories
              writeJsonFile(CATEGORIES_FILE, serverCategories)
            }

            res.statusCode = 200
            res.end(JSON.stringify({
              orders: mergedOrders,
              enquiries: serverEnquiries,
              settings: serverSettings || {},
              products: serverProducts,
              categories: serverCategories,
              deletedOrderIds: mergedDeletedList
            }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        // 2. ORDERS API
        if (pathname === '/api/orders' && req.method === 'GET') {
          const rawOrders = readJsonFile(ORDERS_FILE, [])
          const activeOrders = pruneExpiredOrders(rawOrders)
          if (activeOrders.length !== rawOrders.length) {
            writeJsonFile(ORDERS_FILE, activeOrders)
          }
          res.end(JSON.stringify(activeOrders))
          return
        }

        // 2.1 BACKUP & ARCHIVE ORDERS API
        if (pathname === '/api/orders/backup' && req.method === 'GET') {
          const backupOrders = readJsonFile(BACKUP_ORDERS_FILE, [])
          res.end(JSON.stringify(backupOrders))
          return
        }

        if (pathname === '/api/orders/backup' && req.method === 'POST') {
          try {
            const payload = await parseBody(req)
            const incoming = Array.isArray(payload) ? payload : (Array.isArray(payload.orders) ? payload.orders : [])
            appendToBackupOrders(incoming)
            const currentBackup = readJsonFile(BACKUP_ORDERS_FILE, [])
            res.end(JSON.stringify({ success: true, count: currentBackup.length, backupOrders: currentBackup }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (pathname === '/api/orders/restore' && req.method === 'POST') {
          try {
            const { orderId } = await parseBody(req)
            if (!orderId) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'orderId is required' }))
              return
            }
            const backupList = readJsonFile(BACKUP_ORDERS_FILE, [])
            const target = backupList.find(o => o.orderId === orderId)
            if (!target) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Order not found in backup' }))
              return
            }
            const updatedBackup = backupList.filter(o => o.orderId !== orderId)
            writeJsonFile(BACKUP_ORDERS_FILE, updatedBackup)

            const restored = { ...target, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            delete restored.archivedAt
            delete restored.isArchived

            const activeOrders = readJsonFile(ORDERS_FILE, [])
            activeOrders.unshift(restored)
            writeJsonFile(ORDERS_FILE, activeOrders)

            res.end(JSON.stringify({ success: true, restoredOrder: restored }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (pathname === '/api/orders' && req.method === 'POST') {
          try {
            const newOrder = await parseBody(req)
            const rawOrders = readJsonFile(ORDERS_FILE, [])
            const orders = pruneExpiredOrders(rawOrders)
            if (!newOrder.orderId) {
              newOrder.orderId = `SC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
            }
            if (!newOrder.createdAt) {
              newOrder.createdAt = new Date().toISOString()
            }
            const idx = orders.findIndex(o => o.orderId === newOrder.orderId)
            if (idx >= 0) {
              orders[idx] = { ...orders[idx], ...newOrder, updatedAt: new Date().toISOString() }
            } else {
              orders.unshift(newOrder)
            }
            writeJsonFile(ORDERS_FILE, orders)
            res.statusCode = 201
            res.end(JSON.stringify(newOrder))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
          const orderId = pathname.replace('/api/orders/', '')
          const orders = readJsonFile(ORDERS_FILE, [])
          const found = orders.find(o => o.orderId === orderId)
          if (found) {
            res.statusCode = 200
            res.end(JSON.stringify(found))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Order not found' }))
          }
          return
        }

        if (pathname.startsWith('/api/orders/') && req.method === 'PUT') {
          const orderId = pathname.replace('/api/orders/', '')
          try {
            const updates = await parseBody(req)
            const orders = readJsonFile(ORDERS_FILE, [])
            const idx = orders.findIndex(o => o.orderId === orderId)
            if (idx >= 0) {
              orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() }
              writeJsonFile(ORDERS_FILE, orders)
              res.statusCode = 200
              res.end(JSON.stringify(orders[idx]))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Order not found' }))
            }
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (pathname.startsWith('/api/orders/') && req.method === 'DELETE') {
          const orderId = pathname.replace('/api/orders/', '')
          const orders = readJsonFile(ORDERS_FILE, [])
          const filtered = orders.filter(o => o.orderId !== orderId)
          writeJsonFile(ORDERS_FILE, filtered)

          const deletedList = readJsonFile(DELETED_ORDERS_FILE, [])
          if (!deletedList.includes(orderId)) {
            deletedList.push(orderId)
            writeJsonFile(DELETED_ORDERS_FILE, deletedList)
          }

          res.statusCode = 200
          res.end(JSON.stringify({ success: true, deletedOrderId: orderId }))
          return
        }

        // 3. ENQUIRIES API
        if (pathname === '/api/enquiries' && req.method === 'GET') {
          const data = readJsonFile(ENQUIRIES_FILE, [])
          res.end(JSON.stringify(data))
          return
        }

        if (pathname === '/api/enquiries' && req.method === 'POST') {
          try {
            const newEnq = await parseBody(req)
            let enqs = readJsonFile(ENQUIRIES_FILE, [])
            if (!newEnq.id) newEnq.id = 'enq-' + Date.now()
            if (!newEnq.enquiryNumber) newEnq.enquiryNumber = `#ENQ-${Date.now().toString().slice(-6)}`
            if (!newEnq.createdAt) newEnq.createdAt = new Date().toISOString()
            enqs.unshift(newEnq)
            writeJsonFile(ENQUIRIES_FILE, enqs)
            res.statusCode = 201
            res.end(JSON.stringify(newEnq))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (pathname.startsWith('/api/enquiries/') && req.method === 'DELETE') {
          const enquiryId = pathname.replace('/api/enquiries/', '')
          const enquiries = readJsonFile(ENQUIRIES_FILE, [])
          const filtered = enquiries.filter(e => e.id !== enquiryId)
          writeJsonFile(ENQUIRIES_FILE, filtered)
          res.statusCode = 200
          res.end(JSON.stringify({ success: true, deletedId: enquiryId }))
          return
        }

        // 4. SETTINGS API
        if (pathname === '/api/settings' && req.method === 'GET') {
          const settings = readJsonFile(SETTINGS_FILE, {})
          res.end(JSON.stringify(settings || {}))
          return
        }

        if (pathname === '/api/settings' && req.method === 'POST') {
          try {
            const newSettings = await parseBody(req)
            writeJsonFile(SETTINGS_FILE, newSettings)
            res.statusCode = 200
            res.end(JSON.stringify(newSettings))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        // 5. PRODUCTS API
        if (pathname === '/api/products' && req.method === 'GET') {
          const products = readJsonFile(PRODUCTS_FILE, null)
          if (products) {
            res.end(JSON.stringify(products))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'No products saved yet' }))
          }
          return
        }

        if (pathname === '/api/products' && req.method === 'POST') {
          try {
            const products = await parseBody(req)
            if (Array.isArray(products)) {
              writeJsonFile(PRODUCTS_FILE, products)
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, count: products.length }))
            } else {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Expected array of products' }))
            }
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        // 6. CATEGORIES API
        if (pathname === '/api/categories' && req.method === 'GET') {
          const categories = readJsonFile(CATEGORIES_FILE, null)
          if (categories) {
            res.end(JSON.stringify(categories))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'No categories saved yet' }))
          }
          return
        }

        if (pathname === '/api/categories' && req.method === 'POST') {
          try {
            const categories = await parseBody(req)
            if (Array.isArray(categories)) {
              writeJsonFile(CATEGORIES_FILE, categories)
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, count: categories.length }))
            } else {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Expected array of categories' }))
            }
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        // 7. IMAGE UPLOAD API (Local Device File Upload to /images/products/)
        if (pathname === '/api/upload' && req.method === 'POST') {
          try {
            const body = await parseBody(req)
            if (!body || !body.data) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Missing image data' }))
              return
            }
            
            const rawData = String(body.data)
            let ext = 'jpg'
            let cleanBase64 = rawData

            if (rawData.includes(';base64,')) {
              const parts = rawData.split(';base64,')
              const mime = parts[0].replace('data:', '')
              ext = mime.split('/')[1] || 'jpg'
              cleanBase64 = parts[1]
            }

            if (ext === 'jpeg') ext = 'jpg'

            const buffer = Buffer.from(cleanBase64, 'base64')
            const rawName = (body.filename || `product_${Date.now()}`)
              .toLowerCase()
              .replace(/[^a-z0-9_.-]/g, '_')
              .replace(/\.[^/.]+$/, '')

            const safeFilename = `${rawName}_${Date.now()}.${ext}`

            const targetDirPublic = path.join(__dirname, 'public', 'images', 'products')
            const targetDirSrc = path.join(__dirname, 'images', 'products')

            if (!fs.existsSync(targetDirPublic)) fs.mkdirSync(targetDirPublic, { recursive: true })
            if (!fs.existsSync(targetDirSrc)) fs.mkdirSync(targetDirSrc, { recursive: true })

            fs.writeFileSync(path.join(targetDirPublic, safeFilename), buffer)
            try { fs.writeFileSync(path.join(targetDirSrc, safeFilename), buffer) } catch (_) {}

            const relativeUrl = `/images/products/${safeFilename}`
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, url: relativeUrl, filename: safeFilename }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    port: 5173,
    host: true
  }
})
