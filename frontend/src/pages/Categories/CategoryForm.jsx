import React, { useState, useEffect } from 'react';
import Input from '../../components/Common/Input.jsx';
import Button from '../../components/Common/Button.jsx';

const CategoryForm = ({ category, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm z-[1000] p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-lg mx-auto overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              required
            />

            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
                rows="3"
                className="form-input w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
