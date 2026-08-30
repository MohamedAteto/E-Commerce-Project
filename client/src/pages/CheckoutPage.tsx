import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { ShieldCheck, ArrowLeft, Lock, Loader2, Sparkles } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();

  const [address, setAddress] = useState({
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
    phone: '+1 (555) 019-2834',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchCart();
    }
  }, [user, navigate]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleQuickFill = () => {
    setAddress({
      street: '100 Innovation Way, Suite 400',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
      phone: '+1 (512) 555-0143',
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const res = await api.post('/orders', {
        shippingAddress: address,
      });

      const createdOrder = res.data.data.order;
      await fetchCart(); // Refresh cart in state
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please review your cart and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
          Express Checkout
        </h1>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          title="Order Processing Error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Shipping Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">Shipping Destination</h3>
              </div>

              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Sample Address
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Street Address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
                <Input
                  label="State / Province"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal / Zip Code"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  required
                />
                <Input
                  label="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Phone Number (for courier updates)"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Payment Method</h3>
            </div>
            <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-900">Direct Express Settlement (Instant Test Mode)</p>
                <p className="text-[11px] text-brand-700 mt-0.5">
                  Server-side transaction simulation with real-time stock decrement and snapshot creation.
                </p>
              </div>
              <Lock className="w-5 h-5 text-brand-600 shrink-0" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-base rounded-xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing Order...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" /> Complete Order (${cart.total.toFixed(2)})
              </>
            )}
          </button>
        </form>

        {/* Order Review Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
            Order Review ({cart.itemCount} items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {item.quantity}x
                  </span>
                  <span className="text-slate-800 font-medium truncate">{item.productName}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-slate-900">${cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-bold text-slate-900">
                {cart.shippingCost === 0 ? 'FREE' : `$${cart.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-xl text-brand-600">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Guaranteed bank-grade cryptographic transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};
