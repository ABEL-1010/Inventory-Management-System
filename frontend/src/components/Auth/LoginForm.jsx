import React, { useState } from 'react';
import Input from '../Common/Input.jsx';
import Button from '../Common/Button.jsx';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Input with Icon */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            label=""
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="pl-10" // Add padding for icon
          />
        </div>
      </div>
      
      {/* Password Input with Icon and Toggle */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            label=""
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="pl-10 pr-12" // Add padding for icons
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
      
      <Button
        type="submit"
        loading={loading}
        className="w-full flex justify-center items-center py-2 px-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;