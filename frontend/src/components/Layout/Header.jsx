import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Mobile menu button */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            
            {/* Logo */}
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm">
                <span className="text-white font-bold text-sm">IMS</span>
              </div>
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                InventoryPro
              </span>
            </div>
          </div>
          
          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;