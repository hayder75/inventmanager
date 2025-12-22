'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const CORRECT_ACCESS_CODE = 'REALBRIGHT2025'; // Change this to something secure

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === CORRECT_ACCESS_CODE) {
      setShowLogin(true);
      setAccessError('');
    } else {
      setAccessError('Invalid access code. Please try again.');
      setAccessCode('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      // Verify user is saved before redirecting
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        router.push('/dashboard');
      } else {
        setError('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  // Show access code screen first
  if (!showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0064E0' }}>
              Real-Bright-Trading
            </h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Access</h2>
            <p className="text-gray-600">
              Please enter the access code to continue
            </p>
          </div>
          <form onSubmit={handleAccessCode} className="space-y-4">
            {accessError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {accessError}
              </div>
            )}
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="accessCode"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAccessCode(e);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter access code"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#0082FB' }}
            >
              Continue
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2025 Real-Bright-Trading. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold" style={{ color: '#0064E0' }}>
              Real-Bright-Trading
            </h1>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to Real-Bright-Trading
            </h2>
            <p className="text-gray-600">
              Manage your inventory and sales smarter
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium" style={{ color: '#0082FB' }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#0082FB' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">
              <p>© 2025 Real-Bright-Trading. All rights reserved.</p>
            </div>
            <div className="text-sm" style={{ color: '#0082FB' }}>
              <p className="font-medium">Powered by <span className="font-bold">Easy Tech</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Promotional Content */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0064E0' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-lg"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-lg"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 border-2 border-white rounded-lg"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-lg"></div>
        </div>

        {/* Content Card */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h3>
                <p className="text-sm text-gray-500">February 20, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: '#0082FB' }}>$56,476.00</p>
                <p className="text-xs text-gray-500">Total Sales</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Products</p>
                  <p className="text-lg font-bold text-gray-900">1,234</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Sales Today</p>
                  <p className="text-lg font-bold text-gray-900">45</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h3 className="text-4xl font-bold mb-4">Get better with inventory</h3>
          <p className="text-lg opacity-90">
            Real-Bright-Trading helps you manage stock, track sales, and grow your business efficiently. 
            Streamline your operations and make smarter decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

