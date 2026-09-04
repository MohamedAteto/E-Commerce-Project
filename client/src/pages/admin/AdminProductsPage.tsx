import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { SearchField } from '../../components/ui/SearchField';

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    isActive: true,
  });

  // Fetch Products
  const { data: productsData, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { limit: 50, search: searchTerm || undefined, isActive: 'all' },
      });
      return { products: res.data.data.products };
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data.categories;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.put(`/products/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      resetForm();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProductId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isActive: true,
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    if (categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    const primaryImg = prod.images.find((i) => i.isPrimary) || prod.images[0];
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      categoryId: prod.categoryId,
      imageUrl: primaryImg ? primaryImg.url : '',
      isActive: prod.isActive,
    });
    setEditingProduct(prod);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      categoryId: formData.categoryId,
      isActive: formData.isActive,
      images: formData.imageUrl
        ? [{ url: formData.imageUrl, isPrimary: true, displayOrder: 0 }]
        : [],
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, update stock, edit pricing, and configure images for store products.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
        <SearchField
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          aria-label="Search products by name"
          className="flex-1 max-w-md"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {productsData?.products?.map((prod) => {
                  const img = prod.images.find((i) => i.isPrimary) || prod.images[0];
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img ? img.url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">{prod.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{prod.category?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${prod.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {prod.stock <= 0 ? (
                          <Badge variant="danger" size="sm">0 (Out of Stock)</Badge>
                        ) : prod.stock <= 5 ? (
                          <Badge variant="warning" size="sm">{prod.stock} (Low)</Badge>
                        ) : (
                          <span className="font-bold text-slate-800">{prod.stock} units</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={prod.isActive ? 'success' : 'neutral'} size="sm">
                          {prod.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isCreateModalOpen || !!editingProduct}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product Hardware' : 'Create New Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Ultra ANC Headphones"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Inventory Stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <Input
            label="Image URL (Unsplash or CDN)"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Detailed Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-500"
              placeholder="Highlight technical specifications, materials, and battery life..."
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">
              Product is active and discoverable in store
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Confirm Product Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently delete this product? All image records and associations will be removed.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" onClick={() => setDeletingProductId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deletingProductId && deleteMutation.mutate(deletingProductId)}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
