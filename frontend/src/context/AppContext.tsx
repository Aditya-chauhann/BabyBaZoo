"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../components/ProductCard";

export interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (pid: string) => void;
  updateQuantity: (pid: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  user: any;
  setUser: (user: any) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => void;
  
  // Pending action to resume after login
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;

  isAuthInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
    setIsAuthInitialized(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const addToCart = (product: Product) => {
    let singleImage = product.productImage || '';
    if (typeof singleImage === 'string' && singleImage.startsWith('[')) {
      try {
        const parsed = JSON.parse(singleImage);
        if (Array.isArray(parsed) && parsed.length > 0) singleImage = parsed[0];
      } catch(e) {}
    }
    const safeProduct = { ...product, productImage: singleImage };

    if (!isAuthenticated) {
      setPendingAction(() => () => {
        setCart((prev) => {
          const existing = prev.find((item) => item.pid === safeProduct.pid);
          if (existing) {
            return prev.map((item) =>
              item.pid === safeProduct.pid ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prev, { ...safeProduct, quantity: 1 }];
        });
        setIsCartOpen(true);
      });
      setIsAuthModalOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.pid === safeProduct.pid);
      if (existing) {
        return prev.map((item) =>
          item.pid === safeProduct.pid ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...safeProduct, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (pid: string) => {
    setCart((prev) => prev.filter((item) => item.pid !== pid));
  };

  const updateQuantity = (pid: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.pid === pid ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        pendingAction,
        setPendingAction,
        isAuthInitialized,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
