import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const DELETED_ORDERS_FILE = path.join(DATA_DIR, 'deleted_orders.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

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
      server.middlewares.use(async (req, res, next) => {
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

        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true })
        }

        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        // 1. SMART SYNC API
        if (pathname === '/api/sync' && req.method === 'POST') {
          try {
            const payload = await parseBody(req)
            const clientOrders = Array.isArray(payload.orders) ? payload.orders : []
            const clientDeletedIds = Array.isArray(payload.deletedOrderIds) ? payload.deletedOrderIds : []

            let serverOrders = readJsonFile(ORDERS_FILE, [])
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

            clientOrders.forEach(co => {
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

            res.statusCode = 200
            res.end(JSON.stringify({
              orders: mergedOrders,
              enquiries: serverEnquiries,
              settings: serverSettings || {},
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
          const orders = readJsonFile(ORDERS_FILE, [])
          res.end(JSON.stringify(orders))
          return
        }

        if (pathname === '/api/orders' && req.method === 'POST') {
          try {
            const newOrder = await parseBody(req)
            let orders = readJsonFile(ORDERS_FILE, [])
            if (!newOrder.orderId) {
              newOrder.orderId = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
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
            if (!newEnq.enquiryNumber) newEnq.enquiryNumber = `#ENQ-${1000 + enqs.length + 1}`
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
