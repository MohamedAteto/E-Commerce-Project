import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Order, ShippingAddress } from '../types';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { CheckCircle2, Package, ArrowRight, Home, MapPin, Calendar } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data.order;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">We could not locate this order confirmation.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  let address: ShippingAddress = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };

  try {
    address = JSON.parse(order.shippingAddress);
  } catch {
    // fallback
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-slide-up">
      {/* Confirmation Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Order Confirmed & Logged
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            We've received your request and dispatched inventory allocation. A confirmation summary is below.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 font-mono text-slate-700 font-semibold">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </div>
          <Badge variant="success" size="md">Status: {order.status}</Badge>
        </div>
      </div>

      {/* Order Details & Summary Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Shipping Address
            </div>
            <p className="font-semibold text-slate-900">{address.street}</p>
            <p className="text-slate-600">{address.city}, {address.state} {address.postalCode}</p>
            <p className="text-slate-600">{address.country}</p>
            {address.phone && <p className="text-slate-500">Phone: {address.phone}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Placed On
            </div>
            <p className="font-semibold text-slate-900">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-slate-500">Carrier: Nexus Express 24H Dispatch</p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Purchased Hardware ({order.items.length} lines)
          </h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.productNameSnapshot}</p>
                  <p className="text-slate-500">
                    ${item.unitPriceSnapshot.toFixed(2)} × {item.quantity} units
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax (8%)</span>
            <span className="font-semibold text-slate-900">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">
              {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
            <span>Total Paid</span>
            <span className="text-lg text-brand-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/orders"
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Package className="w-4 h-4" /> View Order History
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" /> Continue Browsing
        </Link>
      </div>
    </div>
  );
};
