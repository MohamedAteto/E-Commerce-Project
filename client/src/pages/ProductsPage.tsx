import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Category, PaginationMeta } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { ProductFilters } from '../components/products/ProductFilters';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data.categories;
    },
  });

  // Fetch Products
  const { data, isLoading } = useQuery<{ products: Product[]; meta: PaginationMeta }>({
    queryKey: ['products', { page, search, categoryId, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params: any = { page, limit: 12, sort };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/products', { params });
      return {
        products: res.data.data.products,
        meta: res.data.meta,
      };
    },
  });

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {search ? `Search Results for "${search}"` : 'All Hardware & Tech'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {data?.products.length || 0} of {data?.meta.total || 0} premium items
          </p>
        </div>

        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          Filter & Sort
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryId}
            onSelectCategory={(catId) => updateParam('categoryId', catId)}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChangeMinPrice={(val) => updateParam('minPrice', val)}
            onChangeMaxPrice={(val) => updateParam('maxPrice', val)}
            sort={sort}
            onChangeSort={(val) => updateParam('sort', val)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={data?.products || []}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!data.meta.hasPrevPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                <span className="font-bold text-slate-900">{data.meta.totalPages}</span>
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.meta.hasNextPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Filter Catalog</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilters
                categories={categories}
                selectedCategory={categoryId}
                onSelectCategory={(catId) => updateParam('categoryId', catId)}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChangeMinPrice={(val) => updateParam('minPrice', val)}
                onChangeMaxPrice={(val) => updateParam('maxPrice', val)}
                sort={sort}
                onChangeSort={(val) => updateParam('sort', val)}
                onReset={handleResetFilters}
              />
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl mt-6 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
