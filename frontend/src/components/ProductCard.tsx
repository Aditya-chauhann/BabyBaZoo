"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";

export interface Product {
  pid: string;
  productName: string;
  productImage: string;
  sellPrice: number;
  categoryName: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      alert("Please login to use wishlist");
      return;
    }
    
    setIsWishlisted(!isWishlisted); // Optimistic UI
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      await fetch(`${baseUrl}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product)
      });
    } catch (err) {
      setIsWishlisted(isWishlisted); // Revert on failure
    }
  };

  return (
    <Link href={`/products/${product.pid}`}>
      <motion.div 
        className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-[var(--background)] overflow-hidden">
          <img 
            src={product.productImage} 
            alt={product.productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Wishlist Button */}
          <button 
            onClick={toggleWishlist}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isWishlisted ? 'filled' : 'outline'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Heart 
                  size={20} 
                  className={isWishlisted ? "fill-[var(--blush-200)] text-[var(--blush-200)]" : "text-gray-500"} 
                />
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Quick Add Button (Desktop Hover) */}
          <div className="absolute bottom-4 left-0 w-full px-4 overflow-hidden">
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 50, opacity: isHovered ? 1 : 0 }}
              className="w-full bg-[var(--gold)] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hidden md:flex"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
            >
              <ShoppingBag size={18} />
              Quick Add
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            {product.categoryName}
          </p>
          <h3 className="font-sans text-sm font-medium leading-relaxed text-gray-800 mb-2 line-clamp-2">
            {product.productName}
          </h3>
          
          {/* Mock Reviews */}
          <div className="flex items-center gap-1 mb-3">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700">
              {(4.0 + (product.pid.charCodeAt(0) % 10) / 10).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({(product.pid.charCodeAt(product.pid.length - 1) * 3) + 12})
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <p className="font-sans font-semibold text-base text-gray-900">
              ₹{Math.round(Number(product.sellPrice || 0))}
            </p>
            
            {/* Mobile Add Button */}
            <button 
              className="md:hidden p-2 bg-[var(--background)] rounded-full text-[var(--gold)] hover:bg-[var(--blush-100)] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
