import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Order, ShippingAddress } from '../types';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data.order;
    },
    enabled: !!id,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'SHIPPED': return 'info';
      case 'PROCESSING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <Link to="/orders" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Back to Orders
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
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Receipt
            </h1>
            <p className="font-mono text-xs text-slate-500 mt-0.5">#{order.id}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(order.status)} size="md">
            Status: {order.status}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-8">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-6 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Order Placed
            </div>
            <p className="font-semibold text-slate-900">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Destination
            </div>
            <p className="font-semibold text-slate-900">{address.street}</p>
            <p className="text-slate-600">{address.city}, {address.state} {address.postalCode}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </div>
            <p className="font-semibold text-slate-900">Verified Direct Electronic Settlement</p>
            <p className="text-slate-500">256-Bit SSL Encrypted</p>
          </div>
        </div>

        {/* Itemized Snapshot Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order Items
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.productNameSnapshot}</p>
                  <p className="text-slate-500 mt-0.5">
                    ${item.unitPriceSnapshot.toFixed(2)} × {item.quantity} units
                  </p>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-slate-100 pt-6 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Sales Tax (8%)</span>
            <span className="font-semibold text-slate-900">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping & Handling</span>
            <span className="font-semibold text-slate-900">
              {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
            <span>Total Invoiced</span>
            <span className="text-xl text-brand-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
