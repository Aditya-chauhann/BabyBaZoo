"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";
import { ShoppingBag, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw, X, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useAppContext();
  
  const [product, setProduct] = useState<any>(null);
  const [cleanDescription, setCleanDescription] = useState<string>('');
  const [descImages, setDescImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${baseUrl}/products/${params.id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);

      if (data.description) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.description, 'text/html');
        const imgs = Array.from(doc.querySelectorAll('img'));
        const imageUrls = imgs.map(img => img.src);
        imgs.forEach(img => img.remove());
        
        // Remove empty paragraphs left behind
        doc.querySelectorAll('p').forEach(p => {
          if (p.innerHTML.trim() === '' || p.innerHTML === '<br>') {
            p.remove();
          }
        });

        setDescImages(imageUrls);
        setCleanDescription(doc.body.innerHTML);
      }
    } catch (err) {
      console.error(err);
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    let singleImage = product.productImage || '';
    if (typeof singleImage === 'string' && singleImage.startsWith('[')) {
      try {
        const parsed = JSON.parse(singleImage);
        if (Array.isArray(parsed) && parsed.length > 0) singleImage = parsed[0];
      } catch(e) {}
    }
    
    const productToAdd = { ...product, productImage: singleImage };

    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd);
    }
  };

  const toggleWishlist = async () => {
    if (!localStorage.getItem('token')) {
      alert("Please login to use wishlist");
      return;
    }
    
    setIsWishlisted(!isWishlisted);
    
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
      setIsWishlisted(isWishlisted); 
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-28 flex justify-center items-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-serif mb-4">Product Not Found</h1>
        <button onClick={() => router.push('/products')} className="text-[var(--gold)] hover:underline">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--gold)] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            
            {/* Image Gallery */}
            <div 
              className="lg:col-span-3 p-8 md:border-r border-gray-100 flex items-center justify-center bg-gray-50/50 overflow-hidden group cursor-crosshair relative"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transformOrigin = `${x}% ${y}%`;
                  img.style.transform = 'scale(2.5)';
                }
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transformOrigin = 'center';
                  img.style.transform = 'scale(1)';
                }
              }}
              onClick={(e) => {
                setShowImageModal(true);
              }}
            >
              <img 
                src={(() => {
                  let img = product.productImage || '';
                  if (img.startsWith('[')) {
                    try {
                      const parsed = JSON.parse(img);
                      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                    } catch(e){}
                  }
                  return img;
                })()} 
                alt={product.productName}
                className="w-full max-w-lg object-contain rounded-xl mix-blend-multiply transition-transform duration-200"
              />
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)] mb-2">
                {product.categoryName}
              </p>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight mb-4">
                {product.productName}
              </h1>
              
              <div className="text-3xl font-bold text-gray-900 mb-8 flex items-baseline gap-2">
                ₹{Math.round(product.sellPrice || 0)}
                <span className="text-sm font-normal text-gray-500 line-through">
                  ₹{Math.round((product.sellPrice || 0) * 1.2)} {/* Mock original price */}
                </span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save 20%
                </span>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-900 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-[var(--gold)] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-[var(--gold)] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg">
                    In Stock
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[var(--gold)] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#c28f3c] transition-colors shadow-md"
                >
                  <ShoppingBag size={20} />
                  Add to Cart
                </button>
                <button 
                  onClick={toggleWishlist}
                  className="px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 border-2 border-gray-100 text-gray-600 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all bg-white"
                >
                  <Heart size={20} className={isWishlisted ? "fill-[var(--gold)] text-[var(--gold)]" : ""} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 mb-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                    <Truck size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Genuine Product</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                    <RotateCcw size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">7-Day Returns</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Description Full Width */}
        {(cleanDescription || descImages.length > 0) && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mt-12 p-8 lg:p-12 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h3 className="text-2xl md:text-3xl font-serif mb-8 text-gray-900 flex items-center gap-3 relative z-10">
              <span className="w-8 h-1 bg-[var(--gold)] rounded-full"></span>
              About this Product
            </h3>
            
            <div className="relative max-w-5xl mx-auto z-10">
              <div 
                className={`transition-all duration-500 ease-in-out ${!isDescExpanded ? 'max-h-[350px] overflow-hidden relative' : ''}`}
              >
                {cleanDescription && (
                  <div 
                    className="text-base text-gray-600 leading-relaxed prose prose-lg prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-600 max-w-none mb-10"
                    dangerouslySetInnerHTML={{ __html: cleanDescription }}
                  />
                )}
                
                {descImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
                    {descImages.map((src, idx) => (
                      <div key={idx} className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden shadow-sm group">
                        <img 
                          src={src} 
                          alt={`Product Detail ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Fade out mask when collapsed */}
                {!isDescExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>

              {/* Read More / Read Less Toggle */}
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="px-8 py-3 bg-white border-2 border-gray-100 hover:border-[var(--gold)] text-gray-700 hover:text-[var(--gold)] font-medium rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 group"
                >
                  {isDescExpanded ? 'Show Less' : 'Read Full Description'}
                  <ChevronDown className={`transition-transform duration-300 ${isDescExpanded ? 'rotate-180' : ''}`} size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300"
            onClick={() => setShowImageModal(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={(() => {
              let img = product.productImage || '';
              if (img.startsWith('[')) {
                try {
                  const parsed = JSON.parse(img);
                  if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                } catch(e){}
              }
              return img;
            })()} 
            alt={product.productName}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
