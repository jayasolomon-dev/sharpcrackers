// ==========================================================================
// SHARP CRACKERS - CART & ORDER CONTEXT
// Manages shopping cart state, real-time calculations, and persistent sessions
// ==========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const CartContext = createContext();

const CART_STORAGE_KEY = 'sharp_crackers_cart_session';

// Helper to check if a product is out of stock (can be imported directly or via useCart)
export const isProductOutOfStock = (product) => {
  if (!product) return false;
  if (product.inStock === false) return true;
  if (product.stockCount !== undefined && product.stockCount !== null && product.stockCount !== '' && Number(product.stockCount) <= 0) {
    return true;
  }
  return false;
};

// Helper to get real-time available stock count for any product
export const getProductAvailableStock = (product) => {
  if (!product || product.inStock === false) return 0;
  if (product.stockCount !== undefined && product.stockCount !== null && product.stockCount !== '') {
    const s = parseInt(product.stockCount, 10);
    return isNaN(s) ? 0 : Math.max(0, s);
  }
  return 100; // Default stock when inStock is true
};

export const CartProvider = ({ children }) => {
  // Cart stored as { [productId]: quantity }
  const [quantities, setQuantities] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState(() => dataService.getProducts());
  const [settings, setSettings] = useState(() => dataService.getSettings());

  // Listen to product/setting updates & trigger multi-device real-time sync with Cloudflare D1
  useEffect(() => {
    const handleDataChange = () => {
      setProducts(dataService.getProducts());
      setSettings(dataService.getSettings());
    };
    window.addEventListener('sharp_data_changed', handleDataChange);

    // Initial remote fetch on page load from Cloudflare D1
    try {
      if (typeof dataService.fetchProducts === 'function') dataService.fetchProducts();
      if (typeof dataService.fetchCategories === 'function') dataService.fetchCategories();
      if (typeof dataService.fetchSettings === 'function') dataService.fetchSettings();
    } catch (e) {
      console.warn("Initial sync catch:", e);
    }

    // Cross-device live sync: poll Cloudflare D1 every 4 seconds
    const interval = setInterval(() => {
      try {
        if (typeof dataService.fetchProducts === 'function') dataService.fetchProducts();
        if (typeof dataService.fetchCategories === 'function') dataService.fetchCategories();
      } catch (_) {}
    }, 4000);

    // Tab focus / screen unlock sync
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          if (typeof dataService.fetchProducts === 'function') dataService.fetchProducts();
          if (typeof dataService.fetchCategories === 'function') dataService.fetchCategories();
        } catch (_) {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      window.removeEventListener('sharp_data_changed', handleDataChange);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantities));
  }, [quantities]);

  // Live multi-device / cross-tab stock reconciliation:
  // If product stock decreases below what customer selected, clamp quantity to available stock!
  useEffect(() => {
    if (!products || products.length === 0) return;
    setQuantities(prev => {
      let changed = false;
      const updated = { ...prev };
      for (const [id, qty] of Object.entries(prev)) {
        if (qty > 0) {
          const prod = products.find(p => p.id === id);
          if (prod) {
            const maxStock = getProductAvailableStock(prod);
            if (maxStock > 0 && qty > maxStock) {
              changed = true;
              updated[id] = maxStock;
            }
          }
        }
      }
      return changed ? updated : prev;
    });
  }, [products]);

  const getItemQuantity = (productId) => {
    return quantities[productId] || 0;
  };

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    const availableStock = getProductAvailableStock(product);

    // If trying to increase when stock is exhausted or 0, prevent it!
    if (delta > 0 && availableStock <= 0) {
      return;
    }

    setQuantities(prev => {
      const current = prev[productId] || 0;
      let next = current + delta;
      // Strictly prevent ordering more than available stock
      if (next > availableStock) {
        next = availableStock;
      }
      next = Math.max(0, next);

      const updated = { ...prev };
      if (next === 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return updated;
    });
  };

  const setItemQuantity = (productId, rawValue) => {
    let sanitized = rawValue;
    if (typeof rawValue === 'string') {
      sanitized = rawValue.replace(/\D/g, '').replace(/^0+/, '');
    }
    const val = parseInt(sanitized, 10);
    const rawNext = isNaN(val) ? 0 : Math.max(0, val);

    const product = products.find(p => p.id === productId);
    const availableStock = getProductAvailableStock(product);

    // Strictly clamp input to available stock limit
    const next = Math.min(availableStock, rawNext);

    setQuantities(prev => {
      const updated = { ...prev };
      if (next === 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setQuantities(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const clearCart = () => {
    setQuantities({});
  };

  // Compile cart items with full product snapshots, availableStock, and out-of-stock flags
  const cartItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      const availableStock = getProductAvailableStock(product);
      const isOut = isProductOutOfStock(product) || availableStock <= 0;
      const safeQty = isOut ? qty : Math.min(qty, availableStock);
      return {
        ...product,
        availableStock,
        quantity: safeQty,
        totalPrice: Number(product.unitPrice) * safeQty,
        isOutOfStock: isOut,
        isStockExceeded: qty > availableStock
      };
    })
    .filter(Boolean);

  const totalSelectedProducts = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const hasOutOfStockItems = cartItems.some(item => item.isOutOfStock || (item.availableStock !== undefined && item.quantity > item.availableStock));

  const deliveryCharge = 0;
  const cartGrandTotal = cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        quantities,
        products,
        settings,
        cartItems,
        totalSelectedProducts,
        totalQuantity,
        cartSubtotal,
        cartGrandTotal,
        deliveryCharge,
        hasOutOfStockItems,
        isProductOutOfStock,
        getProductAvailableStock,
        getItemQuantity,
        updateQuantity,
        setItemQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
