"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Package, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";
import { useAppContext } from "../../../../context/AppContext";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const { isAuthenticated, isAuthInitialized } = useAppContext();

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [isAuthenticated, isAuthInitialized, router, params.id]);

  const fetchOrder = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        alert("Failed to load order");
        router.push('/account/orders');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/orders/${params.id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setShowCancelModal(false);
        fetchOrder();
      } else {
        alert(data.message || "Failed to cancel order");
        setShowCancelModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling order");
      setShowCancelModal(false);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  if (!order) return null;

  const steps = [
    { label: "Order Placed", icon: Package },
    { label: "Processing", icon: Clock },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return -1; // Cancelled
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';
  const canCancel = !isCancelled && order.status !== 'Shipped' && order.status !== 'Delivered';

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/account/orders')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--gold)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-[var(--gold)]">Order Details</h1>
            <p className="text-gray-500 mt-1">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
          </div>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelLoading}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-6 shadow-sm">
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center py-6">
              <XCircle className="text-red-500 mb-3" size={48} />
              <h3 className="text-xl font-serif text-red-700 mb-1">Order Cancelled</h3>
              <p className="text-gray-500">This order has been cancelled and will not be shipped.</p>
            </div>
          ) : (
            <div className="relative flex justify-between items-center max-w-2xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--gold)] -z-10 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= currentStepIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-[var(--gold)] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-serif mb-4">Items</h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs shrink-0 overflow-hidden">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-[var(--gold)]">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-serif mb-4">Summary</h3>
              <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium">{order.paymentId ? 'Paid Online' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-[var(--gold)] text-lg">₹{order.subtotal}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                {order.addressId ? (
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-900 block">{order.addressId.fullName}</span>
                    {order.addressId.addressLine1} {order.addressId.addressLine2}<br />
                    {order.addressId.city}, {order.addressId.state} {order.addressId.pincode}<br />
                    📞 {order.addressId.phone}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Address details unavailable.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-serif mb-2">Cancel Order</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={cancelLoading}
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2.5 px-4 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Success Modal */}
      {cancelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-serif mb-2">Order Cancelled</h3>
            <p className="text-gray-500 mb-8">Your order has been successfully cancelled.</p>
            <button
              onClick={() => setCancelSuccess(false)}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
