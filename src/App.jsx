// ==========================================================================
// SHARP CRACKERS - MAIN APPLICATION SHELL & ROUTER
// Combines Navbar, Footer, Dynamic View Routing, and Global Cart Context
// ==========================================================================

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { CartProvider } from './context/CartContext';
import { dataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';

const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

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

  // Global Smooth Scroll Reveal for all sections, texts, and cards
  useEffect(() => {
    const scrollRevealSelectors = [
      '.reveal-on-scroll',
      '.section-header',
      '.section-header-flex',
      '.section-subtitle',
      '.section-subtitle-badge',
      '.section-title',
      '.section-desc',
      '.category-card',
      '.bestseller-card',
      '.gift-box-card',
      '.why-card',
      '.review-card',
      '.faq-card',
      '.faq-item',
      '.story-content-col',
      '.story-visual-col',
      '.story-feature-card',
      '.story-quick-contact',
      '.stat-pill-box',
      '.pillar-card',
      '.timeline-item',
      '.safety-rule-card',
      '.about-cta-card',
      '.contact-section-intro',
      '.contact-info-card',
      '.contact-form-card',
      '.quick-contact-grid',
      '.quick-card',
      '.direct-call-banner',
      '.map-card-wrapper',
      '.hours-card',
      '.promo-banner-inner',
      '.feature-pill'
    ].join(', ');

    let observer;

    const setupObserver = () => {
      const elements = document.querySelectorAll(scrollRevealSelectors);
      if (!elements.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px 85px 0px', // Trigger ahead of scroll so user never sees empty white gaps
          threshold: 0.01 // Instantly trigger as soon as the element boundary nears
        }
      );

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInInitialViewport = rect.top < viewportHeight + 100 && rect.bottom > -50;

        // Elements already in view on load/switch are revealed immediately with zero white flash
        if (isInInitialViewport) {
          el.classList.add('is-revealed');
          return;
        }

        if (
          !el.classList.contains('reveal-on-scroll') && 
          !el.classList.contains('reveal-scale') && 
          !el.classList.contains('reveal-from-left') && 
          !el.classList.contains('reveal-from-right')
        ) {
          el.classList.add('reveal-on-scroll');
        }

        // Apply progressive subtle stagger delay only for immediate siblings in grid/flex
        if (!el.style.transitionDelay && el.parentElement) {
          const siblings = Array.from(el.parentElement.children);
          const siblingIndex = siblings.indexOf(el);
          if (siblingIndex > 0 && siblings.length > 1) {
            el.style.transitionDelay = `${Math.min((siblingIndex % 3) * 0.04, 0.12)}s`;
          }
        }

        observer.observe(el);
      });
    };

    // Synchronize with next animation frame for silky 60/90/120fps paint
    const rafId = requestAnimationFrame(setupObserver);

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [currentPage]);

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
        <main className="main-content-flow page-enter-active" key={currentPage}>
          <ErrorBoundary setCurrentPage={setCurrentPage}>
            <Suspense fallback={
              <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  border: '3px solid rgba(255,111,0,0.15)', 
                  borderTop: '3px solid #ff6f00', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite' 
                }} />
              </div>
            }>
              {renderCurrentPage()}
            </Suspense>
          </ErrorBoundary>
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
