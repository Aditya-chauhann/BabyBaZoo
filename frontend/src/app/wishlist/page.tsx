"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import ProductCard, { Product } from "../../components/ProductCard";

export default function WishlistPage() {
  const { isAuthenticated, setIsAuthModalOpen } = useAppContext();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWishlist(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="min-h-screen pt-32 px-4 text-center">Loading wishlist...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center">
        <h2 className="font-serif text-3xl mb-4">Your Wishlist</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your wishlist.</p>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-[var(--gold)] text-white px-8 py-3 rounded-xl font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="font-serif text-4xl text-gray-900 mb-2">Your Wishlist</h2>
      <p className="font-sans text-gray-600 mb-12">Save your favorite items here for later.</p>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xl text-gray-500 mb-4">Your wishlist is empty.</p>
          <a href="/" className="text-[var(--gold)] font-medium hover:underline">Explore Products</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {wishlist.map((product) => (
            <ProductCard key={product.pid} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
