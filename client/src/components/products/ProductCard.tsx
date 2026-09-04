import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../ui/Badge';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsAdding(true);
      await addItem(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-brand-200 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Product Image Box */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-16/10 overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock / Status Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <Badge variant="danger" size="md">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="md">Only {product.stock} Left</Badge>
          ) : (
            <Badge variant="success" size="md">In Stock</Badge>
          )}
        </div>

        {/* Category Tag */}
        {product.category && (
          <span className="absolute top-4 right-4 text-xs font-bold tracking-wider uppercase px-3 py-1 bg-white/95 backdrop-blur-md text-slate-800 rounded-full shadow-md z-10">
            {product.category.name}
          </span>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to={`/products/${product.slug}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Price</span>
            <span className="text-2xl font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <AddToCartButton
            onClick={handleAddToCart}
            isAdding={isAdding}
            justAdded={justAdded}
            isOutOfStock={isOutOfStock}
            compact
          />
        </div>
      </div>
    </div>
  );
};
