import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, DollarSign, Folder, BarChart3, LogOut, Users } from "lucide-react";

const Sidebar = () => {
  const { isAdmin, logout } = useAuth();

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
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col justify-between">
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-600 border-r-2'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3 " />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
