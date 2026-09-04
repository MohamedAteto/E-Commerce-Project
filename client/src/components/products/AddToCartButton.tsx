import React from 'react';
import { Check, Loader2, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';

interface AddToCartButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isAdding: boolean;
  justAdded: boolean;
  isOutOfStock: boolean;
  quantityLabel?: string;
  compact?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
  isAdding,
  justAdded,
  isOutOfStock,
  quantityLabel = 'Add to Cart',
  compact = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isOutOfStock || isAdding}
    className={clsx(
      'add-to-cart-button',
      compact ? 'add-to-cart-button--compact' : 'add-to-cart-button--wide',
      justAdded
        ? 'add-to-cart-button--success'
        : isOutOfStock
          ? 'add-to-cart-button--disabled'
          : 'add-to-cart-button--primary'
    )}
  >
    {isAdding ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Adding…
      </>
    ) : justAdded ? (
      <>
        <Check className="w-4 h-4" />
        {compact ? 'Added' : 'Added to Cart!'}
      </>
    ) : (
      <>
        <ShoppingBag className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        {isOutOfStock ? 'Sold Out' : quantityLabel}
      </>
    )}
  </button>
);
