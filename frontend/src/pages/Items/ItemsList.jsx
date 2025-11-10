import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { itemService } from '../../services/itemService';
import Button from '../../components/Common/Button.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import Layout from '../../components/Layout/Layout.jsx';
import ItemForm from './ItemForm.jsx';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from '../../components/Common/Pagination.jsx';

const ItemsList = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    selectedCategory: '',
    sortBy: 'recent'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch items when filters or pagination changes
  useEffect(() => {
    
    fetchItems();
  }, [filters, pagination.currentPage]);

  const fetchItems = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
        category: filters.selectedCategory,
        sortBy: getSortField(filters.sortBy),
        sortOrder: getSortOrder(filters.sortBy)
      };

      console.log('Fetching items with params:', params); // Debug log

      const response = await itemService.getItems(params);
      console.log('API Response:', response); // Debug log

      // Ensure items is always an array
      const items = response.items || [];
      dispatch({ type: 'SET_ITEMS', payload: items });
      
      // FIXED: Changed response.ppagination to response.pagination
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      } else {
        // Fallback if backend doesn't return pagination
        setPagination({
          currentPage: params.page,
          totalPages: Math.ceil(items.length / params.limit) || 1,
          totalItems: items.length,
          itemsPerPage: params.limit
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Ensure items is always an array even on error
      dispatch({ type: 'SET_ITEMS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper functions for sorting
  const getSortField = (sortBy) => {
    switch(sortBy) {
      case 'recent': return 'createdAt';
      case 'asc': return 'name';
      case 'desc': return 'name';
      case 'lastMonth': return 'createdAt';
      default: return 'createdAt';
    }
  };

  const getSortOrder = (sortBy) => {
    switch(sortBy) {
      case 'asc': return 'asc';
      case 'desc': return 'desc';
      case 'recent': return 'desc';
      case 'lastMonth': return 'desc';
      default: return 'desc';
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle filter changes - reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchChange = (search) => {
    console.log('🔍 Search changed to:', search);
    handleFilterChange({ ...filters, search });
  };

  const handleCategoryChange = (selectedCategory) => {
    console.log('🏷️ Category changed to:', selectedCategory);
    handleFilterChange({ ...filters, selectedCategory });
  };

  const handleSortChange = (sortBy) => {
    handleFilterChange({ ...filters, sortBy });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemService.deleteItem(id);
        fetchItems(); // Refresh the current page after deletion
      } catch (error) {
        alert('Error deleting item: ' + error.message);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchItems(); // Refresh items after form submission
  };

  const handleFormSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await itemService.updateItem(editingItem._id, itemData);
      } else {
        await itemService.createItem(itemData);
      }
      handleFormClose();
    } catch (error) {
      alert('Error saving item: ' + error.message);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await itemService.importCSV(formData);
      fetchItems(); // Refresh items after import
      alert(`${res.length} items imported successfully`);
    } catch (error) {
      console.error(error);
      alert('Error importing CSV');
    }
  };

  const exportToExcel = () => {
    // Export current page items
    const itemsToExport = state.items || [];
    const worksheet = XLSX.utils.json_to_sheet(itemsToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'items.xlsx');
  };

  if (state.loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading items..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Item List</h1>
            <p className="text-gray-600">Manage your items</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-amber-600 text-white hover:bg-amber-700 rounded-lg"
            >
              + Add New Item
            </Button>

            <Button
              onClick={() => document.getElementById('csvInput').click()}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              Import CSV
            </Button>
            <input
              id="csvInput"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />

            <Button
              onClick={exportToExcel}
              className="bg-green-600 text-white hover:bg-green-700 rounded-lg"
            >
              Export Excel
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border">
          {/* Left: Search */}
          <div>
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Right: Filters */}
          <div className="flex space-x-2 text-sm">
            <select 
              value={filters.selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {Array.isArray(state.categories) &&
                state.categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))
              }
            </select>

            <select 
              value={filters.sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="recent">Recently Added</option>
              <option value="asc">Name A-Z</option>
              <option value="desc">Name Z-A</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.items && state.items.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.category?.name || 'Uncategorized'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {(!state.items || state.items.length === 0) && (
              <div className="text-center py-12">
                <div className="text-gray-500">No items found</div>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="mt-4"
                >
                  Create Your First Item
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination 
            pagination={pagination}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        )}

        {/* Item Form Modal */}
        {showForm && (
          <ItemForm
            item={editingItem}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        )}
      </div>
    </Layout>
  );
};

export default ItemsList;