import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Particles } from '../components/ui/Particles';
import { ShoppingBag, Lock, Mail, Shield, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch {
      // Handled in store
    }
  };

  const handleQuickFillCustomer = () => {
    setEmail('customer@store.com');
    setPassword('CustomerPass123!');
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@store.com');
    setPassword('AdminPass123!');
  };

  return (
    <div className="auth-page-container">
      {/* Background Animated WebGL Particles */}
      <div className="auth-page-background">
        <Particles
          particleColors={['#22c55e', '#4ade80', '#86efac', '#16a34a']}
          particleCount={260}
          particleSpread={12}
          speed={0.12}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Foreground Sign In Form Content */}
      <div className="auth-page-content flex items-center justify-center px-4 py-16 w-full">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 shadow-2xl space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500">Sign in to manage your orders, cart, and account</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={clearError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full py-3 mt-2 cursor-pointer" isLoading={isLoading}>
              Sign In to Account
            </Button>
          </form>

          {/* Demo Fast Login Helper */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickFillCustomer}
                className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-500" /> Customer Demo
              </button>
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="px-3 py-2 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-brand-600" /> Admin Demo
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
