import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Menu,
  X,
  Shield,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
  Flame,
  Tag,
  Headphones,
  Watch,
  Laptop,
  Sliders,
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { SearchField } from '../ui/SearchField';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  // Fetch dynamic categories for dropdown and mobile menu
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data.categories;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle scroll detection for sticky navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Click outside listener for desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setCategoriesOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoriesOpen(false);
        setAccountDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAccountDropdownOpen(false);
    navigate('/');
  };

  // Helper to render category icon
  const getCategoryIcon = (slug: string) => {
    if (slug.includes('audio')) return <Headphones className="w-5 h-5" />;
    if (slug.includes('wearables') || slug.includes('watch')) return <Watch className="w-5 h-5" />;
    if (slug.includes('computer') || slug.includes('laptop')) return <Laptop className="w-5 h-5" />;
    if (slug.includes('access')) return <Sliders className="w-5 h-5" />;
    return <Tag className="w-5 h-5" />;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200/90 py-2.5'
          : 'bg-white/90 backdrop-blur-sm border-slate-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* 1. Brand / Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group select-none">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-500 group-hover:scale-105 transition-all duration-200">
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:rotate-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                NEXUS
              </span>
              <span className="text-[10px] font-bold text-brand-600 tracking-widest uppercase mt-0.5">
                Commerce
              </span>
            </div>
          </Link>

          {/* 2. Desktop Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <SearchField
              type="text"
              placeholder="Search studio headphones, titanium bio-wearables, laptops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              aria-label="Search products"
            />
          </form>

          {/* 3. Primary Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-700">
            {/* Shop Link */}
            <Link
              to="/products"
              className={`px-3 py-2 rounded-xl transition-all hover:text-brand-600 hover:bg-slate-50 ${
                location.pathname === '/products' && !location.search
                  ? 'text-brand-600 font-semibold bg-brand-50/60'
                  : ''
              }`}
            >
              Shop
            </Link>

            {/* Categories Dropdown / Mega Menu */}
            <div
              ref={categoriesRef}
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all hover:text-brand-600 hover:bg-slate-50 cursor-pointer ${
                  categoriesOpen ? 'text-brand-600 bg-brand-50/60' : ''
                }`}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    categoriesOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Categories Mega Dropdown Panel */}
              {categoriesOpen && (
                <div className="absolute left-0 mt-1.5 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-slide-up origin-top-left">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Product Categories
                    </span>
                    <Link
                      to="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?categoryId=${cat.id}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
                            {getCategoryIcon(cat.slug)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {cat.description || 'Explore collection'}
                            </p>
                          </div>
                        </div>
                        {cat._count?.products !== undefined && (
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {cat._count.products}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Link
                      to="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Browse Full Product Catalog</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Deals Link */}
            <Link
              to="/products?sort=price_asc"
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all hover:text-amber-600 hover:bg-amber-50/60 ${
                location.search.includes('price_asc') ? 'text-amber-600 font-semibold bg-amber-50' : ''
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Deals</span>
            </Link>

            {/* New Arrivals Link */}
            <Link
              to="/products?sort=newest"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:text-brand-600 hover:bg-slate-50 ${
                location.search.includes('newest') && !location.search.includes('categoryId')
                  ? 'text-brand-600 font-semibold bg-brand-50/60'
                  : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>New Arrivals</span>
            </Link>
          </nav>

          {/* 4. Right Action Buttons (Cart & Account) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Icon & Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer group"
              aria-label={`Shopping cart with ${cart?.itemCount || 0} items`}
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-brand-600/30 animate-scale-in">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* Account / Authentication Menu */}
            {user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.firstName[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                      accountDropdownOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {/* Account Dropdown Panel */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-slide-up origin-top-right">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders & History</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50/50 hover:bg-brand-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-brand-600" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-500 shadow-sm shadow-brand-600/20 active:scale-95 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 5. Mobile Search & Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 py-4 border-t border-slate-100 space-y-4 animate-slide-down">
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit}>
              <SearchField
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                aria-label="Search products"
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* Mobile Categories Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesExpanded(!mobileCategoriesExpanded)}
                  className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium text-slate-700">Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      mobileCategoriesExpanded ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {mobileCategoriesExpanded && (
                  <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-brand-200 ml-3 mt-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?categoryId=${cat.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat.slug)}
                          <span>{cat.name}</span>
                        </div>
                        {cat._count?.products !== undefined && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {cat._count.products}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Deals Link */}
              <Link
                to="/products?sort=price_asc"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-amber-50 text-amber-700 flex items-center gap-2 font-semibold"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Deals & Offers</span>
              </Link>

              {/* Mobile New Arrivals Link */}
              <Link
                to="/products?sort=newest"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-brand-50 text-brand-700 flex items-center gap-2 font-semibold"
              >
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>New Arrivals</span>
              </Link>

              {/* Mobile User Profile Section */}
              {user ? (
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <div className="px-3.5 py-2 bg-slate-50 rounded-xl mb-2">
                    <p className="text-xs font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>My Orders</span>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-brand-600" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
