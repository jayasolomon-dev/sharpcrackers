// ==========================================================================
// SHARP CRACKERS - PRODUCTS CATALOG & ORDER ENGINE
// Table-based product catalog, category sidebar, live math, sticky order summary
// ==========================================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { dataService, PRODUCT_TAMIL_NAMES, CATEGORY_TAMIL_NAMES } from '../services/dataService';
import CreativeActionButton from '../components/CreativeActionButton';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  Trash2, 
  Eye, 
  X, 
  Sparkles, 
  Check, 
  AlertCircle,
  RotateCcw,
  FileText,
  Printer,
  Clock,
  Phone,
  Package,
  Tag,
  ChevronDown
} from 'lucide-react';

export { PRODUCT_TAMIL_NAMES, CATEGORY_TAMIL_NAMES };

export const ProductsPage = ({ 
  selectedCategory = 'all', 
  setSelectedCategory, 
  setCurrentPage, 
  searchInputRef,
  lastOrderPlaced,
  onDismissNotification
}) => {
  const { 
    products, 
    getItemQuantity, 
    updateQuantity, 
    setItemQuantity, 
    clearCart, 
    totalSelectedProducts, 
    totalQuantity, 
    cartSubtotal, 
    deliveryCharge, 
    cartGrandTotal,
    settings,
    isProductOutOfStock 
  } = useCart();

  const [categories, setCategories] = useState(() => dataService.getCategories());
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-asc', 'price-desc', 'name-asc'
  const [previewProduct, setPreviewProduct] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSampleReceipt, setShowSampleReceipt] = useState(false);

  // Sync with prop if changed from Navbar/Home
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Listen to category updates and keep active category & preview modal synced
  useEffect(() => {
    const handleDataChange = () => {
      const updatedCats = dataService.getCategories();
      setCategories(updatedCats);
      setActiveCategory(prev => {
        if (prev !== 'all' && !updatedCats.some(c => c.id === prev)) {
          return 'all';
        }
        return prev;
      });
      if (previewProduct) {
        const fresh = dataService.getProductById(previewProduct.id);
        if (fresh) {
          setPreviewProduct(fresh);
        } else {
          setPreviewProduct(null);
        }
      }
    };
    window.addEventListener('sharp_data_changed', handleDataChange);
    return () => {
      window.removeEventListener('sharp_data_changed', handleDataChange);
    };
  }, [previewProduct]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (setSelectedCategory) setSelectedCategory(catId);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Multi-Criteria Search Filter
        if (searchQuery.trim()) {
          const rawQuery = searchQuery.trim();
          const q = rawQuery.toLowerCase();
          
          // Clean for numeric matching (strip leading #, ₹, rs, inr, spaces)
          const cleanNumeric = rawQuery.replace(/^[#₹rsINR\s]+/i, '').trim();
          const queryInt = parseInt(cleanNumeric, 10);
          const hasValidInt = !isNaN(queryInt) && cleanNumeric.length > 0 && /^\d+$/.test(cleanNumeric);

          // Check if user entered an exact serial number (e.g. "15", "12", "1", "0015", "#15")
          const isExactSerial = hasValidInt && products.some(
            prod => parseInt(prod.sno, 10) === queryInt || prod.sno === cleanNumeric
          );

          // If the query matches an exact serial number, show ONLY that product!
          if (isExactSerial) {
            return parseInt(p.sno, 10) === queryInt || p.sno === cleanNumeric;
          }

          // Otherwise, apply category filter if not 'all'
          if (activeCategory !== 'all' && p.category !== activeCategory) {
            return false;
          }

          // General Search: Code, English Name, Tamil Name, Category, Price, Pack, Desc
          const matchCode = (p.code || '').toLowerCase().includes(q);
          const matchName = (p.name || '').toLowerCase().includes(q);
          const tamil = (PRODUCT_TAMIL_NAMES[p.code] || p.tamilName || '').toLowerCase();
          const matchTamil = tamil.includes(q);

          const catObj = categories.find(c => c.id === p.category);
          const catNameEn = (catObj?.name || p.category || '').toLowerCase();
          const catNameTa = (CATEGORY_TAMIL_NAMES[p.category] || '').toLowerCase();
          const matchCat = catNameEn.includes(q) || catNameTa.includes(q);

          // Price match when user enters a price like 90, 140, 1150
          const matchPrice = hasValidInt && (
            p.unitPrice === queryInt || 
            p.mrp === queryInt ||
            String(p.unitPrice) === cleanNumeric ||
            String(p.mrp) === cleanNumeric
          );

          const matchPack = (p.packDetails || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);

          return matchCode || matchName || matchTamil || matchCat || matchPrice || matchPack || matchDesc;
        }

        // When not searching, apply category filter
        if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.unitPrice - b.unitPrice;
        if (sortBy === 'price-desc') return b.unitPrice - a.unitPrice;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0; // default catalog order
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  // Currency helper
  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

  return (
    <div className="products-page-container">
      {/* Real-time Order Success Alert Banner (Shown when returning from order submission) */}
      {lastOrderPlaced && (
        <section className="order-notification-banner-wrapper">
          <div className="container">
            <div className="order-notification-card">
              <div className="order-notification-content">
                <div className="order-bell-icon">
                  <Check size={24} />
                </div>
                <div className="order-notification-text">
                  <div className="order-tag">
                    <Sparkles size={13} />
                    <span>ORDER RECEIVED AT SIVAKASI FACTORY DESK</span>
                  </div>
                  <h2 className="order-notification-heading">
                    Thank you for ordering, {lastOrderPlaced.customer?.name}!
                  </h2>
                  <p className="order-notification-desc">
                    We will reach you within <strong>24 hours</strong> (5 – 24 hours) at <strong>{lastOrderPlaced.customer?.phone}</strong> to confirm your Sivakasi order booking.
                  </p>
                  <div className="order-notification-meta">
                    <span className="meta-pill">Order ID: <strong>#{lastOrderPlaced.orderId}</strong></span>
                    <span className="meta-pill">Total Items: <strong>{(lastOrderPlaced.items || []).length} varieties ({(lastOrderPlaced.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes)</strong></span>
                    <span className="meta-pill price-pill">Total Amount: <strong>{formatCur(lastOrderPlaced.grandTotal)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="order-notification-actions">
                <button 
                  onClick={() => setShowSampleReceipt(true)} 
                  className="btn btn-gold btn-sm"
                  title="View sample reference receipt"
                >
                  <FileText size={15} />
                  <span>Sample Reference</span>
                </button>
                {onDismissNotification && (
                  <button 
                    onClick={onDismissNotification} 
                    className="banner-close-btn"
                    title="Dismiss notice"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Page Header Banner */}
      <section className="catalog-header-bar">
        <div className="container header-flex">
          <div>
            <div className="catalog-pill">PRICE ESTIMATE SHEET</div>
            <h1 className="catalog-title">Official Crackers Price List</h1>
            <p className="catalog-desc">
              Select quantities directly on the table. Grand total updates instantaneously. No hassle, transparent Sivakasi pricing.
            </p>
          </div>

          <div className="catalog-header-actions">
            {totalQuantity > 0 && (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="btn btn-outline-light btn-sm"
                title="Reset all selected items"
              >
                <RotateCcw size={14} />
                <span>Reset Quantities</span>
              </button>
            )}
            <button 
              onClick={() => setCurrentPage('cart')} 
              className="btn btn-gold btn-sm"
            >
              <ShoppingCart size={15} />
              <span>Review Order ({totalQuantity})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <div className="container catalog-workspace">
        {/* Layout Grid: Left Sidebar + Right Products Sheet */}
        <div className="catalog-grid-layout">
          {/* ============================================================
              A. CATEGORY SIDEBAR (Desktop Box Grid + Mobile Scroll)
             ============================================================ */}
          <aside className="category-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title-group">
                <span className="sidebar-title">Categories</span>
                <span className="sidebar-title-ta">வகைகள்</span>
              </div>
              <span className="sidebar-count">{categories.length}</span>
            </div>

            <div className="category-list-wrapper">
              <button
                className={`category-item-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                <div className="cat-text-col">
                  <span className="cat-name-en">All Products</span>
                  <span className="cat-name-ta">அனைத்து ரகங்கள்</span>
                </div>
                <span className="cat-pill-count">{products.length}</span>
              </button>

              {categories
                .filter(c => c.id !== 'all' && c.active !== false)
                .map((cat) => {
                  const count = products.filter(p => p.category === cat.id).length;
                  const isActive = activeCategory === cat.id;
                  const tamilName = CATEGORY_TAMIL_NAMES[cat.id] || cat.ta || '';

                  return (
                    <button
                      key={cat.id}
                      className={`category-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <div className="cat-text-col">
                        <span className="cat-name-en">{cat.name}</span>
                        {tamilName && <span className="cat-name-ta">{tamilName}</span>}
                      </div>
                      <span className="cat-pill-count">{count}</span>
                    </button>
                  );
                })}
            </div>

            {/* Quick Sourcing Notice Box */}
            <div className="sidebar-info-box">
              <Sparkles size={16} className="text-gold" />
              <div className="info-box-text">
                <strong>Direct Dispatch:</strong> All crackers are packed at factory premises in Sivakasi to assure maximum freshness and sound crispness.
              </div>
            </div>
          </aside>

          {/* ============================================================
              B & C. MAIN CONTENT: SEARCH, FILTERS & WHOLESALE TABLE
             ============================================================ */}
          <main className="catalog-main-area">
            {/* Filter & Search Bar */}
            <div className="filter-toolbar card">
              <div className="search-input-box">
                <Search size={18} className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search crackers, code (e.g. SC-SP01), price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-field"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn" title="Clear search">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="toolbar-right">
                <div className="sort-box">
                  <ArrowUpDown size={15} className="sort-icon" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="default">Default Catalog Order</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Product Name (A-Z)</option>
                  </select>
                </div>

                <div className="results-count">
                  Showing <strong>{filteredProducts.length}</strong> items
                </div>
              </div>
            </div>

            {/* Dedicated Mobile 2-Column Categories Grid (Visible on Mobile <= 768px) */}
            <div className="mobile-categories-section">
              <div className="mobile-cat-header">
                <div className="mobile-cat-header-title">
                  <Filter size={14} className="text-orange" />
                  <span>Categories / வகைகள்</span>
                </div>
                <span className="mobile-cat-badge-current">
                  {categories.find(c => c.id === activeCategory)?.name || 'All Products'}
                  {CATEGORY_TAMIL_NAMES[activeCategory] && (
                    <> / {CATEGORY_TAMIL_NAMES[activeCategory]}</>
                  )}
                </span>
              </div>

              <div className="mobile-categories-2col-grid">
                <button
                  type="button"
                  className={`mobile-cat-card-btn ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect('all')}
                >
                  <div className="m-cat-text">
                    <span className="m-cat-name-en">All Products</span>
                    <span className="m-cat-name-ta">அனைத்து ரகங்கள்</span>
                  </div>
                  <span className="m-cat-count-badge">{products.length}</span>
                </button>

                {categories
                  .filter(c => c.id !== 'all' && c.active !== false)
                  .map((cat) => {
                    const count = products.filter(p => p.category === cat.id).length;
                    const isActive = activeCategory === cat.id;
                    const tamilCat = CATEGORY_TAMIL_NAMES[cat.id] || cat.ta || '';

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`mobile-cat-card-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <div className="m-cat-text">
                          <span className="m-cat-name-en">{cat.name}</span>
                          {tamilCat && <span className="m-cat-name-ta">{tamilCat}</span>}
                        </div>
                        <span className="m-cat-count-badge">{count}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Wholesale Order Table */}
            {filteredProducts.length === 0 ? (
              <div className="empty-catalog-state card">
                <AlertCircle size={48} className="empty-icon" />
                <h3>No Matching Fireworks Found</h3>
                <p>We couldn't find any products matching "{searchQuery}". Try searching for sparklers, pots, rockets, or switch categories.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="btn btn-outline-dark btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. DESKTOP WHOLESALE TABLE VIEW (Visible on Laptops/Desktops > 768px) */}
                <div className="desktop-table-wrapper table-responsive-wrapper card">
                  <table className="wholesale-order-table">
                    <thead>
                      <tr>
                        <th className="col-sno">S.No.</th>
                        <th className="col-image">Image</th>
                        <th className="col-code">Code</th>
                        <th className="col-name">Product Name</th>
                        <th className="col-pack">Pack Details</th>
                        <th className="col-price text-right">Unit Price</th>
                        <th className="col-qty text-center">Quantity</th>
                        <th className="col-total text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => {
                        const qty = getItemQuantity(product.id);
                        const isOutOfStock = isProductOutOfStock(product);
                        const lineTotal = product.unitPrice * qty;
                        const hasSelected = qty > 0;
                        const discount = Math.round(((product.mrp - product.unitPrice) / product.mrp) * 100);

                        return (
                          <tr 
                            key={product.id} 
                            className={`product-row ${hasSelected ? 'row-selected' : ''} ${isOutOfStock ? 'row-out-of-stock' : ''}`}
                          >
                            {/* S.No (Permanent 3-Digit Serial Number) */}
                            <td className="col-sno text-center">
                              <span className="table-sno-badge">{product.sno ? String(parseInt(product.sno, 10)).padStart(3, '0') : String(index + 1).padStart(3, '0')}</span>
                            </td>

                            {/* Thumbnail with Lightbox trigger */}
                            <td className="col-image">
                              <div 
                                className="thumb-wrapper" 
                                onClick={() => setPreviewProduct(product)}
                                title="Click to view large photo"
                              >
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="product-thumb" 
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                                />
                                {isOutOfStock ? (
                                  <div className="thumb-out-tag">SOLD OUT</div>
                                ) : (
                                  <div className="thumb-zoom-icon">
                                    <Eye size={12} />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Product Code */}
                            <td className="col-code">
                              <span className="code-badge">{product.code}</span>
                            </td>

                            {/* Product Name (Bilingual English / தமிழ்) */}
                            <td className="col-name">
                              <div className="name-block">
                                <span className="product-title-text">
                                  {product.name}
                                  {(PRODUCT_TAMIL_NAMES[product.code] || product.tamilName) && (
                                    <span className="table-tamil-name"> / {PRODUCT_TAMIL_NAMES[product.code] || product.tamilName}</span>
                                  )}
                                </span>
                                {isOutOfStock ? (
                                  <span className="out-of-stock-pill">
                                    <span className="out-of-stock-dot"></span>
                                    Out of Stock / இருப்பு இல்லை
                                  </span>
                                ) : (
                                  <>
                                    {discount > 0 && (
                                      <span className="discount-pill">{discount}% OFF</span>
                                    )}
                                    {product.isBestseller && (
                                      <span className="bestseller-pill">Bestseller</span>
                                    )}
                                  </>
                                )}
                              </div>
                              {product.description && (
                                <div className="product-row-desc">{product.description}</div>
                              )}
                            </td>

                            {/* Pack Details */}
                            <td className="col-pack">
                              <span className="pack-badge">{product.packDetails}</span>
                            </td>

                            {/* Unit Price */}
                            <td className="col-price text-right">
                              <div className="price-stack">
                                <span className="actual-price">{formatCur(product.unitPrice)}</span>
                                {product.mrp > product.unitPrice && (
                                  <span className="mrp-price">{formatCur(product.mrp)}</span>
                                )}
                              </div>
                            </td>

                            {/* Quantity Selector: Minus, Value, Plus OR Out of Stock Badge */}
                            <td className="col-qty text-center">
                              {isOutOfStock ? (
                                <div className="table-out-of-stock-box" title="Currently unavailable for ordering">
                                  <span className="badge-out-text">Out of Stock</span>
                                  <span className="badge-out-ta">இருப்பு இல்லை</span>
                                </div>
                              ) : (
                                <div className="table-qty-control">
                                  <button
                                    type="button"
                                    className="table-qty-btn minus-btn"
                                    onClick={() => updateQuantity(product.id, -1)}
                                    disabled={qty === 0}
                                    title="Decrease quantity"
                                  >
                                    <Minus size={14} />
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={qty}
                                    onChange={(e) => setItemQuantity(product.id, e.target.value)}
                                    className={`table-qty-input ${qty > 0 ? 'active-input' : ''}`}
                                  />

                                  <button
                                    type="button"
                                    className="table-qty-btn plus-btn"
                                    onClick={() => updateQuantity(product.id, 1)}
                                    title="Increase quantity"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Line Total */}
                            <td className="col-total text-right">
                              {isOutOfStock && qty === 0 ? (
                                <span className="line-total-amount text-zero text-out-tag">Unavailable</span>
                              ) : (
                                <span className={`line-total-amount ${lineTotal > 0 ? 'text-highlight' : 'text-zero'}`}>
                                  {formatCur(lineTotal)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. DEDICATED MOBILE CATALOG VIEW (Visible on Phone Screens <= 768px) */}
                <div className="mobile-catalog-view">
                  {filteredProducts.map((product) => {
                    const qty = getItemQuantity(product.id);
                    const isOutOfStock = isProductOutOfStock(product);
                    const lineTotal = product.unitPrice * qty;
                    const hasSelected = qty > 0;
                    const discount = Math.round(((product.mrp - product.unitPrice) / product.mrp) * 100);
                    const tamilName = PRODUCT_TAMIL_NAMES[product.code] || product.tamilName;

                    return (
                      <div 
                        key={product.id} 
                        className={`mobile-product-card ${hasSelected ? 'card-selected' : ''} ${isOutOfStock ? 'mobile-card-out' : ''}`}
                      >
                        {/* Top Info Area: Photo + Badges + Bilingual Name + Pack */}
                        <div className="mobile-card-top-section">
                          {/* Left: Product Thumbnail with Preview Tap */}
                          <div 
                            className="mobile-thumb-frame"
                            onClick={() => setPreviewProduct(product)}
                            title="Tap to preview image"
                          >
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="mobile-thumb-img" 
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                            />
                            {isOutOfStock ? (
                              <div className="mobile-thumb-out-tag">Sold Out</div>
                            ) : (
                              <div className="mobile-thumb-zoom-badge">
                                <Eye size={12} />
                              </div>
                            )}
                          </div>

                          {/* Right: Details */}
                          <div className="mobile-card-details">
                            <div className="mobile-pill-row">
                              <span className="mobile-sno-badge">#{product.sno ? String(parseInt(product.sno, 10)).padStart(3, '0') : '001'}</span>
                              <span className="mobile-code-badge">{product.code}</span>
                              {isOutOfStock ? (
                                <span className="mobile-out-badge">Out of Stock / இருப்பு இல்லை</span>
                              ) : (
                                <>
                                  {discount > 0 && (
                                    <span className="mobile-discount-badge">{discount}% OFF</span>
                                  )}
                                  {product.isBestseller && (
                                    <span className="mobile-bestseller-badge">Bestseller</span>
                                  )}
                                </>
                              )}
                            </div>

                            <h3 className="mobile-product-title">
                              <span className="title-en">{product.name}</span>
                              {tamilName && (
                                <>
                                  <span className="title-slash"> / </span>
                                  <span className="title-ta">{tamilName}</span>
                                </>
                              )}
                            </h3>

                            <div className="mobile-pack-line">
                              <Package size={12} className="text-muted" />
                              <span>{product.packDetails}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Bottom Action Bar: Price & Subtotal on Left, Add / Stepper on Right */}
                        <div className="mobile-card-bottom-bar">
                          <div className="mobile-price-subtotal-block">
                            <div className="mobile-price-row">
                              <span className="mobile-unit-price">{formatCur(product.unitPrice)}</span>
                              {product.mrp > product.unitPrice && (
                                <span className="mobile-mrp-price">{formatCur(product.mrp)}</span>
                              )}
                            </div>
                            <div className="mobile-status-hint">
                              {isOutOfStock ? (
                                <span className="mobile-out-hint">Currently Unavailable</span>
                              ) : hasSelected ? (
                                <span className="mobile-subtotal-active">
                                  Total: <strong>{formatCur(lineTotal)}</strong>
                                </span>
                              ) : (
                                <span className="mobile-wholesale-label">Direct Price</span>
                              )}
                            </div>
                          </div>

                          <div className="mobile-action-control">
                            {isOutOfStock ? (
                              <button
                                type="button"
                                className="mobile-out-btn"
                                disabled
                                aria-label="Out of Stock"
                              >
                                <span>Out of Stock</span>
                              </button>
                            ) : qty === 0 ? (
                              <button
                                type="button"
                                className="mobile-add-btn"
                                onClick={() => updateQuantity(product.id, 1)}
                                aria-label={`Add ${product.name}`}
                              >
                                <Plus size={16} />
                                <span>ADD</span>
                              </button>
                            ) : (
                              <div className="mobile-qty-stepper">
                                <button
                                  type="button"
                                  className="mobile-stepper-btn minus"
                                  onClick={() => updateQuantity(product.id, -1)}
                                  title="Decrease quantity"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={15} />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max="999"
                                  value={qty}
                                  onChange={(e) => setItemQuantity(product.id, e.target.value)}
                                  className="mobile-stepper-input"
                                  aria-label="Quantity"
                                />
                                <button
                                  type="button"
                                  className="mobile-stepper-btn plus"
                                  onClick={() => updateQuantity(product.id, 1)}
                                  title="Increase quantity"
                                  aria-label="Increase quantity"
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
              </>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================
          F. STICKY ORDER SUMMARY (Desktop & Mobile Compact Bottom Bar)
         ============================================================ */}
      <div className={`sticky-order-bar ${totalQuantity > 0 ? 'visible' : ''}`}>
        <div className="container sticky-bar-inner">
          {/* Desktop Summary Info (Hidden on small mobile) */}
          <div className="sticky-meta-info desktop-sticky-info">
            <div className="sticky-stat">
              <span className="stat-label">Selected Products:</span>
              <strong className="stat-value">{totalSelectedProducts} items</strong>
            </div>
            <div className="sticky-stat">
              <span className="stat-label">Total Quantity:</span>
              <strong className="stat-value">{totalQuantity} units</strong>
            </div>
            <div className="sticky-stat grand-stat">
              <span className="stat-label">Grand Total:</span>
              <strong className="stat-price">{formatCur(cartGrandTotal)}</strong>
            </div>
          </div>

          {/* Mobile Summary Info (Visible on small mobile) */}
          <div className="mobile-sticky-info">
            <div className="mobile-sticky-count">
              <ShoppingCart size={16} className="text-orange" />
              <span>{totalQuantity} boxes ({totalSelectedProducts} items)</span>
            </div>
            <div className="mobile-sticky-price">
              {formatCur(cartGrandTotal)}
            </div>
          </div>

          <div className="sticky-actions">
            <button 
              onClick={() => setShowClearConfirm(true)} 
              className="btn btn-outline-dark btn-sm clear-btn"
              title="Clear all"
            >
              <Trash2 size={16} />
              <span className="btn-text">Reset</span>
            </button>
            <button 
              onClick={() => {
                setCurrentPage('cart');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-primary proceed-btn"
            >
              <span>Order Now</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewProduct && (() => {
        const isPreviewOutOfStock = isProductOutOfStock(previewProduct);

        return (
          <div className="modal-overlay" onClick={() => setPreviewProduct(null)}>
            <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setPreviewProduct(null)}>
                <X size={20} />
              </button>
              <div className="modal-body-layout">
                <div className="modal-img-frame">
                  <img 
                    src={previewProduct.image} 
                    alt={previewProduct.name} 
                    className="modal-large-img" 
                    loading="eager"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = '/images/sharp_crackers_logo_final.png'; }}
                  />
                  {isPreviewOutOfStock && (
                    <div className="modal-img-out-tag">SOLD OUT / இருப்பு இல்லை</div>
                  )}
                </div>
                <div className="modal-product-info">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <div className="code-pill">{previewProduct.code}</div>
                    {isPreviewOutOfStock && (
                      <span className="out-of-stock-pill">
                        <span className="out-of-stock-dot"></span>
                        Out of Stock / இருப்பு இல்லை
                      </span>
                    )}
                  </div>
                  <h2>
                    {previewProduct.name}
                    {(PRODUCT_TAMIL_NAMES[previewProduct.code] || previewProduct.tamilName) && (
                      <span style={{ color: '#ea580c', fontWeight: 700, fontSize: '1.2rem' }}>
                        {' '}/ {PRODUCT_TAMIL_NAMES[previewProduct.code] || previewProduct.tamilName}
                      </span>
                    )}
                  </h2>
                  <div className="pack-info">Packing: <strong>{previewProduct.packDetails}</strong></div>
                  <p className="modal-desc">{previewProduct.description || "Direct from Sivakasi factory. PESO approved eco-friendly formulation."}</p>
                  <div className="modal-price-strip">
                    <div>
                      <div className="price-tag-big">{formatCur(previewProduct.unitPrice)}</div>
                      <div className="mrp-strike">MRP: {formatCur(previewProduct.mrp)}</div>
                    </div>
                    <div className="savings-badge">
                      Save {Math.round(((previewProduct.mrp - previewProduct.unitPrice) / previewProduct.mrp) * 100)}%
                    </div>
                  </div>

                  <div className="modal-qty-action">
                    {isPreviewOutOfStock ? (
                      <div className="modal-out-banner">
                        <AlertCircle size={20} className="text-red" />
                        <div className="modal-out-text">
                          <strong>Currently Out of Stock</strong>
                          <span className="modal-out-ta">இந்த தயாரிப்பு தற்போது இருப்பு இல்லை</span>
                        </div>
                      </div>
                    ) : (
                      <div className="modal-qty-control-row">
                        <div className="modal-stepper-box">
                          <span className="qty-label">Add Quantity:</span>
                          <div className="table-qty-control large-control">
                            <button 
                              onClick={() => updateQuantity(previewProduct.id, -1)} 
                              className="table-qty-btn minus-btn"
                              disabled={getItemQuantity(previewProduct.id) === 0}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="large-qty-num">{getItemQuantity(previewProduct.id)}</span>
                            <button 
                              onClick={() => updateQuantity(previewProduct.id, 1)} 
                              className="table-qty-btn plus-btn"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Item Total & Action Confirmation Button */}
                        <div className="modal-total-and-cta">
                          {getItemQuantity(previewProduct.id) > 0 && (
                            <div className="modal-item-subtotal">
                              <span>Total:</span>
                              <strong>{formatCur(previewProduct.unitPrice * getItemQuantity(previewProduct.id))}</strong>
                            </div>
                          )}

                          <button 
                            className="btn btn-primary modal-done-btn"
                            onClick={() => {
                              if (getItemQuantity(previewProduct.id) === 0) {
                                updateQuantity(previewProduct.id, 1);
                              }
                              setPreviewProduct(null);
                            }}
                          >
                            <ShoppingCart size={16} />
                            <span>{getItemQuantity(previewProduct.id) > 0 ? 'Update Order Sheet' : 'Add to Order Sheet'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={44} className="text-orange mb-2" />
            <h3>Reset Selected Quantities?</h3>
            <p>Are you sure you want to clear all {totalSelectedProducts} selected items and reset your cart?</p>
            <div className="modal-actions-row">
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-outline-dark">
                Cancel
              </button>
              <button 
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }} 
                className="btn btn-danger"
              >
                Yes, Reset Quantities
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Reference Receipt Modal */}
      {showSampleReceipt && lastOrderPlaced && (
        <div className="modal-overlay" onClick={() => setShowSampleReceipt(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="badge badge-festive mb-1">SAMPLE REFERENCE RECEIPT</span>
                <h2>Order #{lastOrderPlaced.orderId}</h2>
                <div className="modal-time">Submitted: {new Date(lastOrderPlaced.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <button onClick={() => setShowSampleReceipt(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-scroll-body">
              <div className="order-details-grid">
                <div className="info-sub-box">
                  <span className="sub-box-title">CUSTOMER CONTACT INFORMATION</span>
                  <div><strong>Customer Name:</strong> {lastOrderPlaced.customer?.name}</div>
                  <div><strong>Mobile Number:</strong> {lastOrderPlaced.customer?.phone}</div>
                  {lastOrderPlaced.customer?.email && <div><strong>Email:</strong> {lastOrderPlaced.customer.email}</div>}
                  {lastOrderPlaced.customer?.notes && <div><strong>Customer Notes:</strong> {lastOrderPlaced.customer.notes}</div>}
                </div>
                <div className="info-sub-box">
                  <span className="sub-box-title">ORDER SUMMARY</span>
                  <div><strong>Total Varieties:</strong> {(lastOrderPlaced.items || []).length} products</div>
                  <div><strong>Total Quantity:</strong> {(lastOrderPlaced.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes</div>
                  <div><strong>Grand Total:</strong> <strong className="text-red font-bold">{formatCur(lastOrderPlaced.grandTotal)}</strong></div>
                </div>
              </div>

              <h4 className="mt-4 mb-2">Ordered Products Breakdown:</h4>
              <div className="table-responsive-wrapper border rounded">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-sno text-center">S.No</th>
                      <th>Code</th>
                      <th>Product Name</th>
                      <th>Packing Details</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lastOrderPlaced.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="text-center col-sno">{idx + 1}</td>
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

              <div className="modal-action-bar-bottom mt-4">
                <div className="d-flex align-items-center gap-2 text-muted text-sm">
                  <Clock size={16} className="text-orange" />
                  <span>We will reach you within 24 hours at <strong>{lastOrderPlaced.customer?.phone}</strong></span>
                </div>
                <div className="document-buttons-row">
                  <CreativeActionButton 
                    variant="print"
                    onClick={() => printOrderDocument(lastOrderPlaced, settings)}
                    label="Print Receipt"
                    size="md"
                  />
                  <CreativeActionButton 
                    variant="pdf"
                    onClick={() => generateOrderPdf(lastOrderPlaced, settings, true)}
                    label="Download PDF"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-notification-banner-wrapper {
          background: #0f172a;
          padding: 1rem 0;
          border-bottom: 2px solid #ffb703;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .order-notification-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1.5px solid rgba(255, 183, 3, 0.4);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .order-notification-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex: 1;
          min-width: 300px;
        }

        .order-bell-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        .order-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #ffd166;
          margin-bottom: 0.25rem;
        }

        .order-notification-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .order-notification-desc {
          font-size: 0.92rem;
          color: #cbd5e1;
          margin-bottom: 0.65rem;
        }

        .order-notification-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .meta-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          font-size: 0.82rem;
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .meta-pill.price-pill {
          background: rgba(255, 183, 3, 0.15);
          border-color: rgba(255, 183, 3, 0.4);
          color: #ffd166;
        }

        .order-notification-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .banner-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .banner-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .modal-content-lg {
          max-width: 820px !important;
          width: 95%;
          padding: 2rem !important;
          text-align: left;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
          text-align: left;
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
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .products-page-container {
          padding-bottom: 6rem;
          min-height: 80vh;
        }

        .catalog-header-bar {
          background: linear-gradient(135deg, #0a1329 0%, #15254d 100%);
          color: #ffffff;
          padding: 2.5rem 0;
          border-bottom: 3px solid #ff6f00;
        }

        .header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .catalog-header-brand-wrap {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
          min-width: 280px;
        }

        .catalog-header-logo-frame {
          width: 76px;
          height: 76px;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          border: 2px solid #ffb703;
          box-shadow: 0 4px 18px rgba(255, 111, 0, 0.4);
          flex-shrink: 0;
        }

        .catalog-header-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .catalog-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #ffd166;
          background: rgba(255, 183, 3, 0.15);
          border: 1px solid rgba(255, 183, 3, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
        }

        .catalog-title {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
        }

        .catalog-desc {
          font-size: 0.95rem;
          color: #cbd5e1;
          max-width: 600px;
        }

        .catalog-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Workspace Grid */
        .catalog-workspace {
          margin-top: 2rem;
        }

        .catalog-grid-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.75rem;
          align-items: start;
        }

        /* Category Sidebar (Desktop View) */
        .category-sidebar {
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid #e2e8f0;
          padding: 1.25rem 1rem 1.15rem 1.25rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          position: sticky;
          top: 85px;
          max-height: calc(100vh - 105px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 20;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
          flex-shrink: 0;
        }

        .sidebar-title-group {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .sidebar-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-title-ta {
          font-size: 0.85rem;
          color: #ff6f00;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 700;
        }

        .sidebar-count {
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
        }

        .category-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding-right: 6px;
          margin-right: -2px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f8fafc;
        }

        /* Custom Elegant Scroller for Desktop Categories */
        .category-list-wrapper::-webkit-scrollbar {
          width: 5px;
        }

        .category-list-wrapper::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 99px;
        }

        .category-list-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
          transition: background 0.2s ease;
        }

        .category-list-wrapper::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }

        .category-item-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .category-item-btn:hover {
          background: #f8fafc;
          color: #ff6f00;
          border-color: #fed7aa;
        }

        .category-item-btn.active {
          background: #fff7ed;
          color: #ea580c;
          border-color: #ffedd5;
          box-shadow: 0 2px 8px rgba(255, 111, 0, 0.12);
        }

        .cat-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .cat-text-col {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
          line-height: 1.25;
        }

        .cat-name-en {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1e293b;
        }

        .category-item-btn.active .cat-name-en {
          color: #c2410c;
        }

        .cat-name-ta {
          font-size: 0.76rem;
          color: #64748b;
          font-family: 'Mukta Malar', 'Noto Sans Tamil', system-ui, sans-serif;
          font-weight: 500;
        }

        .category-item-btn.active .cat-name-ta {
          color: #ea580c;
          font-weight: 600;
        }

        .cat-pill-count {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 0.15rem 0.45rem;
          border-radius: 99px;
          flex-shrink: 0;
        }

        .category-item-btn.active .cat-pill-count {
          background: #ffedd5;
          color: #c2410c;
        }

        .sidebar-info-box {
          margin-top: 0.85rem;
          background: #0a1329;
          color: #f8fafc;
          border-radius: var(--radius-md);
          padding: 0.8rem 0.85rem;
          font-size: 0.78rem;
          display: flex;
          gap: 0.65rem;
          line-height: 1.45;
          flex-shrink: 0;
        }

        /* Filter Toolbar */
        .filter-toolbar {
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .search-input-box {
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

        .search-field {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.4rem;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          background: #f8fafc;
          color: #0f172a;
          font-size: 0.92rem;
          transition: all 0.2s ease;
        }

        .search-field:focus {
          border-color: #ff6f00;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          padding: 2px;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sort-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
        }

        .sort-icon {
          color: #64748b;
        }

        .sort-select {
          background: transparent;
          border: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
        }

        .results-count {
          font-size: 0.85rem;
          color: #64748b;
          white-space: nowrap;
        }

        /* Wholesale Table */
        .table-responsive-wrapper {
          overflow-x: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .wholesale-order-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.92rem;
          text-align: left;
        }

        .wholesale-order-table thead {
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .wholesale-order-table th {
          background: #0a1329;
          color: #ffffff;
          padding: 0.9rem 0.85rem;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #ff6f00;
          white-space: nowrap;
        }

        .wholesale-order-table td {
          padding: 0.8rem 0.85rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .product-row {
          transition: background-color 0.2s ease;
        }

        .product-row:hover {
          background-color: #f8fafc;
        }

        .product-row.row-selected {
          background-color: #fffbeb;
        }

        .col-sno { width: 75px; text-align: center; }

        .table-sno-badge {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.88rem;
          font-weight: 800;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          display: inline-block;
          letter-spacing: 0.5px;
        }
        .col-image { width: 70px; }
        .col-code { width: 95px; }
        .col-pack { width: 120px; }
        .col-price { width: 110px; }
        .col-qty { width: 140px; }
        .col-total { width: 130px; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .thumb-wrapper {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-thumb {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #ffffff;
          padding: 2px;
          transition: transform 0.2s ease;
        }

        .thumb-wrapper:hover .product-thumb {
          transform: scale(1.15);
        }

        .thumb-zoom-icon {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .thumb-wrapper:hover .thumb-zoom-icon {
          opacity: 1;
        }

        .code-badge {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.2rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .name-block {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .product-title-text {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .discount-pill {
          background: #fee2e2;
          color: #dc2626;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .bestseller-pill {
          background: #fef3c7;
          color: #b45309;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .product-row-desc {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 0.25rem;
          line-height: 1.35;
        }

        .pack-badge {
          font-size: 0.82rem;
          color: #0369a1;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          white-space: nowrap;
        }

        .price-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .actual-price {
          font-weight: 800;
          color: #0f172a;
          font-size: 1rem;
        }

        .mrp-price {
          font-size: 0.78rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        /* Quantity Controller */
        .table-qty-control {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          background: #ffffff;
          overflow: hidden;
        }

        .table-qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #334155;
          transition: all 0.15s ease;
        }

        .table-qty-btn:hover:not(:disabled) {
          background: #ff6f00;
          color: #ffffff;
        }

        .table-qty-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .table-qty-input {
          width: 44px;
          height: 32px;
          border: none;
          text-align: center;
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
          background: transparent;
          -moz-appearance: textfield;
        }

        .table-qty-input::-webkit-outer-spin-button,
        .table-qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .table-qty-input.active-input {
          color: #d90429;
          background: #fef2f2;
        }

        .line-total-amount {
          font-weight: 800;
          font-size: 1.05rem;
          font-family: var(--font-display);
        }

        .text-highlight {
          color: #d90429;
        }

        .text-zero {
          color: #94a3b8;
        }

        /* Empty State */
        .empty-catalog-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          color: #f59e0b;
        }

        /* Sticky Summary Bar */
        .sticky-order-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #0a1329;
          color: #ffffff;
          border-top: 3px solid #ff6f00;
          box-shadow: 0 -8px 25px rgba(5, 10, 24, 0.4);
          z-index: 400;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sticky-order-bar.visible {
          transform: translateY(0);
        }

        .sticky-bar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .sticky-meta-info {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .sticky-stat {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.05rem;
          color: #ffffff;
        }

        .grand-stat .stat-price {
          font-size: 1.5rem;
          font-weight: 900;
          color: #ffb703;
          font-family: var(--font-display);
          line-height: 1.1;
        }

        .sticky-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .clear-btn {
          color: #cbd5e1;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .proceed-btn {
          box-shadow: 0 4px 15px rgba(255, 111, 0, 0.4);
        }

        /* Lightbox Modal */
        .product-modal {
          position: relative;
          max-width: 750px;
          padding: 2rem;
          border-radius: var(--radius-xl);
          background: #ffffff;
        }

        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          cursor: pointer;
          z-index: 30;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }

        .modal-body-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          align-items: center;
        }

        .modal-img-frame {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }

        .modal-large-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #ffffff;
          image-rendering: -webkit-optimize-contrast;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05));
        }

        .modal-product-info {
          display: flex;
          flex-direction: column;
        }

        .code-pill {
          align-self: flex-start;
          font-size: 0.8rem;
          font-weight: 700;
          color: #ff6f00;
          background: #fff7ed;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
        }

        .modal-product-info h2 {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }

        .pack-info {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .modal-desc {
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .modal-price-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .price-tag-big {
          font-size: 1.6rem;
          font-weight: 900;
          color: #d90429;
          font-family: var(--font-display);
        }

        .mrp-strike {
          font-size: 0.85rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .savings-badge {
          background: #10b981;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 99px;
        }

        .modal-qty-action {
          width: 100%;
        }

        .modal-qty-control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .modal-stepper-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-total-and-cta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .modal-item-subtotal {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
          font-size: 0.85rem;
          color: #64748b;
        }

        .modal-item-subtotal strong {
          color: #ea580c;
          font-size: 1.2rem;
          font-family: var(--font-display);
        }

        .modal-done-btn {
          padding: 0.65rem 1.15rem;
          font-size: 0.9rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          box-shadow: 0 4px 14px rgba(255, 111, 0, 0.3);
          cursor: pointer;
        }

        .large-control .table-qty-btn {
          width: 42px;
          height: 42px;
        }

        .large-qty-num {
          min-width: 50px;
          text-align: center;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        /* Confirmation Modal */
        .confirm-modal {
          padding: 2.5rem 2rem;
          text-align: center;
          max-width: 450px;
        }
        .confirm-modal h3 {
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
        }
        .confirm-modal p {
          color: #64748b;
          font-size: 0.92rem;
          margin-bottom: 1.5rem;
        }
        .modal-actions-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        /* Desktop vs Mobile Catalog Visibility */
        .desktop-table-wrapper {
          display: block;
        }

        .mobile-catalog-view {
          display: none;
        }

        .mobile-categories-section {
          display: none;
        }

        .table-tamil-name {
          color: #c2410c;
          font-weight: 700;
          font-size: 0.88rem;
        }

        .mobile-sticky-info {
          display: none;
        }

        .desktop-sticky-info {
          display: flex;
        }

        /* Responsive Styles */
        /* Laptops and Medium Displays (993px - 1366px) */
        @media (min-width: 993px) and (max-width: 1366px) {
          .catalog-header-bar {
            padding: 1.4rem 0;
          }

          .catalog-title {
            font-size: 1.7rem;
            margin-bottom: 0.25rem;
          }

          .catalog-desc {
            font-size: 0.88rem;
            max-width: 520px;
          }

          .catalog-workspace {
            margin-top: 1.25rem;
          }

          .catalog-grid-layout {
            grid-template-columns: 240px 1fr;
            gap: 1.25rem;
          }

          .category-sidebar {
            padding: 1rem;
            top: 75px;
          }

          .category-item-btn {
            padding: 0.45rem 0.65rem;
            font-size: 0.88rem;
          }
        }

        @media (max-width: 992px) {
          .catalog-grid-layout {
            grid-template-columns: 1fr;
          }

          .category-sidebar {
            position: static;
            padding: 0.85rem;
          }

          .category-list-wrapper {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            -webkit-overflow-scrolling: touch;
          }

          .category-item-btn {
            white-space: nowrap;
            width: auto;
          }

          .sidebar-info-box {
            display: none;
          }
        }

        /* Mobile Screens (Phone Screens <= 768px) */
        @media (max-width: 768px) {
          .products-page-container {
            padding-bottom: 100px;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow-x: hidden !important;
          }

          .catalog-header-bar {
            padding: 1.25rem 0 1rem;
          }

          .header-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .catalog-title {
            font-size: 1.5rem;
            line-height: 1.2;
          }

          .catalog-desc {
            font-size: 0.82rem;
            color: #cbd5e1;
          }

          .catalog-header-actions {
            width: 100%;
            display: flex;
            gap: 0.5rem;
          }

          .catalog-header-actions .btn {
            flex: 1;
            justify-content: center;
          }

          .catalog-workspace {
            margin-top: 0.75rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .catalog-grid-layout {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.75rem !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          .catalog-main-area {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }

          /* Hide Desktop Wholesale Table and Sidebar */
          .desktop-table-wrapper {
            display: none !important;
          }

          .category-sidebar {
            display: none !important;
          }

          /* Show Dedicated Mobile 2-Column Categories Grid */
          .mobile-categories-section {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            margin-bottom: 0.85rem;
          }

          .mobile-cat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 0.15rem 0.45rem;
          }

          .mobile-cat-header-title {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.8rem;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .mobile-cat-badge-current {
            font-size: 0.72rem;
            font-weight: 700;
            color: #ff6f00;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 0.12rem 0.5rem;
            border-radius: 99px;
            max-width: 160px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mobile-categories-2col-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.45rem;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .mobile-cat-card-btn {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.5rem 0.55rem;
            border-radius: 10px;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            text-align: left;
            transition: all 0.15s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            cursor: pointer;
          }

          .mobile-cat-card-btn:active {
            transform: scale(0.97);
          }

          .mobile-cat-card-btn.active {
            background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
            border-color: #ff6f00;
            color: #ffffff;
            box-shadow: 0 3px 10px rgba(255, 111, 0, 0.28);
          }

          .m-cat-icon {
            font-size: 1.15rem;
            flex-shrink: 0;
            line-height: 1;
          }

          .m-cat-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .m-cat-name-en {
            font-size: 0.75rem;
            font-weight: 800;
            color: #1e293b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }

          .mobile-cat-card-btn.active .m-cat-name-en {
            color: #ffffff;
          }

          .m-cat-name-ta {
            font-size: 0.65rem;
            font-weight: 600;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }

          .mobile-cat-card-btn.active .m-cat-name-ta {
            color: #fed7aa;
          }

          .m-cat-count-badge {
            font-size: 0.65rem;
            font-weight: 800;
            background: #f1f5f9;
            color: #64748b;
            padding: 0.1rem 0.35rem;
            border-radius: 99px;
            flex-shrink: 0;
          }

          .mobile-cat-card-btn.active .m-cat-count-badge {
            background: rgba(255, 255, 255, 0.25);
            color: #ffffff;
          }

          /* Mobile Filter & Search Bar */
          .filter-toolbar {
            flex-direction: column;
            gap: 0.65rem;
            padding: 0.75rem;
            align-items: stretch;
            margin-bottom: 0.75rem;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .search-input-box {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          .search-field {
            font-size: 0.88rem;
            padding: 0.6rem 2rem 0.6rem 2.2rem;
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .toolbar-right {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .sort-select {
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
          }

          .results-count {
            font-size: 0.76rem;
          }

          /* Show Dedicated Mobile Catalog View */
          .mobile-catalog-view {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.75rem !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          /* Mobile Product Card */
          .mobile-product-card {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 14px;
            padding: 0.75rem;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
          }

          .mobile-product-card.card-selected {
            border-color: #ff6f00;
            background: linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
            box-shadow: 0 4px 14px rgba(255, 111, 0, 0.14);
          }

          .mobile-card-top-section {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
            width: 100%;
            box-sizing: border-box;
          }

          .mobile-thumb-frame {
            width: 76px;
            height: 76px;
            border-radius: 10px;
            overflow: hidden;
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            position: relative;
            flex-shrink: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #ffffff;
            padding: 3px;
          }

          .mobile-thumb-zoom-badge {
            position: absolute;
            bottom: 3px;
            right: 3px;
            background: rgba(0, 0, 0, 0.65);
            color: #ffffff;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-card-details {
            flex: 1;
            min-width: 0;
          }

          .mobile-pill-row {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            flex-wrap: wrap;
            margin-bottom: 0.3rem;
          }

          .mobile-sno-badge {
            font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
            font-size: 0.72rem;
            font-weight: 800;
            color: #c2410c;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 0.12rem 0.45rem;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }

          .mobile-code-badge {
            font-family: monospace;
            font-weight: 700;
            font-size: 0.72rem;
            background: #f1f5f9;
            color: #475569;
            padding: 0.12rem 0.45rem;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }

          .mobile-discount-badge {
            background: #fee2e2;
            color: #dc2626;
            font-size: 0.7rem;
            font-weight: 800;
            padding: 0.12rem 0.45rem;
            border-radius: 4px;
          }

          .mobile-bestseller-badge {
            background: #fef3c7;
            color: #b45309;
            font-size: 0.7rem;
            font-weight: 800;
            padding: 0.12rem 0.45rem;
            border-radius: 4px;
          }

          .mobile-product-title {
            font-size: 0.92rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.25rem;
            line-height: 1.35;
            word-break: break-word;
          }

          .mobile-product-title .title-en {
            color: #0f172a;
          }

          .mobile-product-title .title-slash {
            color: #ea580c;
            font-weight: 700;
            margin: 0 3px;
          }

          .mobile-product-title .title-ta {
            color: #b45309;
            font-size: 0.88rem;
            font-weight: 700;
          }

          .mobile-pack-line {
            font-size: 0.78rem;
            color: #0369a1;
            background: #f0f9ff;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.12rem 0.45rem;
            border-radius: 4px;
            border: 1px solid #bae6fd;
          }

          /* Dedicated Mobile Bottom Bar: Price/Total on Left, Add/Stepper on Right */
          .mobile-card-bottom-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.55rem 0.75rem;
            width: 100% !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
          }

          .card-selected .mobile-card-bottom-bar {
            background: #fff7ed;
            border-color: #fed7aa;
          }

          .mobile-price-subtotal-block {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            min-width: 0;
          }

          .mobile-price-row {
            display: flex;
            align-items: baseline;
            gap: 0.35rem;
          }

          .mobile-unit-price {
            font-size: 1.25rem;
            font-weight: 900;
            color: #0f172a;
            font-family: var(--font-display);
            line-height: 1;
          }

          .mobile-mrp-price {
            font-size: 0.8rem;
            color: #94a3b8;
            text-decoration: line-through;
          }

          .mobile-status-hint {
            font-size: 0.75rem;
          }

          .mobile-wholesale-label {
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-size: 0.72rem;
          }

          .mobile-subtotal-active {
            color: #d90429;
            font-weight: 800;
            font-size: 0.82rem;
          }

          .mobile-action-control {
            flex-shrink: 0;
          }

          .mobile-add-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            font-weight: 800;
            font-size: 0.88rem;
            background: linear-gradient(135deg, #ff6f00 0%, #ea580c 100%);
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1.15rem;
            transition: all 0.15s ease;
            box-shadow: 0 3px 10px rgba(255, 111, 0, 0.28);
            min-height: 38px;
            min-width: 86px;
            cursor: pointer;
          }

          .mobile-add-btn:active {
            transform: scale(0.95);
            box-shadow: 0 1px 4px rgba(255, 111, 0, 0.2);
          }

          .mobile-qty-stepper {
            display: inline-flex;
            align-items: center;
            border: 1.5px solid #ff6f00;
            border-radius: 8px;
            background: #ffffff;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(255, 111, 0, 0.18);
            min-height: 38px;
          }

          .mobile-stepper-btn {
            width: 38px;
            height: 38px;
            background: #fff7ed;
            color: #ff6f00;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: background-color 0.1s ease;
          }

          .mobile-stepper-btn:active {
            background: #ff6f00;
            color: #ffffff;
          }

          .mobile-stepper-input {
            width: 42px;
            height: 38px;
            border: none;
            text-align: center;
            font-weight: 900;
            font-size: 1rem;
            color: #d90429;
            background: transparent;
            -moz-appearance: textfield;
          }

          .mobile-stepper-input::-webkit-outer-spin-button,
          .mobile-stepper-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          /* Mobile Sticky Bottom Bar */
          .desktop-sticky-info {
            display: none !important;
          }

          .mobile-sticky-info {
            display: flex !important;
            flex-direction: column;
            gap: 0.15rem;
          }

          .mobile-sticky-count {
            font-size: 0.75rem;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }

          .mobile-sticky-price {
            font-size: 1.45rem;
            font-weight: 900;
            color: #ffb703;
            font-family: var(--font-display);
            line-height: 1.1;
          }

          .sticky-bar-inner {
            padding: 0.65rem 0.85rem;
            gap: 0.75rem;
          }

          .sticky-actions {
            gap: 0.5rem;
          }

          .clear-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.82rem;
          }

          .proceed-btn {
            padding: 0.65rem 1.15rem;
            font-size: 0.95rem;
          }

          /* Lightbox Modal on Mobile */
          .product-modal {
            padding: 1rem 1rem 1.25rem;
            max-height: 92dvh;
            max-height: 92vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: var(--radius-lg);
          }

          .modal-body-layout {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }

          .modal-img-frame {
            height: 180px;
          }

          .modal-product-info h2 {
            font-size: 1.15rem;
            margin-bottom: 0.3rem;
          }

          .pack-info {
            font-size: 0.82rem;
            margin-bottom: 0.5rem;
          }

          .modal-desc {
            font-size: 0.82rem;
            margin-bottom: 0.85rem;
          }

          .modal-price-strip {
            padding: 0.6rem 0.85rem;
            margin-bottom: 1rem;
          }

          .price-tag-big {
            font-size: 1.3rem;
          }

          .modal-qty-action {
            margin-top: 0.5rem;
          }

          .modal-qty-control-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .modal-stepper-box {
            justify-content: space-between;
            width: 100%;
          }

          .modal-total-and-cta {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }

          .modal-done-btn {
            flex: 1;
            justify-content: center;
          }

          .modal-close-btn {
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            z-index: 40;
          }
        }

        /* ============================================================
           OUT OF STOCK BADGES & CONTROLS ALIGNMENT
           ============================================================ */
        .row-out-of-stock {
          background-color: #fbfbfc !important;
          opacity: 0.92;
        }

        .row-out-of-stock:hover {
          background-color: #f8fafc !important;
        }

        .out-of-stock-pill {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-left: 0.45rem;
          vertical-align: middle;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .out-of-stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc2626;
          display: inline-block;
        }

        .thumb-out-tag {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.78);
          backdrop-filter: blur(2px);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          text-transform: uppercase;
          border: 1px solid rgba(239, 68, 68, 0.6);
        }

        .table-out-of-stock-box {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 8px;
          padding: 0.35rem 0.65rem;
          min-width: 110px;
          cursor: not-allowed;
          user-select: none;
          box-sizing: border-box;
        }

        .table-out-of-stock-box .badge-out-text {
          font-size: 0.76rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .table-out-of-stock-box .badge-out-ta {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          line-height: 1.2;
        }

        .text-out-tag {
          color: #94a3b8 !important;
          font-size: 0.82rem;
          font-style: italic;
          font-weight: 500;
        }

        /* Mobile Card Out of Stock Styles */
        .mobile-card-out {
          border-color: #e2e8f0;
          background: #fafafa;
        }

        .mobile-thumb-out-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(220, 38, 38, 0.92);
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 800;
          text-align: center;
          padding: 2px 0;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          border-bottom-left-radius: 7px;
          border-bottom-right-radius: 7px;
        }

        .mobile-out-badge {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .mobile-out-hint {
          color: #ef4444;
          font-size: 0.76rem;
          font-weight: 600;
        }

        .mobile-out-btn {
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.55rem 0.95rem;
          border-radius: 8px;
          cursor: not-allowed;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* Modal Out of Stock */
        .modal-img-out-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(220, 38, 38, 0.95);
          color: #ffffff;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.4px;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          backdrop-filter: blur(4px);
        }

        .modal-out-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          width: 100%;
        }

        .modal-out-text strong {
          display: block;
          color: #b91c1c;
          font-size: 0.95rem;
          font-weight: 800;
          line-height: 1.25;
        }

        .modal-out-text .modal-out-ta {
          display: block;
          color: #ef4444;
          font-size: 0.82rem;
          font-weight: 600;
          line-height: 1.25;
        }
      `}</style>
    </div>
  );
};
