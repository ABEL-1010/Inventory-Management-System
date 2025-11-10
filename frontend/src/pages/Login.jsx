import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm.jsx';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-150 to-indigo-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventory System
            </h1>
            <p className="text-gray-600">
              Sign in to access your account
            </p>
          </div>
          
          <LoginForm 
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? Contact system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;