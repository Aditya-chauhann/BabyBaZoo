import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-8 pb-4">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Social */}
          <div className="space-y-6">
            <span className="font-serif text-3xl font-medium tracking-tight text-[var(--gold)]">
              Babybazoo
            </span>
            <p className="font-sans text-gray-500 max-w-xs">
              Curated premium clothing, toys, and essentials for your baby's first milestones.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-gray-900 uppercase tracking-wider text-sm mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><a href="/products?categoryId=1336151594957590528" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Clothing</a></li>
              <li><a href="/products?categoryId=1336151594957590529" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Educational Toys</a></li>
              <li><a href="/products?categoryId=1336151594957590530" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Nursery & Gear</a></li>
              <li><a href="/products" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">New Arrivals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-sans font-semibold text-gray-900 uppercase tracking-wider text-sm mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Help Center</a></li>
              <li><a href="/account/orders" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Track Order</a></li>
              <li><a href="#" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="font-sans text-gray-500 hover:text-[var(--gold)] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-sans font-semibold text-gray-900 uppercase tracking-wider text-sm mb-6">Join Our Newsletter</h4>
            <p className="font-sans text-gray-500 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:border-[var(--blush-200)] transition-colors">
              <div className="flex-grow flex items-center bg-gray-50 px-3">
                <Mail size={16} className="text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm px-2 py-3 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-[var(--gold)] text-white px-4 font-medium hover:bg-[#d4a04d] transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Babybazoo. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
