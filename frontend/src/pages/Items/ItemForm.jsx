import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import Input from '../../components/Common/Input.jsx';
import Button from '../../components/Common/Button.jsx';

const ItemForm = ({ item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category?._id || '',
        quantity: item.quantity || ''
      });
    }
    fetchCategories();
  }, [item]);

  const fetchCategories = async () => {
  try {
    const res = await categoryService.getCategories();
    // Ensure we set an array
    setCategories(res.categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    setCategories([]); // fallback to empty array
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm z-[1000]">
    <div className="bg-white shadow-xl rounded-xl w-full max-w-lg mx-auto overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter item name"
            required
          />

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="3"
              className="form-input w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <Input
            label="Price ($)"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <div>
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />

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
              {item ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default ItemForm;