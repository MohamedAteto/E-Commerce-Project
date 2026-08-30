import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Particles } from '../components/ui/Particles';
import { ShoppingBag, Lock, Mail, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register(formData);
      navigate('/products');
    } catch {
      // Handled in store
    }
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

      {/* Foreground Register Form Content */}
      <div className="auth-page-content flex items-center justify-center px-4 py-16 w-full">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 shadow-2xl space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-500">Join Nexus Commerce to discover premium developer and audio hardware</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={clearError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Alex"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Morgan"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="alex.morgan@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 chars (upper, lower, digit)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              helperText="Must be 8+ characters and contain uppercase, lowercase & a digit."
              required
            />

            <Button type="submit" className="w-full py-3 mt-2 cursor-pointer" isLoading={isLoading}>
              Create Customer Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
