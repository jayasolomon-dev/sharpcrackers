// ==========================================================================
// SHARP CRACKERS - NAVIGATION BAR
// Responsive, festive header with brand logo, links, search, and dynamic cart badge
// ==========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import PillNav from './PillNav';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { 
  Sparkles, 
  ShoppingCart, 
  Menu, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  Search, 
  UserCheck, 
  Flame,
  Package
} from 'lucide-react';

export const Navbar = ({ currentPage, setCurrentPage, onSearchOpen }) => {
  const { totalQuantity, totalSelectedProducts, settings, products } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastCustomerOrder, setLastCustomerOrder] = useState(() => dataService.getLastPlacedOrder());

  // Live order status synchronization for Navbar
  useEffect(() => {
    const unsub = dataService.subscribe((event) => {
      if (
        event?.type === 'ORDER_CREATED' || 
        event?.type === 'ORDER_STATUS_CHANGED' ||
        event?.type === 'ORDERS_UPDATED'
      ) {
        setLastCustomerOrder(dataService.getLastPlacedOrder());
      }
    });

    const timer = setInterval(() => {
      const order = dataService.getLastPlacedOrder();
      if (order) {
        setLastCustomerOrder(prev => {
          if (!prev || prev.status !== order.status || prev.orderId !== order.orderId) {
            return order;
          }
          return prev;
        });
      }
    }, 3000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  // Native 1-finger mobile touch scrolling is preserved globally without locking body overflow

  const isProductsPage = currentPage === 'products';

  const allProductsTickerList = useMemo(() => {
    if (!products || !products.length) return [];
    return products.map(p => p.name);
  }, [products]);

  const cleanHomeTickerText = useMemo(() => {
    const raw = settings.promoBannerText || "DIWALI 2026 SPECIAL OFFER: Flat Direct Sourcing with Heavy Savings! Order online now for guaranteed express booking!";
    return raw
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}💥🎆🎇✨🔥✦★☆]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [settings.promoBannerText]);

  const navLinks = [
    { id: 'home', label: 'Home', icon: <Sparkles size={16} /> },
    { id: 'products', label: 'Products', icon: <Package size={16} /> },
    { id: 'cart', label: 'Cart', count: totalQuantity, icon: <ShoppingCart size={16} /> },
    { id: 'about', label: 'About Us', icon: <ShieldCheck size={16} /> },
    { id: 'contact', label: 'Contact Us', icon: <PhoneCall size={16} /> }
  ];

  const pillNavItems = [
    { label: 'Home', href: 'home' },
    { label: 'Products', href: 'products' },
    { label: 'Cart', href: 'cart', badge: totalQuantity > 0 ? totalQuantity : null },
    { label: 'About Us', href: 'about' },
    { label: 'Contact Us', href: 'contact' }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky-nav-header no-print">
      {/* Top Festive Announcement Ticker */}
      <div className="top-ticker">
        <div className="nav-container ticker-container">
          <div className="ticker-center">
            <div 
              className="ticker-marquee-track"
              style={{ animationDuration: isProductsPage ? '160s' : '32s' }}
            >
              {isProductsPage ? (
                <>
                  <div className="ticker-marquee-content">
                    <span className="ticker-badge-prefix">ALL PRODUCTS</span>
                    <span className="ticker-sep">•</span>
                    {allProductsTickerList.map((prodName, pIdx) => (
                      <React.Fragment key={`p1-${pIdx}`}>
                        <span className="ticker-product-item">{prodName}</span>
                        <span className="ticker-sep">•</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="ticker-marquee-content" aria-hidden="true">
                    <span className="ticker-badge-prefix">ALL PRODUCTS</span>
                    <span className="ticker-sep">•</span>
                    {allProductsTickerList.map((prodName, pIdx) => (
                      <React.Fragment key={`p2-${pIdx}`}>
                        <span className="ticker-product-item">{prodName}</span>
                        <span className="ticker-sep">•</span>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="ticker-marquee-content">
                    <span className="ticker-text">{cleanHomeTickerText}</span>
                    <span className="ticker-sep">•</span>
                    <span className="ticker-text">Best Sivakasi Crackers Direct From Factory</span>
                    <span className="ticker-sep">•</span>
                    <span className="ticker-text">100% Certified Green Crackers</span>
                    <span className="ticker-sep">•</span>
                  </div>
                  <div className="ticker-marquee-content" aria-hidden="true">
                    <span className="ticker-text">{cleanHomeTickerText}</span>
                    <span className="ticker-sep">•</span>
                    <span className="ticker-text">Best Sivakasi Crackers Direct From Factory</span>
                    <span className="ticker-sep">•</span>
                    <span className="ticker-text">100% Certified Green Crackers</span>
                    <span className="ticker-sep">•</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="ticker-right">
            <a href={`tel:${settings.phone}`} className="ticker-contact" title={`Call ${settings.phone}`}>
              <PhoneCall size={13} />
              <span className="ticker-phone-text">Call: {settings.phone}</span>
            </a>
            <span className="ticker-divider">|</span>
            <div className="ticker-badge">
              <ShieldCheck size={13} className="text-emerald" />
              <span>100% Green Crackers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="nav-container nav-content">
          {/* Logo & Brand Identity */}
          <div className="nav-brand" onClick={() => handleNavClick('home')}>
            <div className="brand-logo-frame">
              <img 
                src="/images/sharp_crackers_brand_logo.jpg" 
                alt="Sharp Crackers Official Logo" 
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text-col">
              <div className="brand-name">
                <span className="brand-name-sharp">SHARP</span><span className="brand-name-crackers">CRACKERS</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links with React Bits PillNav */}
          <div className="desktop-links">
            <PillNav
              items={pillNavItems}
              activeHref={currentPage}
              onItemClick={(item, index, event) => {
                event?.preventDefault();
                handleNavClick(item.href);
              }}
              itemStyle="pill"
              hoverEffect="fill"
              indicator="pill"
              layout="split"
              surface="glass"
              size="md"
              bounce={0.3}
              stretch={0.5}
              collapse="never"
              intro
              theme="dark"
              highlightColor="#ff6f00"
              highlightTextColor="#ffffff"
            />
          </div>

          {/* Action Area: Search, Cart Button, Admin Link */}
          <div className="nav-actions">
            {/* Quick Catalog Search trigger */}
            <button 
              className="action-icon-btn" 
              title="Search Catalog"
              onClick={() => {
                if (currentPage !== 'products') {
                  setCurrentPage('products');
                }
                if (onSearchOpen) onSearchOpen();
              }}
            >
              <Search size={18} />
            </button>


            {/* Cart Button */}
            <button 
              className={`cart-action-btn ${totalQuantity > 0 ? 'has-items' : ''}`}
              onClick={() => handleNavClick('cart')}
              title="View Cart / Order Summary"
            >
              <ShoppingCart size={19} />
              <span className="cart-btn-label">Cart</span>
              {totalQuantity > 0 && (
                <span className="cart-count-pill">{totalQuantity}</span>
              )}
            </button>

            {/* Admin Entrance */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`admin-nav-btn ${currentPage.startsWith('admin') ? 'active' : ''}`}
              title="Shop Owner Portal"
            >
              <UserCheck size={16} />
              <span className="admin-btn-en">Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop Overlay - closes drawer on outside tap */}
        {mobileMenuOpen && (
          <div 
            className="mobile-drawer-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer-content">
              {/* Mobile Drawer Brand Header */}
              <div 
                className="mobile-drawer-brand" 
                onClick={() => {
                  handleNavClick('home');
                  setMobileMenuOpen(false);
                }}
              >
                <div className="mobile-drawer-logo-frame">
                  <img 
                    src={settings.logoUrl || "/images/sharp_crackers_brand_logo.jpg"} 
                    alt="Sharp Crackers" 
                    className="mobile-drawer-logo-img"
                    onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                  />
                </div>
                <div className="mobile-drawer-brand-text">
                  <span className="mobile-drawer-brand-name">SHARP CRACKERS</span>
                  <span className="mobile-drawer-brand-sub">DIRECT SIVAKASI FIREWORKS</span>
                </div>
              </div>

              {navLinks.map((link, idx) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`mobile-nav-item ${currentPage === link.id ? 'active' : ''}`}
                  style={{ animationDelay: `${(idx + 1) * 0.035}s` }}
                >
                  <div className="mobile-nav-left">
                    <span className="mobile-nav-icon">{link.icon}</span>
                    <div className="mobile-nav-text">
                      <span className="item-name">{link.label}</span>
                    </div>
                  </div>
                  <div className="mobile-nav-right">
                    {link.id === 'cart' && totalQuantity > 0 && (
                      <span className="mobile-cart-badge">{totalQuantity} items</span>
                    )}
                    {link.badge && <span className="nav-pill-badge">{link.badge}</span>}
                  </div>
                </button>
              ))}


              <div className="mobile-drawer-footer">
                <button 
                  onClick={() => handleNavClick('admin')} 
                  className="mobile-admin-btn"
                >
                  <UserCheck size={18} />
                  <span>Admin Control Center</span>
                </button>

                <div className="mobile-drawer-contact-card">
                  <div className="mobile-contact-row">
                    <PhoneCall size={14} className="text-gold" />
                    <a href={`tel:${settings.phone}`} className="mobile-contact-link">
                      <strong>Direct Call:</strong> {settings.phone}
                    </a>
                  </div>
                  <div className="mobile-contact-row">
                    <Package size={14} className="text-orange" />
                    <span><strong>Location:</strong> Coimbatore, Tamil Nadu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>


      <style>{`
        .sticky-nav-header {
          position: sticky;
          top: 0;
          z-index: 500;
          box-shadow: 0 4px 20px rgba(5, 10, 24, 0.15);
        }

        .top-ticker {
          background: linear-gradient(90deg, #050a18 0%, #0a1329 50%, #050a18 100%);
          color: #f8fafc;
          padding: 0.4rem 0;
          font-size: 0.8rem;
          border-bottom: 1px solid rgba(255, 183, 3, 0.2);
        }

        .nav-container {
          width: 100%;
          max-width: 100%;
          padding-left: clamp(1rem, 2.5vw, 2.5rem);
          padding-right: clamp(1rem, 2.5vw, 2.5rem);
          box-sizing: border-box;
          margin-left: auto;
          margin-right: auto;
        }

        .ticker-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          min-width: 0;
          width: 100%;
        }

        .ticker-center {
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          min-width: 0;
          flex: 1 1 auto;
          mask-image: linear-gradient(to right, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%);
        }

        .ticker-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          white-space: nowrap;
          animation: trainMarquee 32s linear infinite;
          will-change: transform;
        }

        .ticker-marquee-track:hover {
          animation-play-state: paused;
        }

        .ticker-marquee-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding-right: 1.5rem;
          flex-shrink: 0;
        }

        .ticker-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff6f00;
          box-shadow: 0 0 8px #ff6f00;
          animation: pulseGlow 1.5s infinite;
          flex-shrink: 0;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }

        .ticker-text {
          color: #ffd166;
          font-weight: 700;
          white-space: nowrap;
          font-size: 0.82rem;
          letter-spacing: 0.2px;
        }

        .ticker-badge-prefix {
          background: linear-gradient(135deg, #ffb703 0%, #ff6f00 100%);
          color: #050a18;
          font-weight: 900;
          font-size: 0.72rem;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
          letter-spacing: 0.8px;
          white-space: nowrap;
          box-shadow: 0 0 10px rgba(255, 183, 3, 0.4);
        }

        .ticker-product-item {
          color: #ffffff;
          font-weight: 700;
          white-space: nowrap;
          font-size: 0.82rem;
          letter-spacing: 0.3px;
        }

        .ticker-sep {
          color: #ff6f00;
          font-size: 0.75rem;
          font-weight: 900;
          opacity: 0.8;
        }

        @keyframes trainMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .ticker-contact {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #f8fafc;
          font-weight: 600;
          font-size: 0.8rem;
          white-space: nowrap !important;
          flex-shrink: 0;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.22rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 183, 3, 0.25);
          transition: all 0.2s ease;
        }
        .ticker-contact:hover {
          background: rgba(255, 183, 3, 0.22);
          color: #ffb703;
          border-color: #ffb703;
        }

        .ticker-phone-text {
          white-space: nowrap !important;
        }

        .ticker-divider {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.8rem;
        }

        .ticker-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #a7f3d0;
          font-weight: 600;
          font-size: 0.78rem;
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .text-emerald {
          color: #10b981;
        }

        /* Main Nav */
        .main-navbar {
          background: #0a1329;
          border-bottom: 2px solid var(--orange-primary);
          width: 100%;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.65rem;
          padding-bottom: 0.65rem;
          gap: 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          user-select: none;
          flex: 1 1 0;
          justify-content: flex-start;
          min-width: max-content;
        }

        .brand-logo-frame {
          height: 68px;
          width: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 2px solid #ffb703;
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.4);
          overflow: hidden;
          flex-shrink: 0;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .nav-brand:hover .brand-logo-frame {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 183, 3, 0.6);
        }

        .brand-logo-img {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }

        .brand-text-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-name {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.55rem;
          font-weight: 900;
          letter-spacing: 0.3px;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 0.22rem;
          white-space: nowrap;
        }

        .brand-name-sharp,
        .brand-name-crackers {
          display: inline-block;
          padding-left: 0;
          padding-right: 0;
          color: #ffb703;
          background: linear-gradient(180deg, #ffffff 0%, #ffd166 45%, #ffb703 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 950;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.95)) drop-shadow(0 2px 10px rgba(255, 183, 3, 0.5));
        }

        .mobile-drawer-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          margin-bottom: 0.85rem;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          border: 1.5px solid rgba(255, 183, 3, 0.35);
          cursor: pointer;
        }

        .mobile-drawer-logo-frame {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
          border: 2px solid #ffb703;
          flex-shrink: 0;
        }

        .mobile-drawer-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mobile-drawer-brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mobile-drawer-brand-name {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
        }

        .mobile-drawer-brand-sub {
          font-size: 0.65rem;
          font-weight: 700;
          color: #ffb703;
          letter-spacing: 1px;
        }

        .text-orange {
          color: #ff6f00;
        }

        /* Desktop Links */
        .desktop-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .nav-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.52rem 1.25rem;
          border-radius: 9999px;
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 1;
        }

        .nav-link-content {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }

        /* Circulating Laser Border SVG - Exact Print Order Button Style */
        .nav-laser-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-radius: inherit;
          z-index: 2;
          overflow: hidden;
        }

        .nav-laser-rect {
          fill: none;
          stroke: url(#navLaserGrad);
          stroke-width: 2.2px;
          stroke-dasharray: 24 76;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        /* Subtle circulating laser line on hover */
        .nav-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 183, 3, 0.35);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.28);
        }

        .nav-link-btn:hover .nav-laser-rect {
          opacity: 0.95;
          filter: drop-shadow(0 0 5px #ff6f00) drop-shadow(0 0 10px #ffb703);
          animation: laserCirculate 1.8s linear infinite;
        }

        /* Active page state: continuous circulating energetic laser beam */
        .nav-link-btn.active {
          color: #ffffff !important;
          background: linear-gradient(135deg, #ff5e00 0%, #d90429 100%) !important;
          border-color: rgba(255, 215, 0, 0.5) !important;
          box-shadow: 0 4px 20px rgba(255, 94, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
          font-weight: 800;
          transform: translateY(-1px);
        }

        .nav-link-btn.active .nav-laser-rect {
          stroke: url(#navLaserGradActive);
          opacity: 1 !important;
          stroke-width: 2.6px;
          stroke-dasharray: 28 72;
          filter: drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 12px #ffd166);
          animation: laserCirculate 1.35s linear infinite !important;
        }

        /* Active click pulse */
        .nav-link-btn:active {
          transform: scale(0.97);
        }
        .nav-link-btn:active .nav-laser-rect {
          animation: laserCirculate 0.7s linear infinite !important;
          stroke-width: 3.2px;
        }

        /* Shimmer sweep */
        .nav-btn-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.16) 50%,
            transparent 100%
          );
          border-radius: inherit;
          pointer-events: none;
          z-index: 2;
          transition: all 0.5s ease;
        }

        .nav-link-btn:hover .nav-btn-shimmer {
          left: 100%;
          transition: left 0.75s ease-in-out;
        }

        .nav-link-en {
          font-weight: 700;
          color: inherit;
          letter-spacing: 0.25px;
        }

        .nav-link-btn.active .nav-link-en {
          color: #ffffff !important;
          font-weight: 800;
        }

        .nav-link-sep {
          color: rgba(255, 183, 3, 0.65);
          font-size: 0.8rem;
          margin: 0 1px;
        }

        .nav-link-ta {
          font-size: 0.82rem;
          color: #cbd5e1;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 500;
        }

        .nav-link-btn:hover .nav-link-ta {
          color: #ffd166;
        }

        .nav-link-btn.active .nav-link-ta {
          color: #ffd166;
          font-weight: 700;
        }

        .nav-pill-badge {
          background: linear-gradient(135deg, #ff6f00, #d90429);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .nav-cart-badge {
          background: #d90429;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          min-width: 19px;
          height: 19px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1 1 0;
          justify-content: flex-end;
          min-width: max-content;
        }

        .action-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffb703;
        }


        .cart-action-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
          color: #ffffff;
          padding: 0.45rem 0.95rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
          position: relative;
        }
        .cart-action-btn:hover {
          background: linear-gradient(135deg, #ff8500 0%, #ff6f00 100%);
          transform: translateY(-1px);
        }

        .cart-count-pill {
          background: #d90429;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 20px;
          height: 20px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          border: 1.5px solid #ffffff;
        }

        .admin-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.45rem 0.8rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-nav-btn:hover, .admin-nav-btn.active {
          background: rgba(255, 183, 3, 0.15);
          border-color: #ffb703;
          color: #ffb703;
        }

        .admin-btn-en {
          font-weight: 700;
        }

        .admin-btn-sep {
          color: rgba(255, 183, 3, 0.65);
          font-size: 0.78rem;
          margin: 0 1px;
        }

        .admin-btn-ta {
          font-size: 0.8rem;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          color: #cbd5e1;
        }

        .admin-nav-btn:hover .admin-btn-ta, .admin-nav-btn.active .admin-btn-ta {
          color: #ffd166;
        }

        .mobile-toggle-btn {
          display: none;
          color: #ffb703;
          background: rgba(255, 183, 3, 0.12);
          border: 1.5px solid rgba(255, 183, 3, 0.45);
          border-radius: 10px;
          width: 40px;
          height: 40px;
          min-width: 40px;
          flex-shrink: 0 !important;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-toggle-btn:active {
          transform: scale(0.92);
          background: #ffb703;
          color: #050a18;
        }

        /* Mobile Backdrop Overlay */
        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(5, 10, 24, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 480;
          animation: drawerBackdropFade 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes drawerBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 490;
          display: block;
          background: #091326;
          border-top: 1.5px solid rgba(255, 183, 3, 0.35);
          border-bottom: 2px solid rgba(255, 183, 3, 0.25);
          padding: 1rem 1rem max(1.75rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)));
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
          animation: slideDownDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: calc(100dvh - 75px);
          max-height: calc(100vh - 75px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain;
          touch-action: pan-y !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .mobile-drawer::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @keyframes slideDownDrawer {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-drawer-content {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          touch-action: pan-y !important;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.82rem 1.1rem;
          border-radius: 14px;
          color: #f1f5f9;
          background: #0f1c38 !important;
          border: 1.5px solid rgba(255, 183, 3, 0.18) !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease, border-color 0.18s ease;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          animation: drawerItemEnter 0.32s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          outline: none;
        }

        @keyframes drawerItemEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav-item:hover,
        .mobile-nav-item:focus {
          background: #16284e !important;
          border-color: rgba(255, 183, 3, 0.35) !important;
          color: #ffffff;
        }

        .mobile-nav-item:active {
          background: #1a305e !important;
          transform: scale(0.98);
        }

        .mobile-nav-item.active {
          background: linear-gradient(135deg, #ff5e00 0%, #d90429 100%) !important;
          color: #ffffff !important;
          border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
          box-shadow: 0 4px 18px rgba(255, 94, 0, 0.45) !important;
        }

        .mobile-nav-item.active .item-name {
          color: #ffffff;
          font-weight: 800;
        }

        .mobile-nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .mobile-nav-icon {
          font-size: 1.25rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent !important;
        }

        .mobile-nav-text {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          background: transparent !important;
        }

        .item-name {
          font-weight: 800;
          font-size: 0.95rem;
          color: #ffffff;
          background: transparent !important;
        }

        .item-name-ta {
          font-size: 0.75rem;
          color: #fed7aa;
          font-weight: 600;
        }

        .mobile-nav-right {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent !important;
        }

        .mobile-cart-badge {
          background: #d90429;
          color: #ffffff;
          font-size: 0.75rem;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(217, 4, 41, 0.35);
        }

        .mobile-drawer-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .mobile-admin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: #0f1c38 !important;
          border: 1.5px solid #ffb703 !important;
          color: #ffb703 !important;
          padding: 0.88rem 1rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25) !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          user-select: none;
          transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
        }

        .mobile-admin-btn * {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          color: inherit !important;
        }

        .mobile-admin-btn:hover,
        .mobile-admin-btn:focus {
          background: #16284e !important;
          border-color: #ffd166 !important;
          color: #ffffff !important;
        }

        .mobile-admin-btn:active {
          transform: scale(0.98);
          background: #ffb703 !important;
          color: #050a18 !important;
        }

        .mobile-admin-btn:active * {
          color: #050a18 !important;
        }

        .mobile-drawer-contact-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.75rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .mobile-contact-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .mobile-contact-link {
          color: #ffb703;
          text-decoration: none;
        }

        @media (min-width: 993px) {
          .nav-content {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            width: 100%;
          }
          .nav-brand {
            justify-self: start;
          }
          .desktop-links {
            justify-self: center;
          }
          .nav-actions {
            justify-self: end;
          }
        }

        /* Laptops & Standard Displays (993px - 1366px) */
        @media (min-width: 993px) and (max-width: 1366px) {
          .nav-container {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }
          .nav-brand {
            gap: 0.65rem;
            flex-shrink: 0;
          }
          .brand-logo-frame {
            width: 54px;
            height: 54px;
            border-radius: 12px;
          }
          .brand-name {
            font-size: 1.25rem;
          }
          .brand-tagline {
            font-size: 0.62rem;
            letter-spacing: 0.8px;
          }
          .desktop-links {
            gap: 0.35rem;
          }
          .nav-link-btn {
            padding: 0.45rem 0.85rem;
            font-size: 0.88rem;
            gap: 0.3rem;
          }
          .nav-actions {
            gap: 0.6rem;
            flex-shrink: 0;
          }
          .cart-action-btn {
            padding: 0.42rem 0.85rem;
            font-size: 0.86rem;
          }
          .admin-nav-btn {
            padding: 0.42rem 0.75rem;
            font-size: 0.82rem;
          }
          .ticker-divider,
          .ticker-badge {
            display: none !important;
          }
        }

        @media (min-width: 993px) {
          .mobile-drawer {
            display: none !important;
          }
        }

        @media (max-width: 992px) {
          .nav-container {
            padding-left: clamp(0.65rem, 2.5vw, 1.25rem);
            padding-right: clamp(0.65rem, 2.5vw, 1.25rem);
          }
          .ticker-container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ticker-spacer {
            display: none !important;
          }
          .ticker-right {
            display: none !important;
          }
          .ticker-center {
            width: 100%;
            justify-content: center;
          }
          .desktop-links {
            display: none !important;
          }
          .admin-nav-btn {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .nav-content {
            gap: 0.5rem;
          }
          .nav-brand {
            flex: 1 1 auto;
            min-width: 0;
            gap: 0.6rem;
          }
          .brand-logo-frame {
            width: 46px;
            height: 46px;
            border-radius: 10px;
            flex-shrink: 0;
          }
          .brand-name {
            font-size: clamp(1.05rem, 3.8vw, 1.35rem);
            gap: 0.18rem;
          }
          .nav-actions {
            flex: 0 0 auto !important;
            flex-shrink: 0 !important;
            min-width: max-content;
            gap: 0.45rem;
          }
        }

        @media (max-width: 576px) {
          .nav-container {
            padding-left: 0.6rem !important;
            padding-right: 0.6rem !important;
          }
          .cart-btn-label {
            display: none;
          }
          .brand-name {
            font-size: clamp(0.95rem, 4.2vw, 1.15rem);
            letter-spacing: 0.2px;
            gap: 0.15rem;
          }
          .brand-logo-frame {
            width: 42px;
            height: 42px;
            border-radius: 9px;
            flex-shrink: 0;
          }
          .brand-tagline {
            display: none;
          }
          .nav-content {
            padding-top: 0.45rem;
            padding-bottom: 0.45rem;
            gap: 0.35rem;
          }
          .nav-actions {
            flex-shrink: 0 !important;
            gap: 0.35rem;
          }
          .action-icon-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            flex-shrink: 0;
          }
          .cart-action-btn {
            padding: 0.4rem 0.65rem;
            height: 36px;
            box-sizing: border-box;
            flex-shrink: 0;
          }
          .mobile-toggle-btn {
            width: 38px;
            height: 38px;
            min-width: 38px;
            flex-shrink: 0 !important;
          }
          .top-ticker {
            font-size: 0.72rem;
            padding: 0.35rem 0;
          }
        }

        @media (max-width: 380px) {
          .nav-container {
            padding-left: 0.4rem !important;
            padding-right: 0.4rem !important;
          }
          .nav-content {
            gap: 0.25rem;
          }
          .nav-brand {
            gap: 0.35rem;
            min-width: 0;
            overflow: hidden;
          }
          .brand-logo-frame {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            flex-shrink: 0;
          }
          .brand-text-col {
            min-width: 0;
            overflow: hidden;
          }
          .brand-name {
            font-size: 0.92rem;
            gap: 0.12rem;
            white-space: nowrap;
          }
          .brand-name-sharp {
            padding-left: 0;
          }
          .nav-actions {
            gap: 0.25rem;
            flex-shrink: 0;
          }
          .action-icon-btn {
            width: 33px;
            height: 33px;
            min-width: 33px;
          }
          .cart-action-btn {
            padding: 0.35rem 0.5rem;
            height: 33px;
          }
          .mobile-toggle-btn {
            width: 35px;
            height: 35px;
            min-width: 35px;
            border-radius: 8px;
          }
        }

        @media (max-width: 340px) {
          .brand-logo-frame {
            width: 30px;
            height: 30px;
            border-radius: 6px;
          }
          .brand-name {
            font-size: 0.82rem;
          }
          .action-icon-btn {
            width: 30px;
            height: 30px;
            min-width: 30px;
          }
          .cart-action-btn {
            padding: 0.3rem 0.4rem;
            height: 30px;
          }
          .mobile-toggle-btn {
            width: 32px;
            height: 32px;
            min-width: 32px;
          }
        }
      `}</style>
    </header>
  );
};
