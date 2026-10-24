// ==========================================================================
// SHARP CRACKERS - FOOTER COMPONENT
// Comprehensive footer with contact details, quick links, safety notice, and hours
// ==========================================================================

import React from 'react';
import { useCart } from '../context/CartContext';
import {
  Flame,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';

export const Footer = ({ setCurrentPage, setSelectedCategory }) => {
  const { settings } = useCart();

  const handleNav = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCategoryClick = (catId) => {
    if (setSelectedCategory) setSelectedCategory(catId);
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <footer className="site-footer no-print">
      {/* Upper Safety & Trust Strip */}
      <div className="footer-trust-strip">
        <div className="container trust-grid">
          <div className="trust-item">
            <div className="trust-icon-box">
              <ShieldCheck size={24} className="text-emerald" />
            </div>
            <div>
              <div className="trust-title">100% Green Crackers</div>
              <div className="trust-desc">Certified eco-friendly formulas with reduced emissions</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Sparkles size={24} className="text-gold" />
            </div>
            <div>
              <div className="trust-title">Direct From Sivakasi</div>
              <div className="trust-desc">Freshly manufactured pyrotechnics at genuine direct rates</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Clock size={24} className="text-orange" />
            </div>
            <div>
              <div className="trust-title">Prompt Safe Delivery</div>
              <div className="trust-desc">Carefully packed in compliance with hazardous transport laws</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => handleNav('home')}>
              <div className="footer-logo-frame">
                <img
                  src={settings.logoUrl || "/images/sharp_crackers_brand_logo.jpg"}
                  alt="Sharp Crackers"
                  className="footer-logo-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                />
              </div>
              <div>
                <span className="footer-brand-title">SHARP <span className="text-orange">CRACKERS</span></span>
                <span className="footer-brand-sub">DIRECT SIVAKASI FIREWORKS</span>
              </div>
            </div>
            <p className="footer-about-text">
              SHARP CRACKERS is Sivakasi's premier direct-to-customer fireworks showroom. We bring the sparkle, joy, and grand tradition of Diwali right to your doorstep with unmatched quality, safety compliance, and honest direct pricing.
            </p>
            <div className="footer-timings">
              <Clock size={16} className="text-gold" />
              <span><strong>Working Hours:</strong> {settings.businessHours || '8:00 AM – 10:00 PM'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNav('home')} className="footer-link-btn">
                  <ChevronRight size={14} /> Home Page
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="footer-link-btn">
                  <ChevronRight size={14} /> Products & Price Catalog
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('cart')} className="footer-link-btn">
                  <ChevronRight size={14} /> Cart / Order Summary
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="footer-link-btn">
                  <ChevronRight size={14} /> About Our Sivakasi Heritage
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="footer-link-btn">
                  <ChevronRight size={14} /> Contact & Directions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="footer-link-btn admin-link">
                  <Lock size={13} /> Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Cracker Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => handleCategoryClick('sparklers')} className="footer-link-btn">
                  <ChevronRight size={14} /> Electric & Color Sparklers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('flower-pots')} className="footer-link-btn">
                  <ChevronRight size={14} /> Deluxe Flower Pots & Asoka
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('ground-chakkars')} className="footer-link-btn">
                  <ChevronRight size={14} /> High-Speed Ground Chakkars
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('multi-colour-shots')} className="footer-link-btn">
                  <ChevronRight size={14} /> Sky Shots & Dancing Fountains
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('sound-crackers')} className="footer-link-btn">
                  <ChevronRight size={14} /> 1000 to 5000 Wala Garlands
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('gift-boxes')} className="footer-link-btn">
                  <ChevronRight size={14} /> Diwali Family Gift Mega Packs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Showroom Address */}
          <div className="footer-col">
            <h4 className="footer-heading">Showroom & Office</h4>
            <div className="footer-contact-block">
              <div className="contact-line">
                <MapPin size={18} className="contact-icon text-orange" />
                <span>{settings.address || '89, Sivasakthy Layout, Selvam Mahal (opposite), Chettipalayam Road, Echanari, Coimbatore - 641 021. Tamilnadu'}</span>
              </div>
              <div className="contact-line">
                <Phone size={18} className="contact-icon text-gold" />
                <div>
                  <a href={`tel:${settings.phone || '9566886785'}`}>{settings.phone || '+91 95668 86785'}</a>
                  {settings.altPhone && <span>, <a href={`tel:${settings.altPhone}`}>{settings.altPhone}</a></span>}
                </div>
              </div>
              <div className="contact-line">
                <Mail size={18} className="contact-icon text-orange" />
                <a href={`mailto:${settings.email || 'sharpcrackars@gmail.com'}`}>{settings.email || 'sharpcrackars@gmail.com'}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-content">
          <div>
            © {new Date().getFullYear()} <strong>SHARP CRACKERS</strong>. All Rights Reserved. Manufactured and marketed in Sivakasi, India. | Designed & Developed by <strong style={{ color: '#ffd166' }}>GEN-Z WORKS</strong>, Coimbatore Tamil Nadu India.
          </div>
          <div className="bottom-safety-badge">
            <span>Always follow standard firework safety precautions. Light responsibly.</span>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #050a18;
          color: #cbd5e1;
          margin-top: auto;
          border-top: 3px solid #ff6f00;
        }

        .footer-trust-strip {
          background: #0a1329;
          padding: 1.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .trust-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 183, 3, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trust-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .trust-desc {
          font-size: 0.82rem;
          color: #94a3b8;
        }

        .footer-main {
          padding: 3.5rem 0 2.5rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 2.5rem;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .footer-logo-frame {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          background: #ffffff;
          border: 2px solid #ffb703;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(255, 111, 0, 0.35);
        }

        .footer-brand-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 900;
          color: #ffffff;
          display: block;
          line-height: 1.1;
        }

        .footer-brand-sub {
          font-size: 0.65rem;
          color: #ffb703;
          font-weight: 700;
          letter-spacing: 1.2px;
          display: block;
        }

        .footer-about-text {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #94a3b8;
          margin-bottom: 1.25rem;
        }

        .footer-timings {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #ffd166;
          background: rgba(255, 183, 3, 0.08);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 183, 3, 0.2);
        }

        .footer-heading {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.2rem;
          position: relative;
          padding-bottom: 0.4rem;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 28px;
          height: 2px;
          background: #ff6f00;
          border-radius: 2px;
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .footer-link-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #94a3b8;
          font-size: 0.88rem;
          text-align: left;
          padding: 0.15rem 0;
        }

        .footer-link-btn:hover {
          color: #ffb703;
          transform: translateX(3px);
        }

        .admin-link {
          color: #ffd166;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .footer-contact-block {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          font-size: 0.88rem;
        }

        .contact-line {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .contact-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .contact-line a:hover {
          color: #ffb703;
        }



        .text-gold { color: #ffb703; }
        .text-orange { color: #ff6f00; }

        .footer-bottom {
          background: #030611;
          padding: 1.25rem 0;
          font-size: 0.82rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #64748b;
        }

        .bottom-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .bottom-safety-badge {
          color: #ffb703;
          font-size: 0.8rem;
        }

        @media (max-width: 992px) {
          .trust-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .bottom-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};
