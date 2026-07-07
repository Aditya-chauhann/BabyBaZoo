"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, ArrowRight, Check, Plus, X, MapPin, CreditCard, Truck } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isAuthenticated, isAuthInitialized, clearCart } = useAppContext();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    isDefault: false
  });

  const subtotal = Math.round(cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0));

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      router.push("/");
    }
    if (isAuthInitialized && cart.length === 0 && !orderSuccess) {
      router.push("/");
    }
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, isAuthInitialized, cart, router]);

  const fetchAddresses = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/address`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
        const defaultAddress = data.data.find((a: any) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (data.data.length > 0) {
          setSelectedAddressId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.pincode) {
        setCheckoutError("Please fill all required fields");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddressModal(false);
        setNewAddress({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "", pincode: "", isDefault: false });
        await fetchAddresses();
        setSelectedAddressId(data.data._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      // 1. Create order
      const res = await fetch(`${baseUrl}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart, total: subtotal, addressId: selectedAddressId, paymentMethod })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      if (paymentMethod === 'cod') {
        setOrderSuccess(data.data.orderId);
        clearCart();
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setCheckoutError("Failed to load Razorpay. Check your connection.");
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, currency } = data.data;

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyId",
        amount,
        currency,
        name: "Babybazoo",
        description: "Secure Checkout",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch(`${baseUrl}/orders/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderSuccess(orderId);
            clearCart();
          } else {
            setCheckoutError("Payment verification failed.");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#0ea5e9" // blue-500
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setCheckoutError(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setCheckoutError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (cart.length === 0 && !orderSuccess)) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-serif flex items-center gap-3 mb-8 text-[var(--gold)]">
          <Lock size={28} />
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address Box */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--gold)] flex items-center justify-center text-white font-bold text-sm">1</div>
                  <h2 className="text-xl font-serif">Delivery Address</h2>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--gold)] hover:text-[#c28f3c] transition-colors"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
                  <MapPin className="mx-auto text-amber-300 mb-3" size={32} />
                  <h3 className="text-amber-800 font-medium mb-1">No saved addresses</h3>
                  <p className="text-amber-600 text-sm mb-4">Add a delivery address to proceed with checkout.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-6 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${selectedAddressId === addr._id
                          ? 'border-[var(--gold)] bg-orange-50/30'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-[var(--gold)]' : 'border-gray-300'
                        }`}>
                        {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 bg-[var(--gold)] rounded-full" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{addr.fullName}</span>
                          {addr.isDefault && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Default</span>}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                          {addr.city}, {addr.state} {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                          📞 {addr.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Box */}
            <div className={`bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-opacity ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-[var(--gold)] flex items-center justify-center text-white font-bold text-sm">2</div>
                <h2 className="text-xl font-serif">Payment Method</h2>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === 'razorpay'
                      ? 'border-[var(--gold)] bg-orange-50/30'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-[var(--gold)]' : 'border-gray-300'
                    }`}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-[var(--gold)] rounded-full" />}
                  </div>
                  <CreditCard className={paymentMethod === 'razorpay' ? 'text-[var(--gold)]' : 'text-gray-400'} size={24} />
                  <div className="flex-1">
                    <span className="font-semibold block">Pay Online</span>
                    <span className="text-sm text-gray-500">UPI, Cards, Netbanking via Razorpay</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium tracking-wide">RECOMMENDED</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === 'cod'
                      ? 'border-[var(--gold)] bg-orange-50/30'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[var(--gold)]' : 'border-gray-300'
                    }`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[var(--gold)] rounded-full" />}
                  </div>
                  <Truck className={paymentMethod === 'cod' ? 'text-[var(--gold)]' : 'text-gray-400'} size={24} />
                  <div>
                    <span className="font-semibold block">Cash on Delivery</span>
                    <span className="text-sm text-gray-500">Pay when your order arrives</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !selectedAddressId}
                className="mt-8 w-full bg-[var(--gold)] text-white py-4 rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-[#c28f3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-lg"
              >
                {loading ? "Please wait..." : (
                  <>
                    <Lock size={18} />
                    Place Order — ₹{subtotal}
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.pid} className="flex gap-4 items-center">
                    <img src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{Math.round(item.sellPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-medium">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-serif">Total</span>
                  <span className="text-2xl font-bold text-[var(--gold)]">₹{subtotal}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif">Add a new address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                <input
                  type="text"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 1 *</label>
                <input
                  type="text"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
                <input
                  type="text"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country * (e.g., India)</label>
                <input
                  type="text"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none transition-shadow"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)]"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as default address</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                onClick={handleSaveAddress}
                className="flex-1 bg-[var(--gold)] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#c28f3c] transition-colors shadow-sm"
              >
                Save Address
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-2xl font-serif mb-2">Order Confirmed!</h3>
            <p className="text-gray-500 mb-8">Thank you for your purchase. We're getting your order ready.</p>
            <button
              onClick={() => router.push(`/account/orders/${orderSuccess}`)}
              className="w-full bg-[var(--gold)] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#c28f3c] transition-colors shadow-sm"
            >
              View Order Details
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {checkoutError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-serif mb-2">Checkout Failed</h3>
            <p className="text-gray-500 mb-8">{checkoutError}</p>
            <button
              onClick={() => setCheckoutError(null)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
