"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context/AppContext";

export default function CartDrawer() {
  const { 
    cart, isCartOpen, setIsCartOpen, 
    updateQuantity, removeFromCart, clearCart,
    isAuthenticated, setIsAuthModalOpen, setPendingAction 
  } = useAppContext();

  const subtotal = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  const router = useRouter();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      setPendingAction(() => () => {
        setIsCartOpen(true);
      });
      setIsAuthModalOpen(true);
      return;
    }
    
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--background)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-serif text-2xl flex items-center gap-2">
                <ShoppingBag size={24} className="text-[var(--gold)]" />
                Your Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p className="font-sans text-lg">Your cart is empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[var(--gold)] hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        key={item.pid} 
                        className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm"
                      >
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="w-20 h-20 object-cover rounded-xl bg-gray-50"
                        />
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-sans font-medium text-sm text-gray-900 line-clamp-2 leading-snug">
                            {item.productName}
                          </h4>
                          <p className="text-[var(--gold)] font-medium mt-1">
                            ₹{Math.round(item.sellPrice)}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.pid, item.quantity - 1)}
                                className="p-1 hover:text-[var(--gold)] transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.pid, item.quantity + 1)}
                                className="p-1 hover:text-[var(--gold)] transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(item.pid)}
                              className="text-xs text-red-400 hover:text-red-500 font-medium px-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-sans text-gray-500">Subtotal</span>
                  <span className="font-sans font-semibold text-xl">₹{Math.round(subtotal)}</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">Shipping & taxes calculated at checkout.</p>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-black transition-colors"
                >
                  Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
