import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { GradientWaves } from '../components/ui/GradientWaves';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowRight, Sparkles, Headphones, Watch, Laptop, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 6, sort: 'newest' } });
      return res.data.data.products as Product[];
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data.categories as Category[];
    },
  });

  return (
    <div className="space-y-16">
      {/* Hero Section with Interactive GradientWaves */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[560px] lg:min-h-[600px] flex items-center">
        {/* Background WebGL Waves */}
        <div className="absolute inset-0 z-0">
          <GradientWaves
            horizonColor="#0b0f19"
            waveColor="#15803d"
            crestColor="#4ade80"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1.0}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1.0}
            opacity={0.9}
            mouseInteraction={true}
            parallaxStrength={0.5}
            grain={true}
            grainIntensity={0.05}
          />
        </div>

        {/* Ambient Dark Gradient Vignette for ultra-sharp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20 pointer-events-none z-1" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/80 pointer-events-none z-1" />

        {/* Foreground Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen Consumer Tech 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Engineered for <span className="text-brand-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]">Pure Performance.</span>
            </h1>

            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Explore our hand-crafted selection of studio-grade acoustic headphones, titanium bio-wearables, and high-performance computing hardware.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/products"
                className="home-primary-action group px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer backdrop-blur-xs"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?categoryId=audio-sound"
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all border border-slate-700/80 backdrop-blur-md cursor-pointer"
              >
                Explore Audio Gear
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curated Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Discover top-tier tech across specialized categories</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categoriesData?.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {cat.slug.includes('audio') && <Headphones className="w-6 h-6" />}
                {cat.slug.includes('wearables') && <Watch className="w-6 h-6" />}
                {cat.slug.includes('computers') && <Laptop className="w-6 h-6" />}
                {!cat.slug.includes('audio') && !cat.slug.includes('wearables') && !cat.slug.includes('computers') && <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors text-sm sm:text-base">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {cat._count?.products || 0} Products available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid - Spacious & Wide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trending Releases</h2>
            <p className="text-sm text-slate-500 mt-1">Our most popular hardware loved by creators and tech enthusiasts</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Browse complete catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-sm">
                <Skeleton className="aspect-16/10 w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsData?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
