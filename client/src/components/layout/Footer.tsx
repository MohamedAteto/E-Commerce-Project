import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Guarantees Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="footer-feature-icon">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-400">On all orders over $150</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="footer-feature-icon">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">2-Year Full Warranty</h4>
                <p className="text-xs text-slate-400">100% genuine guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="footer-feature-icon">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">30-Day Hassle Returns</h4>
                <p className="text-xs text-slate-400">Instant store refunds</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="footer-feature-icon">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">24/7 Expert Support</h4>
                <p className="text-xs text-slate-400">Dedicated tech specialists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-black text-lg">
              <ShoppingBag className="w-6 h-6 text-brand-500" />
              <span>NEXUS COMMERCE</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Engineered for cutting-edge performance. We deliver premium audio, wearable technology, and developer-grade computing hardware.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Shop Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?categoryId=audio-sound" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
              <li><Link to="/products?categoryId=smart-wearables" className="hover:text-white transition-colors">Smart Wearables</Link></li>
              <li><Link to="/products?categoryId=laptops-computers" className="hover:text-white transition-colors">Laptops & Computers</Link></li>
              <li><Link to="/products?categoryId=tech-accessories" className="hover:text-white transition-colors">Charging & Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Complete Catalog</Link></li>
              <li><span className="text-slate-500 cursor-not-allowed">Shipping & Returns Policies</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Newsletter</h5>
            <p className="text-xs mb-3 text-slate-400">Get early access to exclusive drops and tech hardware updates.</p>
            <form className="flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setIsSubscribed(false);
                }}
                aria-label="Email address for newsletter"
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 flex-1 min-w-0"
              />
              <button type="submit" className="subscribe-button text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer">
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
            {isSubscribed && <p className="text-[11px] text-brand-400 mt-2" role="status">Thanks — you’re on the list.</p>}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nexus Commerce Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Production-Grade E-Commerce Application</p>
        </div>
      </div>
    </footer>
  );
};
