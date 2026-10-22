// ==========================================================================
// SHARP CRACKERS - CART & ORDER SUMMARY
// Simplified customer contact form (Name, Mobile, optional Email, Notes)
// Instant submission, "Thank you for ordering, we will reach you in 24 hours" notification,
// automatic return to Products List, sample receipt printing & instant admin sync
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { generateOrderPdf, printOrderDocument } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import CreativeActionButton from '../components/CreativeActionButton';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  FileText, 
  Printer, 
  CheckCircle, 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  Send, 
  User, 
  Phone, 
  Package,
  Receipt,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export const CartPage = ({ setCurrentPage, setLastOrderPlaced }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalSelectedProducts, 
    totalQuantity, 
    cartSubtotal, 
    deliveryCharge,
    cartGrandTotal,
    settings 
  } = useCart();

  // Simplified Form State: Name, Phone, optional Email, Notes
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

  const validateForm = () => {
    const errors = {};
    if (!customer.name.trim()) {
      errors.name = 'Please enter your name';
    }
    const cleanPhone = customer.phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please enter your mobile number';
    } else if (!/^(\+?\d{1,4})?[6-9]\d{9}$/.test(cleanPhone) && !/^\+?\d{10,15}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid mobile number (e.g. 9566886795 or +91 9566886795)';
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      alert("Your order sheet is empty. Please select products before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer,
        items: cartItems.map(item => ({
          id: item.id,
          code: item.code,
          name: item.name,
          packDetails: item.packDetails,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.image
        }))
      };

      // 1. Save and broadcast order immediately with guaranteed persistence
      const newOrder = await dataService.createOrder(orderPayload);
      setSubmittedOrder(newOrder);
      if (setLastOrderPlaced) {
        setLastOrderPlaced(newOrder);
      }

      // 2. Trigger celebratory confetti
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#ff6f00', '#ffd166', '#d90429', '#10b981']
      });

      // 3. Clear shopping cart
      clearCart();
    } catch (err) {
      alert("Error submitting order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto redirect countdown back to Products List
  useEffect(() => {
    let timer = null;
    if (submittedOrder && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (submittedOrder && countdown === 0) {
      // Go back to product list
      setCurrentPage('products');
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submittedOrder, countdown, setCurrentPage]);

  const handleReturnToProducts = () => {
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!submittedOrder) return;
    generateOrderPdf(submittedOrder, settings, true);
  };

  // Print Order Receipt
  const handlePrintReceipt = () => {
    if (!submittedOrder) return;
    printOrderDocument(submittedOrder, settings);
  };

  // Forward Order Summary to WhatsApp
  const handleSendOrderToWhatsApp = () => {
    if (!submittedOrder) return;
    const whatsappNumber = (settings.whatsapp || '919566886795').replace(/\D/g, '');
    const itemsText = (submittedOrder.items || [])
      .map((it, idx) => `${idx + 1}. ${it.name} (${it.packDetails || '1 box'}) x ${it.quantity} = ₹${it.totalPrice}`)
      .join('\n');

    const text =
      `💥 *NEW ORDER - SHARP CRACKERS* 💥\n\n` +
      `📋 *Order ID:* #${submittedOrder.orderId}\n` +
      `👤 *Customer Name:* ${submittedOrder.customer.name}\n` +
      `📱 *Mobile:* ${submittedOrder.customer.phone}\n` +
      (submittedOrder.customer.email ? `📧 *Email:* ${submittedOrder.customer.email}\n` : '') +
      (submittedOrder.customer.notes ? `📝 *Notes:* ${submittedOrder.customer.notes}\n` : '') +
      `\n📦 *Ordered Items:*\n${itemsText}\n\n` +
      `💰 *Total Amount:* ₹${Number(submittedOrder.grandTotal || 0).toLocaleString('en-IN')}\n\n` +
      `📍 _Direct Order from Sharp Crackers Website_`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank') || (window.location.href = url);
  };

  // -------------------------------------------------------------
  // SUCCESS NOTIFICATION POPUP (MODAL)
  // -------------------------------------------------------------
  if (submittedOrder) {
    const totalOrderQty = (submittedOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    return (
      <div className="order-submitted-overlay">
        <div className="order-submitted-modal card">
          <div className="submitted-icon-wrap">
            <CheckCircle size={56} className="text-emerald" />
          </div>

          <div className="badge badge-green mb-2">
            <Sparkles size={14} />
            <span>ORDER RECEIVED AT SIVAKASI FACTORY DESK</span>
          </div>

          <h1 className="submitted-main-title">Thank You For Ordering!</h1>
          
          <div className="reach-highlight-box">
            <Clock size={22} className="text-orange" />
            <span>We will reach you within <strong>24 hours</strong> (5 – 24 hours) at <strong>{submittedOrder.customer.phone}</strong></span>
          </div>

          <p className="submitted-subtext">
            Your cracker order <strong>#{submittedOrder.orderId}</strong> has been forwarded directly to our Admin team.
            <br />
            <span className="sample-reference-badge">Sample Reference Receipt for your records</span>
          </p>

          {/* Quick Summary Card */}
          <div className="submitted-quick-info">
            <div className="info-stat">
              <span className="stat-label">Customer Name</span>
              <strong className="stat-val">{submittedOrder.customer.name}</strong>
            </div>
            <div className="info-stat">
              <span className="stat-label">Mobile Number</span>
              <strong className="stat-val">{submittedOrder.customer.phone}</strong>
            </div>
            <div className="info-stat">
              <span className="stat-label">Products Ordered</span>
              <strong className="stat-val">{submittedOrder.items.length} varieties ({totalOrderQty} boxes)</strong>
            </div>
            <div className="info-stat">
              <span className="stat-label">Total Amount</span>
              <strong className="stat-val text-red">{formatCur(submittedOrder.grandTotal)}</strong>
            </div>
          </div>

          {/* Primary Action: Back to Product List */}
          <div className="modal-cta-group">
            <button 
              onClick={handleReturnToProducts} 
              className="btn btn-primary btn-lg btn-block return-btn"
            >
              <span>Back to Products List ({countdown}s)</span>
              <ArrowRight size={18} />
            </button>

            {/* Optional Sample Receipt Print / PDF / WhatsApp for customer reference */}
            <div className="sample-receipt-actions">
              <span className="sample-receipt-hint">Download or Print Your Order Copy</span>
              <div className="d-flex gap-2 justify-content-center flex-wrap align-items-center mt-2">
                <CreativeActionButton
                  variant="pdf"
                  onClick={handleDownloadPdf}
                  label="Download PDF"
                  size="md"
                />
                <CreativeActionButton
                  variant="print"
                  onClick={handlePrintReceipt}
                  label="Print Receipt"
                  size="md"
                />
                <button 
                  type="button"
                  onClick={handleSendOrderToWhatsApp} 
                  className="btn btn-md"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    border: 'none',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '9px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                    cursor: 'pointer',
                    fontSize: '0.94rem',
                    minHeight: '48px'
                  }}
                >
                  <MessageSquare size={17} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          <div className="redirect-progress-bar-wrap">
            <div 
              className="redirect-progress-bar"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <style>{`
          .order-submitted-overlay {
            position: fixed;
            inset: 0;
            background: rgba(5, 10, 24, 0.85);
            backdrop-filter: blur(6px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            animation: fadeIn 0.25s ease-out;
          }

          .order-submitted-modal {
            background: #ffffff;
            max-width: 620px;
            width: 100%;
            border-radius: var(--radius-xl);
            padding: 2.75rem 2rem 2rem;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
            border: 2px solid #ffb703;
            position: relative;
            overflow: hidden;
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes scaleIn {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .submitted-icon-wrap {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: #ecfdf5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.25rem;
          }

          .submitted-main-title {
            font-size: 2.2rem;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 0.65rem;
            line-height: 1.15;
          }

          .reach-highlight-box {
            background: #fff7ed;
            border: 1.5px solid #ffedd5;
            color: #9a3412;
            padding: 0.75rem 1.25rem;
            border-radius: var(--radius-full);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.05rem;
            margin-bottom: 1rem;
          }

          .submitted-subtext {
            font-size: 0.95rem;
            color: #64748b;
            margin-bottom: 1.75rem;
            line-height: 1.6;
          }

          .sample-reference-badge {
            display: inline-block;
            margin-top: 0.4rem;
            background: #f1f5f9;
            color: #475569;
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.2rem 0.65rem;
            border-radius: var(--radius-full);
            border: 1px solid #e2e8f0;
          }

          .submitted-quick-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: var(--radius-lg);
            padding: 1rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
            text-align: left;
            margin-bottom: 1.75rem;
          }

          .info-stat {
            display: flex;
            flex-direction: column;
          }

          .stat-label {
            font-size: 0.72rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
          }

          .stat-val {
            font-size: 0.95rem;
            color: #0f172a;
          }

          .modal-cta-group {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .return-btn {
            font-size: 1.1rem;
            padding: 0.95rem;
            box-shadow: 0 4px 18px rgba(255, 111, 0, 0.4);
          }

          .sample-receipt-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .sample-receipt-hint {
            font-size: 0.8rem;
            color: #64748b;
          }

          .redirect-progress-bar-wrap {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #f1f5f9;
          }

          .redirect-progress-bar {
            height: 100%;
            background: #ff6f00;
            transition: width 1s linear;
          }

          @media (max-width: 576px) {
            .order-submitted-modal {
              padding: 2rem 1.25rem 1.5rem;
            }
            .submitted-main-title {
              font-size: 1.75rem;
            }
            .submitted-quick-info {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY CART VIEW
  // -------------------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="container text-center">
          <div className="empty-cart-card card">
            <div className="empty-icon-wrap">
              <ShoppingCart size={48} className="text-orange" />
            </div>
            <h2>Your Order Sheet is Empty</h2>
            <p>You haven't selected any fireworks yet. Head over to our products catalog to select sparklers, pots, spinners, and gift boxes.</p>
            <button 
              onClick={handleReturnToProducts} 
              className="btn btn-primary btn-lg mt-3"
            >
              <span>Explore Products & Price List</span>
              <Sparkles size={18} />
            </button>
          </div>
        </div>

        <style>{`
          .empty-cart-page {
            padding: 5rem 0;
            min-height: 70vh;
            display: flex;
            align-items: center;
          }
          .empty-cart-card {
            max-width: 550px;
            margin: 0 auto;
            padding: 3.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .empty-icon-wrap {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #fff7ed;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          .empty-cart-card h2 {
            font-size: 1.8rem;
            margin-bottom: 0.75rem;
          }
          .empty-cart-card p {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN CART & ORDER SUMMARY
  // -------------------------------------------------------------
  return (
    <div className="cart-page-wrapper">
      <div className="container">
        {/* Top Header */}
        <div className="cart-header-row">
          <div>
            <button onClick={handleReturnToProducts} className="back-link-btn">
              <ArrowLeft size={16} /> Back to Products Catalog
            </button>
            <h1 className="cart-page-title">Order Sheet Summary</h1>
            <p className="cart-page-subtitle">
              Verify your selected crackers, enter your contact details, and submit directly to SHARP CRACKERS.
            </p>
          </div>

          <div className="cart-quick-stats">
            <div className="quick-stat-badge">
              <span>Selected Products:</span>
              <strong>{totalSelectedProducts} Varieties</strong>
            </div>
            <div className="quick-stat-badge">
              <span>Total Quantity:</span>
              <strong>{totalQuantity} Units</strong>
            </div>
          </div>
        </div>

        <div className="cart-layout-grid">
          {/* =========================================================
              LEFT COLUMN: SELECTED PRODUCTS TABLE
             ========================================================= */}
          <div className="cart-left-col">
            <div className="order-table-card card">
              <div className="card-top-bar">
                <h3 className="card-header-title">
                  <ShoppingCart size={18} className="text-orange" />
                  <span>Selected Products ({cartItems.length})</span>
                </h3>
                <button onClick={clearCart} className="clear-cart-link">
                  <Trash2 size={14} /> Clear All
                </button>
              </div>

              {/* Desktop Table View (> 768px) */}
              <div className="desktop-cart-table table-responsive-wrapper">
                <table className="cart-review-table">
                  <thead>
                    <tr>
                      <th className="col-sno text-center">S.No.</th>
                      <th className="col-img">Image</th>
                      <th className="col-details">Product Details</th>
                      <th className="col-price text-right">Unit Price</th>
                      <th className="col-qty text-center">Quantity</th>
                      <th className="col-total text-right">Total</th>
                      <th className="col-del text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="text-center col-sno">
                          <span className="cart-sno-badge">{item.sno ? String(parseInt(item.sno, 10)).padStart(3, '0') : String(idx + 1).padStart(3, '0')}</span>
                        </td>
                        <td className="col-img">
                          <img src={item.image} alt={item.name} className="cart-item-thumb" />
                        </td>
                        <td className="col-details">
                          <div className="cart-prod-code">{item.code}</div>
                          <div className="cart-prod-name">
                            {item.name}
                          </div>
                          <div className="cart-prod-pack">{item.packDetails}</div>
                        </td>
                        <td className="col-price text-right">{formatCur(item.unitPrice)}</td>
                        <td className="col-qty text-center">
                          <div className="cart-qty-ctrl">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="cart-qbtn"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="cart-qval">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="cart-qbtn"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="col-total text-right font-bold text-red">
                          {formatCur(item.totalPrice)}
                        </td>
                        <td className="col-del text-center">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="item-remove-btn"
                            title="Remove product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cart Items List (<= 768px) */}
              <div className="mobile-cart-items-list">
                {cartItems.map((item, idx) => (
                  <div key={item.id} className="mobile-cart-card">
                    <div className="m-cart-top">
                      <img src={item.image} alt={item.name} className="m-cart-thumb" />
                      <div className="m-cart-info">
                        <div className="m-cart-header-line">
                          <div className="d-flex align-items-center gap-1">
                            <span className="m-cart-sno">#{item.sno ? String(parseInt(item.sno, 10)).padStart(3, '0') : '001'}</span>
                            <span className="m-cart-code">{item.code}</span>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="m-cart-del-btn"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <h4 className="m-cart-title">
                          {item.name}
                        </h4>
                        <div className="m-cart-pack">{item.packDetails}</div>
                        <div className="m-cart-unit-price">Rate: {formatCur(item.unitPrice)} / box</div>
                      </div>
                    </div>

                    <div className="m-cart-bottom">
                      <div className="m-cart-stepper">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="m-c-btn minus"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="m-c-qty">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="m-c-btn plus"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="m-cart-line-total">
                        <span className="m-line-lbl">Line Total:</span>
                        <span className="m-line-val">{formatCur(item.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Calculations Bar */}
              <div className="cart-calculation-block">
                <div className="calc-row">
                  <span>Total Varieties:</span>
                  <strong>{totalSelectedProducts} Products</strong>
                </div>
                <div className="calc-row">
                  <span>Total Units:</span>
                  <strong>{totalQuantity} Boxes / Pkts</strong>
                </div>
                <div className="calc-row grand-total-row">
                  <span>Total Order Amount:</span>
                  <span className="grand-price">{formatCur(cartGrandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: SIMPLIFIED CUSTOMER FORM & SUBMIT
             ========================================================= */}
          <div className="cart-right-col">
            <div className="checkout-form-card card">
              <h3 className="card-header-title mb-2">
                <User size={18} className="text-orange" />
                <span>Customer Contact Information</span>
              </h3>
              <p className="form-info-sub mb-3">
                Please enter your name and mobile number. Upon submitting, your order is instantly sent to the Admin Desk and we will reach you within 24 hours.
              </p>

              <form onSubmit={handleSubmitOrder} className="checkout-form">
                {/* Customer Name */}
                <div className="form-group">
                  <label className="form-label">
                    Your Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                  <label className="form-label">
                    Mobile Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number (or +91...)"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 16) })}
                    className={`form-input ${formErrors.phone ? 'error' : ''}`}
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>

                {/* Email Address (Optional) */}
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com (optional)"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                {/* Additional Notes */}
                <div className="form-group">
                  <label className="form-label">Special Notes / Message (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Any specific requests or preferred contact time..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="form-textarea"
                  ></textarea>
                </div>

                {/* Order Confirmation Summary */}
                <div className="final-confirmation-summary">
                  <div className="confirm-row">
                    <span>Total Varieties:</span>
                    <strong>{totalSelectedProducts} Products</strong>
                  </div>
                  <div className="confirm-row">
                    <span>Total Units:</span>
                    <strong>{totalQuantity} Boxes / Pkts</strong>
                  </div>
                  <div className="confirm-row grand-total">
                    <span>Total Amount:</span>
                    <strong className="confirm-price">{formatCur(cartGrandTotal)}</strong>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="two-action-buttons">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block submit-order-btn"
                    disabled={isSubmitting}
                  >
                    <Send size={18} />
                    <span>{isSubmitting ? 'Submitting Order...' : 'Submit Order'}</span>
                  </button>

                  <div className="cart-dual-doc-buttons mt-3">
                    <CreativeActionButton 
                      variant="pdf" 
                      onClick={() => {
                        const tempOrder = {
                          orderId: 'ESTIMATE-DRAFT',
                          createdAt: new Date().toISOString(),
                          customer: { name: customer.name || 'Valued Customer', phone: customer.phone || 'N/A', email: customer.email, notes: customer.notes },
                          items: cartItems,
                          subtotal: cartSubtotal,
                          deliveryCharge: 0,
                          grandTotal: cartGrandTotal,
                          status: 'Draft'
                        };
                        generateOrderPdf(tempOrder, settings, true);
                      }}
                      label="Download PDF"
                      size="md"
                    />

                    <CreativeActionButton 
                      variant="print" 
                      onClick={() => {
                        const tempOrder = {
                          orderId: 'ESTIMATE-DRAFT',
                          createdAt: new Date().toISOString(),
                          customer: { name: customer.name || 'Valued Customer', phone: customer.phone || 'N/A', email: customer.email, notes: customer.notes },
                          items: cartItems,
                          subtotal: cartSubtotal,
                          deliveryCharge: 0,
                          grandTotal: cartGrandTotal,
                          status: 'Draft'
                        };
                        printOrderDocument(tempOrder, settings);
                      }}
                      label="Print Order"
                      size="md"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page-wrapper {
          padding: 3rem 0 6rem;
          background: #fdfbf7;
          min-height: 80vh;
        }

        .cart-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #ff6f00;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .cart-page-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .cart-page-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          max-width: 650px;
        }

        .cart-quick-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quick-stat-badge {
          background: #0a1329;
          color: #ffffff;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          border: 1px solid rgba(255, 183, 3, 0.3);
        }

        .quick-stat-badge strong {
          color: #ffb703;
          font-size: 0.95rem;
        }

        .cart-layout-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .order-table-card {
          padding: 1.5rem;
          background: #ffffff;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .card-header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .clear-cart-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cart-review-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .cart-review-table th {
          background: #f8fafc;
          padding: 0.75rem 0.65rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }

        .cart-review-table td {
          padding: 0.75rem 0.65rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .cart-sno-badge {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-weight: 800;
          font-size: 0.85rem;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .cart-item-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: contain;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 2px;
        }

        .cart-prod-code {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .cart-prod-name {
          font-weight: 700;
          color: #0f172a;
        }

        .cart-tamil-name {
          color: #c2410c;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .cart-prod-pack {
          font-size: 0.78rem;
          color: #64748b;
        }

        .cart-qty-ctrl {
          display: inline-flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-sm);
          background: #ffffff;
        }

        .cart-qbtn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #334155;
        }
        .cart-qbtn:hover {
          background: #ff6f00;
          color: #ffffff;
        }

        .cart-qval {
          width: 28px;
          text-align: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .font-bold {
          font-weight: 700;
        }

        .item-remove-btn {
          color: #94a3b8;
          padding: 4px;
        }
        .item-remove-btn:hover {
          color: #dc2626;
        }

        .cart-calculation-block {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 2px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: #475569;
        }

        .grand-total-row {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          padding-top: 0.6rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 0.4rem;
        }

        .grand-price {
          color: #d90429;
          font-family: var(--font-display);
        }

        /* Form Card */
        .checkout-form-card {
          padding: 1.75rem;
          background: #ffffff;
        }

        .form-info-sub {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
        }

        .req {
          color: #dc2626;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          background: #f8fafc;
          font-size: 0.92rem;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #ff6f00;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
        }

        .form-input.error, .form-textarea.error {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .error-text {
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 600;
        }

        .final-confirmation-summary {
          background: #0a1329;
          color: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 183, 3, 0.3);
        }

        .confirm-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .confirm-price {
          font-size: 1.4rem;
          color: #ffb703;
          font-family: var(--font-display);
        }

        .confirm-items-line {
          font-size: 0.78rem;
          color: #cbd5e1;
          margin-top: 0.25rem;
        }

        .two-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 0.5rem;
        }

        .submit-order-btn {
          font-size: 1.05rem;
          padding: 0.9rem;
          box-shadow: 0 4px 15px rgba(255, 111, 0, 0.35);
        }

        .cart-dual-doc-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
          width: 100%;
        }

        /* Desktop vs Mobile Cart Visibility */
        .desktop-cart-table {
          display: block;
        }

        .mobile-cart-items-list {
          display: none;
        }

        @media (max-width: 992px) {
          .cart-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Mobile Screens (<= 768px) */
        @media (max-width: 768px) {
          .cart-page-wrapper {
            padding: 1.5rem 0 4rem;
          }

          .cart-header-row {
            margin-bottom: 1.25rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .cart-page-title {
            font-size: 1.85rem;
          }

          .cart-quick-stats {
            width: 100%;
            display: flex;
            gap: 0.5rem;
          }

          .quick-stat-badge {
            flex: 1;
            font-size: 0.8rem;
            padding: 0.5rem 0.65rem;
          }

          /* Hide Desktop Cart Table */
          .desktop-cart-table {
            display: none !important;
          }

          /* Show Mobile Cart Cards */
          .mobile-cart-items-list {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .mobile-cart-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: var(--radius-lg);
            padding: 0.85rem;
            box-shadow: var(--shadow-sm);
          }

          .m-cart-top {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
          }

          .m-cart-thumb {
            width: 68px;
            height: 68px;
            border-radius: 8px;
            object-fit: contain;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            padding: 3px;
            flex-shrink: 0;
          }

          .m-cart-info {
            flex: 1;
            min-width: 0;
          }

          .m-cart-header-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.2rem;
          }

          .m-cart-sno {
            font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
            font-weight: 800;
            font-size: 0.72rem;
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #fed7aa;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }

          .m-cart-code {
            font-family: monospace;
            font-weight: 700;
            font-size: 0.75rem;
            background: #f1f5f9;
            color: #475569;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
          }

          .m-cart-del-btn {
            color: #94a3b8;
            padding: 4px;
            border-radius: 4px;
          }
          .m-cart-del-btn:hover {
            color: #dc2626;
            background: #fee2e2;
          }

          .m-cart-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.3;
            margin-bottom: 0.25rem;
          }

          .m-cart-pack {
            font-size: 0.78rem;
            color: #0369a1;
            margin-bottom: 0.2rem;
          }

          .m-cart-unit-price {
            font-size: 0.8rem;
            color: #64748b;
          }

          .m-cart-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px dashed #e2e8f0;
            margin-top: 0.65rem;
            padding-top: 0.65rem;
          }

          .m-cart-stepper {
            display: inline-flex;
            align-items: center;
            border: 1.5px solid #ff6f00;
            border-radius: 8px;
            background: #ffffff;
            overflow: hidden;
          }

          .m-c-btn {
            width: 34px;
            height: 32px;
            background: #fff7ed;
            color: #ff6f00;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .m-c-btn:active {
            background: #ff6f00;
            color: #ffffff;
          }

          .m-c-qty {
            width: 36px;
            text-align: center;
            font-weight: 800;
            font-size: 0.92rem;
            color: #0f172a;
          }

          .m-cart-line-total {
            text-align: right;
          }

          .m-line-lbl {
            font-size: 0.75rem;
            color: #64748b;
            display: block;
          }

          .m-line-val {
            font-size: 1.1rem;
            font-weight: 800;
            color: #d90429;
            font-family: var(--font-display);
          }

          /* Checkout Form on Mobile */
          .checkout-form-card {
            padding: 1.25rem;
          }

          .form-input, .form-textarea {
            font-size: 16px; /* Prevents auto-zoom on iOS */
          }

          .draft-actions-dual {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
