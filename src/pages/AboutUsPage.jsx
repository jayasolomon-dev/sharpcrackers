// ==========================================================================
// SHARP CRACKERS - ABOUT US PAGE COMPONENT
// Spacious, elegant layout: Sivakasi heritage, green pyrotechnics, safety standards
// ==========================================================================

import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Package,
  PhoneCall,
  Clock,
  Star,
  MapPin,
  Flame,
  Truck
} from 'lucide-react';

export const AboutUsPage = ({ setCurrentPage }) => {
  const { settings } = useCart();

  const handleExploreClick = () => {
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactClick = () => {
    setCurrentPage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-backdrop" />
        <div className="about-hero-overlay" />
        <div className="about-container text-center about-hero-content">
          <div className="about-pill">
            <Sparkles size={14} className="text-gold" />
            <span>HERITAGE OF SIVAKASI • TRADITION OF EXCELLENCE</span>
          </div>
          <h1 className="about-hero-title">
            About <span className="highlight-hero-brand">{settings.shopName || "SHARP CRACKERS"}</span>
          </h1>
          <p className="about-hero-lead">
            Sivakasi's trusted direct fireworks showroom. Bringing the sparkle, safety, and grand tradition of Diwali right to your celebration with certified green crackers and honest direct pricing.
          </p>
        </div>
      </section>

      {/* 2. Main Story & Foundation Section */}
      <section className="section-padding bg-cream">
        <div className="about-container">
          <div className="about-story-grid">
            {/* Story Content Left */}
            <div className="story-content-col">
              <div className="section-subtitle-badge">
                <Flame size={14} className="text-orange" />
                <span>OUR FOUNDATION</span>
              </div>
              <h2 className="story-main-heading">
                Authentic Sivakasi Pyrotechnics, Direct to Celebrations
              </h2>
              
              <p className="story-lead-p">
                Born in the fireworks capital of India — Sivakasi, <strong>SHARP CRACKERS</strong> was established with a clear mission: to eliminate unnecessary middlemen markups and supply certified, genuine green crackers directly to families, communities, and celebration events nationwide.
              </p>

              <p className="story-body-p">
                Every single item in our catalog is sourced directly from licensed, high-standard manufacturers in Sivakasi who rigorously follow PESO (Petroleum and Explosives Safety Organisation) regulations and Supreme Court certified chemical compositions.
              </p>

              {/* Feature Highlights Cards */}
              <div className="story-highlights-list">
                <div className="story-feature-card">
                  <div className="feature-icon-circle bg-emerald-light">
                    <CheckCircle2 size={20} className="text-emerald" />
                  </div>
                  <div className="feature-text-block">
                    <div className="feature-item-title">Direct Sivakasi Factory-Floor Pricing</div>
                    <div className="feature-item-desc">Enjoy up to 75% savings compared to standard retail market markups.</div>
                  </div>
                </div>

                <div className="story-feature-card">
                  <div className="feature-icon-circle bg-gold-light">
                    <ShieldCheck size={20} className="text-gold-dark" />
                  </div>
                  <div className="feature-text-block">
                    <div className="feature-item-title">100% CSIR-NEERI Certified Green Formulations</div>
                    <div className="feature-item-desc">Clean chemical composition, barium-free, producing 30% lower particulate emissions.</div>
                  </div>
                </div>

                <div className="story-feature-card">
                  <div className="feature-icon-circle bg-orange-light">
                    <Package size={20} className="text-orange" />
                  </div>
                  <div className="feature-text-block">
                    <div className="feature-item-title">Safe All-Weather Corrugated Packaging</div>
                    <div className="feature-item-desc">Specialized shock-absorbent packing tailored for safe pan-India parcel dispatch.</div>
                  </div>
                </div>
              </div>

              {/* 4 Quick Stat Counters */}
              <div className="about-stats-grid">
                <div className="stat-pill-box">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Certified Green</div>
                </div>
                <div className="stat-pill-box">
                  <div className="stat-number">75%</div>
                  <div className="stat-label">Factory Savings</div>
                </div>
                <div className="stat-pill-box">
                  <div className="stat-number">25+</div>
                  <div className="stat-label">Firework Varieties</div>
                </div>
                <div className="stat-pill-box">
                  <div className="stat-number">Fast</div>
                  <div className="stat-label">Express Delivery</div>
                </div>
              </div>
            </div>

            {/* Visual Showcase Right - Official Company Profile & Brand Logo */}
            <div className="story-visual-col">
              <div className="story-visual-card">
                <div className="visual-media-wrapper brand-showcase-media">
                  <div className="brand-logo-spotlight">
                    <img 
                      src={settings.logoUrl || "/images/sharp_crackers_brand_logo.jpg"} 
                      alt="SHARP CRACKERS Official Brand Logo" 
                      className="story-brand-logo-img"
                      onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_brand_logo.jpg'; }}
                    />
                  </div>
                  <div className="visual-floating-badge">
                    <Award size={16} className="text-gold" />
                    <span>Official Sivakasi Brand</span>
                  </div>
                </div>
                <div className="visual-caption-bar">
                  <div className="caption-title">SHARP CRACKERS</div>
                  <div className="caption-tagline">Direct Sivakasi Fireworks Showroom & Wholesale Depot</div>
                  <div className="caption-sub">
                    Direct factory fireworks enterprise originating from Sivakasi, Tamil Nadu. Committed to 100% legal green crackers, uncompromised safety standards, and factory-direct savings across Tamil Nadu & Pan-India.
                  </div>
                  <div className="caption-trust-pills">
                    <span className="caption-trust-pill">
                      <ShieldCheck size={14} className="text-emerald" />
                      <span>100% Green Certified</span>
                    </span>
                    <span className="caption-trust-pill">
                      <Award size={14} className="text-gold" />
                      <span>Factory Direct Prices</span>
                    </span>
                    <span className="caption-trust-pill">
                      <Truck size={14} className="text-orange" />
                      <span>Safe Pan-India Transport</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Microcard */}
              <div className="story-quick-contact">
                <div className="qc-icon">
                  <MapPin size={22} className="text-orange" />
                </div>
                <div className="qc-details">
                  <div className="qc-title">Located at Coimbatore, Tamil Nadu</div>
                  <div className="qc-desc">{settings.address || "89, Sivasakthy Layout, Selvam Mahal (opposite), Chettipalayam Road, Echanari, Coimbatore - 641 021"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Four Core Pillars */}
      <section className="section-padding bg-white">
        <div className="about-container">
          <div className="section-header text-center">
            <div className="section-subtitle-badge">
              <Sparkles size={14} className="text-gold" />
              <span>OUR 4 CORNERSTONES</span>
            </div>
            <h2 className="section-title">The Four Pillars of SHARP CRACKERS</h2>
            <p className="section-desc">
              We pledge transparency, supreme quality, safety, and dedicated customer assistance for every celebration.
            </p>
          </div>

          <div className="pillars-grid">
            {/* Pillar 1 */}
            <div className="pillar-card">
              <div className="pillar-header-row">
                <div className="pillar-icon-box bg-emerald-light">
                  <ShieldCheck size={28} className="text-emerald" />
                </div>
                <span className="pillar-index">01</span>
              </div>
              <h3 className="pillar-name">Our Commitment</h3>
              <div className="pillar-tamil-title">Safety & Certified Quality</div>
              <p className="pillar-text">
                Safety and statutory compliance always come first. We strictly supply legitimate green crackers that drastically lower particulate emissions while delivering brilliant colors, longer sparkler duration, and joyful sound.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="pillar-card">
              <div className="pillar-header-row">
                <div className="pillar-icon-box bg-gold-light">
                  <Sparkles size={28} className="text-gold-dark" />
                </div>
                <span className="pillar-index">02</span>
              </div>
              <h3 className="pillar-name">Our Product Range</h3>
              <div className="pillar-tamil-title">Grand Fireworks Selection</div>
              <p className="pillar-text">
                From child-friendly matchless snappers and electric sparklers to majestic 60-shot sky bursts, dazzling fountains, and festive gift boxes, our catalog provides curated pyrotechnics for every budget and occasion.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="pillar-card">
              <div className="pillar-header-row">
                <div className="pillar-icon-box bg-orange-light">
                  <Users size={28} className="text-orange" />
                </div>
                <span className="pillar-index">03</span>
              </div>
              <h3 className="pillar-name">Customer Service</h3>
              <div className="pillar-tamil-title">Dedicated Customer Care</div>
              <p className="pillar-text">
                We treat every customer order with urgency and personal care. Our Sivakasi team provides responsive phone and direct showroom support, tracking confirmations, and customized secure packing.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="pillar-card">
              <div className="pillar-header-row">
                <div className="pillar-icon-box bg-red-light">
                  <Award size={28} className="text-red" />
                </div>
                <span className="pillar-index">04</span>
              </div>
              <h3 className="pillar-name">Pricing Integrity</h3>
              <div className="pillar-tamil-title">Honest Direct Pricing</div>
              <p className="pillar-text">
                No artificial inflated markups. Our transparent catalog displays exact unit rates, volume discounts, and automated calculation so you always know exactly what you are paying for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Safety & Standards Strip */}
      <section className="section-padding bg-cream">
        <div className="about-container">
          <div className="safety-strip-box">
            <div className="safety-strip-header text-center">
              <div className="section-subtitle-badge">
                <ShieldCheck size={14} className="text-emerald" />
                <span>SAFETY & STATUTORY ASSURANCE</span>
              </div>
              <h2 className="safety-heading">How We Ensure 100% Safe Celebrations</h2>
              <p className="safety-sub">
                Our strict multi-stage inspection guarantees that every box of crackers leaving our Sivakasi showroom meets the highest Indian safety benchmarks.
              </p>
            </div>

            <div className="safety-steps-grid">
              <div className="safety-step-card">
                <div className="step-badge">Phase 1</div>
                <h4 className="step-title">CSIR-NEERI Green Certification</h4>
                <p className="step-desc">All pyrotechnic formulas avoid prohibited chemicals (Barium, Lead, Chromium) and feature genuine QR verifiable tags.</p>
              </div>

              <div className="safety-step-card">
                <div className="step-badge">Phase 2</div>
                <h4 className="step-title">PESO Licensed Handling</h4>
                <p className="step-desc">Storage and packing adhere strictly to licensed magazine safety codes with constant humidity and spark-free isolation.</p>
              </div>

              <div className="safety-step-card">
                <div className="step-badge">Phase 3</div>
                <h4 className="step-title">Shockproof Transit Packaging</h4>
                <p className="step-desc">Double-corrugated boxes with interior cushion spacers to ensure 100% zero transit friction or breakage during travel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="about-cta-section text-center">
        <div className="about-container">
          <div className="cta-content-wrap">
            <div className="cta-festive-icon">
              <Sparkles size={36} className="text-gold" />
            </div>
            <h2 className="cta-heading text-white">Experience the Magic of Sivakasi Fireworks</h2>
            <p className="cta-sub text-muted-light">
              Prepare for your Diwali, wedding, or temple festival celebration with ease. Browse our live products catalog today.
            </p>
            <div className="cta-buttons-group">
              <button onClick={handleExploreClick} className="btn btn-primary btn-lg">
                <span>Explore Products Catalog</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={handleContactClick} className="btn btn-outline-light btn-lg">
                <PhoneCall size={18} />
                <span>Contact Showroom Team</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-page-wrapper {
          width: 100%;
          overflow-x: hidden;
        }

        .about-container {
          width: 100%;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(1.25rem, 3.5vw, 3.5rem);
          padding-right: clamp(1.25rem, 3.5vw, 3.5rem);
          box-sizing: border-box;
        }

        /* Hero */
        .about-hero {
          position: relative;
          color: #ffffff;
          padding: 5.5rem 0 5rem;
          border-bottom: 3px solid #ff6f00;
          overflow: hidden;
        }

        .about-hero-backdrop {
          position: absolute;
          inset: 0;
          background-image: url('/images/about_hero_bg.jpg?v=3');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: 1;
        }

        .about-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(5, 10, 24, 0.90) 0%,
            rgba(10, 19, 41, 0.82) 50%,
            rgba(21, 37, 77, 0.78) 100%
          );
          z-index: 2;
        }

        .about-hero-content {
          position: relative;
          z-index: 3;
        }

        .about-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          height: 3px;
          background: #ffb703;
          box-shadow: 0 0 15px #ffb703;
          z-index: 4;
        }

        .about-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ffd166;
          background: rgba(255, 183, 3, 0.12);
          border: 1px solid rgba(255, 183, 3, 0.35);
          padding: 0.4rem 1.1rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.25rem;
          backdrop-filter: blur(8px);
        }

        .about-hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.5rem);
          font-weight: 900;
          margin-bottom: 1.25rem;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .highlight-hero-brand {
          background: linear-gradient(135deg, #ffb703 0%, #ff6f00 60%, #d90429 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-hero-lead {
          font-size: clamp(1rem, 1.8vw, 1.18rem);
          color: #cbd5e1;
          max-width: 820px;
          margin: 0 auto;
          line-height: 1.75;
          font-weight: 400;
        }

        /* Section Subtitle Badge */
        .section-subtitle-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #ff6f00;
          text-transform: uppercase;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.9rem;
        }

        /* Story Grid */
        .about-story-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-main-heading {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 1.25rem;
          line-height: 1.25;
        }

        .story-lead-p {
          font-size: 1.05rem;
          color: #334155;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .story-body-p {
          font-size: 0.98rem;
          color: #64748b;
          line-height: 1.75;
          margin-bottom: 2rem;
        }

        /* Story Feature Cards List */
        .story-highlights-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          margin-bottom: 2.25rem;
        }

        .story-feature-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: #ffffff;
          padding: 1.1rem 1.35rem;
          border-radius: var(--radius-md);
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
        }

        .story-feature-card:hover {
          border-color: #ffb703;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 111, 0, 0.08);
        }

        .feature-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-item-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .feature-item-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
        }

        /* Stats Grid */
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-pill-box {
          background: #ffffff;
          border: 1.5px solid #fed7aa;
          padding: 1rem 0.75rem;
          border-radius: var(--radius-md);
          text-align: center;
          box-shadow: 0 2px 6px rgba(255, 111, 0, 0.05);
          transition: all 0.2s ease;
        }

        .stat-pill-box:hover {
          border-color: #ff6f00;
          background: #fff7ed;
          transform: translateY(-2px);
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 900;
          color: #ea580c;
          line-height: 1.1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Visual Column */
        .story-visual-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .story-visual-card {
          background: #ffffff;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .brand-showcase-media {
          position: relative;
          min-height: 340px;
          background: radial-gradient(circle at center, #112044 0%, #0a1329 65%, #050a18 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          overflow: hidden;
          border-bottom: 2px solid rgba(255, 183, 3, 0.25);
        }

        .brand-showcase-media::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255, 183, 3, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-logo-spotlight {
          position: relative;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background: #ffffff;
          padding: 8px;
          box-shadow: 0 0 35px rgba(255, 183, 3, 0.45), 0 12px 30px rgba(0, 0, 0, 0.4);
          border: 3.5px solid #ffb703;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }

        .story-visual-card:hover .brand-logo-spotlight {
          transform: scale(1.06);
          box-shadow: 0 0 50px rgba(255, 183, 3, 0.65), 0 16px 36px rgba(0, 0, 0, 0.45);
        }

        .story-brand-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .visual-floating-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(10, 19, 41, 0.88);
          color: #ffd166;
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 183, 3, 0.35);
          display: flex;
          align-items: center;
          gap: 0.45rem;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          z-index: 3;
        }

        .visual-caption-bar {
          padding: 1.75rem;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }

        .caption-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.25rem;
          letter-spacing: -0.2px;
        }

        .caption-tagline {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ff6f00;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .caption-sub {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
        }

        .caption-trust-pills {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
          margin-top: 1.15rem;
          padding-top: 1rem;
          border-top: 1px dashed #e2e8f0;
        }

        .caption-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          font-weight: 700;
          color: #1e293b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.32rem 0.7rem;
          border-radius: var(--radius-full);
        }

        .story-quick-contact {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffffff;
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .qc-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #fff7ed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qc-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }

        .qc-desc {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* Pillars Grid */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
          margin-top: 2rem;
        }

        .pillar-card {
          background: #ffffff;
          padding: 2.25rem 1.85rem;
          border-radius: var(--radius-lg);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .pillar-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6f00, #ffb703);
          opacity: 0.8;
          transition: height 0.3s ease;
        }

        .pillar-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(255, 111, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: #ffedd5;
        }

        .pillar-card:hover::before {
          height: 6px;
        }

        .pillar-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .pillar-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .pillar-index {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 900;
          color: #e2e8f0;
          letter-spacing: 1px;
        }

        .pillar-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .pillar-tamil-title {
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: #ea580c;
          margin-bottom: 1rem;
        }

        .pillar-text {
          font-size: 0.92rem;
          color: #64748b;
          line-height: 1.7;
          margin-top: auto;
        }

        /* Safety Strip Box */
        .safety-strip-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-xl);
          padding: 3.5rem 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }

        .safety-heading {
          font-size: clamp(1.8rem, 2.8vw, 2.3rem);
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.65rem;
        }

        .safety-sub {
          font-size: 1rem;
          color: #64748b;
          max-width: 680px;
          margin: 0 auto 3rem;
          line-height: 1.65;
        }

        .safety-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .safety-step-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 2rem 1.65rem;
          border-radius: var(--radius-lg);
          transition: all 0.25s ease;
        }

        .safety-step-card:hover {
          background: #ffffff;
          border-color: #10b981;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.1);
        }

        .step-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #059669;
          background: #ecfdf5;
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .step-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.65rem;
        }

        .step-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Call To Action Section */
        .about-cta-section {
          background: linear-gradient(135deg, #050a18 0%, #0a1329 50%, #15254d 100%);
          padding: 5rem 0;
          color: #ffffff;
          border-top: 3px solid #ff6f00;
        }

        .cta-content-wrap {
          max-width: 760px;
          margin: 0 auto;
        }

        .cta-festive-icon {
          font-size: 2.8rem;
          margin-bottom: 1rem;
        }

        .cta-heading {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 900;
          margin-bottom: 0.75rem;
          letter-spacing: -0.5px;
        }

        .cta-sub {
          font-size: 1.1rem;
          margin-bottom: 2.25rem;
          line-height: 1.65;
        }

        .cta-buttons-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        /* Color Utilities */
        .bg-emerald-light { background: #ecfdf5; }
        .bg-gold-light { background: #fffbeb; }
        .bg-orange-light { background: #fff7ed; }
        .bg-red-light { background: #fef2f2; }
        .text-emerald { color: #10b981; }
        .text-gold-dark { color: #b45309; }
        .text-orange { color: #ff6f00; }
        .text-red { color: #d90429; }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .pillars-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          .about-story-grid {
            gap: 2.5rem;
          }
        }

        @media (max-width: 992px) {
          .about-story-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .safety-steps-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .safety-strip-box {
            padding: 2.5rem 1.5rem;
          }
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .about-hero {
            padding: 3.5rem 0 3rem;
          }
          .brand-showcase-media {
            min-height: 250px;
            padding: 1.5rem 1rem;
          }
          .brand-logo-spotlight {
            width: 145px;
            height: 145px;
            padding: 6px;
          }
          .caption-title {
            font-size: 1.18rem;
          }
          .visual-caption-bar {
            padding: 1.25rem;
          }
          .pillars-grid {
            grid-template-columns: 1fr;
          }
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
          }
          .cta-buttons-group {
            flex-direction: column;
            width: 100%;
          }
          .cta-buttons-group .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
