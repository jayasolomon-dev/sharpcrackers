// ==========================================================================
// SHARP CRACKERS - CONTACT US PAGE COMPONENT
// Modern direct contact & enquiry layout with showroom details
// ==========================================================================

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  ArrowRight
} from 'lucide-react';

export const ContactUsPage = () => {
  const { settings } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter your full name';
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Please enter your mobile number';
    } else if (!/^(\+?\d{1,4})?[6-9]\d{9}$/.test(cleanPhone) && !/^\+?\d{10,15}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid mobile number (e.g. 9842123456 or +91 9842123456)';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) errs.message = 'Please enter your enquiry or product requirements';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Save and sync enquiry to backend/admin panel
      dataService.addEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });

      // 2. Prepare WhatsApp message content
      const whatsappNumber = (settings.whatsapp || '919842123456').replace(/\D/g, '');
      const whatsappText = 
        `💥 *SHARP CRACKERS - NEW ENQUIRY* 💥\n\n` +
        `👤 *Name:* ${formData.name.trim()}\n` +
        `📱 *Mobile:* ${formData.phone.trim()}\n` +
        (formData.email.trim() ? `📧 *Email:* ${formData.email.trim()}\n` : '') +
        (formData.subject.trim() ? `📋 *Subject:* ${formData.subject.trim()}\n` : '') +
        `\n💬 *Message:*\n${formData.message.trim()}\n\n` +
        `📍 _Direct Sivakasi Showroom Enquiry_`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
      setSubmittedWhatsappUrl(whatsappUrl);

      // 3. Immediately redirect to WhatsApp
      window.open(whatsappUrl, '_blank') || (window.location.href = whatsappUrl);

      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert("Error sending message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* 1. Hero Banner */}
      <section className="contact-hero">
        <div className="contact-container text-center">
          <div className="contact-pill">
            <Sparkles size={14} className="text-gold" />
            <span>DIRECT SIVAKASI HELPLINE • 24/7 CUSTOMER SUPPORT</span>
          </div>
          <h1 className="contact-hero-title">
            Contact <span className="highlight-hero-brand">{settings.shopName || "SHARP CRACKERS"}</span>
          </h1>
          <p className="contact-hero-lead">
            Have questions about cracker pricing, festive orders, transport arrangements, or special discounts? Reach out to our Sivakasi showroom team anytime.
          </p>
        </div>
      </section>

      {/* 2. Main Contact & Enquiry Section */}
      <section className="section-padding bg-cream">
        <div className="contact-container">
          <div className="contact-main-grid">
            
            {/* Left Column: Showroom Info & Contact Stack */}
            <div className="contact-left-col">
              <div className="contact-section-intro">
                <div className="section-subtitle-badge">
                  <Building size={14} className="text-orange" />
                  <span>SIVAKASI HEADQUARTERS</span>
                </div>
                <h2 className="info-main-title">Showroom & Factory Dispatch</h2>
                <p className="info-main-desc">
                  Visit our Sivakasi fireworks showroom or connect with our sales team via phone and email for immediate quotations and priority order dispatch.
                </p>
              </div>

              <div className="contact-cards-stack">
                {/* 1. Showroom Address */}
                <div className="contact-info-card">
                  <div className="info-icon-box bg-orange-light">
                    <MapPin size={24} className="text-orange" />
                  </div>
                  <div className="info-text-group">
                    <h4 className="info-card-label">Main Showroom & Dispatch Unit</h4>
                    <p className="info-card-value">
                      {settings.address || "145/2, By-Pass Road, Near New Bus Stand, Sivakasi - 626123, Tamil Nadu, India"}
                    </p>
                    {settings.branchAddress && (
                      <div className="branch-info-pill">
                        <strong>Branch:</strong> {settings.branchAddress}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Phone Numbers */}
                <div className="contact-info-card">
                  <div className="info-icon-box bg-gold-light">
                    <Phone size={24} className="text-gold-dark" />
                  </div>
                  <div className="info-text-group">
                    <h4 className="info-card-label">Direct Phone & Bulk Orders</h4>
                    <div className="phone-links-wrap">
                      <a href={`tel:${settings.phone}`} className="phone-call-link">
                        {settings.phone || "+91 98421 23456"}
                      </a>
                      {settings.altPhone && (
                        <>
                          <span className="phone-link-divider">•</span>
                          <a href={`tel:${settings.altPhone}`} className="phone-call-link">
                            {settings.altPhone}
                          </a>
                        </>
                      )}
                    </div>
                    <p className="info-card-hint">Available 8:00 AM – 10:00 PM for instant order assistance.</p>
                  </div>
                </div>

                {/* 3. Email */}
                <div className="contact-info-card">
                  <div className="info-icon-box bg-blue-light">
                    <Mail size={24} className="text-blue" />
                  </div>
                  <div className="info-text-group">
                    <h4 className="info-card-label">Official Email Support</h4>
                    <a href={`mailto:${settings.email}`} className="email-link">
                      {settings.email || "sales@sharpcrackers.com"}
                    </a>
                    <p className="info-card-hint">Send purchase orders, corporate inquiries, or quotation requests.</p>
                  </div>
                </div>

                {/* 4. Business Hours */}
                <div className="contact-info-card">
                  <div className="info-icon-box bg-emerald-light">
                    <Clock size={24} className="text-emerald" />
                  </div>
                  <div className="info-text-group">
                    <h4 className="info-card-label">Festival Working Hours</h4>
                    <p className="info-card-value">{settings.businessHours || "8:00 AM – 10:00 PM (Monday – Sunday)"}</p>
                    <p className="info-card-hint">Open 7 days a week during Diwali and wedding festive seasons.</p>
                  </div>
                </div>
              </div>

              {/* Sivakasi Factory Direct Assistance Card */}
              <div className="help-callout-card">
                <div className="help-callout-content">
                  <div className="help-icon-large">
                    <Building size={28} className="text-orange" />
                  </div>
                  <div>
                    <h3 className="help-callout-heading">Need Fast Price Quotes?</h3>
                    <p className="help-callout-text">Call directly with our Sivakasi showroom desk for custom pricing and seasonal festive packages.</p>
                  </div>
                </div>
                <a 
                  href={`tel:${settings.phone || '9842123456'}`}
                  className="btn btn-call-direct"
                >
                  <Phone size={18} />
                  <span>Call {settings.phone || '+91 98421 23456'}</span>
                </a>
              </div>
            </div>

            {/* Right Column: "Send Us a Message" Form */}
            <div className="contact-right-col">
              <div className="enquiry-form-card">
                <div className="form-card-header">
                  <div className="form-badge-pill">
                    <Mail size={13} className="text-orange" />
                    <span>DIRECT ENQUIRY</span>
                  </div>
                  <h3 className="form-main-heading">Send Us a Message</h3>
                  <p className="form-main-desc">
                    Fill out your enquiry below. Our Sivakasi sales and dispatch team will review your requirements and respond promptly!
                  </p>
                </div>

                {submitted ? (
                  <div className="enquiry-success-container">
                    <div className="success-icon-frame">
                      <CheckCircle2 size={48} className="text-emerald" />
                    </div>
                    <h4 className="success-title">Message Registered & Redirected to WhatsApp!</h4>
                    <p className="success-message">
                      Your enquiry has been registered and forwarded to WhatsApp. If WhatsApp did not open automatically, please click below.
                    </p>

                    <div className="success-actions-wrap" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.25rem' }}>
                      {submittedWhatsappUrl && (
                        <a 
                          href={submittedWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            fontWeight: 800,
                            padding: '0.85rem 1.6rem',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none'
                          }}
                        >
                          <MessageSquare size={18} />
                          <span>Open WhatsApp Chat</span>
                        </a>
                      )}
                      <button 
                        onClick={() => setSubmitted(false)} 
                        className="btn btn-outline-dark"
                        style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form-layout" noValidate>
                    {/* Name */}
                    <div className="form-field-group">
                      <label className="form-label-bold">
                        <span>Your Full Name</span>
                        <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <User size={18} className="input-field-icon" />
                        <input 
                          type="text" 
                          placeholder="e.g. Anandha Kumar" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`form-text-input ${errors.name ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.name && <span className="field-error-msg">{errors.name}</span>}
                    </div>

                    {/* Dual Row: Mobile & Email */}
                    <div className="form-fields-dual-row">
                      {/* Mobile */}
                      <div className="form-field-group">
                        <label className="form-label-bold">
                          <span>Mobile Number</span>
                          <span className="req-star">*</span>
                        </label>
                        <div className="input-with-icon">
                          <Phone size={18} className="input-field-icon" />
                          <input 
                            type="tel" 
                            placeholder="10-digit mobile number" 
                            value={formData.phone}
                            maxLength={10}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className={`form-text-input ${errors.phone ? 'is-invalid' : ''}`}
                          />
                        </div>
                        {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                      </div>

                      {/* Email */}
                      <div className="form-field-group">
                        <label className="form-label-bold">
                          <span>Email Address</span>
                          <span className="optional-tag">(Optional)</span>
                        </label>
                        <div className="input-with-icon">
                          <Mail size={18} className="input-field-icon" />
                          <input 
                            type="email" 
                            placeholder="e.g. anand@gmail.com" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`form-text-input ${errors.email ? 'is-invalid' : ''}`}
                          />
                        </div>
                        {errors.email && <span className="field-error-msg">{errors.email}</span>}
                      </div>
                    </div>

                    {/* Subject / Purpose */}
                    <div className="form-field-group">
                      <label className="form-label-bold">
                        <span>Subject / Purpose</span>
                        <span className="optional-tag">(Optional)</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Diwali Booking / Price List Inquiry" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="form-text-input no-icon-input"
                      />
                    </div>

                    {/* Enquiry Message */}
                    <div className="form-field-group">
                      <label className="form-label-bold">
                        <span>Your Enquiry Message</span>
                        <span className="req-star">*</span>
                      </label>
                      <textarea 
                        rows="5"
                        placeholder="Please specify which cracker items you are interested in, your delivery location, or any specific order queries..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`form-textarea-input ${errors.message ? 'is-invalid' : ''}`}
                      ></textarea>
                      {errors.message && <span className="field-error-msg">{errors.message}</span>}
                    </div>

                    {/* Submit Button */}
                    <div className="form-submit-wrapper">
                      <button 
                        type="submit" 
                        className="btn btn-message-submit btn-block"
                        disabled={loading}
                      >
                        <Send size={18} />
                        <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                      </button>
                      <div className="submit-disclaimer-note">
                        <ShieldCheck size={14} className="text-emerald" />
                        <span>Your contact details are kept strictly confidential with Sharp Crackers.</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Google Maps Location Section */}
      <section className="section-padding bg-white">
        <div className="contact-container">
          <div className="section-header text-center">
            <div className="section-subtitle-badge">
              <MapPin size={14} className="text-orange" />
              <span>FIND US IN SIVAKASI</span>
            </div>
            <h2 className="section-title">Showroom & Factory Location</h2>
            <p className="section-desc">
              Conveniently located on Sivakasi Bypass Road. Spacious parking for delivery trucks, commercial vans, and family visitors.
            </p>
          </div>

          <div className="map-frame-wrapper">
            <iframe 
              title="Sharp Crackers Sivakasi Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31484.5828731333!2d77.7818456!3d9.4533035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee1a6bfad4b%3A0x6b75f5664cb9ce64!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1697200000000!5m2!1sen!2sin"
              width="100%" 
              height="440" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <style>{`
        .contact-page-wrapper {
          width: 100%;
          overflow-x: hidden;
        }

        .contact-container {
          width: 100%;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(1.25rem, 3.5vw, 3.5rem);
          padding-right: clamp(1.25rem, 3.5vw, 3.5rem);
          box-sizing: border-box;
        }

        /* Hero */
        .contact-hero {
          background: linear-gradient(135deg, #050a18 0%, #0a1329 50%, #15254d 100%);
          color: #ffffff;
          padding: 5rem 0 4.5rem;
          border-bottom: 3px solid #ff6f00;
          position: relative;
        }

        .contact-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          height: 3px;
          background: #ffb703;
          box-shadow: 0 0 15px #ffb703;
        }

        .contact-pill {
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

        .contact-hero-title {
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

        .contact-hero-lead {
          font-size: clamp(1rem, 1.8vw, 1.18rem);
          color: #cbd5e1;
          max-width: 820px;
          margin: 0 auto;
          line-height: 1.75;
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

        /* Main Grid */
        .contact-main-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          align-items: start;
        }

        /* Left Column */
        .contact-section-intro {
          margin-bottom: 2rem;
        }

        .info-main-title {
          font-size: clamp(1.8rem, 2.5vw, 2.3rem);
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }

        .info-main-desc {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.7;
        }

        .contact-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .contact-info-card {
          background: #ffffff;
          padding: 1.4rem 1.6rem;
          border-radius: var(--radius-lg);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          transition: all 0.25s ease;
        }

        .contact-info-card:hover {
          border-color: #ffb703;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 111, 0, 0.08);
        }

        .info-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-text-group {
          flex: 1;
        }

        .info-card-label {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }

        .info-card-value {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.6;
        }

        .branch-info-pill {
          margin-top: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: #475569;
        }

        .phone-links-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .phone-call-link {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ff6f00;
          text-decoration: none;
        }
        .phone-call-link:hover {
          color: #ea580c;
          text-decoration: underline;
        }

        .phone-link-divider {
          color: #cbd5e1;
        }

        .email-link {
          font-size: 1rem;
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
        }
        .email-link:hover {
          text-decoration: underline;
        }

        .info-card-hint {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-top: 0.35rem;
        }

        /* Help Callout Card */
        .help-callout-card {
          background: linear-gradient(135deg, #0a1329 0%, #15254d 100%);
          border: 1.5px solid rgba(255, 107, 0, 0.4);
          border-radius: var(--radius-xl);
          padding: 1.75rem 2rem;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .help-callout-content {
          display: flex;
          align-items: flex-start;
          gap: 1.1rem;
        }

        .help-icon-large {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255, 107, 0, 0.15);
          border: 1px solid rgba(255, 107, 0, 0.3);
          color: #ff6b00;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .help-callout-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.35rem;
        }

        .help-callout-text {
          font-size: 0.9rem;
          color: #cbd5e1;
          line-height: 1.55;
        }

        .btn-call-direct {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          padding: 0.75rem 1.4rem;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.35);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-call-direct:hover {
          background: linear-gradient(135deg, #ff8533 0%, #f97316 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.45);
        }

        /* Right Column Form Card */
        .enquiry-form-card {
          background: #ffffff;
          padding: 2.75rem 2.5rem;
          border-radius: var(--radius-xl);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05);
        }

        .form-card-header {
          margin-bottom: 2rem;
        }

        .form-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #059669;
          background: #ecfdf5;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }

        .form-main-heading {
          font-size: 2rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .form-main-desc {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
        }

        .contact-form-layout {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .form-fields-dual-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-label-bold {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.92rem;
          font-weight: 700;
          color: #1e293b;
        }

        .req-star {
          color: #d90429;
          font-weight: 800;
        }

        .optional-tag {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-field-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          pointer-events: none;
        }

        .form-text-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: #0f172a;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-text-input.no-icon-input {
          padding-left: 1rem;
        }

        .form-textarea-input {
          width: 100%;
          padding: 0.95rem 1rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: #0f172a;
          font-family: inherit;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-text-input:focus,
        .form-textarea-input:focus {
          background: #ffffff;
          border-color: #ff6f00;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
          outline: none;
        }

        .form-text-input.is-invalid,
        .form-textarea-input.is-invalid {
          border-color: #d90429;
          background: #fef2f2;
        }

        .field-error-msg {
          font-size: 0.82rem;
          font-weight: 600;
          color: #d90429;
        }

        /* Submit Button */
        .form-submit-wrapper {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .btn-message-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%);
          color: #ffffff;
          padding: 1rem 1.5rem;
          font-size: 1.05rem;
          font-weight: 800;
          border-radius: var(--radius-md);
          border: none;
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.35);
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
        }

        .btn-message-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff8533 0%, #f97316 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 0, 0.45);
        }

        .btn-message-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .submit-disclaimer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: #64748b;
          text-align: center;
        }

        /* Success Container */
        .enquiry-success-container {
          text-align: center;
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.1rem;
        }

        .success-icon-frame {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #ecfdf5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.2);
        }

        .success-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: #0f172a;
        }

        .success-message {
          font-size: 1rem;
          color: #475569;
          line-height: 1.65;
          max-width: 480px;
        }

        .success-actions-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
          max-width: 360px;
          margin-top: 0.5rem;
        }

        /* Map Section */
        .map-frame-wrapper {
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
        }

        /* Background Colors */
        .bg-orange-light { background: #fff7ed; }
        .bg-gold-light { background: #fffbeb; }
        .bg-blue-light { background: #eff6ff; }
        .bg-emerald-light { background: #ecfdf5; }
        .text-orange { color: #ff6f00; }
        .text-gold-dark { color: #b45309; }
        .text-blue { color: #2563eb; }
        .text-emerald { color: #10b981; }

        /* Responsive */
        @media (max-width: 1100px) {
          .contact-main-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 3.5rem 0 3rem;
          }
          .enquiry-form-card {
            padding: 2rem 1.5rem;
          }
          .form-fields-dual-row {
            grid-template-columns: 1fr;
            gap: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};
