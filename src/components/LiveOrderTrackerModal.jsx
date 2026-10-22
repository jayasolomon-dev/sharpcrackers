// ==========================================================================
// SHARP CRACKERS - LIVE ORDER STATUS TRACKER
// Real-time synchronization for customer orders with live status pipeline:
// Pending (Order Placed) -> Processing (Packing) -> Completed (Dispatched)
// ==========================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  XCircle, 
  Package, 
  Truck, 
  FileText, 
  Printer, 
  Search, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { generateOrderPdf, printOrderDocument } from '../utils/pdfGenerator';
import CreativeActionButton from './CreativeActionButton';
import './LiveOrderTrackerModal.css';

export const LiveOrderTrackerModal = ({ 
  isOpen = true, 
  onClose, 
  orderId: propOrderId, 
  initialOrder,
  inline = false,
  onContinueShopping
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOrder, setCurrentOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [statusAnimation, setStatusAnimation] = useState(false);
  const prevStatusRef = useRef(initialOrder?.status);

  const activeOrderId = propOrderId || currentOrder?.orderId || initialOrder?.orderId || null;

  // Currency Formatter
  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

  // Load Order by ID
  const loadOrder = useCallback(async (idToFind, showLoader = false) => {
    if (!idToFind) return;
    if (showLoader) setLoading(true);
    setErrorMessage('');

    try {
      const order = await dataService.fetchOrderById(idToFind);
      if (order) {
        // Detect live status change to trigger animation
        if (prevStatusRef.current && prevStatusRef.current !== order.status) {
          setStatusAnimation(true);
          setTimeout(() => setStatusAnimation(false), 2500);
        }
        prevStatusRef.current = order.status;
        setCurrentOrder(order);
        setLastSyncTime(new Date());
      } else {
        // Try fallback to local orders matching mobile number or ID
        const allOrders = dataService.getOrders();
        const cleanQuery = String(idToFind).trim().toLowerCase();
        const matched = allOrders.find(o => 
          String(o.orderId).toLowerCase() === cleanQuery ||
          String(o.customer?.phone || '').includes(cleanQuery)
        );
        if (matched) {
          setCurrentOrder(matched);
          setLastSyncTime(new Date());
        } else if (showLoader) {
          setErrorMessage(`No order found matching "${idToFind}". Please verify your Order ID.`);
        }
      }
    } catch (err) {
      console.warn("Live sync error:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
      prevStatusRef.current = initialOrder.status;
    } else if (propOrderId) {
      loadOrder(propOrderId, true);
    } else {
      const lastPlaced = dataService.getLastPlacedOrder();
      if (lastPlaced) {
        setCurrentOrder(lastPlaced);
        prevStatusRef.current = lastPlaced.status;
      }
    }
  }, [propOrderId, initialOrder, loadOrder]);

  // Real-Time Live Sync Hook: Listen to dataService events & poll every 3 seconds
  useEffect(() => {
    if (!isOpen && !inline) return;

    // 1. Subscribe to dataService events (broadcast across tabs and local updates)
    const unsubscribe = dataService.subscribe((event) => {
      if (!event) return;
      const targetId = activeOrderId || currentOrder?.orderId;
      if (!targetId) return;

      if (
        event.type === 'ORDER_STATUS_CHANGED' ||
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDERS_UPDATED'
      ) {
        if (!event.orderId || String(event.orderId).toLowerCase() === String(targetId).toLowerCase()) {
          loadOrder(targetId, false);
        }
      }
    });

    // 2. Poll every 3 seconds for guaranteed real-time synchronization with cloud database
    const pollInterval = setInterval(() => {
      const targetId = activeOrderId || currentOrder?.orderId;
      if (targetId) {
        loadOrder(targetId, false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [isOpen, inline, activeOrderId, currentOrder?.orderId, loadOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadOrder(searchQuery.trim(), true);
    }
  };

  const copyOrderId = () => {
    if (!currentOrder?.orderId) return;
    navigator.clipboard.writeText(currentOrder.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // WhatsApp Support Helper
  const handleWhatsAppStatus = () => {
    if (!currentOrder) return;
    const settings = dataService.getSettings();
    const whatsappNum = (settings.whatsapp || '919566886795').replace(/\D/g, '');
    const text = `💥 *SHARP CRACKERS - ORDER STATUS INQUIRY* 💥\n\n` +
      `📋 *Order ID:* #${currentOrder.orderId}\n` +
      `👤 *Customer Name:* ${currentOrder.customer?.name}\n` +
      `📱 *Phone:* ${currentOrder.customer?.phone}\n` +
      `⚡ *Live Status:* ${currentOrder.status}\n` +
      `💰 *Total Amount:* ${formatCur(currentOrder.grandTotal)}\n\n` +
      `Please provide the latest delivery / dispatch update. Thank you!`;
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen && !inline) return null;

  const status = (currentOrder?.status || 'Pending');
  const normalizedStatus = status.toLowerCase();

  // Progress Pipeline Stages:
  // Step 1: Pending (Order Placed)
  // Step 2: Processing (Packing at Factory)
  // Step 3: Completed (Dispatched / Ready)
  const isCancelled = normalizedStatus === 'cancelled';
  const isPending = normalizedStatus === 'pending';
  const isProcessing = normalizedStatus === 'processing';
  const isCompleted = normalizedStatus === 'completed';

  let currentStep = 1;
  if (isProcessing) currentStep = 2;
  if (isCompleted) currentStep = 3;

  const content = (
    <div className={`live-tracker-box ${inline ? 'tracker-inline' : 'tracker-modal-card card'}`}>
      {/* Header */}
      <div className="tracker-header">
        <div className="tracker-header-title-wrap">
          <div className="tracker-badge-live">
            <span className="live-radar-dot"></span>
            <span>LIVE SYNC ACTIVE</span>
          </div>
          <h2 className="tracker-title">Live Order Status Tracker</h2>
          <span className="tracker-tamil-subtitle">நேரலை ஆர்டர் நிலை கண்காணிப்பு</span>
        </div>

        {!inline && onClose && (
          <button 
            type="button" 
            onClick={onClose} 
            className="tracker-close-btn"
            title="Close tracker"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search / Order Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="tracker-lookup-form">
        <div className="lookup-input-wrapper">
          <Search size={18} className="lookup-search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. SC-2026-0006) or Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lookup-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')} 
              className="lookup-clear-btn"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button 
          type="submit" 
          disabled={loading || !searchQuery.trim()} 
          className="btn btn-primary lookup-submit-btn"
        >
          {loading ? (
            <RefreshCw size={15} className="spin-icon" />
          ) : (
            <Search size={15} />
          )}
          <span>Track</span>
        </button>
      </form>

      {errorMessage && (
        <div className="tracker-error-alert">
          <XCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentOrder ? (
        <div className="tracker-order-details-pane">
          {/* Top Order Hero Bar */}
          <div className="tracker-hero-bar">
            <div className="hero-id-col">
              <span className="hero-label">Order Identifier</span>
              <div className="hero-id-wrap">
                <strong className="hero-order-id">#{currentOrder.orderId}</strong>
                <button 
                  type="button" 
                  onClick={copyOrderId} 
                  className="hero-copy-btn" 
                  title="Copy Order ID"
                >
                  {copiedId ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="hero-date">
                Placed: {new Date(currentOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(currentOrder.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {/* LIVE STATUS BADGE (Matches user's screenshot exactly) */}
            <div className={`hero-status-col status-hero-${normalizedStatus} ${statusAnimation ? 'status-just-updated' : ''}`}>
              <span className="hero-status-label">Current Live Status</span>
              <div className={`status-display-pill status-${normalizedStatus}`}>
                {isPending && <Clock size={16} />}
                {isProcessing && <RefreshCw size={16} className="spin-icon-slow" />}
                {isCompleted && <CheckCircle size={16} />}
                {isCancelled && <XCircle size={16} />}
                <span className="status-text">{status}</span>
              </div>
              <span className="live-sync-timestamp">
                <span className="mini-pulse-dot"></span>
                Updated: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* 3-STEP VISUAL PROGRESS PIPELINE */}
          {!isCancelled ? (
            <div className="tracker-stepper-card">
              <div className="stepper-track-line">
                <div 
                  className="stepper-track-progress" 
                  style={{ 
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                    background: currentStep === 3 
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                  }}
                ></div>
              </div>

              <div className="stepper-stages-grid">
                {/* Step 1: Pending */}
                <div className={`stepper-stage ${currentStep >= 1 ? 'stage-reached' : ''} ${currentStep === 1 ? 'stage-current' : ''}`}>
                  <div className="stage-icon-circle">
                    {currentStep > 1 ? <Check size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="stage-info">
                    <strong className="stage-title">1. Order Placed</strong>
                    <span className="stage-desc">Received at Sivakasi factory desk</span>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className={`stepper-stage ${currentStep >= 2 ? 'stage-reached' : ''} ${currentStep === 2 ? 'stage-current' : ''}`}>
                  <div className="stage-icon-circle">
                    {currentStep > 2 ? <Check size={18} /> : <Package size={18} />}
                  </div>
                  <div className="stage-info">
                    <strong className="stage-title">2. Processing</strong>
                    <span className="stage-desc">Packing & quality verification</span>
                  </div>
                </div>

                {/* Step 3: Completed */}
                <div className={`stepper-stage ${currentStep >= 3 ? 'stage-reached' : ''} ${currentStep === 3 ? 'stage-current' : ''}`}>
                  <div className="stage-icon-circle">
                    {currentStep >= 3 ? <CheckCircle size={18} /> : <Truck size={18} />}
                  </div>
                  <div className="stage-info">
                    <strong className="stage-title">3. Completed</strong>
                    <span className="stage-desc">Ready for pickup / Dispatched</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="tracker-cancelled-alert">
              <XCircle size={22} className="text-red" />
              <div>
                <strong>Order Cancelled</strong>
                <p>This booking has been cancelled. If this is a mistake, please contact our Sivakasi desk directly.</p>
              </div>
            </div>
          )}

          {/* Customer & Order Summary Grid */}
          <div className="tracker-summary-grid">
            <div className="summary-card">
              <span className="summary-label">Customer Details</span>
              <strong className="summary-val">{currentOrder.customer?.name}</strong>
              <a href={`tel:${currentOrder.customer?.phone}`} className="summary-phone">
                <PhoneCall size={13} />
                <span>{currentOrder.customer?.phone}</span>
              </a>
              {currentOrder.customer?.email && (
                <span className="summary-sub">{currentOrder.customer.email}</span>
              )}
            </div>

            <div className="summary-card">
              <span className="summary-label">Delivery & Booking</span>
              <strong className="summary-val">
                {currentOrder.customer?.deliveryType ? String(currentOrder.customer.deliveryType).toUpperCase() : 'STANDARD BOOKING'}
              </strong>
              {currentOrder.customer?.address ? (
                <span className="summary-sub" title={currentOrder.customer.address}>
                  {currentOrder.customer.address}
                </span>
              ) : (
                <span className="summary-sub">Sivakasi Direct Booking</span>
              )}
            </div>

            <div className="summary-card">
              <span className="summary-label">Total Amount</span>
              <strong className="summary-val text-red font-bold">
                {formatCur(currentOrder.grandTotal)}
              </strong>
              <span className="summary-sub">
                {(currentOrder.items || []).length} varieties ({(currentOrder.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes)
              </span>
            </div>
          </div>

          {/* Ordered Products Accordion */}
          <div className="tracker-items-section">
            <button 
              type="button" 
              onClick={() => setShowItems(!showItems)} 
              className="items-accordion-trigger"
            >
              <span>View Ordered Firecrackers ({(currentOrder.items || []).length})</span>
              {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showItems && (
              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Pack</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentOrder.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{it.name}</strong>
                          {it.code && <span className="item-sku-sub">({it.code})</span>}
                        </td>
                        <td className="text-center">{it.packDetails || '1 Box'}</td>
                        <td className="text-center">
                          <span className="qty-tag">{it.quantity}</span>
                        </td>
                        <td className="text-right font-bold">{formatCur(it.totalPrice || it.unitPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="tracker-actions-row">
            <CreativeActionButton
              variant="pdf"
              onClick={() => {
                const settings = dataService.getSettings();
                generateOrderPdf(currentOrder, settings, true);
              }}
              label="Download PDF Bill"
              size="md"
            />
            <CreativeActionButton
              variant="print"
              onClick={() => {
                const settings = dataService.getSettings();
                printOrderDocument(currentOrder, settings);
              }}
              label="Print Order Sheet"
              size="md"
            />
            <button 
              type="button" 
              onClick={handleWhatsAppStatus} 
              className="btn btn-whatsapp-track"
              title="Chat with Sivakasi factory desk on WhatsApp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Support</span>
            </button>
            {inline && onContinueShopping && (
              <button 
                type="button" 
                onClick={onContinueShopping} 
                className="btn btn-outline-dark ml-auto"
              >
                <span>Continue Shopping</span>
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="tracker-empty-search">
          <Package size={48} className="text-muted" />
          <h3>Track Your Sivakasi Firecracker Order</h3>
          <p>
            Enter your 10-digit mobile number or Order ID (e.g. <code>SC-2026-0006</code>) in the search box above to check real-time status and download your invoice.
          </p>
        </div>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="tracker-modal-overlay">
      <div className="tracker-modal-backdrop" onClick={onClose}></div>
      <div className="tracker-modal-container">
        {content}
      </div>
    </div>
  );
};

export default LiveOrderTrackerModal;
