import React, { useState, useEffect } from 'react';
import { saleService } from '../../services/saleService';
import Layout from '../../components/Layout/Layout.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PlusCircle, RefreshCw, Trash2, Calendar, Package, DollarSign, Edit, Hash } from 'lucide-react';
import SalesForm from './SaleForm.jsx';
import Pagination from '../../components/Common/Pagination.jsx';

const SalesList = () => {
  const { isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'recent'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch sales when filters or pagination changes
  useEffect(() => {
    fetchSales();
  }, [filters, pagination.currentPage]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
        sortBy: getSortField(filters.sortBy),
        sortOrder: getSortOrder(filters.sortBy)
      };

      console.log('🔄 Fetching sales with params:', params);

      const response = await saleService.getSales(params);
      console.log('✅ Sales API Response:', response);
      
      setSales(response.sales || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } catch (error) {
      console.error('❌ Error fetching sales:', error);
      toast.error('Failed to load sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for sorting
  const getSortField = (sortBy) => {
    switch(sortBy) {
      case 'recent': return 'saleDate';
      case 'asc': return 'item.name';
      case 'desc': return 'item.name';
      case 'highAmount': return 'totalAmount';
      case 'lowAmount': return 'totalAmount';
      default: return 'saleDate';
    }
  };

  const getSortOrder = (sortBy) => {
    switch(sortBy) {
      case 'asc': return 'asc';
      case 'desc': return 'desc';
      case 'recent': return 'desc';
      case 'highAmount': return 'desc';
      case 'lowAmount': return 'asc';
      default: return 'desc';
    }
  };

  // Calculate serial number for each row
  const getSerialNumber = (index) => {
    return (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    console.log('🎯 Changing to page:', newPage);
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle filter changes - reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchChange = (search) => {
    handleFilterChange({ ...filters, search });
  };

  const handleSortChange = (sortBy) => {
    handleFilterChange({ ...filters, sortBy });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      await saleService.deleteSale(id);
      toast.success('Sale deleted successfully');
      // Refresh the current page after deletion
      fetchSales();
    } catch (error) {
      toast.error('Failed to delete sale');
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleSaleAdded = () => {
    fetchSales();
    setShowForm(false);
    setEditingSale(null);
  };

  const getSaleStatus = (quantity, totalAmount) => {
    if (totalAmount > 1000) return { text: 'High Value', color: 'bg-purple-100 text-purple-800' };
    if (quantity > 10) return { text: 'Bulk Sale', color: 'bg-blue-100 text-blue-800' };
    return { text: 'Standard', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
            <div className="text-gray-600">Loading sales...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
            <p className="text-gray-600">View and manage all sales transactions</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              New Sale
            </button>
            <button
              onClick={fetchSales}
              className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border">
          {/* Left: Search */}
          <div>
            <input
              type="text"
              placeholder="Search sales by item name..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Right: Filters */}
          <div className="flex space-x-2 text-sm">
            <select 
              value={filters.sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="recent">Most Recent</option>
              <option value="asc">Item Name A-Z</option>
              <option value="desc">Item Name Z-A</option>
              <option value="highAmount">Highest Amount</option>
              <option value="lowAmount">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 mr-1" />
                      ID
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale, index) => {
                  const status = getSaleStatus(sale.quantity, sale.totalAmount);
                  const serialNumber = getSerialNumber(index);
                  
                  return (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      {/* ID Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <span className="text-sm font-medium text-gray-700">
                            {serialNumber}
                          </span>
                        </div>
                      </td>
                      
                      {/* Item Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sale.item?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sale.item?.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${sale.item?.price ? sale.item.price.toFixed(2) : '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          
                          <span className="text-sm font-semibold text-gray-900">
                            ${sale.totalAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          
                          {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.saleDate || sale.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(sale)}
                              className="flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sale._id)}
                              className="flex items-center text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {sales.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No sales records found</div>
                <p className="text-gray-400 text-sm mb-4">
                  {filters.search ? 'Try adjusting your search terms' : 'Start by creating your first sale'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Create First Sale
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination 
            pagination={pagination}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        )}

        {/* Sales Summary */}
         {sales.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-amber-800">
                <strong>{pagination.totalItems}</strong> sales records found
                {filters.search && ` matching "${filters.search}"`}
              </div>
              <div className="text-sm font-semibold text-amber-800">
                Total Revenue: $
                {sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Sales Form Modal */}
        {(showForm || editingSale) && (
          <SalesForm
            sale={editingSale}
            onClose={handleFormClose}
            onSaleAdded={handleSaleAdded}
          />
        )}
      </div>
    </Layout>
  );
};

export default SalesList;