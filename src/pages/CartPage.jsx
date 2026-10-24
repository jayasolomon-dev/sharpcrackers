// ==========================================================================
// SHARP CRACKERS - CART & ORDER SUMMARY
// Simplified customer contact form (Name, Mobile, optional Email, Notes)
// Instant submission, "Thank you for ordering, we will reach you in 24 hours" notification,
// automatic return to Products List, sample receipt printing & instant admin sync
// ==========================================================================

import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  AlertCircle,
  Download,
  X
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
    settings,
    hasOutOfStockItems,
    getProductAvailableStock
  } = useCart();

  // Simplified Form State: Name, Phone, optional Email, Notes
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Refs for seamless Enter-key keyboard navigation between fields
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const notesInputRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;


  // Input Sanitizers & Handlers
  const handleNameChange = (e) => {
    // Restrict strictly to alphabetic characters and spaces only
    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setCustomer(prev => ({ ...prev, name: lettersOnly }));
    if (formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    // Restrict strictly to digits only, maximum 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomer(prev => ({ ...prev, phone: digitsOnly }));
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setCustomer(prev => ({ ...prev, email: val }));
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const cleanName = customer.name.trim();
    if (!cleanName) {
      errors.name = 'Please enter your name (letters only)';
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(cleanName)) {
      errors.name = 'Name should contain only letters and spaces (min 2 characters)';
    }

    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please enter your 10-digit mobile number';
    } else if (cleanPhone.length !== 10) {
      errors.phone = `Mobile number must be exactly 10 digits (${cleanPhone.length}/10 entered)`;
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }

    const cleanEmail = customer.email ? customer.email.trim() : '';
    if (cleanEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (hasOutOfStockItems) {
      alert("Your order contains Out of Stock products! Please remove them from your order list before submitting.");
      return;
    }
    const overStockItem = cartItems.find(item => {
      const avail = item.availableStock !== undefined ? item.availableStock : (getProductAvailableStock ? getProductAvailableStock(item) : (item.stockCount !== undefined ? Number(item.stockCount) : 100));
      return item.quantity > avail;
    });
    if (overStockItem) {
      const avail = overStockItem.availableStock !== undefined ? overStockItem.availableStock : 0;
      alert(`The requested quantity for "${overStockItem.name}" exceeds available stock (${avail} available). Please adjust quantity before placing your order.`);
      return;
    }
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
          image: item.image && String(item.image).startsWith('data:') 
            ? (item.code ? `/images/products/${String(item.code).toLowerCase()}.jpg` : '') 
            : item.image
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

  // Return back to Products List (Triggered via X button or Return button)

  const handleReturnToProducts = () => {
    setSubmittedOrder(null);
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
    const whatsappNumber = (settings.whatsapp || '919566886785').replace(/\D/g, '');
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
    try {
      const opened = window.open(url, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
  };

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // SUCCESS NOTIFICATION & ORDER RECEIPT VIEW (Dark Luxury Theme)
  // -------------------------------------------------------------
  if (submittedOrder) {
    const totalOrderQty = (submittedOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    return (
      <div className="order-submitted-overlay" onClick={handleReturnToProducts}>
        <div className="order-submitted-modal card" onClick={(e) => e.stopPropagation()}>
          {/* Header Row: Status Badge & Actions */}
          <div className="submitted-modal-header">
            <div className="submitted-status-pill">
              <CheckCircle size={15} className="text-emerald" />
              <span>Order Confirmed</span>
              <span className="order-chip-num">#{submittedOrder.orderId}</span>
            </div>

            <div className="submitted-modal-top-actions">
              <button 
                type="button" 
                onClick={handleDownloadPdf} 
                className="submitted-modal-download-btn" 
                title="Download Official Order Invoice PDF"
              >
                <Download size={13} />
                <span>Download Invoice</span>
              </button>
              <button 
                type="button" 
                onClick={handleReturnToProducts} 
                className="submitted-modal-close-btn" 
                title="Close and return to products catalog"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Title & Contact Note */}
          <div className="submitted-body-content">
            <h2 className="submitted-compact-title">Thank You For Ordering!</h2>
            <p className="submitted-reach-text">
              <Clock size={14} className="text-amber" />
              <span>Our Sivakasi team will reach you within <strong>24 hrs</strong> at <strong className="phone-accent">{submittedOrder.customer.phone}</strong></span>
            </p>

            {/* Compact Glass Summary Strip */}
            <div className="submitted-compact-strip">
              <div className="strip-col">
                <span className="strip-label">Customer</span>
                <strong className="strip-val">{submittedOrder.customer.name}</strong>
              </div>
              <div className="strip-divider"></div>
              <div className="strip-col">
                <span className="strip-label">Ordered Items</span>
                <strong className="strip-val">{submittedOrder.items.length} items ({totalOrderQty} boxes)</strong>
              </div>
              <div className="strip-divider"></div>
              <div className="strip-col strip-col-total">
                <span className="strip-label">Total Amount</span>
                <strong className="strip-val total-price-glow">{formatCur(submittedOrder.grandTotal)}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="submitted-modal-footer">
            <button 
              type="button"
              onClick={handleReturnToProducts} 
              className="btn-compact-primary"
            >
              <span>Back to Products</span>
              <ArrowRight size={15} />
            </button>
            <button 
              type="button"
              onClick={handleSendOrderToWhatsApp} 
              className="btn-compact-whatsapp"
              title="Share Order on WhatsApp"
            >
              <MessageSquare size={15} />
              <span>WhatsApp</span>
            </button>
            <button 
              type="button"
              onClick={handlePrintReceipt} 
              className="btn-compact-print"
              title="Print Order Receipt"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Self-Contained Modal CSS (Guarantees Minimal, Sleek Dark Theme) */}
        <style>{`
          .order-submitted-overlay {
            position: fixed;
            inset: 0;
            background: rgba(3, 7, 18, 0.82);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            animation: fadeInModal 0.2s ease-out;
            font-family: inherit;
          }

          @keyframes fadeInModal {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .order-submitted-modal {
            background: linear-gradient(155deg, #10192e 0%, #090e1d 100%);
            border: 1px solid rgba(255, 183, 3, 0.4);
            max-width: 480px;
            width: 100%;
            border-radius: 18px;
            padding: 1.35rem 1.45rem 1.25rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(255, 183, 3, 0.12);
            position: relative;
            animation: scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          @keyframes scaleInModal {
            from { transform: scale(0.94) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }

          .submitted-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 0.85rem;
          }

          .submitted-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.35);
            color: #34d399;
            font-size: 0.76rem;
            font-weight: 700;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
          }

          .order-chip-num {
            color: #ffd166;
            font-weight: 800;
            padding-left: 0.35rem;
            border-left: 1px solid rgba(16, 185, 129, 0.4);
            margin-left: 0.25rem;
          }

          .submitted-modal-top-actions {
            display: flex;
            align-items: center;
            gap: 0.45rem;
          }

          .submitted-modal-download-btn {
            background: linear-gradient(135deg, rgba(255, 183, 3, 0.2) 0%, rgba(255, 111, 0, 0.25) 100%);
            border: 1px solid rgba(255, 183, 3, 0.55);
            color: #ffd166;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 0.32rem 0.75rem;
            border-radius: 9999px;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }

          .submitted-modal-download-btn:hover {
            background: linear-gradient(135deg, #ffb703 0%, #ff8f00 100%);
            color: #0b1329;
            border-color: #ffb703;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 183, 3, 0.4);
          }

          .submitted-modal-close-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.08);
            color: #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .submitted-modal-close-btn:hover {
            background: rgba(239, 68, 68, 0.9);
            border-color: #ef4444;
            color: #ffffff;
            transform: scale(1.06);
          }

          .submitted-body-content {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
          }

          .submitted-compact-title {
            font-size: 1.35rem;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.01em;
          }

          .submitted-reach-text {
            font-size: 0.84rem;
            color: #94a3b8;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            line-height: 1.4;
          }

          .phone-accent {
            color: #ffd166;
            font-weight: 700;
          }

          .submitted-compact-strip {
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 0.65rem 0.85rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.6rem;
            margin-top: 0.25rem;
          }

          .strip-col {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            flex: 1;
            min-width: 0;
          }

          .strip-divider {
            width: 1px;
            height: 26px;
            background: rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
          }

          .strip-label {
            font-size: 0.66rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .strip-val {
            font-size: 0.86rem;
            font-weight: 700;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .strip-col-total .strip-label {
            color: #ffd166;
          }

          .total-price-glow {
            color: #ffb703;
            font-size: 1.05rem;
            font-weight: 900;
            text-shadow: 0 0 10px rgba(255, 183, 3, 0.35);
          }

          .submitted-modal-footer {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            margin-top: 0.25rem;
          }

          .btn-compact-primary {
            flex: 1;
            min-height: 40px;
            background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
            border: none;
            border-radius: 10px;
            color: #ffffff;
            font-size: 0.88rem;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(255, 111, 0, 0.35);
            transition: all 0.2s ease;
          }

          .btn-compact-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(255, 111, 0, 0.5);
          }

          .btn-compact-whatsapp {
            min-height: 40px;
            padding: 0 0.85rem;
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            border: none;
            border-radius: 10px;
            color: #ffffff;
            font-size: 0.84rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
            transition: all 0.2s ease;
          }

          .btn-compact-whatsapp:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37, 211, 102, 0.45);
          }

          .btn-compact-print {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 10px;
            color: #cbd5e1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }

          .btn-compact-print:hover {
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
          }

          @media (max-width: 480px) {
            .order-submitted-modal {
              padding: 1.15rem 0.85rem 1rem;
              border-radius: 16px;
              width: 95%;
              max-width: 100%;
            }
            .submitted-modal-header {
              flex-direction: column;
              align-items: stretch;
              gap: 0.65rem;
            }
            .submitted-modal-top-actions {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
            }
            .submitted-modal-download-btn {
              flex: 1;
              justify-content: center;
            }
            .submitted-compact-title {
              font-size: 1.2rem;
            }
            .submitted-compact-strip {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.4rem;
            }
            .strip-divider {
              display: none;
            }
            .submitted-modal-footer {
              flex-wrap: wrap;
            }
            .btn-compact-primary {
              width: 100%;
              flex: auto;
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
              <ShoppingCart size={44} className="text-orange" />
            </div>
            <h2>Your Order Sheet is Empty</h2>
            <p>You haven't selected any fireworks yet. Head over to our products catalog to select sparklers, pots, spinners, and gift boxes.</p>
            <button 
              onClick={handleReturnToProducts} 
              className="btn btn-primary btn-lg empty-explore-btn"
            >
              <span>Explore Products & Price List</span>
            </button>
          </div>
        </div>

        <style>{`
          .empty-cart-page {
            padding: 4rem 1rem;
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-cart-card {
            max-width: 540px;
            width: 100%;
            margin: 0 auto;
            padding: 3.5rem 2.25rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
          }
          .empty-icon-wrap {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            background: #fff7ed;
            border: 2px solid #ffedd5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 16px rgba(255, 111, 0, 0.12);
          }
          .empty-cart-card h2 {
            font-size: 1.85rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.85rem;
            text-align: center;
            letter-spacing: -0.02em;
          }
          .empty-cart-card p {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.65;
            text-align: center;
            max-width: 440px;
            margin: 0 auto 2.25rem auto;
          }
          .empty-explore-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
            padding: 0.95rem 2.25rem;
            font-size: 1rem;
            font-weight: 700;
            border-radius: 14px;
            background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
            box-shadow: 0 4px 18px rgba(234, 88, 12, 0.35);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            border: none;
            cursor: pointer;
          }
          .empty-explore-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(234, 88, 12, 0.45);
          }
          .empty-explore-btn:active {
            transform: scale(0.98);
          }
          @media (max-width: 640px) {
            .empty-cart-page {
              padding: 2.5rem 1rem;
            }
            .empty-cart-card {
              padding: 2.5rem 1.5rem;
              border-radius: 20px;
            }
            .empty-cart-card h2 {
              font-size: 1.5rem;
              margin-bottom: 0.75rem;
            }
            .empty-cart-card p {
              font-size: 0.9rem;
              line-height: 1.55;
              margin-bottom: 1.85rem;
            }
            .empty-explore-btn {
              width: 100%;
              max-width: 320px;
              padding: 0.85rem 1.5rem;
              font-size: 0.95rem;
            }
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

              {/* Out of Stock Warning Banner */}
              {hasOutOfStockItems && (
                <div className="cart-out-warning-banner">
                  <AlertCircle size={22} className="text-red flex-shrink-0" />
                  <div className="cart-out-warning-text">
                    <strong>Attention: Some items are currently Out of Stock! / சில பொருட்கள் இருப்பு இல்லை</strong>
                    <p>Please remove the out-of-stock items highlighted below from your cart to proceed with submitting your order.</p>
                  </div>
                </div>
              )}

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
                      <tr key={item.id} className={item.isOutOfStock ? 'cart-row-out' : ''}>
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
                            {item.isOutOfStock && (
                              <span className="cart-out-tag">Out of Stock / இருப்பு இல்லை</span>
                            )}
                          </div>
                          <div className="cart-prod-pack">{item.packDetails}</div>
                        </td>
                        <td className="col-price text-right">{formatCur(item.unitPrice)}</td>
                        <td className="col-qty text-center">
                          {(() => {
                            const maxStock = item.availableStock !== undefined ? item.availableStock : (getProductAvailableStock ? getProductAvailableStock(item) : 100);
                            return (
                              <div className="cart-qty-ctrl-wrap">
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
                                    disabled={item.isOutOfStock || item.quantity >= maxStock}
                                    title={item.isOutOfStock ? "Product is Out of Stock" : item.quantity >= maxStock ? `Maximum stock reached (${maxStock} units)` : "Increase quantity"}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                {item.quantity >= maxStock && maxStock > 0 && (
                                  <div className="cart-stock-limit-note">Max: {maxStock}</div>
                                )}
                              </div>
                            );
                          })()}
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
                  <div key={item.id} className={`mobile-cart-card ${item.isOutOfStock ? 'm-cart-card-out' : ''}`}>
                    <div className="m-cart-top">
                      <img src={item.image} alt={item.name} className="m-cart-thumb" />
                      <div className="m-cart-info">
                        <div className="m-cart-header-line">
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="m-cart-sno">#{item.sno ? String(parseInt(item.sno, 10)).padStart(3, '0') : '001'}</span>
                            <span className="m-cart-code">{item.code}</span>
                            {item.isOutOfStock && (
                              <span className="cart-out-tag">Out of Stock</span>
                            )}
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
                      {(() => {
                        const maxStock = item.availableStock !== undefined ? item.availableStock : (getProductAvailableStock ? getProductAvailableStock(item) : 100);
                        return (
                          <div className="m-cart-stepper-wrap">
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
                                disabled={item.isOutOfStock || item.quantity >= maxStock}
                                title={item.isOutOfStock ? "Product is Out of Stock" : item.quantity >= maxStock ? `Maximum stock reached (${maxStock} units)` : "Increase quantity"}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            {item.quantity >= maxStock && maxStock > 0 && (
                              <span className="m-cart-stock-limit-note">Max: {maxStock}</span>
                            )}
                          </div>
                        );
                      })()}

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
                    ref={nameInputRef}
                    type="text"
                    placeholder="Enter your name"
                    value={customer.name}
                    onChange={handleNameChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        phoneInputRef.current?.focus();
                      }
                    }}
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    autoComplete="name"
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Mobile Number <span className="req">*</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: customer.phone.length === 10 ? '#10b981' : '#94a3b8', fontWeight: 600 }}>
                      {customer.phone.length}/10 digits
                    </span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={customer.phone}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        emailInputRef.current?.focus();
                      }
                    }}
                    className={`form-input ${formErrors.phone ? 'error' : ''}`}
                    autoComplete="tel"
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>

                {/* Email Address (Optional) */}
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="Enter email address"
                    value={customer.email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        notesInputRef.current?.focus();
                      }
                    }}
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                    autoComplete="email"
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                {/* Additional Notes */}
                <div className="form-group">
                  <label className="form-label">Special Notes / Message (Optional)</label>
                  <textarea
                    ref={notesInputRef}
                    rows="2"
                    placeholder="Write your message or notes..."
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
                    disabled={isSubmitting || hasOutOfStockItems}
                    style={
                      hasOutOfStockItems 
                        ? { opacity: 0.75, cursor: 'not-allowed', background: '#dc2626' } 
                        : {}
                    }
                    title={
                      hasOutOfStockItems 
                        ? "Please remove out of stock items first" 
                        : "Submit Order"
                    }
                  >
                    <Send size={18} />
                    <span>
                      {isSubmitting 
                        ? 'Submitting Order...' 
                        : hasOutOfStockItems 
                          ? 'Remove Out of Stock Items to Submit' 
                          : 'Submit Order'}
                    </span>
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
        .cart-qbtn:hover:not(:disabled) {
          background: #ff6f00;
          color: #ffffff;
        }

        .cart-qbtn:disabled {
          opacity: 0.35 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          background: #f1f5f9 !important;
          color: #94a3b8 !important;
        }

        .cart-qty-ctrl-wrap {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .cart-stock-limit-note {
          font-size: 0.7rem;
          color: #ea580c;
          font-weight: 700;
          line-height: 1;
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
          .m-c-btn:active:not(:disabled) {
            background: #ff6f00;
            color: #ffffff;
          }
          .m-c-btn:disabled {
            opacity: 0.35 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            background: #f1f5f9 !important;
            color: #94a3b8 !important;
          }

          .m-cart-stepper-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .m-cart-stock-limit-note {
            font-size: 0.65rem;
            color: #ea580c;
            font-weight: 800;
            line-height: 1;
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

        /* Out of Stock Warning Banner & Row Highlighting */
        .cart-out-warning-banner {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.08);
          animation: fadeIn 0.25s ease-out;
        }

        .cart-out-warning-text strong {
          display: block;
          color: #991b1b;
          font-size: 0.95rem;
          font-weight: 800;
          margin-bottom: 0.2rem;
        }

        .cart-out-warning-text p {
          color: #b91c1c;
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.4;
        }

        .cart-row-out {
          background-color: #fff1f2 !important;
        }

        .cart-out-tag {
          display: inline-block;
          margin-left: 0.45rem;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .m-cart-card-out {
          border-color: #fca5a5 !important;
          background-color: #fff1f2 !important;
        }

        .cart-qbtn:disabled, .m-c-btn:disabled {
          background: #f1f5f9 !important;
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
        }

        /* Order Submitted Fullscreen Modal */
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

        .submitted-modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 25;
        }

        .submitted-modal-close-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .submitted-modal-close-btn:active {
          transform: scale(0.92);
        }

        @media (max-width: 576px) {
          .order-submitted-modal {
            padding: 1.25rem 0.85rem 1rem !important;
            width: 95% !important;
          }
          .submitted-main-title {
            font-size: 1.45rem;
          }
          .submitted-quick-info {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 380px) {
          .m-cart-thumb {
            width: 54px;
            height: 54px;
          }
          .m-cart-title {
            font-size: 0.88rem;
          }
          .m-cart-bottom {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .m-cart-line-total {
            text-align: left;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-top: 1px dotted #f1f5f9;
            padding-top: 0.35rem;
          }
          .m-c-btn {
            width: 30px;
            height: 30px;
          }
          .m-c-qty {
            width: 32px;
            font-size: 0.88rem;
          }
        }
      `}</style>
    </div>
  );
};
