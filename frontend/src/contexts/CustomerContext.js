import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCartByCustomer } from '../api';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const raw = localStorage.getItem('customer');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (customer) localStorage.setItem('customer', JSON.stringify(customer));
      else localStorage.removeItem('customer');
    } catch (e) {
    }
  }, [customer]);

  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async (overrideCustomer) => {
    try {
      const c = overrideCustomer || customer;
      if (!c) {
        setCartCount(0);
        return null;
      }
      const cart = await getCartByCustomer(c._id || c.id);
      const qty = (cart?.items || []).reduce((s, i) => s + (i.qty || 0), 0);
      setCartCount(qty);
      return cart;
    } catch (e) {
      setCartCount(0);
      return null;
    }
  }, [customer]);

  // refresh cart when customer changes
  useEffect(() => {
    refreshCart();
  }, [customer, refreshCart]);

  // listen for cross-component/tab cart updates
  useEffect(() => {
    const handler = () => refreshCart();
    window.addEventListener('cart-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, [refreshCart]);

  const value = { customer, setCustomer, cartCount, refreshCart };
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}

export default CustomerContext;
