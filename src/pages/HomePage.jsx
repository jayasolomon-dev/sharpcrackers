// ==========================================================================
// SHARP CRACKERS - HOMEPAGE COMPONENT
// Festive hero banner, categories, bestsellers, value propositions, and promos
// ==========================================================================

import React from 'react';
import { useCart } from '../context/CartContext';
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
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';

export const HomePage = ({ setCurrentPage, setSelectedCategory }) => {
  const { products, settings, getItemQuantity, updateQuantity } = useCart();

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

  // Curated Featured Categories with Bilingual Names
  const featuredCategories = [
    { id: 'sparklers', name: 'Sparklers', ta: 'கம்பி மத்தாப்பு', count: '4 Varieties', desc: 'Electric, Golden & Multi-color rods', image: '/images/product_sparkler_1791567639029.jpg' },
    { id: 'flower-pots', name: 'Flower Pots', ta: 'பூந்தொட்டி', count: '3 Varieties', desc: 'Dense golden sparks & Asoka towers', image: '/images/product_flowerpots.jpg' },
    { id: 'ground-chakkars', name: 'Ground Chakkars', ta: 'தரை சக்கரம்', count: '3 Varieties', desc: 'High-speed spinning wheels & spinners', image: '/images/product_chakkars.jpg' },
    { id: 'rockets', name: 'Rockets & Aerial', ta: 'வான வெடி & ராக்கெட்', count: '3 Varieties', desc: 'Whistling sky rockets with parachute drops', image: '/images/product_rockets.jpg' },
    { id: 'fancy-crackers', name: 'Fancy Fountains', ta: 'ஃபேசி வெடிகள்', count: '4 Varieties', desc: 'Multi-shot repeaters & dancing peacock', image: '/images/product_fountain_1791567652291.jpg' },
    { id: 'gift-boxes', name: 'Diwali Gift Boxes', ta: 'தீபாவளி கிப்ட் பாக்ஸ்', count: '3 Packs', desc: 'Complete family celebration hampers', image: '/images/product_giftpack_1791567665442.jpg' },
  ];

  // Best-selling products
  const bestSellers = products.filter(p => p.isBestseller).slice(0, 4);

  return (
    <div className="homepage-wrapper">
      {/* 1. HERO BANNER SECTION */}
      <section className="hero-section">
        <div className="hero-backdrop" style={{ backgroundImage: `url(${settings.heroBannerUrl || '/images/hero_banner_1791567625102.jpg'})` }}>
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-header-stack">
              <div className="hero-brand-block">
                <div className="hero-brand-logo-frame">
                  <img 
                    src={settings.logoUrl || "/images/sharp_crackers_logo_final.png"} 
                    alt="Sharp Crackers Official Logo" 
                    className="hero-brand-logo-img" 
                    loading="eager"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                  />
                </div>
                <div className="hero-brand-text-wrap">
                  <div className="hero-brand-callout">SHARP CRACKERS</div>
                  <div className="hero-brand-subline">DIRECT SIVAKASI FIREWORKS</div>
                </div>
              </div>

              <div className="hero-pill-badge">
                <Sparkles size={15} className="text-gold" />
                <span>Direct From Sivakasi • Best Price Guarantee</span>
              </div>
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

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section id="featured-categories" className="section-padding bg-cream">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-subtitle">EXPLORE BY CATEGORY</div>
            <h2 className="section-title">Popular Cracker Collections</h2>
            <p className="section-desc">
              Browse our diverse collection of sparkling firecrackers designed for festive safety, vivid illumination, and joyous festivities.
            </p>
          </div>

          <div className="categories-grid">
            {featuredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="category-card"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="cat-img-wrapper">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="cat-img" 
                    loading="eager"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                  />
                  <span className="cat-badge">{cat.count}</span>
                </div>
                <div className="cat-info">
                  <h3 className="cat-title">
                    <span className="cat-title-en">{cat.name}</span>
                    {cat.ta && (
                      <>
                        <span className="cat-title-sep"> / </span>
                        <span className="cat-title-ta">{cat.ta}</span>
                      </>
                    )}
                  </h3>
                  <p className="cat-desc">{cat.desc}</p>
                  <button className="cat-btn" type="button">
                    <span>View Products</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BEST-SELLING PRODUCTS SECTION */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <div className="section-subtitle">FAVORITES OF THE SEASON</div>
              <h2 className="section-title">Best-Selling Fireworks</h2>
              <p className="section-desc">Hand-picked by thousands of happy families across India.</p>
            </div>
            <button onClick={handleExploreClick} className="btn btn-outline-dark">
              <span>View Full Catalog</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="bestsellers-grid">
            {bestSellers.map((product) => {
              const discount = Math.round(((product.mrp - product.unitPrice) / product.mrp) * 100);
              const qty = getItemQuantity(product.id);

              return (
                <div 
                  key={product.id} 
                  className={`product-showcase-card clickable-bestseller-card ${qty > 0 ? 'card-has-items' : ''}`}
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
                  <div className="product-card-media">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-card-img" 
                      loading="eager"
                      decoding="async"
                      onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                    />
                    <span className="discount-tag">{discount}% OFF</span>
                    <div className="bestseller-star-badge">
                      <Star size={12} fill="#ffb703" color="#ffb703" />
                      <span>Best Seller</span>
                    </div>
                  </div>

                  <div className="product-card-details">
                    <div className="product-code-row">
                      <span className="product-sno-tag">#{product.sno ? String(parseInt(product.sno, 10)).padStart(3, '0') : '001'}</span>
                      <span className="product-code-label">{product.code}</span>
                    </div>
                    <h3 className="product-card-title">
                      <span className="prod-title-en">{product.name}</span>
                    </h3>
                    <div className="product-pack-tag">{product.packDetails}</div>
                    <p className="product-short-desc">{product.description}</p>

                    <div className="product-price-block">
                      <div className="price-primary">₹{product.unitPrice}</div>
                      <div className="price-strike">₹{product.mrp}</div>
                    </div>

                    <div className="product-card-action">
                      {qty === 0 ? (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, 1);
                          }}
                          className="btn btn-primary btn-block add-bestseller-btn"
                        >
                          <Plus size={16} />
                          <span>Add to Order</span>
                        </button>
                      ) : (
                        <div className="bestseller-stepper-control" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            className="bestseller-stepper-btn minus"
                            title="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="bestseller-stepper-val">{qty} in Order</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            className="bestseller-stepper-btn plus"
                            title="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE SHARP CRACKERS */}
      <section className="section-padding bg-navy text-white">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-subtitle text-gold">TRUSTED SIVAKASI TRADITION</div>
            <h2 className="section-title text-white">Why Choose SHARP CRACKERS?</h2>
            <p className="section-desc text-muted-light">
              We make fireworks shopping simple, transparent, and completely worry-free for families and celebration events alike.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Package size={28} className="text-orange" />
              </div>
              <h3 className="feature-title">Wide Variety of Products</h3>
              <p className="feature-text">
                Over 100+ items spanning classic sparklers, soaring rockets, dancing fountains, high-burst repeaters, and curated family gift boxes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <CheckCircle2 size={28} className="text-emerald" />
              </div>
              <h3 className="feature-title">Easy Product Selection</h3>
              <p className="feature-text">
                Browse our one-stop order catalog table. Add quantities with single-click plus/minus controls without navigating back and forth.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Tag size={28} className="text-gold" />
              </div>
              <h3 className="feature-title">Transparent Pricing</h3>
              <p className="feature-text">
                Honest factory rates direct from Sivakasi with clear pack details, no hidden surcharges, and real-time order total calculations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Award size={28} className="text-orange" />
              </div>
              <h3 className="feature-title">Instant PDF & Order Sheets</h3>
              <p className="feature-text">
                Generate computer invoices instantly, print paper order sheets, and forward orders directly to our Sivakasi desk with 1-click WhatsApp.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={28} className="text-gold" />
              </div>
              <h3 className="feature-title">Customer-Friendly Service</h3>
              <p className="feature-text">
                Dedicated direct phone assistance, festive guidance, and transparent fulfillment updates ensure your festive deliveries arrive intact and on schedule.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Sparkles size={28} className="text-emerald" />
              </div>
              <h3 className="feature-title">100% Legal Green Crackers</h3>
              <p className="feature-text">
                CSIR-NEERI and PESO compliant fireworks formulated without harmful barium compounds, generating 30% lower smoke and crisp celebrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FESTIVE PROMOTIONAL BANNER */}
      <section className="section-padding promo-section">
        <div className="container">
          <div className="promo-banner-card">
            <div className="promo-content">
              <span className="badge badge-festive promo-badge">FESTIVAL SPECIAL</span>
              <h2 className="promo-title">Plan Your Festival Early & Save Big!</h2>
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
                src="/images/product_giftpack_1791567665442.jpg" 
                alt="Sharp Crackers Gift Pack" 
                className="promo-img"
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
          color: #ffffff;
          overflow: hidden;
        }

        .hero-backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg, 
            rgba(5, 10, 24, 0.98) 0%, 
            rgba(10, 19, 41, 0.92) 55%, 
            rgba(5, 10, 24, 0.82) 100%
          );
          backdrop-filter: blur(2px);
        }

        .hero-container {
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 680px;
        }

        .hero-header-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
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
          margin-bottom: 0;
          backdrop-filter: blur(8px);
        }

        .hero-brand-block {
          display: inline-flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 0;
          background: rgba(10, 19, 41, 0.75);
          padding: 0.6rem 1.4rem 0.6rem 0.6rem;
          border-radius: 20px;
          border: 1.5px solid rgba(255, 183, 3, 0.45);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 111, 0, 0.25);
          backdrop-filter: blur(10px);
        }

        .hero-brand-logo-frame {
          width: 90px;
          height: 90px;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffb703;
          box-shadow: 0 4px 18px rgba(255, 183, 3, 0.5);
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .hero-brand-block:hover .hero-brand-logo-frame {
          transform: scale(1.06) rotate(2deg);
        }

        .hero-brand-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-brand-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .hero-brand-callout {
          font-family: var(--font-display);
          font-size: 1.65rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: #ff6f00;
          line-height: 1.1;
          margin-bottom: 0;
        }

        .hero-brand-subline {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ffb703;
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
          margin-bottom: 3rem;
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
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
        }

        .category-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(255, 111, 0, 0.15);
          border-color: #ffb703;
        }

        .cat-img-wrapper {
          position: relative;
          height: 190px;
          overflow: hidden;
          background: #0a1329;
        }

        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .category-card:hover .cat-img {
          transform: scale(1.08);
        }

        .cat-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(5, 10, 24, 0.85);
          color: #ffd166;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 183, 3, 0.4);
          backdrop-filter: blur(4px);
        }

        .cat-info {
          padding: 1.4rem;
        }

        .cat-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .cat-title-en {
          font-weight: 800;
          color: #0f172a;
        }

        .cat-title-sep {
          color: #ff6f00;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .cat-title-ta {
          font-size: 0.92rem;
          color: #64748b;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 600;
        }

        .cat-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1.1rem;
          line-height: 1.5;
        }

        .cat-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #ff6f00;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .category-card:hover .cat-btn {
          color: #d90429;
          gap: 0.6rem;
        }

        /* Bestsellers Grid */
        .bestsellers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 2rem;
        }

        .product-showcase-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .product-showcase-card:hover {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .product-card-media {
          position: relative;
          height: 200px;
          background: #0a1329;
          overflow: hidden;
        }

        .product-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .product-showcase-card:hover .product-card-img {
          transform: scale(1.05);
        }

        .discount-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #d90429;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
        }

        .bestseller-star-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(10, 19, 41, 0.9);
          color: #ffd166;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 183, 3, 0.3);
        }

        .product-card-details {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .product-code-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }

        .product-sno-tag {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.75rem;
          font-weight: 800;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .product-code-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .product-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
          line-height: 1.35;
        }

        .prod-title-en {
          font-weight: 700;
          color: #0f172a;
        }

        .prod-title-sep {
          color: #ff6f00;
          font-weight: 700;
        }

        .prod-title-ta {
          font-size: 0.92rem;
          color: #ea580c;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 600;
        }

        .product-pack-tag {
          font-size: 0.8rem;
          color: #ff6f00;
          font-weight: 600;
          margin-bottom: 0.6rem;
        }

        .product-short-desc {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.2rem;
          flex-grow: 1;
        }

        .product-price-block {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .price-primary {
          font-size: 1.45rem;
          font-weight: 800;
          color: #d90429;
          font-family: var(--font-display);
        }

        .price-strike {
          font-size: 0.95rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .product-card-action {
          margin-top: auto;
        }

        .btn-block {
          width: 100%;
        }

        .clickable-bestseller-card {
          cursor: pointer;
        }

        .clickable-bestseller-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(255, 111, 0, 0.12), 0 4px 14px rgba(0, 0, 0, 0.08);
          border-color: #ff6f00;
        }

        .card-has-items {
          border-color: #ff6f00 !important;
          box-shadow: 0 8px 24px rgba(255, 111, 0, 0.18) !important;
        }

        .add-bestseller-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
          color: #ffffff;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.92rem;
          box-shadow: 0 4px 12px rgba(255, 111, 0, 0.25);
          transition: all 0.2s ease;
          width: 100%;
        }

        .add-bestseller-btn:hover {
          background: linear-gradient(135deg, #ff8500 0%, #ff6f00 100%);
          box-shadow: 0 6px 18px rgba(255, 111, 0, 0.4);
          transform: translateY(-1px);
        }

        .bestseller-stepper-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff7ed;
          border: 1.5px solid #ffb703;
          border-radius: var(--radius-md);
          padding: 0.35rem 0.65rem;
          box-shadow: 0 2px 8px rgba(255, 111, 0, 0.15);
          width: 100%;
          box-sizing: border-box;
        }

        .bestseller-stepper-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bestseller-stepper-btn.minus {
          background: #ffffff;
          color: #d90429;
          border: 1px solid #fecaca;
        }

        .bestseller-stepper-btn.plus {
          background: #ff6f00;
          color: #ffffff;
        }

        .bestseller-stepper-btn:hover {
          transform: scale(1.08);
        }

        .bestseller-stepper-val {
          font-weight: 800;
          font-size: 0.88rem;
          color: #c2410c;
        }

        /* Why Choose Us Features */
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

        /* Promo Section */
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
        }

        .promo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-header-stack {
            align-items: flex-start;
            gap: 0.65rem;
            margin-bottom: 1rem;
          }
          .hero-brand-block {
            gap: 0.85rem;
            padding: 0.5rem 1rem 0.5rem 0.5rem;
            margin-bottom: 0;
          }
          .hero-brand-logo-frame {
            width: 65px;
            height: 65px;
            border-radius: 12px;
          }
          .hero-brand-callout {
            font-size: 1.25rem;
            letter-spacing: 1px;
          }
          .hero-brand-subline {
            font-size: 0.62rem;
          }
          .hero-section {
            padding: 3rem 0;
            min-height: auto;
          }
          .hero-main-title {
            font-size: 2.1rem;
            line-height: 1.2;
          }
          .section-title {
            font-size: 1.75rem;
          }
          .hero-cta-group {
            flex-direction: column;
            gap: 0.75rem;
          }
          .hero-btn-primary, .hero-btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-feature-pills {
            gap: 0.5rem;
          }
          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.25rem;
          }
          .bestsellers-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.25rem;
          }
          .section-header-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        @media (max-width: 540px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }
          .bestsellers-grid {
            grid-template-columns: 1fr;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .hero-main-title {
            font-size: 1.85rem;
          }
          .hero-description {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};
