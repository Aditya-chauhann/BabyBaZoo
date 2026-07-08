"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, { Product } from "@/components/ProductCard";
import { ChevronDown } from "lucide-react";

function ProductsList() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    // Reset products and page when category or search changes
    setProducts([]);
    setPage(1);
    fetchProducts(1, true);
  }, [categoryId, sortBy, searchQuery]);

  const fetchProducts = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      let url = `${baseUrl}/products?limit=24&page=${pageNum}`;
      if (categoryId) url += `&categoryId=${categoryId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      let newProducts = data.list || [];
      
      // Client-side filtering for search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        newProducts = newProducts.filter((p: any) => 
          p.productName.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
      }
      
      // Client-side sorting for demonstration
      if (sortBy === "Price Low-High") {
        newProducts.sort((a: any, b: any) => a.sellPrice - b.sellPrice);
      } else if (sortBy === "Price High-Low") {
        newProducts.sort((a: any, b: any) => b.sellPrice - a.sellPrice);
      }

      setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
      
      // Mocking total count based on data if not provided by backend
      if (data.total) setTotalCount(data.total);
      else if (reset) setTotalCount(newProducts.length * 5 + 100); // Fake total count for UI

    } catch (error) {
      console.warn("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const getCategoryTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    switch(categoryId) {
      case "1336151594957590528": return "Clothing";
      case "1336151594957590529": return "Toys";
      case "1336151594957590530": return "Essentials";
      default: return "All Products";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
              {getCategoryTitle()}
            </h1>
            <p className="text-gray-500">
              {totalCount > 0 ? `${totalCount.toLocaleString()} products` : 'Loading...'}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">

            
            <div className="relative group flex-1 md:flex-none">
              <button className="flex items-center justify-between gap-2 w-full md:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                Sort by: {sortBy}
                <ChevronDown size={18} className="text-gray-400" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button onClick={() => setSortBy("Newest")} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">Newest First</button>
                <button onClick={() => setSortBy("Price Low-High")} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">Price: Low to High</button>
                <button onClick={() => setSortBy("Price High-Low")} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)]">Price: High to Low</button>
              </div>
            </div>
          </div>
        </div>

        {products.length === 0 && !loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <h3 className="text-xl font-serif text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, idx) => (
              <ProductCard key={`${product.pid}-${idx}`} product={product} />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-4">Showing {products.length} of {totalCount} products</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1 mb-6 overflow-hidden">
              <div 
                className="bg-[var(--gold)] h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((products.length / totalCount) * 100, 100)}%` }}
              ></div>
            </div>
            <button 
              onClick={loadMore}
              className="px-8 py-3 bg-white border-2 border-[var(--gold)] text-[var(--gold)] rounded-xl font-medium hover:bg-[var(--gold)] hover:text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 flex justify-center">Loading...</div>}>
      <ProductsList />
    </Suspense>
  );
}
