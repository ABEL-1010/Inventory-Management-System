import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm.jsx';
import { Package, Shield } from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent mb-2">
            InventoryPro
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your inventory with ease
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
          {/* Security Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Secure Login</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500">
              Sign in to access your inventory dashboard
            </p>
          </div>
          
          <LoginForm 
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need access?{' '}
                <span className="font-semibold text-amber-600">
                  Contact administrator
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white">
            <div className="text-amber-600 font-semibold text-sm">Items</div>
            <div className="text-xs text-gray-500">Manage Products</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white">
            <div className="text-amber-600 font-semibold text-sm">Sales</div>
            <div className="text-xs text-gray-500">Track Revenue</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white">
            <div className="text-amber-600 font-semibold text-sm">Reports</div>
            <div className="text-xs text-gray-500">Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;