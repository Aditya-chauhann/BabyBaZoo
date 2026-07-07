"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, MapPin, Mail, Calendar, Phone, Plus, X, Lock, AlertCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthInitialized, logout } = useAppContext();

  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'security'>('details');
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Security State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityAction, setSecurityAction] = useState<'change_password' | 'delete_account' | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

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

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isAuthInitialized, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const [userRes, addrRes] = await Promise.all([
        fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/address`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const userData = await userRes.json();
      const addrData = await addrRes.json();

      if (userData.success) setUser(userData.data);
      if (addrData.success) setAddresses(addrData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.pincode) {
        alert("Please fill all required fields");
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
        // Refresh addresses
        const addrRes = await fetch(`${baseUrl}/address`, { headers: { 'Authorization': `Bearer ${token}` } });
        const addrData = await addrRes.json();
        if (addrData.success) setAddresses(addrData.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      await fetch(`${baseUrl}/address/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [securityMessage, setSecurityMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSendSecurityOtp = async (action: 'change_password' | 'delete_account') => {
    setSecurityLoading(true);
    setSecurityMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/auth/send-security-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSecurityAction(action);
        if (action === 'delete_account') setShowDeleteModal(false);
      } else {
        setSecurityMessage({ text: data.message || "Failed to send OTP", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSecurityMessage({ text: "An error occurred while sending OTP", type: 'error' });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifySecurityAction = async () => {
    setSecurityMessage(null);
    if (!otp) {
      setSecurityMessage({ text: "Please enter the OTP", type: 'error' });
      return;
    }
    if (securityAction === 'change_password' && newPassword.length < 6) {
      setSecurityMessage({ text: "Password must be at least 6 characters", type: 'error' });
      return;
    }
    
    setSecurityLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/auth/security-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: securityAction, otp, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        if (securityAction === 'delete_account') {
          logout();
          router.push('/');
        } else {
          setSecurityMessage({ text: data.message || "Password changed successfully!", type: 'success' });
          setOtpSent(false);
          setOtp('');
          setNewPassword('');
          setSecurityAction(null);
        }
      } else {
        setSecurityMessage({ text: data.message || "Action failed", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSecurityMessage({ text: "An error occurred during verification", type: 'error' });
    } finally {
      setSecurityLoading(false);
    }
  };

  if (!isAuthInitialized || loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif mb-8 text-[var(--gold)] flex items-center gap-3">
          <UserIcon size={28} />
          My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${activeTab === 'details' ? 'bg-[var(--gold)] text-white' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <UserIcon size={20} /> Account Details
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${activeTab === 'addresses' ? 'bg-[var(--gold)] text-white' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <MapPin size={20} /> Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${activeTab === 'security' ? 'bg-[var(--gold)] text-white' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <Lock size={20} /> Security
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">

              {activeTab === 'details' && user && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-serif mb-6">Account Details</h2>

                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 bg-orange-100 text-[var(--gold)] rounded-full flex items-center justify-center text-3xl font-serif">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{user.name}</h3>
                      <p className="text-gray-500">Member since {new Date(user.createdAt).getFullYear()}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <Mail className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-0.5">Email Address</p>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif">Saved Addresses</h2>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={16} /> Add New
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                      <MapPin className="mx-auto text-gray-300 mb-3" size={32} />
                      <p className="text-gray-500">You haven't saved any addresses yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(addr => (
                        <div key={addr._id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex justify-between items-start group hover:border-[var(--gold)] transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-lg">{addr.fullName}</span>
                              {addr.isDefault && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">Default</span>}
                            </div>
                            <p className="text-gray-600 leading-relaxed max-w-md">
                              {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-gray-600 mt-2 flex items-center gap-2 font-medium">
                              <Phone size={14} className="text-gray-400" /> {addr.phone}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-in fade-in duration-300 max-w-2xl">
                  <h2 className="text-2xl font-serif mb-6">Security Settings</h2>
                  
                  {securityMessage && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                      securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="font-medium text-sm">{securityMessage.text}</p>
                    </div>
                  )}

                  {!otpSent ? (
                    <div className="space-y-8">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
                        <p className="text-gray-500 text-sm mb-4">We'll send a one-time password (OTP) to your registered email to verify your identity before changing the password.</p>
                        <button
                          onClick={() => handleSendSecurityOtp('change_password')}
                          disabled={securityLoading}
                          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {securityLoading ? "Please wait..." : "Change Password"}
                        </button>
                      </div>

                      <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                        <h3 className="text-lg font-medium text-red-700 mb-2">Delete Account</h3>
                        <p className="text-red-500/80 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          disabled={securityLoading}
                          className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {securityLoading ? "Please wait..." : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-md">
                      <h3 className="text-xl font-serif mb-2">
                        {securityAction === 'change_password' ? 'Set New Password' : 'Confirm Deletion'}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6">
                        Please enter the 6-digit OTP sent to <strong>{user?.email}</strong>.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP *</label>
                          <input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                          />
                        </div>

                        {securityAction === 'change_password' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                            <input
                              type="password"
                              placeholder="Min. 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                            />
                          </div>
                        )}

                        <div className="pt-2 flex gap-3">
                          <button
                            onClick={handleVerifySecurityAction}
                            disabled={securityLoading || !otp || (securityAction === 'change_password' && newPassword.length < 6)}
                            className={`flex-1 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                              securityAction === 'delete_account' ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--gold)] hover:bg-[#c28f3c]'
                            }`}
                          >
                            {securityLoading ? "Verifying..." : securityAction === 'delete_account' ? 'Confirm Delete' : 'Update Password'}
                          </button>
                          <button
                            onClick={() => {
                              setOtpSent(false);
                              setOtp('');
                              setNewPassword('');
                              setSecurityAction(null);
                            }}
                            className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Address Modal (Reused from Checkout) */}
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 1 *</label>
                <input
                  type="text"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
                <input
                  type="text"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country * (e.g., India)</label>
                <input
                  type="text"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none"
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-serif text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to permanently delete your account? This action cannot be undone and will require OTP verification.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={securityLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendSecurityOtp('delete_account')}
                disabled={securityLoading}
                className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2.5 px-4 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {securityLoading ? "Sending OTP..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
