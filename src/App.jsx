// ==========================================================================
// SHARP CRACKERS - MAIN APPLICATION SHELL & ROUTER
// Combines Navbar, Footer, Dynamic View Routing, and Global Cart Context
// ==========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { CartProvider } from './context/CartContext';
import { dataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const getInitialPage = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path === '/admin-dashboard' || path.startsWith('/admin')) {
      return 'admin';
    }
    if (path === '/products' || path === '/catalog') return 'products';
    if (path === '/cart') return 'cart';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
  }
  return 'home';
};

export function App() {
  const [currentPage, setCurrentPageRaw] = useState(getInitialPage);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastOrderPlaced, setLastOrderPlaced] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => dataService.isAdminAuthenticated());
  const searchInputRef = useRef(null);

  const setCurrentPage = (page) => {
    setCurrentPageRaw(page);
    if (typeof window !== 'undefined') {
      const targetPath = page === 'home' ? '/' : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageRaw(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchOpen = () => {
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 150);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedCategory={setSelectedCategory} 
          />
        );

      case 'products':
        return (
          <ProductsPage 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            setCurrentPage={setCurrentPage} 
            searchInputRef={searchInputRef}
            lastOrderPlaced={lastOrderPlaced}
            onDismissNotification={() => setLastOrderPlaced(null)}
          />
        );

      case 'cart':
        return (
          <CartPage 
            setCurrentPage={setCurrentPage} 
            setLastOrderPlaced={setLastOrderPlaced} 
          />
        );

      case 'about':
        return <AboutUsPage setCurrentPage={setCurrentPage} />;

      case 'contact':
        return <ContactUsPage />;

      case 'admin':
      case 'admin-dashboard':
        if (dataService.isAdminAuthenticated() || isAdminLoggedIn) {
          return (
            <AdminDashboardPage 
              setCurrentPage={setCurrentPage} 
              onLogout={() => setIsAdminLoggedIn(false)} 
            />
          );
        } else {
          return (
            <AdminLoginPage 
              setCurrentPage={setCurrentPage} 
              onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            />
          );
        }

      case 'admin-login':
        return (
          <AdminLoginPage 
            setCurrentPage={setCurrentPage} 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
          />
        );

      default:
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedCategory={setSelectedCategory} 
          />
        );
    }
  };

  const isAdminView = currentPage === 'admin-dashboard' || (currentPage === 'admin' && isAdminLoggedIn);

  return (
    <CartProvider>
      <div className="app-root">
        {/* Render Customer Navbar on non-admin-dashboard pages */}
        {!isAdminView && (
          <Navbar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            onSearchOpen={handleSearchOpen}
          />
        )}

        {/* Dynamic Page Content */}
        <main className="main-content-flow">
          {renderCurrentPage()}
        </main>

        {/* Render Customer Footer on non-admin-dashboard pages */}
        {!isAdminView && (
          <Footer setCurrentPage={setCurrentPage} />
        )}
      </div>
    </CartProvider>
  );
}

export default App;
