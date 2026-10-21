// ==========================================================================
// SHARP CRACKERS - NAVIGATION BAR
// Responsive, festive header with brand logo, links, search, and dynamic cart badge
// ==========================================================================

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
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
  Package,
  Home,
  Info,
  Building2
} from 'lucide-react';

export const Navbar = ({ currentPage, setCurrentPage, onSearchOpen }) => {
  const { totalQuantity, totalSelectedProducts, cartSubtotal, settings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop navigation links (Cart is in dedicated right-side action button)
  const desktopLinks = [
    { id: 'home', label: 'Home', ta: 'முகப்பு' },
    { id: 'products', label: 'Products & Price List', ta: 'ரகங்கள் & விலை' },
    { id: 'about', label: 'About Us', ta: 'எங்களை பற்றி' },
    { id: 'contact', label: 'Contact Us', ta: 'தொடர்பு' }
  ];

  // Mobile drawer links include Cart with live count
  const mobileLinks = [
    { id: 'home', label: 'Home', ta: 'முகப்பு', icon: '🏠' },
    { id: 'products', label: 'Products & Price List', ta: 'பட்டாசு ரகங்கள்', icon: '🎆' },
    { id: 'cart', label: 'Cart & Order Sheet', ta: 'ஆர்டர் கூடை', count: totalQuantity, icon: '🛒' },
    { id: 'about', label: 'About Us', ta: 'எங்களை பற்றி', icon: '🏭' },
    { id: 'contact', label: 'Contact Us', ta: 'தொடர்பு கொள்ள', icon: '📞' }
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
          <div className="ticker-left-info">
            <span className="ticker-badge-mini">
              <ShieldCheck size={12} className="text-emerald" />
              <span>100% Green Certified</span>
            </span>
          </div>
          <div className="ticker-center">
            <span className="ticker-pulse"></span>
            <span className="ticker-text">{settings.promoBannerText || "💥 DIWALI 2026 MEGA SALE: Flat Direct Sivakasi Pricing with Heavy Savings! 🎆"}</span>
          </div>
          <div className="ticker-right">
            <a href={`tel:${settings.phone}`} className="ticker-contact" title="Direct Phone Helpline">
              <PhoneCall size={12} />
              <span>Hotline: {settings.phone}</span>
            </a>
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
                src={settings.logoUrl || "/images/sharp_crackers_logo_final.png"} 
                alt="Sharp Crackers Official Logo" 
                className="brand-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="brand-logo-fallback" style={{ display: 'none' }}>
                <Flame size={24} color="#ffb703" />
              </div>
            </div>
            <div className="brand-text-block">
              <div className="brand-name">
                SHARP <span className="text-orange">CRACKERS</span>
              </div>
              <div className="brand-tagline">DIRECT SIVAKASI FIREWORKS</div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="desktop-links">
            {desktopLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-link-en">{link.label}</span>
                  <span className="nav-link-ta">{link.ta}</span>
                </button>
              );
            })}
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
              <ShoppingCart size={18} />
              <span className="cart-btn-label">Cart</span>
              {totalQuantity > 0 ? (
                <span className="cart-count-pill">{totalQuantity}</span>
              ) : (
                <span className="cart-zero-pill">0</span>
              )}
            </button>

            {/* Admin Entrance */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`admin-nav-btn ${currentPage.startsWith('admin') ? 'active' : ''}`}
              title="Shop Owner Portal"
            >
              <UserCheck size={15} />
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer-content">
              {mobileLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`mobile-nav-item ${currentPage === link.id ? 'active' : ''}`}
                >
                  <div className="mobile-nav-left">
                    <span className="mobile-nav-icon">{link.icon}</span>
                    <div className="mobile-nav-text">
                      <span className="item-name">{link.label}</span>
                      <span className="item-name-ta">{link.ta}</span>
                    </div>
                  </div>
                  <div className="mobile-nav-right">
                    {link.id === 'cart' && totalQuantity > 0 && (
                      <span className="mobile-cart-badge">{totalQuantity} boxes</span>
                    )}
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
                    <span><strong>Location:</strong> Sivakasi, Tamil Nadu</span>
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
          gap: 1rem;
          min-width: 0;
          width: 100%;
        }

        .ticker-left-info {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .ticker-badge-mini {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #a7f3d0;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ticker-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          min-width: 0;
          flex: 1;
          text-align: center;
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
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          text-align: center;
        }

        .ticker-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .ticker-contact {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #cbd5e1;
        }
        .ticker-contact:hover {
          color: #ffb703;
        }

        .ticker-divider {
          color: rgba(255, 255, 255, 0.2);
        }

        .ticker-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #a7f3d0;
          font-weight: 600;
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
          width: 58px;
          height: 58px;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffb703;
          box-shadow: 0 4px 16px rgba(255, 183, 3, 0.45);
          flex-shrink: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .nav-brand:hover .brand-logo-frame {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 111, 0, 0.5);
        }

        .brand-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-text-block {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-name {
          font-family: var(--font-display);
          font-size: 1.55rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #ffb703;
          margin-top: 3px;
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
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.55rem 1.25rem;
          border-radius: 9999px;
          position: relative;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.14);
        }

        .nav-link-btn.active {
          color: #ffffff !important;
          background: linear-gradient(135deg, #ff5e00 0%, #d90429 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 4px 18px rgba(255, 94, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
          font-weight: 800;
          transform: translateY(-1px);
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

        .cart-zero-pill {
          background: rgba(255, 255, 255, 0.2);
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
          border: 1px solid rgba(255, 255, 255, 0.3);
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
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 183, 3, 0.35);
          border-radius: 8px;
          padding: 0.45rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-toggle-btn:active {
          transform: scale(0.92);
          background: rgba(255, 183, 3, 0.2);
        }

        /* Mobile Drawer */
        .mobile-drawer {
          display: block;
          background: linear-gradient(180deg, #0a1329 0%, #060d1f 100%);
          border-top: 1.5px solid rgba(255, 183, 3, 0.35);
          padding: 1rem 1rem 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          animation: slideDownDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: calc(100vh - 75px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 183, 3, 0.3) transparent;
        }

        .mobile-drawer::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-drawer::-webkit-scrollbar-thumb {
          background: rgba(255, 183, 3, 0.3);
          border-radius: 4px;
        }

        @keyframes slideDownDrawer {
          from {
            opacity: 0;
            transform: translateY(-8px);
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
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.95rem;
          border-radius: 12px;
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
        }

        .mobile-nav-item:active {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(0.98);
        }

        .mobile-nav-item.active {
          background: linear-gradient(135deg, #ff5e00 0%, #d90429 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 15px rgba(255, 94, 0, 0.4);
        }

        .mobile-nav-item.active .item-name {
          color: #ffffff;
          font-weight: 800;
        }

        .mobile-nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-nav-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .mobile-nav-text {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .item-name {
          font-weight: 800;
          font-size: 0.95rem;
          color: #ffffff;
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
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(255, 183, 3, 0.2) 0%, rgba(255, 111, 0, 0.15) 100%);
          border: 1.5px solid #ffb703;
          color: #ffd166;
          padding: 0.85rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 183, 3, 0.15);
          transition: all 0.2s ease;
        }

        .mobile-admin-btn:active {
          transform: scale(0.97);
          background: #ffb703;
          color: #050a18;
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

        @media (min-width: 1260px) {
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

        @media (min-width: 993px) and (max-width: 1259px) {
          .nav-container {
            padding-left: 0.85rem;
            padding-right: 0.85rem;
          }
          .nav-content {
            gap: 0.4rem;
          }
          .nav-brand {
            gap: 0.5rem;
            flex: initial;
          }
          .brand-logo-frame {
            width: 48px;
            height: 48px;
          }
          .brand-name {
            font-size: 1.2rem;
          }
          .brand-tagline {
            font-size: 0.6rem;
            letter-spacing: 0.7px;
          }
          .desktop-links {
            gap: 0.2rem;
            flex: 1;
            justify-content: center;
          }
          .nav-link-btn {
            padding: 0.45rem 0.5rem;
            font-size: 0.82rem;
            gap: 0.2rem;
          }
          .nav-link-ta {
            font-size: 0.74rem;
          }
          .nav-pill-badge {
            display: none;
          }
          .nav-actions {
            gap: 0.45rem;
            flex: initial;
          }
          .cart-action-btn {
            padding: 0.4rem 0.7rem;
            font-size: 0.82rem;
          }
          .admin-nav-btn {
            padding: 0.4rem 0.6rem;
            font-size: 0.78rem;
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
          .nav-brand {
            flex: initial;
          }
          .nav-actions {
            flex: initial;
          }
        }

        @media (max-width: 576px) {
          .cart-btn-label {
            display: none;
          }
          .brand-name {
            font-size: 1.15rem;
          }
          .brand-logo-frame {
            width: 44px;
            height: 44px;
          }
          .brand-tagline {
            display: none;
          }
          .nav-content {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            gap: 0.5rem;
          }
          .nav-actions {
            gap: 0.45rem;
          }
          .top-ticker {
            font-size: 0.72rem;
            padding: 0.35rem 0;
          }
        }
      `}</style>
    </header>
  );
};
