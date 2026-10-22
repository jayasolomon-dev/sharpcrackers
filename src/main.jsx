import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register High-Speed Service Worker for instant zero-latency image caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[⚡ ServiceWorker] Instant Image Cache Ready. Scope:', reg.scope);
    }).catch((err) => {
      console.warn('[ServiceWorker] Registration skipped:', err);
    });

    // In-memory image pre-warming (loads images into browser RAM instantly)
    const criticalImages = [
      '/images/sharp_crackers_brand_logo.jpg',
      '/images/sharp_celebration_hero_banner.jpg',
      '/images/product_sparkler_1791567639029.jpg',
      '/images/product_flowerpots.jpg',
      '/images/product_chakkars.jpg',
      '/images/product_fountain_1791567652291.jpg',
      '/images/product_garland.jpg',
      '/images/product_giftpack_1791567665442.jpg'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
