// ==========================================================================
// SHARP CRACKERS - CART & ORDER CONTEXT
// Manages shopping cart state, real-time calculations, and persistent sessions
// ==========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const CartContext = createContext();

const CART_STORAGE_KEY = 'sharp_crackers_cart_session';

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

  const getItemQuantity = (productId) => {
    return quantities[productId] || 0;
  };

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
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
    const val = parseInt(rawValue, 10);
    const next = isNaN(val) ? 0 : Math.max(0, val);
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

  // Compile cart items with full product snapshots
  const cartItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return {
        ...product,
        quantity: qty,
        totalPrice: Number(product.unitPrice) * qty
      };
    })
    .filter(Boolean);

  const totalSelectedProducts = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const deliveryCharge = 0;
  const cartGrandTotal = cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        quantities,
        cartItems,
        getItemQuantity,
        updateQuantity,
        setItemQuantity,
        removeFromCart,
        clearCart,
        totalSelectedProducts,
        totalQuantity,
        cartSubtotal,
        deliveryCharge,
        cartGrandTotal,
        settings,
        products
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
