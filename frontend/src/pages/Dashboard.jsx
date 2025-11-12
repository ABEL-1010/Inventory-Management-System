import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout.jsx';
import API from '../services/api';
import {
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowDownCircle,
  CreditCard,
  Users,
  ShoppingCart,
  BarChart3,
  Box,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalSales: 0,
    lowQuantity: 0,
    todaySales: 0,
    monthlyData: [],      
    topCategories: [],    
    recentSales: [],      
    lowQuantityProducts: []  
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🔄 Fetching dashboard stats...');
        const { data } = await API.get('/stats');
        console.log('✅ Dashboard stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('❌ Error loading dashboard stats:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600 py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          {error}
        </div>
      </Layout>
    );
  }

  const summaryCards = [
    { 
      name: 'Total Items', 
      value: stats.totalItems.toLocaleString(), 
      color: 'bg-amber-500', 
      icon: Package 
    },
    { 
      name: 'Total Categories', 
      value: stats.totalCategories.toLocaleString(), 
      color: 'bg-amber-600', 
      icon: FileText 
    },
    { 
      name: 'Today Sales', 
      value: `$${stats.todaySales.toLocaleString()}`, 
      color: 'bg-green-500', 
      icon: DollarSign 
    },
    { 
      name: 'Total Sales', 
      value: stats.totalSales.toLocaleString(), 
      color: 'bg-blue-500', 
      icon: ShoppingCart 
    },
    { 
      name: 'Low Stock', 
      value: stats.lowQuantity.toLocaleString(), 
      color: 'bg-red-500', 
      icon: AlertTriangle 
    },
  ];

  const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'Admin'}! Here's what's happening today.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{card.name}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart: Monthly Sales */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales ({new Date().getFullYear()})</h3>
            {stats.monthlyData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Sales']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    name="Sales Amount"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-sm">No sales data available for this year.</p>
              </div>
            )}
          </div>

          {/* Pie Chart: Top Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories by Item Count</h3>
            {stats.topCategories?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.topCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.topCategories.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Items']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-sm">No category data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales & Low Stock Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h3>
            {stats.recentSales?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentSales.map((sale, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{sale.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sale.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">${sale.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent sales.</p>
              </div>
            )}
          </div>

          {/* Low Stock Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Alert</h3>
            {stats.lowQuantityProducts?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.lowQuantityProducts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-red-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 text-sm">All items sufficiently stocked! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;