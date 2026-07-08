"use client";

import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Navbar() {
  const { cart, setIsCartOpen, isAuthenticated, setIsAuthModalOpen, logout } = useAppContext();
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <button className="p-2 text-gray-500 hover:text-gray-900">
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-start flex-1">
            <a href="/" className="font-serif text-3xl font-medium tracking-tight">
              <span className="text-[var(--gold)]">Baby</span><span className="text-black">Ba</span><span className="text-[var(--gold)]">Zoo.</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
            <a href="/products" className="font-sans text-gray-600 hover:text-gray-900 transition-colors">All</a>
            <a href="/products?categoryId=1336151594957590528" className="font-sans text-gray-600 hover:text-gray-900 transition-colors">Clothing</a>
            <a href="/products?categoryId=1336151594957590529" className="font-sans text-gray-600 hover:text-gray-900 transition-colors">Toys</a>
            <a href="/products?categoryId=1336151594957590530" className="font-sans text-gray-600 hover:text-gray-900 transition-colors">Essentials</a>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end flex-1 space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              <Search size={22} />
            </button>
            <div className="relative group">
              <button 
                className="p-2 text-gray-500 hover:text-[var(--gold)] transition-colors hidden sm:block"
                onClick={() => {
                  if (!isAuthenticated) setIsAuthModalOpen(true);
                }}
              >
                <User size={22} />
              </button>
              {isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2 border-b border-gray-100">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">My Profile</a>
                    <a href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">My Orders</a>
                  </div>
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shopping</div>
                    <a href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">My Wishlist</a>
                  </div>
                  <div className="py-2 border-t border-gray-100">
                    <button onClick={() => logout()} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="p-2 text-gray-500 hover:text-[var(--gold)] transition-colors relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={22} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[var(--gold)] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
