import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Order, PaginationMeta, ShippingAddress } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ShoppingBag, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Fetch Orders
  const { data, isLoading } = useQuery<{ orders: Order[]; meta: PaginationMeta }>({
    queryKey: ['admin-orders', selectedStatus, page],
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const res = await api.get('/admin/orders', { params });
      return {
        orders: res.data.data.orders,
        meta: res.data.meta,
      };
    },
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
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

  const statuses = ['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Customer Order Lifecycle
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect order items, view customer shipping destinations, and update shipment progression.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => {
              setSelectedStatus(st);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              selectedStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Shipping Destination</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data?.orders.map((order) => {
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
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}
                        </p>
                        <p className="text-slate-400 text-[11px]">{order.user?.email}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                        {address.city}, {address.state} ({address.country})
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{order.items.length} line(s)</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {order.items.map((i) => i.productNameSnapshot).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          disabled={statusMutation.isPending || order.status === 'CANCELLED'}
                          onChange={(e) =>
                            statusMutation.mutate({ id: order.id, status: e.target.value })
                          }
                          className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200 opacity-60'
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!data.meta.hasPrevPage}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data.meta.hasNextPage}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
