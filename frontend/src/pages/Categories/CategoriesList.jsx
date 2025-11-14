import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/Common/Button.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import Layout from '../../components/Layout/Layout.jsx';
import CategoryForm from './CategoryForm.jsx';
import { Plus, Edit, Trash2, Calendar, Package, Search } from 'lucide-react';

const CategoriesList = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Fetching categories...');
      const response = await categoryService.getCategories();
      console.log('✅ Categories API Response:', response);
      
      // Handle both response formats
      let categories = [];
      if (Array.isArray(response)) {
        categories = response; 
      } else if (response && Array.isArray(response.categories)) {
        categories = response.categories; // Paginated format
      } else if (response && response.items && Array.isArray(response.items)) {
        categories = response.items; 
      }
      
      console.log(`Loaded ${categories.length} categories`);
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_CATEGORIES', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Filter categories based on current filters
  const filteredCategories = Array.isArray(state.categories) 
    ? state.categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                             category.description?.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (filters.sortBy) {
      case 'asc':
        return a.name.localeCompare(b.name);
      case 'desc':
        return b.name.localeCompare(a.name);
      case 'itemsHigh':
        return (b.itemsCount || 0) - (a.itemsCount || 0);
      case 'itemsLow':
        return (a.itemsCount || 0) - (b.itemsCount || 0);
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        // Refresh categories after deletion
        fetchCategories();
      } catch (error) {
        alert('Error deleting category: ' + error.message);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
    
    fetchCategories();
  };

  const handleFormSubmit = async (categoryData) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      handleFormClose();
    } catch (error) {
      alert('Error saving category: ' + error.message);
    }
  };

  const getCategoryStatus = (itemsCount) => {
    if (itemsCount === 0) return { text: 'Empty', color: 'bg-gray-100 text-gray-800' };
    if (itemsCount > 10) return { text: 'Popular', color: 'bg-green-100 text-green-800' };
    return { text: 'Active', color: 'bg-blue-100 text-blue-800' };
  };

  if (state.loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading categories..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600">Organize your inventory with categories</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 text-white hover:bg-amber-700 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </Button>
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border">
 
          <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

        
          <div className="flex space-x-2 text-sm">
            <select 
              value={filters.sortBy} 
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="recent">Recently Added</option>
              <option value="asc">Name A-Z</option>
              <option value="desc">Name Z-A</option>
              <option value="itemsHigh">Most Items</option>
              <option value="itemsLow">Fewest Items</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCategories.map((category) => {
                  const status = getCategoryStatus(category.itemsCount || 0);
                  return (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {category.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {category.itemsCount || 0} items
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
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                        <div className='flex space-x-3'>
                        <Button
                          
                          onClick={() => handleEdit(category)}
                          className="flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(category._id)}
                          className="flex items-center text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {sortedCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No categories found</div>
                <p className="text-gray-400 text-sm mb-4">
                  {filters.search ? 'Try adjusting your search terms' : 'Start by creating your first category'}
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  Create First Category
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Summary */}
        {sortedCategories.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-amber-800">
                <strong>{sortedCategories.length}</strong> categories found
                {filters.search && ` matching "${filters.search}"`}
              </div>
              <div className="text-sm font-semibold text-amber-800">
                Total Items: {sortedCategories.reduce((sum, category) => sum + (category.itemsCount || 0), 0)}
              </div>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        )}
      </div>
    </Layout>
  );
};

export default CategoriesList;