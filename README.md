# 🎆 SHARP CRACKERS — Sivakasi Direct Wholesale & Retail E-Commerce Portal

A high-performance, real-time e-commerce cracker order portal built with **React**, **Vite**, and **Node.js**, designed for direct festival sales from Sivakasi, Tamil Nadu.

---

## 🌟 Key Features

1. **Bilingual Catalog (English & தமிழ்)**
   - All 27+ cracker varieties feature continuous 3-digit serial numbers (`001` - `027`), English titles, Tamil names, pack details, and Sivakasi factory direct pricing.

2. **Smart Shopping Cart & Instant Checkout**
   - Live subtotal and delivery charge calculations based on store settings (`freeDeliveryThreshold`, `deliveryCharge`).
   - Phone number validation supporting Indian mobile numbers (10 digits) and international/NRI formats (+91 / +971 etc.).
   - Confetti celebration, printable order sheets, instant PDF download via `html2pdf.js`, and direct WhatsApp order forwarding.

3. **Multi-Device & Cross-Tab Real-Time Sync**
   - Zero external DB required for local/single-server setup: uses JSON file storage in `./data/`.
   - `BroadcastChannel` for instant zero-latency cross-tab sync.
   - Smart bidirectional delta sync `/api/sync` merging updates and deletions without data loss.

4. **Complete Admin Management Portal**
   - **Customer Orders Tab**: Live order feed, status updates (Pending, Processing, Completed, Cancelled), customer contact tracking, printable invoices, and permanent deletion.
   - **Audible Chimes**: Native Web Audio API celebratory 3-tone melodic chime plays when new orders arrive.
   - **Product Catalog Tab**: Add new cracker products, edit pricing and details, and toggle stock availability in real time.
   - **Customer Enquiries Tab**: View and manage customer messages submitted via Contact Us, with direct Call and WhatsApp reply buttons.
   - **Store Profile & Settings Tab**: Update store identity, hotline numbers, showroom addresses, and website announcement banner.

5. **Dual Deployment Support**
   - **Zero-Dependency Node.js Server (`server.js`)**: Serves production build and provides complete REST API out of the box (runs anywhere: Render, VPS, Local).
   - **Cloudflare Edge Worker (`worker.js` + `wrangler.json`)**: Serverless edge deployment with Cloudflare D1 SQL database support.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Local Development (Vite Dev Server + Built-in API)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Launch
```bash
# Build optimized production bundle
npm run build

# Start zero-dependency Node.js production server
npm start
```
The server will start on [http://localhost:10000](http://localhost:10000) (or the `PORT` specified in your environment).

---

## 🔐 Administrative Access

Navigate to `/admin` on the website:
- **Default Username:** `admin`
- **Default Password:** `sharp2026!`

*Note: For production deployments, ensure admin credentials are kept secure.*

---

## 📁 Project Structure

```
├── data/                    # JSON data storage (orders, enquiries, settings, deleted_orders)
├── public/                  # Static assets & favicons
├── images/                  # Cracker product photography & banners
├── src/
│   ├── components/          # Reusable UI components (Navbar, Footer, etc.)
│   ├── context/             # Global CartContext & state management
│   ├── pages/               # Application views
│   │   ├── HomePage.jsx             # Hero, categories, features, promotions
│   │   ├── ProductsPage.jsx         # Full cracker catalog & search
│   │   ├── CartPage.jsx             # Cart summary, delivery calc & order form
│   │   ├── AboutUsPage.jsx          # Sivakasi heritage & quality assurance
│   │   ├── ContactUsPage.jsx        # Showroom location & enquiry form
│   │   ├── AdminLoginPage.jsx       # Secure admin login gateway
│   │   └── AdminDashboardPage.jsx   # Multi-tab admin control desk
│   ├── services/
│   │   └── dataService.js   # Local persistence, validation & API sync
│   └── utils/
│       └── pdfGenerator.js  # Order PDF & printable receipt generator
├── server.js                # Zero-dependency Node.js HTTP server & API
├── worker.js                # Cloudflare Worker script for Edge + D1
├── schema.sql               # Cloudflare D1 SQL database schema
├── vite.config.js           # Vite configuration & dev API middleware
└── wrangler.json            # Cloudflare deployment settings
```

---

## 📡 REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/sync` | `POST` | Smart bidirectional merge of orders, deleted IDs, enquiries & settings |
| `/api/orders` | `GET` | Fetch all customer orders |
| `/api/orders` | `POST` | Place a new customer order |
| `/api/orders/:id` | `PUT` | Update order status or details |
| `/api/orders/:id` | `DELETE` | Permanently remove an order |
| `/api/enquiries` | `GET` | List all customer contact enquiries |
| `/api/enquiries` | `POST` | Submit a new contact enquiry |
| `/api/enquiries/:id` | `DELETE` | Delete a customer enquiry |
| `/api/settings` | `GET` | Fetch current store configuration |
| `/api/settings` | `POST` | Update store configuration |

---

## 🔒 Security & Best Practices

- Secure credential checking with exact username/password mapping.
- Configurable CORS headers via `ALLOWED_ORIGIN` environment variable.
- Non-colliding timestamp-based order IDs (`SC-YYYY-XXXXXX`) and enquiry numbers (`#ENQ-XXXXXX`).
- Safe JSON file error boundaries with automatic fallback.

---

## 📄 License
© 2026 SHARP CRACKERS, Sivakasi. All rights reserved.
