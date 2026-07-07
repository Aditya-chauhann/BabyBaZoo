"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ArrowRight, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, setIsAuthenticated, pendingAction, setPendingAction } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      if (showOtp) {
        // OTP Verification flow
        const res = await fetch(`${baseUrl}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'OTP Verification failed');
        }

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        resetState();
        
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      } else {
        // Login/Register flow
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin ? { email, password } : { name, email, password };

        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Authentication failed');
        }

        // If backend returns requireOtp, switch to OTP view
        if (data.data?.requireOtp) {
          setShowOtp(true);
          return;
        }

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        resetState();
        
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setIsLogin(true);
    setShowOtp(false);
    setEmail("");
    setPassword("");
    setName("");
    setOtp("");
    setError("");
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setTimeout(resetState, 300);
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              {showOtp && (
                <button 
                  onClick={() => setShowOtp(false)}
                  className="text-sm text-gray-500 hover:text-gray-900 mb-4 block mx-auto"
                >
                  ← Back to login
                </button>
              )}
              <h2 className="font-serif text-3xl text-gray-900 mb-2">
                {showOtp ? "Verify your email" : isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="font-sans text-gray-500">
                {showOtp 
                  ? `Enter the 6-digit code sent to ${email}` 
                  : isLogin 
                    ? "Sign in to access your wishlist and orders." 
                    : "Join Babybazoo for a premium experience."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
              
              {showOtp ? (
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--blush-200)] focus:border-[var(--blush-200)] outline-none transition-all"
                      placeholder="6-digit OTP code"
                      maxLength={6}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--blush-200)] focus:border-[var(--blush-200)] outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--blush-200)] focus:border-[var(--blush-200)] outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--blush-200)] focus:border-[var(--blush-200)] outline-none transition-all"
                        placeholder={isLogin ? "••••••••" : "Password (min 6 chars)"}
                        minLength={6}
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--gold)] text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-[#d4a04d] transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? "Please wait..." : showOtp ? "Verify & Login" : isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} />
              </button>
            </form>

            {!showOtp && (
              <div className="mt-6 text-center text-sm font-sans">
                <span className="text-gray-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-[var(--gold)] font-medium hover:underline"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
