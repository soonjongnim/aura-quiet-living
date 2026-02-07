/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Journal from './components/Journal';
import Assistant from './components/Assistant';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import JournalDetail from './components/JournalDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Admin from './components/Admin';
import RecommendModal from './components/RecommendModal';

import { Product, JournalArticle, ViewState, User } from './types';

import { useEffect } from 'react';



function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);


  useEffect(() => {
    const fetchProducts = async () => {
      const API_BASE_URL = '';
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();

    const savedUser = localStorage.getItem('aura_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);


  const trackAction = async (actionType: 'view' | 'click' | 'buy', productId?: string) => {
    if (!user) return;
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? `http://${window.location.hostname}:3001`
      : '';
    try {
      await fetch(`${API_BASE_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.username, actionType, productId }),
      });
    } catch (err) {
      console.error('Failed to track action', err);
    }
  };

  const handleLogin = async (username: string, pw: string) => {
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? `http://${window.location.hostname}:3001`
      : '';
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('aura_user', JSON.stringify(data.user));
        setView({ type: 'home' });
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleAiRecommend = async () => {
    if (!user) {
      alert('AI 추천을 위해 먼저 로그인해 주세요!');
      setView({ type: 'login' });
      return;
    }
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? `http://${window.location.hostname}:3001`
      : '';
    setIsAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend?userId=${user.username}`);
      const data = await res.json();
      if (data.success) {
        console.log('[AI Recommendation Results]', data.recommendations.slice(0, 5));
        setRecommendations(data.recommendations);
        setIsAiModalOpen(true);
      } else {
        alert('추천을 불러오지 못했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('AI Recommend Error:', err);
      alert('서버와 통신 중 오류가 발생했습니다. 백엔드가 실행 중인지 확인해 주세요.');
    } finally {
      setIsAiLoading(false);
    }
  };



  // Handle navigation (clicks on Navbar or Footer links)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // If we are not home, go home first
    if (view.type !== 'home') {
      setView({ type: 'home' });
      // Allow state update to render Home before scrolling
      setTimeout(() => scrollToSection(targetId), 0);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      // Manual scroll calculation to account for fixed header
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      try {
        window.history.pushState(null, '', `#${targetId}`);
      } catch (err) {
        // Ignore SecurityError in restricted environments
      }
    }
  };

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
      <Navbar
        onNavClick={handleNavClick}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onLoginClick={() => setView({ type: 'login' })}

        onLogout={() => {
          setUser(null);
          localStorage.removeItem('aura_user');
        }}
        onAdminClick={() => setView({ type: 'admin' })}
      />



      <main>
        {view.type === 'home' && (
          <>
            <Hero />
            <ProductGrid
              products={products}
              onProductClick={(p) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                trackAction('click', p.id);
                setView({ type: 'product', product: p });
              }}
              onAiRecommend={handleAiRecommend}
              isAiLoading={isAiLoading}
              aiRecommendations={recommendations}
              showAiSection={isAiModalOpen}
              onCloseAiSection={() => setIsAiModalOpen(false)}
            />


            <About />
            <Journal onArticleClick={(a) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setView({ type: 'journal', article: a });
            }} />
          </>
        )}


        {view.type === 'product' && (
          <ProductDetail
            product={view.product}
            onBack={() => {
              setView({ type: 'home' });
              setTimeout(() => scrollToSection('products'), 50);
            }}
            onAddToCart={(p) => {
              addToCart(p);
              trackAction('view', p.id); // Also track view when adding to cart? Or just when viewing?
            }}
            onView={() => trackAction('view', view.product.id)}
          />
        )}


        {view.type === 'journal' && (
          <JournalDetail
            article={view.article}
            onBack={() => setView({ type: 'home' })}
          />
        )}

        {view.type === 'checkout' && (
          <Checkout
            items={cartItems}
            onBack={() => setView({ type: 'home' })}
            onComplete={() => {
              cartItems.forEach(item => trackAction('buy', item.id));
              setCartItems([]);
              setView({ type: 'home' });
            }}
          />
        )}

        {view.type === 'login' && (
          <Login
            onLogin={handleLogin}
            onBack={() => setView({ type: 'home' })}
            error={loginError}
          />
        )}

        {view.type === 'admin' && (
          <Admin />
        )}


      </main>

      {view.type !== 'checkout' && <Footer onLinkClick={handleNavClick} />}

      <Assistant />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView({ type: 'checkout' });
        }}
      />

      {user && (
        <RecommendModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          username={user.username}
          recommendations={recommendations}
        />
      )}
    </div>

  );
}

export default App;
