// ==========================================================================
// SHARP CRACKERS - HOMEPAGE COMPONENT
// Festive hero banner, complete 14-category collections, auto-scrolling bestsellers,
// dedicated 5-pack gift box showcase, and genuine Sivakasi product visuals.
// ==========================================================================

import React, { useRef, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Truck, 
  Tag, 
  Package, 
  Star,
  ChevronLeft,
  ChevronRight,
  Gift,
  ShoppingCart
} from 'lucide-react';

export const HomePage = ({ setCurrentPage, setSelectedCategory }) => {
  const { products, settings } = useCart();
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleCategoryClick = (categoryId) => {
    if (setSelectedCategory) setSelectedCategory(categoryId);
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreClick = () => {
    if (setSelectedCategory) setSelectedCategory('all');
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductCardClick = (product) => {
    if (setSelectedCategory && product?.category) {
      setSelectedCategory(product.category);
    } else if (setSelectedCategory) {
      setSelectedCategory('all');
    }
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live synced categories from dataService
  const [categories, setCategories] = useState(() => dataService.getCategories());

  useEffect(() => {
    const handleDataChange = () => {
      setCategories(dataService.getCategories());
    };
    window.addEventListener('sharp_data_changed', handleDataChange);
    return () => {
      window.removeEventListener('sharp_data_changed', handleDataChange);
    };
  }, []);

  // Best-selling products (wide catalog selection)
  const bestSellers = products.filter(p => p.isBestseller);

  // Dedicated 5 Gift Boxes from Catalog
  const giftBoxes = products
    .filter(p => p.category === 'gift-boxes')
    .sort((a, b) => (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0));

  // Gentle horizontal auto-scroll animation for Bestsellers
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId;
    let lastTime = performance.now();

    const step = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isHovered && el) {
        // Slow, gentle, buttery drift (~35px per second)
        el.scrollLeft += delta * 0.035;
        // Loop back seamlessly when near the end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* 1. HERO BANNER SECTION WITH AMBIENT VIDEO BACKGROUND */}
      <section className="hero-section">
        <video 
          ref={videoRef}
          className="hero-video-bg"
          autoPlay 
          loop 
          muted 
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster="/images/home_hero_bg_4k.webp"
        >
          <source src="/videos/hero_bg_wp.mp4" type="video/mp4" />
          <source src="/videos/hero_fireworks_bg.mp4" type="video/mp4" />
          <source src="/videos/cracker_wp_enhance.mp4" type="video/mp4" />
        </video>
        <div 
          className="hero-backdrop" 
          style={{ backgroundImage: `url('/images/home_hero_bg_4k.webp')` }}
        />
        <div className="hero-overlay" />

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <Sparkles size={16} className="text-gold" />
              <span>Direct From Sivakasi • Best Price Guarantee</span>
            </div>

            <h1 className="hero-main-title">
              Light Up Your <span className="highlight-text">Celebrations!</span>
            </h1>
            <p className="hero-description">
              Discover a wide range of crackers for every celebration. Direct Sivakasi factory prices, 100% green-certified formulations, and smooth bulk ordering tailored for your family and community.
            </p>

            <div className="hero-cta-group">
              <button onClick={handleExploreClick} className="btn btn-primary btn-lg hero-btn-primary">
                <span>Explore Products</span>
                <ArrowRight size={20} />
              </button>
              <a href="#featured-categories" className="btn btn-outline-light btn-lg hero-btn-secondary">
                <span>View Categories</span>
              </a>
            </div>

            <div className="hero-feature-pills">
              <div className="feature-pill">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>100% Legal Green Crackers</span>
              </div>
              <div className="feature-pill">
                <Tag size={16} className="text-gold" />
                <span>Up to 75% Factory Savings</span>
              </div>
              <div className="feature-pill">
                <Truck size={16} className="text-orange" />
                <span>Pan-India Safe Transport</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CRACKER COLLECTIONS (ALL 14 CATEGORIES WITH GENUINE UPLOADED PRODUCT IMAGES) */}
      <section id="featured-categories" className="section-padding bg-cream">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-subtitle">
              EXPLORE BY CATEGORY
            </div>
            <h2 className="section-title">
              Popular Cracker Collections
            </h2>
            <p className="section-desc">
              Browse our diverse collection of {categories.length} genuine Sivakasi firecracker categories designed for festive safety, vivid illumination, and joyous festivities.
            </p>
          </div>

          <div className="categories-grid">
            {categories.filter(c => c.active !== false).map((cat, idx) => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="category-card"
                  style={{ transitionDelay: `${(idx % 4) * 0.07}s` }}
                  onClick={() => handleCategoryClick(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(cat.id);
                    }
                  }}
                  title={`Click to view ${cat.name} collection`}
                >
                  <div className="cat-img-wrapper">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="cat-img"
                      loading="eager"
                      decoding="async"
                      onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                    />
                    <span className="cat-badge">{count > 0 ? `${count} Varieties` : 'Explore'}</span>
                  </div>
                  <div className="cat-info">
                    <h3 className="cat-title">
                      <span className="cat-title-en">{cat.name}</span>
                      <span className="cat-title-sep"> / </span>
                      <span className="cat-title-ta">{cat.ta}</span>
                    </h3>
                    <p className="cat-desc">{cat.desc}</p>
                    <button className="cat-btn" type="button">
                      <span>View Products</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BEST-SELLING FIREWORKS (SMOOTH HORIZONTAL AUTO-SCROLLING SHOWCASE) */}
      <section className="section-padding bg-white bestsellers-showcase-section">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <div className="section-subtitle">
                FAVORITES OF THE SEASON
              </div>
              <h2 className="section-title">
                Best-Selling Fireworks
              </h2>
              <p className="section-desc">
                Hand-picked trending festive favorites continuously moving — swipe or use arrows to explore all {bestSellers.length} bestsellers!
              </p>
            </div>
            <div className="slider-action-controls">
              <button 
                type="button"
                className="slider-nav-btn" 
                onClick={() => handleScroll('left')} 
                title="Scroll previous"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                type="button"
                className="slider-nav-btn" 
                onClick={() => handleScroll('right')} 
                title="Scroll next"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
              <button onClick={handleExploreClick} className="btn btn-outline-dark btn-sm">
                <span>Full Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bestsellers-scroll-wrapper">
            <div 
              className="bestsellers-scroll-track" 
              ref={scrollRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
            >
              {bestSellers.map((product) => {
                const discount = Math.round(((product.mrp - product.unitPrice) / product.mrp) * 100);

                return (
                  <div 
                    key={product.id} 
                    className="bestseller-slide-card"
                    onClick={() => handleProductCardClick(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProductCardClick(product);
                      }
                    }}
                    title={`Click to view ${product.name} in Products catalog`}
                  >
                    <div className="slide-card-media">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="slide-card-img" 
                        loading="eager"
                        decoding="async"
                        onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                      />

                      <div className="slide-star-badge">
                        <Star size={11} fill="#ffb703" color="#ffb703" />
                        <span>Best Seller</span>
                      </div>
                    </div>

                    <div className="slide-card-details">
                      <div className="slide-code-row">
                        <span className="slide-sno-tag">#{product.sno ? String(parseInt(product.sno, 10)).padStart(3, '0') : '001'}</span>
                        <span className="slide-code-label">{product.code}</span>
                      </div>
                      <h3 className="slide-card-title">
                        <span className="slide-title-en">{product.name}</span>
                        {product.tamilName && (
                          <span className="slide-title-ta">{product.tamilName}</span>
                        )}
                      </h3>
                      <div className="slide-pack-tag">{product.packDetails}</div>
                      <p className="slide-short-desc">{product.description}</p>

                      <div className="slide-price-block">
                        <div className="slide-price-primary">₹{product.unitPrice}</div>
                        <div className="slide-price-strike">₹{product.mrp}</div>
                      </div>

                      <div className="slide-card-action">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductCardClick(product);
                          }}
                          className="btn btn-primary btn-block slide-action-btn"
                        >
                          <ShoppingCart size={14} />
                          <span>Order Item</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEDICATED DIWALI GIFT BOXES SHOWCASE (ALL 5 GIFT PACKS IN CLEAN RESPONSIVE LINE) */}
      <section id="gift-boxes-section" className="section-padding bg-cream gift-boxes-section">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <div className="section-subtitle">
                FESTIVE FAMILY PACKS • 75% SAVINGS
              </div>
              <h2 className="section-title">
                Diwali Special Gift Boxes
              </h2>
              <p className="section-desc">
                Specially curated family gift hampers packed with classic sparklers, flowerpots, chakkars, rockets, and sound crackers for complete festive joy.
              </p>
            </div>
            <button onClick={() => handleCategoryClick('gift-boxes')} className="btn btn-gold btn-sm">
              <Gift size={15} />
              <span>Explore All Gift Packs</span>
            </button>
          </div>

          <div className="gift-boxes-grid">
            {giftBoxes.map((box) => {
              const discount = Math.round(((box.mrp - box.unitPrice) / box.mrp) * 100);
              return (
                <div
                  key={box.id}
                  className="gift-box-card"
                  onClick={() => handleProductCardClick(box)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProductCardClick(box);
                    }
                  }}
                  title={`Click to view ${box.name}`}
                >
                  <div className="gift-card-media">
                    <img 
                      src={box.image} 
                      alt={box.name} 
                      className="gift-card-img" 
                      loading="eager"
                      onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                    />

                    <span className="gift-festive-tag">Diwali Special</span>
                  </div>

                  <div className="gift-card-body">
                    <div className="gift-code-tag">#{box.sno || '064'} • {box.code}</div>
                    <h3 className="gift-card-name">
                      <span className="gift-name-en">{box.name}</span>
                      <span className="gift-name-ta">{box.tamilName}</span>
                    </h3>
                    <div className="gift-pack-badge">{box.packDetails}</div>
                    <p className="gift-short-desc">{box.description}</p>

                    <div className="gift-price-row">
                      <div>
                        <div className="gift-price-current">₹{box.unitPrice}</div>
                        <div className="gift-price-mrp">MRP ₹{box.mrp}</div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm gift-order-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductCardClick(box);
                        }}
                      >
                        <span>Order Box</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE SHARP CRACKERS */}
      <section className="section-padding bg-navy text-white">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-subtitle text-gold">
              TRUSTED SIVAKASI TRADITION
            </div>
            <h2 className="section-title text-white">
              Why Choose SHARP CRACKERS?
            </h2>
            <p className="section-desc text-muted-light">
              We make fireworks shopping simple, transparent, and completely worry-free for families and celebration events alike.
            </p>
          </div>

          <div className="features-grid">
            {[
              { icon: <Package size={28} className="text-orange" />, title: 'Wide Variety of Products', text: 'Over 90+ verified items spanning classic sparklers, soaring rockets, dancing fountains, high-burst repeaters, and curated family gift boxes.' },
              { icon: <CheckCircle2 size={28} className="text-emerald" />, title: 'Easy Product Selection', text: 'Browse our one-stop order catalog table. Add quantities with single-click plus/minus controls without navigating back and forth.' },
              { icon: <Tag size={28} className="text-gold" />, title: 'Transparent Pricing', text: 'Honest factory rates direct from Sivakasi with clear pack details, no hidden surcharges, and real-time order total calculations.' },
              { icon: <Award size={28} className="text-orange" />, title: 'Convenient Order Management', text: 'Instant computer-generated PDF invoices, print-ready order sheets, and real-time order tracking via our automated system.' },
              { icon: <ShieldCheck size={28} className="text-gold" />, title: 'Customer-Friendly Service', text: 'Dedicated direct phone assistance, festive guidance, and transparent fulfillment updates ensure your festive deliveries arrive intact and on schedule.' },
            ].map((feat) => (
              <div key={feat.title} className="feature-card">
                <div className="feature-icon-box">{feat.icon}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-text">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FESTIVE PROMOTIONAL BANNER WITH GENUINE UPLOADED SIVAKASI PRODUCT IMAGE */}
      <section className="section-padding promo-section">
        <div className="container">
          <div className="promo-banner-card">
            <div className="promo-content">
              <span className="badge badge-festive promo-badge">FESTIVAL SPECIAL</span>
              <h2 className="promo-title">
                Plan Your Festival Early & Save Big!
              </h2>
              <p className="promo-text">
                Direct Sivakasi bookings for Diwali 2026 are officially open. Enjoy verified stock availability, factory-level price advantages, and stress-free early dispatch.
              </p>
              <div className="promo-features">
                <div className="promo-feature-item">
                  <CheckCircle2 size={18} className="text-emerald" />
                  <span>Free doorstep packing for orders over ₹5,000</span>
                </div>
                <div className="promo-feature-item">
                  <CheckCircle2 size={18} className="text-emerald" />
                  <span>Direct factory pickup available in Sivakasi</span>
                </div>
              </div>
              <div className="promo-cta">
                <button onClick={handleExploreClick} className="btn btn-primary btn-lg">
                  <span>Start Order Now</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <div className="promo-visual">
              <img 
                src="/images/products/gift_box_60_items_v1.jpg" 
                alt="Sharp Crackers Royal Celebration Hamper" 
                className="promo-img"
                onError={(e) => { e.currentTarget.src = '/images/products/gift_box_35_items_v1.jpg'; }}
              />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 5rem 0;
          overflow: hidden;
          background: #050a18;
        }

        .hero-video-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
          pointer-events: none;
        }

        .hero-backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          z-index: 2;
          opacity: 0.85;
          pointer-events: none;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(5, 10, 24, 0.94) 0%,
            rgba(5, 10, 24, 0.72) 48%,
            rgba(5, 10, 24, 0.35) 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        .hero-container {
          position: relative;
          z-index: 4;
        }

        .hero-content {
          max-width: 680px;
          color: #ffffff;
        }

        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 183, 3, 0.15);
          border: 1px solid rgba(255, 183, 3, 0.4);
          color: #ffd166;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          backdrop-filter: blur(8px);
        }

        .hero-main-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.5px;
        }

        .highlight-text {
          background: linear-gradient(135deg, #ffb703 0%, #ff6f00 60%, #d90429 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          box-shadow: 0 8px 25px rgba(255, 111, 0, 0.4);
        }

        .hero-feature-pills {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        /* Section Layouts */
        .section-padding {
          padding: 5rem 0;
        }

        .bg-cream {
          background-color: #fdfbf7;
        }

        .bg-white {
          background-color: #ffffff;
        }

        .bg-navy {
          background: linear-gradient(180deg, #0a1329 0%, #050a18 100%);
        }

        .section-header {
          margin-bottom: 3.5rem;
        }

        .section-header.text-center {
          text-align: center;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-header-flex {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .section-subtitle {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff6f00;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .section-title {
          font-size: 2.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .section-title.text-white {
          color: #ffffff;
        }

        .section-desc {
          font-size: 1.05rem;
          color: #64748b;
          line-height: 1.6;
        }

        .text-muted-light {
          color: #94a3b8;
        }

        /* Categories Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.85rem;
          perspective: 1000px;
        }

        .category-card {
          grid-column: span 2;
          position: relative;
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(255, 111, 0, 0.14), 0 1px 6px rgba(15, 23, 42, 0.07), inset 0 0 0 1.5px rgba(255, 145, 0, 0.18);
          border: 2px solid #ffb347;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          isolation: isolate;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.35s ease;
        }

        .category-card:nth-child(13) {
          grid-column: 2 / span 2;
        }

        .category-card:nth-child(14) {
          grid-column: 4 / span 2;
        }

        /* Classy Glass / Specular Holographic Reflection Beam (Sheen Sweep) */
        .category-card::before {
          content: '';
          position: absolute;
          top: -65%;
          left: -80%;
          width: 75%;
          height: 230%;
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.15) 30%,
            rgba(255, 255, 255, 0.75) 48%,
            rgba(255, 215, 0, 0.7) 52%,
            rgba(255, 255, 255, 0.9) 56%,
            rgba(255, 255, 255, 0.15) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(26deg);
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.45));
        }

        /* Hover & Touch Reflection Trigger */
        .category-card:hover::before,
        .category-card:active::before {
          animation: cardReflectionSweep 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes cardReflectionSweep {
          0% {
            transform: rotate(26deg) translate(-130%, 0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: rotate(26deg) translate(390%, 0);
            opacity: 0;
          }
        }

        /* Smooth Hover & Touch Elevation (overriding scroll reveal defaults cleanly) */
        .category-card:hover,
        .category-card.is-revealed:hover {
          transform: translateY(-8px) scale(1.015) !important;
          box-shadow: 0 20px 48px -8px rgba(255, 111, 0, 0.32), 
                      0 0 0 2.5px #ff9100,
                      0 0 32px rgba(255, 183, 3, 0.22), 
                      0 4px 12px rgba(0, 0, 0, 0.06);
          border-color: #ff6f00;
        }

        .category-card:active,
        .category-card.is-revealed:active {
          transform: translateY(-3px) scale(0.995) !important;
          box-shadow: 0 10px 24px -6px rgba(255, 111, 0, 0.3), 0 0 0 2px #ff9100;
        }

        .cat-img-wrapper {
          position: relative;
          height: 205px;
          background: radial-gradient(circle at 50% 35%, #ffffff 0%, #f9fafb 70%, #f1f5f9 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        /* Ambient Glass Surface Sheen on the Image Area */
        .cat-img-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(255, 183, 3, 0.04) 100%
          );
          pointer-events: none;
          transition: background 0.4s ease, opacity 0.4s ease;
        }

        .category-card:hover .cat-img-wrapper::after {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(255, 215, 0, 0.15) 30%,
            rgba(255, 255, 255, 0) 70%
          );
        }

        .cat-img {
          max-width: 88%;
          max-height: 88%;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.07));
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), 
                      filter 0.5s ease;
        }

        .category-card:hover .cat-img {
          transform: scale(1.08) translateY(-3px);
          filter: drop-shadow(0 12px 22px rgba(255, 111, 0, 0.24));
        }

        .cat-badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          background: rgba(10, 19, 41, 0.82);
          color: #ffd166;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.28rem 0.75rem;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 183, 3, 0.35);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          letter-spacing: 0.4px;
          transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
          z-index: 6;
        }

        .category-card:hover .cat-badge {
          background: #ff6f00;
          color: #ffffff;
          border-color: #ffd166;
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(255, 111, 0, 0.4);
        }

        .cat-info {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          background: #ffffff;
        }

        .cat-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .cat-title-en {
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .cat-title-sep {
          color: #ff6f00;
        }

        .cat-title-ta {
          font-size: 1rem;
          color: #ea580c;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 600;
        }

        .cat-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          flex-grow: 1;
        }

        .cat-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.86rem;
          font-weight: 700;
          color: #ff6f00;
          background: rgba(255, 111, 0, 0.08);
          border: 1px solid rgba(255, 111, 0, 0.22);
          padding: 0.45rem 0.95rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: fit-content;
        }

        .category-card:hover .cat-btn {
          background: linear-gradient(135deg, #ff6f00 0%, #d90429 100%);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(255, 111, 0, 0.35);
          gap: 0.75rem;
          transform: translateX(3px);
        }

        /* 3. Bestsellers Horizontal Smooth Scroller */
        .slider-action-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .slider-nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .slider-nav-btn:hover {
          background: #ff6f00;
          color: #ffffff;
          border-color: #ff6f00;
          transform: scale(1.08);
        }

        .bestsellers-scroll-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .bestsellers-scroll-track {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0.75rem 0.5rem 1.75rem;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          -webkit-overflow-scrolling: touch;
        }

        .bestsellers-scroll-track::-webkit-scrollbar {
          height: 6px;
        }

        .bestsellers-scroll-track::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 999px;
        }

        .bestsellers-scroll-track::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .bestseller-slide-card {
          min-width: 275px;
          max-width: 275px;
          flex-shrink: 0;
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(255, 111, 0, 0.13), 0 1px 4px rgba(15, 23, 42, 0.06);
          border: 2px solid #ffa040;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .bestseller-slide-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(255, 111, 0, 0.22), 0 0 0 2.5px #ff6f00, 0 0 28px rgba(255, 183, 3, 0.18);
          border-color: #ff6f00;
        }

        .slide-card-media {
          position: relative;
          aspect-ratio: 1.15;
          background: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .slide-card-img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .bestseller-slide-card:hover .slide-card-img {
          transform: scale(1.08);
        }

        .slide-discount-tag {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: #d90429;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 8px rgba(217, 4, 41, 0.35);
        }

        .slide-star-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(10, 19, 41, 0.85);
          color: #ffd166;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 183, 3, 0.3);
          backdrop-filter: blur(4px);
        }

        .slide-card-details {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .slide-code-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .slide-sno-tag {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.72rem;
          font-weight: 800;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
        }

        .slide-code-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .slide-card-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.35rem;
          line-height: 1.3;
        }

        .slide-title-en {
          display: block;
        }

        .slide-title-ta {
          display: block;
          font-size: 0.85rem;
          color: #ea580c;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 600;
          margin-top: 0.15rem;
        }

        .slide-pack-tag {
          font-size: 0.75rem;
          color: #ff6f00;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .slide-short-desc {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.45;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .slide-price-block {
          display: flex;
          align-items: baseline;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }

        .slide-price-primary {
          font-size: 1.35rem;
          font-weight: 800;
          color: #d90429;
          font-family: var(--font-display);
        }

        .slide-price-strike {
          font-size: 0.85rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .slide-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.6rem 1rem;
          border-radius: var(--radius-md);
        }

        /* 4. Gift Boxes Showcase */
        .gift-boxes-section {
          background: #fffdfa;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }

        .gift-boxes-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .gift-box-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(255, 145, 0, 0.15), 0 1px 5px rgba(15, 23, 42, 0.06);
          border: 2px solid #ffb347;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gift-box-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(255, 111, 0, 0.22), 0 0 0 2.5px #ffb703, 0 0 28px rgba(255, 183, 3, 0.2);
          border-color: #ffb703;
        }

        .gift-card-media {
          position: relative;
          aspect-ratio: 1.15;
          background: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem;
          border-bottom: 1px solid #fed7aa;
        }

        .gift-card-img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .gift-box-card:hover .gift-card-img {
          transform: scale(1.06);
        }

        .gift-discount-pill {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: #d90429;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 8px rgba(217, 4, 41, 0.35);
        }

        .gift-festive-tag {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(10, 19, 41, 0.85);
          color: #ffd166;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 183, 3, 0.4);
          backdrop-filter: blur(4px);
        }

        .gift-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .gift-code-tag {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.72rem;
          font-weight: 800;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
          margin-bottom: 0.5rem;
        }

        .gift-card-name {
          margin-bottom: 0.35rem;
        }

        .gift-name-en {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          display: block;
          line-height: 1.25;
        }

        .gift-name-ta {
          font-size: 0.85rem;
          color: #ea580c;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 600;
          display: block;
          margin-top: 0.15rem;
        }

        .gift-pack-badge {
          font-size: 0.75rem;
          color: #ff6f00;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .gift-short-desc {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.45;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .gift-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px dashed #e2e8f0;
          gap: 0.5rem;
        }

        .gift-price-current {
          font-size: 1.35rem;
          font-weight: 900;
          color: #d90429;
          font-family: var(--font-display);
          line-height: 1;
        }

        .gift-price-mrp {
          font-size: 0.82rem;
          color: #94a3b8;
          text-decoration: line-through;
          margin-top: 0.15rem;
        }

        .gift-order-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          font-size: 0.82rem;
          border-radius: 8px;
          flex-shrink: 0;
        }

        /* 5. Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.75rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 2rem 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #ffb703;
          transform: translateY(-4px);
        }

        .feature-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(255, 183, 3, 0.1);
          border: 1px solid rgba(255, 183, 3, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .feature-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.65rem;
        }

        .feature-text {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        /* 6. Promo Section */
        .promo-section {
          background: #fdfbf7;
        }

        .promo-banner-card {
          background: linear-gradient(135deg, #0a1329 0%, #112044 100%);
          border: 2px solid rgba(255, 183, 3, 0.3);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          box-shadow: 0 15px 35px rgba(5, 10, 24, 0.2);
        }

        .promo-content {
          padding: 3.5rem;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .promo-badge {
          margin-bottom: 1rem;
          align-self: flex-start;
        }

        .promo-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .promo-text {
          font-size: 1.05rem;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }

        .promo-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .promo-feature-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffd166;
        }

        .promo-visual {
          height: 100%;
          min-height: 320px;
          background: #050a18;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .promo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .promo-banner-card:hover .promo-img {
          transform: scale(1.05);
        }

        @media (max-width: 1200px) {
          .gift-boxes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .hero-main-title {
            font-size: 2.6rem;
          }
          .promo-banner-card {
            grid-template-columns: 1fr;
          }
          .promo-content {
            padding: 2.5rem 1.5rem;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          .category-card,
          .category-card:nth-child(13),
          .category-card:nth-child(14) {
            grid-column: auto !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 4.5rem 0 3.5rem;
            min-height: 70vh;
            display: flex;
            align-items: center;
          }
          .hero-main-title {
            font-size: 2.15rem;
            line-height: 1.18;
          }
          .hero-description {
            font-size: 0.96rem;
            margin-bottom: 1.5rem;
          }
          .section-title {
            font-size: 1.75rem;
          }
          .hero-cta-group {
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
          }
          .hero-btn-primary, .hero-btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-feature-pills {
            gap: 0.5rem;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          .category-card,
          .category-card:nth-child(13),
          .category-card:nth-child(14) {
            grid-column: auto !important;
          }
          .category-card:active {
            transform: scale(0.985) !important;
            box-shadow: 0 10px 24px rgba(255, 111, 0, 0.28), 0 0 0 2px #ff9100 !important;
            border-color: #ff6f00 !important;
          }
          .category-card:active::before {
            animation: cardReflectionSweep 0.75s ease-out forwards;
          }
          .gift-boxes-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .gift-card-body {
            padding: 1rem;
          }
          .gift-name-en {
            font-size: 0.95rem;
          }
          .bestseller-slide-card {
            min-width: 235px;
            max-width: 235px;
            border: 2px solid #ffa040;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .section-header-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .slider-action-controls {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 520px) {
          .categories-grid {
            grid-template-columns: 1fr;
            gap: 1.15rem;
          }
          .gift-boxes-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .gift-card-media {
            aspect-ratio: 1.2;
          }
          .gift-price-row {
            flex-direction: row;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};
