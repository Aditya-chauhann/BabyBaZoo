"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/navigation";
import { Package } from "lucide-react";
import { useAppContext } from "../../../context/AppContext";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isAuthInitialized } = useAppContext();

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, isAuthInitialized, router]);

  const fetchOrders = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif mb-8 text-[var(--gold)] flex items-center gap-3">
          <Package size={28} />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-serif mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-[var(--gold)] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#c28f3c] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div 
                key={order._id} 
                onClick={() => router.push(`/account/orders/${order._id}`)}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Order ID</span>
                    <p className="font-semibold text-gray-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date</span>
                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total</span>
                    <p className="font-medium text-[var(--gold)]">₹{order.subtotal}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className={`font-medium px-3 py-1 rounded-full text-xs inline-block mt-1 ${
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto py-2">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-gray-50 rounded-xl p-2 pr-4 border border-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                        {item.image ? (
                          <img 
                            src={(() => {
                              let img = item.image || '';
                              if (img.startsWith('[')) {
                                try {
                                  const parsed = JSON.parse(img);
                                  if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                                } catch(e){}
                              }
                              return img;
                            })()} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          'Img'
                        )}
                      </div>
                      <div className="w-32">
                        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
