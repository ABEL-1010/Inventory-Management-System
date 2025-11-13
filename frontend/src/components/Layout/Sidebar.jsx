import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Folder, 
  BarChart3, 
  LogOut, 
  Users,
  Shield
} from "lucide-react";

const Sidebar = () => {
  const { isAdmin, logout, user } = useAuth();
  const location = useLocation();
  

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Items', href: '/items', icon: Package },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    ...(isAdmin ? [
      { name: 'Categories', href: '/categories', icon: Folder },
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 pt-16 z-40 overflow-hidden">
      {/* User Info Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <div className="flex items-center mt-1">
              <Shield className={`h-3 w-3 mr-1 ${
                isAdmin ? 'text-green-500' : 'text-blue-500'
              }`} />
              <span className="text-xs text-gray-500">
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Fixed height, no scroll */}
      <nav className="flex-1 py-4 overflow-hidden">
        <div className="px-4 space-y-1 h-full">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-transparent hover:border-amber-200'
                  }
                `}
              >
                <Icon className={`h-5 w-5 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-amber-500'
                }`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200 group"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
          Logout
        </button>
        
        {/* Token/Status Info (Mobile) */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 lg:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-500">Session:</span>
            <span className="font-medium text-amber-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;