import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchCart();
    }
  }, [user, navigate]);

  if (isLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Your shopping cart is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Looks like you haven't added any gear yet. Check out our high-performance hardware catalog!
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {cart.itemCount} items ready for checkout
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-center justify-between"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Link
                  to={`/products/${item.productSlug}`}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                >
                  <img
                    src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="space-y-1">
                  <Link
                    to={`/products/${item.productSlug}`}
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-slate-500 font-medium">
                    ${item.productPrice.toFixed(2)} each
                  </p>
                  {item.hasStockIssue && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> Only {item.stock} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-sm font-black text-slate-900">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <Link to="/products" className="hover:text-brand-600 font-semibold flex items-center gap-1">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${cart.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">${cart.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {cart.shippingCost === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `$${cart.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>

            {cart.subtotal < 150 && (
              <p className="text-[11px] text-brand-600 bg-brand-50 p-2 rounded-lg">
                Add ${(150 - cart.subtotal).toFixed(2)} more to qualify for Free Shipping!
              </p>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Estimated Total</span>
              <span className="text-2xl font-black text-slate-900">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Secure 256-Bit SSL Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Dispatched within 24 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
