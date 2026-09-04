import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  onClear?: () => void;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onClear,
  className,
  'aria-label': ariaLabel = 'Search',
  ...props
}) => {
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <div className={clsx('search-field', className)}>
      <input
        {...props}
        value={value}
        aria-label={ariaLabel}
        className="search-field__input"
      />
      <Search className="search-field__icon" aria-hidden="true" />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="search-field__clear"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
