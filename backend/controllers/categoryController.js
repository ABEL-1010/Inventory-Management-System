import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Item from '../models/Item.js';
import Sale from '../models/Sale.js';

// @desc    Get all categories with pagination
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Category.countDocuments(filter);
  
  const categories = await Category.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    categories,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  console.log('Incoming category data:', req.body);
  const { name, description } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Find all items under this category
  const itemsWithCategory = await Item.find({ category: category._id });

  if (itemsWithCategory.length > 0) {
    // ⚠️ Warning: this will permanently delete all related items & sales
    for (const item of itemsWithCategory) {
      // Delete all sales linked to each item
      await Sale.deleteMany({ item: item._id });
    }

    // Delete all items under this category
    await Item.deleteMany({ category: category._id });
  }

  // Finally, delete the category
  await Category.deleteOne({ _id: category._id });

  res.json({ message: 'Category, items, and related sales deleted' });
});