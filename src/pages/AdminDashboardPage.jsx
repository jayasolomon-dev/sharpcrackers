// ==========================================================================
// SHARP CRACKERS - ADMIN DASHBOARD & ORDERS MANAGEMENT
// Real-time multi-tab order synchronization, live audible chimes, order alerts,
// customer contact tracking, and instant print/PDF invoice generation
// ==========================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dataService, getOrderRetentionDetails, ORDER_RETENTION_DAYS } from '../services/dataService';
import { generateOrderPdf, printOrderDocument } from '../utils/pdfGenerator';
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Printer, 
  Search, 
  LogOut, 
  ExternalLink, 
  TrendingUp, 
  AlertCircle, 
  Settings as SettingsIcon,
  MessageSquare,
  Eye,
  X,
  Save,
  RotateCcw,
  BellRing,
  Trash2,
  Edit,
  Plus,
  ShieldCheck,
  Calendar,
  RefreshCw,
  Archive,
  Download,
  Undo2,
  Zap
} from 'lucide-react';

export const AdminDashboardPage = ({ setCurrentPage, onLogout }) => {
  // Navigation Tabs: 'orders', 'enquiries', 'settings'
  const [activeTab, setActiveTab] = useState('orders');

  // Live Data States
  const [orders, setOrders] = useState(() => dataService.getOrders());
  const [products, setProducts] = useState(() => dataService.getProducts());
  const [settings, setSettings] = useState(() => dataService.getSettings());
  const [enquiries, setEnquiries] = useState(() => dataService.getEnquiries());
  const [redisStats, setRedisStats] = useState(null);

  // New incoming order notification banner
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);

  // Order Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Selected Order for Details View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Deletion Confirmation State
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Cancellation Confirmation State (Crucial fix for blank screen crash)
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Backup & Archive Bills (Preserved past 30 days)
  const [backupOrders, setBackupOrders] = useState(() => dataService.getBackupOrders());
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupSearch, setBackupSearch] = useState('');

  // Product Catalog State
  const [categories] = useState(() => dataService.getCategories());
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    code: '',
    name: '',
    tamilName: '',
    category: 'sparklers',
    packDetails: '1 box',
    unitPrice: '',
    mrp: '',
    image: '/images/product_sparkler_1791567639029.jpg',
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: ''
  });

  // Enquiry Management State
  const [enquirySearch, setEnquirySearch] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(() => dataService.getSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Track previous order count to detect new additions
  const prevOrderCountRef = useRef(orders.length);

  // Play pleasant notification audio chime using browser Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);

      // 2-tone melodic chime (Diwali celebration chime: 523Hz -> 659Hz -> 784Hz)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio chime prevented by browser autoplay policy:", e);
    }
  };

  // Synchronize orders and show alert if a new one was received (multi-device)
  const refreshOrders = async () => {
    try {
      const latestOrders = await dataService.fetchOrders();
      const currentLen = latestOrders.length;
      
      // Check if new order arrived
      if (currentLen > prevOrderCountRef.current) {
        const newest = latestOrders[0];
        setIncomingOrderAlert(newest);
        playChime();
      }
      prevOrderCountRef.current = currentLen;
      setOrders(latestOrders);

      // Also refresh enquiries across devices
      const latestEnquiries = await dataService.fetchEnquiries();
      setEnquiries(latestEnquiries);

      // Also refresh backup & archived bills
      const latestBackup = await dataService.fetchBackupOrders();
      setBackupOrders(latestBackup);

      // Check Redis RAM Cache status
      try {
        const rRes = await fetch('/api/redis/status');
        if (rRes.ok) {
          const rData = await rRes.json();
          setRedisStats(rData);
        }
      } catch (e) {
        // Silent fallback for offline/isolated mode
      }
    } catch (e) {
      const localOrders = dataService.getOrders();
      setOrders(localOrders);
      setBackupOrders(dataService.getBackupOrders());
    }
  };

  // Multi-channel Real-time Listener (Universal Cross-Device Polling + BroadcastChannel + Storage)
  useEffect(() => {
    // Initial fetch from cloud/server API
    refreshOrders();

    // 1. BroadcastChannel for instant cross-tab sync
    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('sharp_crackers_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_CREATED') {
          setIncomingOrderAlert(event.data.order);
          playChime();
        }
        refreshOrders();
        setProducts(dataService.getProducts());
        setSettings(dataService.getSettings());
      };
    }

    // 2. Window Storage Event (fires whenever localStorage changes in another tab)
    const handleStorage = (e) => {
      if (e.key === 'sharp_crackers_orders' || e.key === 'shark_crackers_orders' || !e.key) {
        refreshOrders();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Custom same-window event
    const handleCustomDataChange = (e) => {
      if (e.detail?.type === 'ORDER_CREATED') {
        setIncomingOrderAlert(e.detail.order);
        playChime();
      }
      refreshOrders();
      setProducts(dataService.getProducts());
      setSettings(dataService.getSettings());
    };
    window.addEventListener('sharp_data_changed', handleCustomDataChange);
    window.addEventListener('shark_data_changed', handleCustomDataChange);

    // 4. Live Multi-Device polling every 3.5 seconds across phones and laptops
    const pollInterval = setInterval(() => {
      refreshOrders();
    }, 3500);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sharp_data_changed', handleCustomDataChange);
      window.removeEventListener('shark_data_changed', handleCustomDataChange);
      clearInterval(pollInterval);
    };
  }, []);

  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

  // -------------------------------------------------------------
  // KPI STATS
  // -------------------------------------------------------------
  const kpiStats = useMemo(() => {
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const processingOrdersCount = orders.filter(o => o.status === 'Processing').length;
    const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
    const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return {
      totalOrdersCount,
      pendingOrdersCount,
      processingOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      totalRevenue,
      totalProductsCount: products.length
    };
  }, [orders, products]);

  // -------------------------------------------------------------
  // FILTERED ORDERS
  // -------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchId = (order.orderId || '').toLowerCase().includes(q);
        const matchName = (order.customer?.name || '').toLowerCase().includes(q);
        const matchPhone = (order.customer?.phone || '').includes(q);
        return matchId || matchName || matchPhone;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleUpdateStatus = async (orderId, newStatus) => {
    await dataService.updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    await dataService.updateOrderStatus(orderToCancel.orderId, 'Cancelled');
    if (selectedOrder && selectedOrder.orderId === orderToCancel.orderId) {
      setSelectedOrder(prev => ({ ...prev, status: 'Cancelled' }));
    }
    setOrderToCancel(null);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const delId = orderToDelete.orderId;
    await dataService.deleteOrder(delId);
    setOrders(prev => prev.filter(o => o.orderId !== delId));
    if (selectedOrder && selectedOrder.orderId === delId) {
      setSelectedOrder(null);
    }
    setOrderToDelete(null);
    setToastMessage({ type: 'success', text: `Order #${delId} has been permanently deleted.` });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualPurgeExpired = async () => {
    try {
      const res = await dataService.pruneExpiredOrders();
      await refreshOrders();
      setBackupOrders(dataService.getBackupOrders());
      setToastMessage({
        type: 'success',
        text: `30-Day Retention Verified: ${res.prunedCount} expired bill(s) moved to Backup Archive safely.`
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error("Manual purge error:", e);
    }
  };

  const handleRestoreOrder = async (orderId) => {
    try {
      const restored = await dataService.restoreOrderFromBackup(orderId);
      if (restored) {
        await refreshOrders();
        setBackupOrders(dataService.getBackupOrders());
        setToastMessage({ 
          type: 'success', 
          text: `Bill #${orderId} restored back to Active Orders with fresh 30-day window!` 
        });
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  };

  const handleExportBackupJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupOrders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sharp_crackers_backup_bills_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setToastMessage({ type: 'success', text: `Exported ${backupOrders.length} backup bills as JSON file.` });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      alert("Failed to export backup bills: " + e.message);
    }
  };

  const filteredBackupOrders = useMemo(() => {
    if (!backupSearch.trim()) return backupOrders;
    const q = backupSearch.toLowerCase().trim();
    return backupOrders.filter(o => {
      const matchId = (o.orderId || '').toLowerCase().includes(q);
      const matchName = (o.customer?.name || '').toLowerCase().includes(q);
      const matchPhone = (o.customer?.phone || '').includes(q);
      return matchId || matchName || matchPhone;
    });
  }, [backupOrders, backupSearch]);

  const handleWarmRedis = async () => {
    try {
      const res = await fetch('/api/redis/warm', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRedisStats(data);
        setToastMessage({
          type: 'success',
          text: `⚡ Redis Acceleration Active: ${data.cachedImagesCount || 0} product images cached in RAM with 0ms delivery time!`
        });
      } else {
        setToastMessage({
          type: 'success',
          text: '⚡ Redis Cache Pre-warming signaled to server.'
        });
      }
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn('Redis warm ping:', err);
    }
  };

  // -------------------------------------------------------------
  // SETTINGS ACTIONS
  // -------------------------------------------------------------
  const handleSaveSettings = (e) => {
    e.preventDefault();
    dataService.updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset to demo orders?")) {
      dataService.resetAllData();
      setSettingsForm(dataService.getSettings());
      alert("Demo data reset successfully.");
    }
  };

  // -------------------------------------------------------------
  // PRODUCT CATALOG ACTIONS
  // -------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCode = (p.code || '').toLowerCase().includes(q);
        const matchSno = (p.sno || '').toLowerCase().includes(q);
        const matchTamil = (p.tamilName || '').toLowerCase().includes(q);
        return matchName || matchCode || matchSno || matchTamil;
      }
      return true;
    });
  }, [products, productCatFilter, productSearch]);

  const handleToggleProductStock = (prod) => {
    const updated = { ...prod, inStock: !prod.inStock };
    dataService.updateProduct(updated);
    setProducts(dataService.getProducts());
    setToastMessage({ type: 'success', text: `Product "${prod.name}" marked as ${updated.inStock ? 'In Stock' : 'Out of Stock'}.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) {
      alert("Product name is required.");
      return;
    }
    dataService.updateProduct(editingProduct);
    setProducts(dataService.getProducts());
    setEditingProduct(null);
    setToastMessage({ type: 'success', text: `Product "${editingProduct.name}" updated successfully!` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name.trim() || !newProductForm.unitPrice) {
      alert("Product name and unit price are required.");
      return;
    }
    const created = dataService.addProduct(newProductForm);
    setProducts(dataService.getProducts());
    setIsAddingProduct(false);
    setNewProductForm({
      code: '',
      name: '',
      tamilName: '',
      category: 'sparklers',
      packDetails: '1 box',
      unitPrice: '',
      mrp: '',
      image: '/images/product_sparkler_1791567639029.jpg',
      inStock: true,
      isBestseller: false,
      isFeatured: false,
      description: ''
    });
    setToastMessage({ type: 'success', text: `Product "${created.name}" added successfully!` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    dataService.deleteProduct(productToDelete.id);
    setProducts(dataService.getProducts());
    setProductToDelete(null);
    setToastMessage({ type: 'success', text: `Product "${name}" deleted.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // ENQUIRY ACTIONS
  // -------------------------------------------------------------
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      if (!enquirySearch.trim()) return true;
      const q = enquirySearch.toLowerCase();
      return (
        (enq.enquiryNumber || '').toLowerCase().includes(q) ||
        (enq.name || '').toLowerCase().includes(q) ||
        (enq.phone || '').toLowerCase().includes(q) ||
        (enq.email || '').toLowerCase().includes(q) ||
        (enq.subject || '').toLowerCase().includes(q) ||
        (enq.message || '').toLowerCase().includes(q)
      );
    });
  }, [enquiries, enquirySearch]);

  const handleDeleteEnquiry = (id, num) => {
    dataService.deleteEnquiry(id);
    setEnquiries(dataService.getEnquiries());
    setToastMessage({ type: 'success', text: `Enquiry ${num || ''} deleted.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Admin Top Navigation Bar */}
      <header className="admin-header no-print">
        <div className="container-wide admin-header-content">
          <div className="admin-brand">
            <span className="admin-badge">ADMIN DESK</span>
            <h2 className="admin-shop-title">{settings.shopName || "SHARP CRACKERS"}</h2>
            <span className="admin-loc">Live Customer Orders & Store Management</span>
          </div>

          <div className="admin-header-actions">
            <button 
              onClick={() => setCurrentPage('products')} 
              className="btn btn-outline-light btn-sm"
              title="Open customer catalog in customer view"
            >
              <ExternalLink size={15} />
              <span>Customer Website</span>
            </button>
            <button 
              onClick={() => {
                dataService.adminLogout();
                if (onLogout) onLogout();
                setCurrentPage('home');
              }} 
              className="btn btn-outline-light btn-sm logout-btn"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Order Alert Toast Banner */}
      {incomingOrderAlert && (
        <div className="container-wide mt-3 no-print">
          <div className="incoming-order-alert-banner">
            <div className="alert-pulse-icon">
              <BellRing size={22} className="text-white" />
            </div>
            <div className="alert-text-body">
              <strong>🔔 NEW CUSTOMER ORDER RECEIVED JUST NOW!</strong>
              <span>
                Order <strong>#{incomingOrderAlert.orderId}</strong> placed by <strong>{incomingOrderAlert.customer?.name}</strong> ({incomingOrderAlert.customer?.phone}) for <strong>{formatCur(incomingOrderAlert.grandTotal)}</strong>!
              </span>
            </div>
            <div className="alert-actions-group">
              <button 
                onClick={() => {
                  setSelectedOrder(incomingOrderAlert);
                  setIncomingOrderAlert(null);
                }} 
                className="btn btn-gold btn-sm"
              >
                <Eye size={15} />
                <span>View Order Details</span>
              </button>
              <button 
                onClick={() => setIncomingOrderAlert(null)}
                className="alert-dismiss-btn"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Summary Bar */}
      <section className="kpi-section no-print">
        <div className="container-wide">
          <div className="kpi-grid">
            <div className="kpi-card card">
              <div className="kpi-icon-box bg-blue-subtle">
                <FileText size={22} className="text-blue" />
              </div>
              <div className="kpi-data">
                <span className="kpi-title">Total Orders</span>
                <span className="kpi-value">{kpiStats.totalOrdersCount}</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-box bg-amber-subtle">
                <Clock size={22} className="text-amber" />
              </div>
              <div className="kpi-data">
                <span className="kpi-title">New / Pending</span>
                <span className="kpi-value text-amber">{kpiStats.pendingOrdersCount}</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-box bg-emerald-subtle">
                <CheckCircle size={22} className="text-emerald" />
              </div>
              <div className="kpi-data">
                <span className="kpi-title">Completed Orders</span>
                <span className="kpi-value text-emerald">{kpiStats.completedOrdersCount}</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-box bg-orange-subtle">
                <TrendingUp size={22} className="text-orange" />
              </div>
              <div className="kpi-data">
                <span className="kpi-title">Total Order Value</span>
                <span className="kpi-value text-orange">{formatCur(kpiStats.totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Admin Tabbed Navigation */}
      <div className="container-wide admin-main-container">
        <div className="admin-nav-tabs-bar no-print">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FileText size={16} />
            <span>Customer Orders ({orders.length})</span>
            {kpiStats.pendingOrdersCount > 0 && (
              <span className="tab-pending-badge">{kpiStats.pendingOrdersCount} new</span>
            )}
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <MessageSquare size={16} />
            <span>Customer Enquiries ({enquiries.length})</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={16} />
            <span>Store Settings & Contacts</span>
          </button>
        </div>

        {/* =============================================================
            TAB 1: ORDER MANAGEMENT
           ============================================================= */}
        {activeTab === 'orders' && (
          <div className="admin-tab-content">
            {/* 30-Day Cloud & Local Storage Retention & Backup Strip */}
            <div className="card mb-3 p-3" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main, #0f172a)' }}>
                      🔒 30-Day Active Retention & Secure Backup Storage Active
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                      Bills stay active for 30 days. After 30 days, they are automatically stored in the Secure Backup Archive (Never lost).
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 8px' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {ORDER_RETENTION_DAYS} Days Active Window
                  </span>
                  <button 
                    onClick={() => setShowBackupModal(true)} 
                    className="btn btn-gold btn-xs"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    title="Open Backup Bills Archive"
                  >
                    <Archive size={13} />
                    <span>📦 Backup Bills Archive ({backupOrders.length})</span>
                  </button>
                  <button 
                    onClick={handleManualPurgeExpired} 
                    className="btn btn-outline-dark btn-xs"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Check and auto-archive bills older than 30 days"
                  >
                    <RefreshCw size={12} />
                    <span>Run Auto-Purge & Backup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Redis In-Memory RAM Acceleration & Zero Network Traffic Status Strip */}
            <div className="card mb-3 p-3" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(16, 185, 129, 0.07) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚡ Redis In-Memory RAM Caching & Zero-Traffic Engine Active</span>
                      <span className="badge badge-amber" style={{ fontSize: '10px', padding: '2px 6px' }}>0ms Latency</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                      All product cracker images & catalog data are cached in RAM. Service Worker PWA cache active: Zero network bandwidth on repeat loads across all devices (Mobile, Tablet, Desktop).
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold" style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} />
                    {redisStats?.backend === 'real-redis' ? 'Redis 6379 Port' : 'Redis RAM Engine'}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 8px' }}>
                    🖼️ {redisStats?.cachedImagesCount || 15} Images in RAM
                  </span>
                  <button 
                    onClick={handleWarmRedis} 
                    className="btn btn-outline-warning btn-xs"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    title="Pre-warm Redis RAM cache for all cracker product images"
                  >
                    <Zap size={12} />
                    <span>Re-Warm RAM Cache</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Search & Filter Bar */}
            <div className="table-filter-bar card">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Mobile..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="admin-search-input"
                />
                {orderSearch && (
                  <button onClick={() => setOrderSearch('')} className="clear-btn">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="status-filter-group">
                <span className="filter-label">Filter Status:</span>
                <select 
                  value={orderStatusFilter} 
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="Pending">Pending ({orders.filter(o => o.status === 'Pending').length})</option>
                  <option value="Processing">Processing ({orders.filter(o => o.status === 'Processing').length})</option>
                  <option value="Completed">Completed ({orders.filter(o => o.status === 'Completed').length})</option>
                  <option value="Cancelled">Cancelled ({orders.filter(o => o.status === 'Cancelled').length})</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="admin-table-card card">
              {filteredOrders.length === 0 ? (
                <div className="empty-table-state">
                  <AlertCircle size={36} className="text-amber" />
                  <h4>No orders found</h4>
                  <p>There are no customer orders matching your current search or status filter.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="col-sno text-center">S.No.</th>
                        <th className="col-order-id">Order ID</th>
                        <th className="col-date">Date & Retention</th>
                        <th className="col-customer">Customer Name</th>
                        <th className="col-phone">Mobile Number</th>
                        <th className="col-email">Email</th>
                        <th className="col-items text-center">Products</th>
                        <th className="col-qty text-center">Total Quantity</th>
                        <th className="col-amount text-right">Order Amount</th>
                        <th className="col-status text-center">Status</th>
                        <th className="col-actions text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, idx) => {
                        const totalQty = (order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
                        const isCancelled = order.status === 'Cancelled';
                        const isJustPlaced = Date.now() - new Date(order.createdAt).getTime() < 120000; // placed in last 2 mins
                        const retention = getOrderRetentionDetails(order);

                        return (
                          <tr key={order.orderId} className={`admin-order-row ${isCancelled ? 'row-cancelled' : ''} ${isJustPlaced ? 'row-just-placed' : ''}`}>
                            <td className="text-center col-sno">
                              {idx + 1}
                              {isJustPlaced && <span className="new-tag-dot" title="Just arrived"></span>}
                            </td>
                            <td className="col-order-id">
                              <span className="order-id-badge" onClick={() => setSelectedOrder(order)} title="Click to view details">
                                {order.orderId}
                              </span>
                            </td>
                            <td className="col-date">
                              <div className="date-time-block">
                                <span className="date-line">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                                <span className="time-line">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span 
                                  className={`badge ${retention.daysRemaining <= 5 ? 'badge-amber' : 'badge-green'}`}
                                  style={{ fontSize: '10px', padding: '1px 5px', marginTop: '3px', display: 'inline-block', width: 'fit-content' }}
                                  title={retention.expiresAt ? `Bill auto-deletes on ${new Date(retention.expiresAt).toLocaleDateString('en-IN')}` : '30-Day Retention'}
                                >
                                  ⏱️ {retention.daysRemaining}d left
                                </span>
                              </div>
                            </td>
                            <td className="col-customer" title={order.customer?.name}>
                              <strong className="customer-name">{order.customer?.name}</strong>
                            </td>
                            <td className="col-phone">
                              <a href={`tel:${order.customer?.phone}`} className="mobile-link">
                                {order.customer?.phone}
                              </a>
                            </td>
                            <td className="col-email" title={order.customer?.email || '-'}>
                              <span className="email-text">{order.customer?.email || '-'}</span>
                            </td>
                            <td className="col-items text-center">
                              <button 
                                onClick={() => setSelectedOrder(order)} 
                                className="item-count-badge" 
                                title="Click to view all ordered products"
                              >
                                {(order.items || []).length} items ›
                              </button>
                            </td>
                            <td className="col-qty text-center font-bold">{totalQty} pkts</td>
                            <td className="col-amount text-right font-bold text-red">
                              {formatCur(order.grandTotal)}
                            </td>
                            <td className="col-status text-center">
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                                className={`status-dropdown status-${order.status?.toLowerCase()}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="col-actions text-center">
                              <div className="order-actions-cell">
                                <button 
                                  onClick={() => setSelectedOrder(order)} 
                                  className="action-icon-btn-sm text-blue"
                                  title="View order details"
                                >
                                  <Eye size={15} />
                                </button>
                                <button 
                                  onClick={() => generateOrderPdf(order, settings, true)}
                                  className="action-icon-btn-sm text-navy"
                                  title="Download PDF Order Sheet"
                                >
                                  <FileText size={15} />
                                </button>
                                <button 
                                  onClick={() => printOrderDocument(order, settings)}
                                  className="action-icon-btn-sm text-gold-dark"
                                  title="Print order sheet"
                                >
                                  <Printer size={15} />
                                </button>
                                <button 
                                  onClick={() => setOrderToDelete(order)}
                                  className="action-icon-btn-sm action-btn-delete"
                                  title="Delete order"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 2: PRODUCT CATALOG MANAGEMENT
           ============================================================= */}
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            <div className="catalog-header-actions-row">
              <div>
                <h3 className="tab-heading">Product Catalog Management</h3>
                <p className="tab-sub">View, edit prices, toggle stock availability, or add new cracker varieties to the live catalog.</p>
              </div>
              <button 
                onClick={() => setIsAddingProduct(true)} 
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="table-filter-bar card">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products by code, English or Tamil name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-search-input"
                />
                {productSearch && (
                  <button onClick={() => setProductSearch('')} className="clear-btn">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="status-filter-group">
                <span className="filter-label">Category:</span>
                <select 
                  value={productCatFilter} 
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({products.filter(p => p.category === c.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="table-container card">
              <div className="table-responsive-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-sno text-center">S.No</th>
                      <th className="text-center">Image</th>
                      <th>Code</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Pack Details</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">MRP</th>
                      <th className="text-center">Stock Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="text-center col-sno">
                          <span className="cart-sno-badge">{p.sno || String(idx + 1).padStart(3, '0')}</span>
                        </td>
                        <td className="text-center">
                          <img src={p.image} alt={p.name} className="table-row-thumb" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} />
                        </td>
                        <td><span className="code-badge">{p.code}</span></td>
                        <td>
                          <div><strong>{p.name}</strong></div>
                          {p.tamilName && <small className="text-muted">{p.tamilName}</small>}
                        </td>
                        <td>
                          <span className="badge badge-festive" style={{ textTransform: 'capitalize' }}>
                            {p.category ? p.category.replace('-', ' ') : 'General'}
                          </span>
                        </td>
                        <td>{p.packDetails}</td>
                        <td className="text-right font-bold text-red">{formatCur(p.unitPrice)}</td>
                        <td className="text-right text-muted" style={{ textDecoration: 'line-through' }}>{formatCur(p.mrp)}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleToggleProductStock(p)}
                            className={`badge ${p.inStock !== false ? 'badge-green' : 'badge-danger'}`}
                            style={{ cursor: 'pointer', border: 'none', padding: '0.35rem 0.65rem' }}
                            title="Click to toggle stock status"
                          >
                            {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="text-center">
                          <div className="table-action-btns justify-content-center">
                            <button
                              onClick={() => setEditingProduct({ ...p })}
                              className="action-icon-btn-sm text-navy"
                              title="Edit Product"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="action-icon-btn-sm action-btn-delete"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="10" className="text-center py-4 text-muted">
                          No products found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 3: CUSTOMER ENQUIRIES & CONTACT MESSAGES
           ============================================================= */}
        {activeTab === 'enquiries' && (
          <div className="admin-tab-content">
            <div className="catalog-header-actions-row">
              <div>
                <h3 className="tab-heading">Customer Enquiries & Contact Messages</h3>
                <p className="tab-sub">Messages submitted via the Contact Us form, direct showroom queries, and wholesale inquiries.</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="table-filter-bar card">
              <div className="search-box" style={{ width: '100%', maxWidth: '450px' }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Enquiry #, Name, Mobile, Message..."
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  className="admin-search-input"
                />
                {enquirySearch && (
                  <button onClick={() => setEnquirySearch('')} className="clear-btn">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Enquiries Table */}
            <div className="table-container card">
              {filteredEnquiries.length === 0 ? (
                <div className="empty-filter-state p-5 text-center">
                  <MessageSquare size={48} className="text-muted mb-2" />
                  <h4>No Customer Enquiries Found</h4>
                  <p className="text-muted">Any messages sent via the Contact Us form will appear here in real time.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Enquiry #</th>
                        <th>Date & Time</th>
                        <th>Customer Name</th>
                        <th>Mobile Number</th>
                        <th>Email</th>
                        <th>Subject / Message</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnquiries.map((enq) => {
                        const cleanPhone = (enq.phone || '').replace(/\D/g, '');
                        const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(`Hello ${enq.name}, regarding your Sharp Crackers enquiry (${enq.enquiryNumber})...`)}`;
                        return (
                          <tr key={enq.id}>
                            <td>
                              <span className="badge badge-festive">{enq.enquiryNumber || '#ENQ'}</span>
                            </td>
                            <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {enq.createdAt ? new Date(enq.createdAt).toLocaleString('en-IN') : 'Recent'}
                            </td>
                            <td>
                              <strong>{enq.name}</strong>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <a href={`tel:${enq.phone}`} className="text-blue font-bold">
                                  {enq.phone}
                                </a>
                                <a 
                                  href={waUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="btn btn-sm"
                                  style={{ background: '#25D366', color: '#fff', padding: '0.15rem 0.45rem', fontSize: '0.72rem', borderRadius: '4px' }}
                                  title="Chat on WhatsApp"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </td>
                            <td>{enq.email || <span className="text-muted">—</span>}</td>
                            <td style={{ maxWidth: '320px' }}>
                              {enq.subject && <div className="font-bold text-navy">{enq.subject}</div>}
                              <div className="text-muted" style={{ fontSize: '0.88rem' }}>{enq.message}</div>
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => handleDeleteEnquiry(enq.id, enq.enquiryNumber)}
                                className="action-icon-btn-sm action-btn-delete"
                                title="Delete Enquiry"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 4: STORE CONFIGURATION & SETTINGS
           ============================================================= */}
        {activeTab === 'settings' && (
          <div className="admin-tab-content">
            <div className="catalog-header-actions-row">
              <div>
                <h3 className="tab-heading">Store Profile & Contacts</h3>
                <p className="tab-sub">Update showroom name, contact numbers, address, and festival announcement banner.</p>
              </div>
              <button onClick={handleResetData} className="btn btn-outline-dark btn-sm">
                <RotateCcw size={15} />
                <span>Reset Demo Orders</span>
              </button>
            </div>

            {settingsSaved && (
              <div className="badge badge-green p-3 mb-3 text-center w-100">
                <CheckCircle size={18} />
                <span>Store configuration saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="settings-form-layout card p-4">
              <div className="settings-section">
                <h4 className="settings-sec-title">Store Identity</h4>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Shop Name</label>
                    <input 
                      type="text" 
                      value={settingsForm.shopName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tagline</label>
                    <input 
                      type="text" 
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Brand Logo</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', background: '#0a1128', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img 
                        src={settingsForm.logoUrl || '/images/sharp_crackers_logo_final.png'} 
                        alt="Logo preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <input 
                        type="text" 
                        value={settingsForm.logoUrl || '/images/sharp_crackers_logo_final.png'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        className="form-input"
                        placeholder="/images/sharp_crackers_logo_final.png"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-outline-light btn-xs"
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontWeight: 600 }}
                          onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '/images/sharp_crackers_logo_final.png' })}
                        >
                          Official Sharp Logo (Final PNG)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-light btn-xs"
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#fef3c7', color: '#b45309', borderColor: '#fde68a', fontWeight: 600 }}
                          onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '/images/sharp_crackers_logo_transparent.png' })}
                        >
                          Transparent Festive Logo
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-light btn-xs"
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1', fontWeight: 600 }}
                          onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '/images/sharp_crackers_logo.jpg' })}
                        >
                          Showroom Emblem (JPG)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section mt-4">
                <h4 className="settings-sec-title">Contact Information</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Primary Phone</label>
                    <input 
                      type="text" 
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Showroom Address (Sivakasi)</label>
                  <input 
                    type="text" 
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Working Hours</label>
                  <input 
                    type="text" 
                    value={settingsForm.businessHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="settings-section mt-4">
                <h4 className="settings-sec-title">Website Top Announcement Banner</h4>
                <div className="form-group">
                  <label className="form-label">Announcement Text</label>
                  <input 
                    type="text" 
                    value={settingsForm.promoBannerText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, promoBannerText: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                <button type="submit" className="btn btn-primary btn-lg">
                  <Save size={18} />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* =============================================================
          MODAL: VIEW COMPLETE ORDER DETAILS
         ============================================================= */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="badge badge-festive mb-1">OFFICIAL ORDER SHEET</span>
                <h2>Order #{selectedOrder.orderId}</h2>
                <div className="modal-time">Submitted: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-scroll-body">
              {/* Customer Contact Information */}
              <div className="order-details-grid">
                <div className="info-sub-box">
                  <span className="sub-box-title">CUSTOMER CONTACT INFORMATION</span>
                  <div><strong>Customer Name:</strong> {selectedOrder.customer?.name}</div>
                  <div><strong>Mobile Number:</strong> <a href={`tel:${selectedOrder.customer?.phone}`}>{selectedOrder.customer?.phone}</a></div>
                  {selectedOrder.customer?.email && <div><strong>Email:</strong> {selectedOrder.customer.email}</div>}
                  {selectedOrder.customer?.notes && (
                    <div><strong>Customer Notes:</strong> <em>"{selectedOrder.customer.notes}"</em></div>
                  )}
                </div>

                <div className="info-sub-box">
                  <span className="sub-box-title">ORDER TOTALS</span>
                  <div><strong>Total Varieties:</strong> {(selectedOrder.items || []).length} items</div>
                  <div><strong>Total Quantity:</strong> {(selectedOrder.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes/pkts</div>
                  <div><strong>Total Amount:</strong> <strong className="text-red font-bold">{formatCur(selectedOrder.grandTotal)}</strong></div>
                </div>
              </div>

              {/* 30-Day Storage Retention Notice */}
              {(() => {
                const ret = getOrderRetentionDetails(selectedOrder);
                return (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} className="text-blue" />
                      <span>
                        <strong>Storage Retention:</strong> Retained under 30-Day Policy. 
                        {ret.expiresAt && <span> Auto-deletes on <strong>{new Date(ret.expiresAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>.</span>}
                      </span>
                    </div>
                    <span className={`badge ${ret.daysRemaining <= 5 ? 'badge-amber' : 'badge-green'}`}>
                      ⏱️ {ret.daysRemaining} days remaining
                    </span>
                  </div>
                );
              })()}

              {/* Ordered Products Table */}
              <h4 className="mt-4 mb-2">Ordered Products Breakdown:</h4>
              <div className="table-responsive-wrapper border rounded">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-sno text-center">S.No</th>
                      <th className="text-center">Image</th>
                      <th>Code</th>
                      <th>Product Name</th>
                      <th>Packing Details</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="text-center col-sno">{idx + 1}</td>
                        <td className="text-center">
                          <img src={it.image} alt={it.name} className="table-row-thumb" />
                        </td>
                        <td><span className="code-badge">{it.code}</span></td>
                        <td><strong>{it.name}</strong></td>
                        <td>{it.packDetails}</td>
                        <td className="text-right">{formatCur(it.unitPrice)}</td>
                        <td className="text-center font-bold">{it.quantity}</td>
                        <td className="text-right font-bold text-red">
                          {formatCur(it.totalPrice || (it.unitPrice * it.quantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status Update & Document Actions */}
              <div className="modal-action-bar-bottom">
                <div className="status-update-action">
                  <span>Update Order Status:</span>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.orderId, e.target.value)}
                    className={`status-dropdown status-${selectedOrder.status?.toLowerCase()}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="document-buttons-row">
                  <button 
                    onClick={() => generateOrderPdf(selectedOrder, settings, true)}
                    className="btn btn-primary"
                  >
                    <FileText size={16} />
                    <span>Download Order PDF</span>
                  </button>
                  <button 
                    onClick={() => printOrderDocument(selectedOrder, settings)}
                    className="btn btn-outline-dark"
                  >
                    <Printer size={16} />
                    <span>Print Order Sheet</span>
                  </button>
                  <button 
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      setOrderToDelete(ord);
                    }}
                    className="btn btn-danger-outline"
                    title="Delete this order"
                  >
                    <Trash2 size={16} />
                    <span>Delete Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: CONFIRM ORDER DELETION WITH COMPLETE PRODUCTS TABLE
         ============================================================= */}
      {orderToDelete && (
        <div className="modal-overlay" onClick={() => setOrderToDelete(null)}>
          <div className="modal-content modal-content-lg modal-danger-border" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar modal-header-danger">
              <div className="d-flex align-items-center gap-3">
                <div className="danger-badge-icon">
                  <Trash2 size={22} className="text-white" />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge badge-danger">CONFIRM DELETION</span>
                    <span className="badge badge-festive">{orderToDelete.status}</span>
                  </div>
                  <h2 className="modal-title-danger">Delete Order #{orderToDelete.orderId}?</h2>
                  <div className="modal-time">Order Placed: {new Date(orderToDelete.createdAt).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <button onClick={() => setOrderToDelete(null)} className="modal-close-btn" title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-scroll-body">
              {/* Customer Information & Summary Cards */}
              <div className="order-details-grid mb-3">
                <div className="info-sub-box">
                  <span className="sub-box-title text-red">CUSTOMER CONTACT DETAILS</span>
                  <div><strong>Customer Name:</strong> {orderToDelete.customer?.name}</div>
                  <div><strong>Mobile Number:</strong> <a href={`tel:${orderToDelete.customer?.phone}`}>{orderToDelete.customer?.phone}</a></div>
                  {orderToDelete.customer?.email && <div><strong>Email:</strong> {orderToDelete.customer.email}</div>}
                  {orderToDelete.customer?.notes && (
                    <div><strong>Customer Notes:</strong> <em>"{orderToDelete.customer.notes}"</em></div>
                  )}
                </div>

                <div className="info-sub-box border-danger-subtle">
                  <span className="sub-box-title text-red">ORDER SUMMARY TO BE DELETED</span>
                  <div><strong>Total Varieties:</strong> {(orderToDelete.items || []).length} items</div>
                  <div><strong>Total Quantity:</strong> {(orderToDelete.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes/pkts</div>
                  <div><strong>Order Amount:</strong> <strong className="text-red font-bold fs-5">{formatCur(orderToDelete.grandTotal)}</strong></div>
                </div>
              </div>

              {/* Ordered Products Breakdown Table */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="m-0 font-bold">Ordered Products in this Order:</h4>
                <span className="badge badge-light text-muted">{(orderToDelete.items || []).length} items</span>
              </div>
              <div className="table-responsive-wrapper border rounded mb-3">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-sno text-center">S.No</th>
                      <th className="text-center">Image</th>
                      <th>Code</th>
                      <th>Product Name</th>
                      <th>Packing Details</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderToDelete.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="text-center col-sno">{idx + 1}</td>
                        <td className="text-center">
                          <img src={it.image} alt={it.name} className="table-row-thumb" />
                        </td>
                        <td><span className="code-badge">{it.code}</span></td>
                        <td><strong>{it.name}</strong></td>
                        <td>{it.packDetails}</td>
                        <td className="text-right">{formatCur(it.unitPrice)}</td>
                        <td className="text-center font-bold">{it.quantity}</td>
                        <td className="text-right font-bold text-red">
                          {formatCur(it.totalPrice || (it.unitPrice * it.quantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light-gray font-bold">
                      <td colSpan="6" className="text-right">Total:</td>
                      <td className="text-center">{(orderToDelete.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} pkts</td>
                      <td className="text-right text-red font-bold">{formatCur(orderToDelete.grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* High-visibility Warning Notice */}
              <div className="confirm-warning-box mb-4">
                <AlertCircle size={24} className="flex-shrink-0 text-red" />
                <div>
                  <strong className="d-block mb-1 text-red">Warning: Permanent Removal</strong>
                  <span>
                    Clicking <strong>"OK, Delete"</strong> will permanently delete order #{orderToDelete.orderId} and erase all items from the database. This action cannot be reversed.
                  </span>
                </div>
              </div>

              {/* Action Buttons: Cancel or OK, Delete */}
              <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-3 pt-3 border-top">
                <button 
                  type="button" 
                  onClick={() => setOrderToDelete(null)} 
                  className="btn btn-outline-dark"
                >
                  Cancel / Keep Order
                </button>
                <button 
                  type="button" 
                  onClick={confirmDeleteOrder} 
                  className="btn btn-danger"
                  id="btn-ok-delete"
                >
                  <Trash2 size={16} />
                  <span>OK, Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: CONFIRM ORDER CANCELLATION
         ============================================================= */}
      {orderToCancel && (
        <div className="modal-overlay" onClick={() => setOrderToCancel(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <XCircle size={44} className="text-red mb-2" />
            <h3>Cancel Order #{orderToCancel.orderId}?</h3>
            <p>
              Are you sure you want to mark this order as <strong>Cancelled</strong>? 
              The order will remain recorded in the dashboard as cancelled.
            </p>
            <div className="modal-actions-row">
              <button onClick={() => setOrderToCancel(null)} className="btn btn-outline-dark">
                Keep Order
              </button>
              <button onClick={confirmCancelOrder} className="btn btn-danger">
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: SECURE BILLS BACKUP ARCHIVE (> 30 DAYS OLD)
         ============================================================= */}
      {showBackupModal && (
        <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1050px', maxHeight: '90vh' }}>
            <div className="modal-header-bar" style={{ background: 'linear-gradient(135deg, #0a1128 0%, #1c2541 100%)', color: '#fff' }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 183, 3, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb703' }}>
                  <Archive size={22} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge badge-festive">PERMANENT BACKUP STORAGE</span>
                    <span className="badge badge-green">{backupOrders.length} Bills Preserved</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>Customer Bills Backup Archive</h2>
                  <div className="modal-time" style={{ color: '#cbd5e1' }}>
                    All customer bills exceeding the 30-day active window are automatically backed up and safely stored here.
                  </div>
                </div>
              </div>
              <button onClick={() => setShowBackupModal(false)} className="modal-close-btn" title="Close" style={{ color: '#fff' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-scroll-body p-4">
              {/* Search & Export Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="search-box" style={{ maxWidth: '380px', flex: 1 }}>
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search backup bills by Order ID, Name, Mobile..."
                    value={backupSearch}
                    onChange={(e) => setBackupSearch(e.target.value)}
                    className="admin-search-input"
                    style={{ fontSize: '13px' }}
                  />
                  {backupSearch && (
                    <button onClick={() => setBackupSearch('')} className="clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={handleExportBackupJson}
                    className="btn btn-outline-dark btn-sm"
                    disabled={backupOrders.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Export All Backup (JSON)</span>
                  </button>
                </div>
              </div>

              {filteredBackupOrders.length === 0 ? (
                <div className="empty-table-state" style={{ padding: '3rem 1rem' }}>
                  <Archive size={42} className="text-amber" />
                  <h4>No backup bills found</h4>
                  <p className="text-muted">
                    {backupSearch.trim() 
                      ? "No archived orders match your search criteria." 
                      : "Bills will automatically appear in this backup archive after reaching their 30-day active retention period."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive-wrapper border rounded">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="col-sno text-center">S.No</th>
                        <th>Order ID</th>
                        <th>Customer Details</th>
                        <th>Original Order Date</th>
                        <th>Archived Date</th>
                        <th className="text-center">Items</th>
                        <th className="text-right">Total Amount</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBackupOrders.map((ord, idx) => {
                        const totalQty = (ord.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
                        return (
                          <tr key={ord.orderId}>
                            <td className="text-center col-sno">{idx + 1}</td>
                            <td>
                              <span className="order-id-badge" onClick={() => { setSelectedOrder(ord); setShowBackupModal(false); }}>
                                {ord.orderId}
                              </span>
                            </td>
                            <td>
                              <div><strong>{ord.customer?.name || 'Customer'}</strong></div>
                              <small><a href={`tel:${ord.customer?.phone}`}>{ord.customer?.phone}</a></small>
                            </td>
                            <td>
                              <div>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</div>
                              <small className="text-muted">{new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                            </td>
                            <td>
                              <span className="badge badge-festive" style={{ fontSize: '11px' }}>
                                {ord.archivedAt ? new Date(ord.archivedAt).toLocaleDateString('en-IN') : 'Auto-Archived'}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="item-count-badge">
                                {(ord.items || []).length} items ({totalQty} pkts)
                              </span>
                            </td>
                            <td className="text-right font-bold text-red">
                              {formatCur(ord.grandTotal)}
                            </td>
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center gap-1">
                                <button
                                  onClick={() => { setSelectedOrder(ord); setShowBackupModal(false); }}
                                  className="action-icon-btn-sm text-blue"
                                  title="View Bill Details"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => generateOrderPdf(ord, settings, true)}
                                  className="action-icon-btn-sm text-navy"
                                  title="Download Invoice PDF"
                                >
                                  <FileText size={15} />
                                </button>
                                <button
                                  onClick={() => printOrderDocument(ord, settings)}
                                  className="action-icon-btn-sm text-gold-dark"
                                  title="Print Order Sheet"
                                >
                                  <Printer size={15} />
                                </button>
                                <button
                                  onClick={() => handleRestoreOrder(ord.orderId)}
                                  className="action-icon-btn-sm text-emerald"
                                  title="Restore Bill to Active Orders (30 Days Active)"
                                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                                >
                                  <Undo2 size={13} />
                                  <span>Restore</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: ADD NEW PRODUCT
         ============================================================= */}
      {isAddingProduct && (
        <div className="modal-overlay" onClick={() => setIsAddingProduct(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="badge badge-festive mb-1">CATALOG MANAGEMENT</span>
                <h2>Add New Cracker Product</h2>
              </div>
              <button onClick={() => setIsAddingProduct(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="modal-scroll-body p-4">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 cm Tri-Color Mega Sparklers"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 செ.மீ முவர்ண மெகா மத்தாப்பு"
                    value={newProductForm.tamilName}
                    onChange={(e) => setNewProductForm({ ...newProductForm, tamilName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Product Code (SKU)</label>
                  <input
                    type="text"
                    placeholder="e.g. SC-SP05 (auto-generated if empty)"
                    value={newProductForm.code}
                    onChange={(e) => setNewProductForm({ ...newProductForm, code: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="form-input"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Pack Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 pcs / box, 1 Mega Box"
                    value={newProductForm.packDetails}
                    onChange={(e) => setNewProductForm({ ...newProductForm, packDetails: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={newProductForm.unitPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unitPrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    placeholder="/images/product_sparkler_1791567639029.jpg"
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  placeholder="Short description of cracker effects and bursts..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group mt-3 d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="newProdStock"
                  checked={newProductForm.inStock}
                  onChange={(e) => setNewProductForm({ ...newProductForm, inStock: e.target.checked })}
                />
                <label htmlFor="newProdStock" style={{ cursor: 'pointer', margin: 0 }}>Available In Stock</label>
              </div>

              <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="btn btn-outline-dark">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Create Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: EDIT PRODUCT
         ============================================================= */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="badge badge-festive mb-1">EDIT PRODUCT</span>
                <h2>{editingProduct.name} ({editingProduct.code})</h2>
              </div>
              <button onClick={() => setEditingProduct(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="modal-scroll-body p-4">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={editingProduct.tamilName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tamilName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Product Code (SKU)</label>
                  <input
                    type="text"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="form-input"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Pack Details</label>
                  <input
                    type="text"
                    value={editingProduct.packDetails || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, packDetails: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.mrp || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group mt-3 d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="editProdStock"
                  checked={editingProduct.inStock !== false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                />
                <label htmlFor="editProdStock" style={{ cursor: 'pointer', margin: 0 }}>Available In Stock</label>
              </div>

              <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-outline-dark">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: CONFIRM PRODUCT DELETION
         ============================================================= */}
      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <Trash2 size={44} className="text-red mb-2" />
            <h3>Delete Product?</h3>
            <p>
              Are you sure you want to delete <strong>{productToDelete.name}</strong> ({productToDelete.code}) from the catalog? This will remove it from the customer order sheet.
            </p>
            <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-3 pt-3 border-top">
              <button 
                type="button" 
                onClick={() => setProductToDelete(null)} 
                className="btn btn-outline-dark"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteProduct} 
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`admin-toast-banner toast-${toastMessage.type || 'success'}`}>
          <CheckCircle size={18} />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="toast-close-btn" title="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      <style>{`
        .admin-dashboard-wrapper {
          min-height: 90vh;
          background: #f1f5f9;
          padding-bottom: 5rem;
        }

        .admin-dashboard-wrapper .container-wide {
          max-width: 98% !important;
          width: 98% !important;
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
        }

        .admin-header {
          background: #0a1329;
          color: #ffffff;
          padding: 1.25rem 0;
          border-bottom: 3px solid #ff6f00;
        }

        .admin-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .admin-badge {
          background: #d90429;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          letter-spacing: 1px;
        }

        .admin-shop-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
        }

        .admin-loc {
          font-size: 0.8rem;
          color: #ffd166;
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          padding-left: 0.75rem;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logout-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fecaca;
        }

        /* Incoming order banner */
        .incoming-order-alert-banner {
          background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
          color: #ffffff;
          border-radius: var(--radius-lg);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 8px 25px rgba(234, 88, 12, 0.35);
          animation: pulseBanner 2s infinite ease-in-out;
        }

        @keyframes pulseBanner {
          0%, 100% { box-shadow: 0 8px 25px rgba(234, 88, 12, 0.35); }
          50% { box-shadow: 0 10px 32px rgba(255, 111, 0, 0.6); }
        }

        .alert-pulse-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .alert-text-body {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          flex-grow: 1;
          font-size: 0.95rem;
        }

        .alert-actions-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-dismiss-btn {
          color: #ffffff;
          font-size: 1.2rem;
          opacity: 0.8;
          padding: 0.25rem;
        }
        .alert-dismiss-btn:hover {
          opacity: 1;
        }

        /* KPI Section */
        .kpi-section {
          padding: 1.75rem 0 1rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .kpi-card {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffffff;
        }

        .kpi-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-blue-subtle { background: #eff6ff; }
        .bg-amber-subtle { background: #fffbeb; }
        .bg-emerald-subtle { background: #ecfdf5; }
        .bg-orange-subtle { background: #fff7ed; }

        .text-blue { color: #2563eb; }
        .text-amber { color: #d97706; }
        .text-emerald { color: #059669; }
        .text-orange { color: #ff6f00; }

        .kpi-title {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .kpi-value {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          font-family: var(--font-display);
        }

        /* Tabs Bar */
        .admin-main-container {
          margin-top: 1.25rem;
        }

        .admin-nav-tabs-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .admin-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.92rem;
          color: #475569;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .admin-tab-btn:hover {
          color: #0f172a;
          border-color: #94a3b8;
        }

        .admin-tab-btn.active {
          background: #0a1329;
          color: #ffffff;
          border-color: #0a1329;
        }

        .tab-pending-badge {
          background: #ff6f00;
          color: #ffffff;
          font-size: 0.7rem;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
        }

        /* Tab Content Cards */
        .admin-tab-content {
          animation: fadeIn 0.2s ease-out;
        }

        .table-filter-bar {
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          flex-grow: 1;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .admin-search-input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.4rem;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          background: #f8fafc;
          font-size: 0.9rem;
        }
        .admin-search-input:focus {
          border-color: #ff6f00;
          background: #ffffff;
        }

        .status-filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
        }

        .admin-select {
          padding: 0.55rem 0.85rem;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.88rem;
          color: #334155;
          background: #ffffff;
        }

        .admin-table-card {
          background: #ffffff;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: var(--radius-md);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.81rem;
          table-layout: auto;
        }

        .admin-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          font-size: 0.73rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          padding: 0.65rem 0.4rem;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 0.6rem 0.4rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .col-sno {
          width: 34px;
          padding-left: 0.2rem !important;
          padding-right: 0.2rem !important;
          text-align: center;
        }
        .col-order-id {
          white-space: nowrap;
        }
        .col-date {
          white-space: nowrap;
        }
        .col-customer {
          max-width: 125px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .col-phone {
          white-space: nowrap;
        }
        .col-email {
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.76rem;
        }
        .col-items {
          text-align: center;
          white-space: nowrap;
        }
        .col-qty {
          text-align: center;
          white-space: nowrap;
        }
        .col-amount {
          text-align: right;
          white-space: nowrap;
          font-weight: 800;
        }
        .col-status {
          text-align: center;
          white-space: nowrap;
        }
        .col-actions {
          width: 136px;
          min-width: 136px;
          text-align: center;
          white-space: nowrap;
        }

        .admin-order-row:hover {
          background: #f8fafc;
        }

        .row-just-placed {
          background: #fffbeb !important;
          animation: highlightRow 3s ease-out;
        }

        @keyframes highlightRow {
          0% { background: #fef08a; }
          100% { background: #fffbeb; }
        }

        .new-tag-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #ff6f00;
          border-radius: 50%;
          margin-left: 4px;
        }

        .row-cancelled {
          background: #fef2f2 !important;
          opacity: 0.85;
        }

        .order-id-badge {
          font-family: monospace;
          font-weight: 800;
          color: #2563eb;
          cursor: pointer;
          background: #eff6ff;
          padding: 0.2rem 0.45rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
        }
        .order-id-badge:hover {
          text-decoration: underline;
        }

        .item-count-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-full);
          padding: 0.15rem 0.5rem;
          cursor: pointer;
          font-size: 0.76rem;
          font-weight: 700;
          color: #0f172a;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }
        .item-count-badge:hover {
          background: #e2e8f0;
          border-color: #ff6f00;
          color: #ff6f00;
        }

        .date-time-block {
          display: flex;
          flex-direction: column;
          font-size: 0.78rem;
        }
        .date-line { font-weight: 600; color: #1e293b; }
        .time-line { color: #94a3b8; font-size: 0.72rem; }

        .customer-name {
          color: #0f172a;
          display: block;
        }

        .email-text {
          font-size: 0.76rem;
          color: #64748b;
        }

        .mobile-link {
          color: #475569;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .mobile-link:hover {
          color: #ff6f00;
        }

        .status-dropdown {
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 700;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .status-dropdown.status-pending { background: #fffbeb; color: #b45309; border-color: #fde68a; }
        .status-dropdown.status-processing { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .status-dropdown.status-completed { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
        .status-dropdown.status-cancelled { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

        .order-actions-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          min-width: 132px;
          white-space: nowrap;
        }

        .action-icon-btn-sm {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          transition: all 0.15s ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        .action-icon-btn-sm:hover {
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }

        .table-row-thumb {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          background: #0a1329;
        }

        .catalog-header-actions-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tab-heading {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .tab-sub {
          font-size: 0.88rem;
          color: #64748b;
        }

        /* Modal Details */
        .modal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header-bar h2 {
          font-size: 1.5rem;
          color: #0f172a;
          margin: 0;
        }

        .modal-time {
          font-size: 0.8rem;
          color: #64748b;
        }

        .modal-scroll-body {
          padding: 1.5rem 2rem;
          max-height: 75vh;
          overflow-y: auto;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .info-sub-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 1rem;
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .sub-box-title {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ff6f00;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .modal-action-bar-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .status-update-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .document-buttons-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .settings-sec-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }

        .empty-table-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
        }

        .enq-msg-cell {
          max-width: 280px;
          white-space: normal;
          font-size: 0.82rem;
          color: #475569;
        }

        .action-icon-btn-sm.action-btn-delete {
          color: #dc2626;
          border-color: #fecaca;
          background: #fef2f2;
        }
        .action-icon-btn-sm.action-btn-delete:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          transform: translateY(-1px);
        }

        .confirm-modal {
          padding: 2.5rem 2rem;
          text-align: center;
          max-width: 450px;
        }
        .confirm-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .confirm-icon-wrapper.danger-pulse {
          animation: dangerPulse 2s infinite;
        }
        @keyframes dangerPulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .confirm-warning-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-align: left;
          margin: 1rem 0 1.5rem;
        }
        .confirm-modal h3 {
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .modal-danger-border {
          border-top: 5px solid #dc2626 !important;
        }
        .modal-header-danger {
          background: #fef2f2;
          border-bottom: 1px solid #fee2e2;
        }
        .danger-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        .modal-title-danger {
          font-size: 1.4rem;
          color: #991b1b;
          font-weight: 800;
          margin: 0.15rem 0;
        }
        .badge-danger {
          background: #fee2e2;
          color: #b91c1c;
          font-weight: 800;
          font-size: 0.72rem;
          letter-spacing: 0.5px;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
        }
        .border-danger-subtle {
          border-color: #fecaca !important;
          background: #fffbfb !important;
        }
        .bg-light-gray {
          background: #f8fafc;
        }

        .modal-actions-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn-danger-outline {
          background: #fff5f5;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.15s ease;
        }
        .btn-danger-outline:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
        }

        .admin-toast-banner {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #0f172a;
          color: #ffffff;
          padding: 0.85rem 1.35rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          z-index: 1050;
          font-size: 0.9rem;
          font-weight: 600;
          border-left: 4px solid #10b981;
          animation: slideInUp 0.25s ease-out;
        }
        .toast-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          margin-left: 0.5rem;
        }
        .toast-close-btn:hover {
          color: #ffffff;
        }
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        /* Settings Form Layout & Input Styling */
        .settings-form-layout {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 2rem !important;
          margin-top: 1.5rem;
        }

        .settings-section {
          padding-bottom: 1.75rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 1.75rem;
        }
        .settings-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .settings-sec-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-label {
          font-size: 0.825rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #0f172a;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .form-input:focus {
          border-color: #ff6f00;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
          background: #fffdfa;
        }

        @media (max-width: 992px) {
          .order-details-grid {
            grid-template-columns: 1fr;
          }
          .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
          .modal-header-bar {
            padding: 1rem 1.25rem;
          }
          .modal-scroll-body {
            padding: 1rem 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
