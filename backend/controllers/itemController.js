import asyncHandler from 'express-async-handler';
import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
//pagination included
export const getItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) {
    filter.category = category;
  }

  const total = await Item.countDocuments(filter);

  const items = await Item.find(filter)
    .populate('category', 'name')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
    console.log('➡️ Fetching items:', { page, limit, skip, search, category, sortBy, sortOrder });

  res.json({
    items,
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

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('category', 'name description');

  if (item) {
    res.json(item);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Create item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, quantity } = req.body;

  // Check if item already exists
  const itemExists = await Item.findOne({ name });
  if (itemExists) {
    res.status(400);
    throw new Error('Item already exists');
  }

  const item = await Item.create({
    name,
    description,
    price,
    category,
    quantity: quantity || 0
  });

  const populatedItem = await Item.findById(item._id).populate('category', 'name description');
  res.status(201).json(populatedItem);
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;
    item.quantity = req.body.quantity !== undefined ? req.body.quantity : item.quantity;

    const updatedItem = await item.save();
    const populatedItem = await Item.findById(updatedItem._id).populate('category', 'name description');
    res.json(populatedItem);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private/Admin
import Sale from '../models/Sale.js';

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    const salesWithItem = await Sale.find({ item: item._id });

        if (salesWithItem.length > 0) {
      await Sale.deleteMany({ item: item._id }); // dangerous if you need records
    }
    await Item.deleteOne({ _id: item._id });
    res.json({ message: 'Item and related sales deleted' });
      } else {
    res.status(404);
    throw new Error('Item not found');
  }
});


// @desc    Get items by category
// @route   GET /api/items/category/:categoryId
// @access  Public
export const getItemsByCategory = asyncHandler(async (req, res) => {
  const items = await Item.find({ category: req.params.categoryId })
    .populate('category', 'name description');
  res.json(items);
});

// @desc    Update item quantity
// @route   PATCH /api/items/:id/quantity
// @access  Private/Admin
export const updateItemQuantity = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    item.quantity = req.body.quantity;
    const updatedItem = await item.save();
    const populatedItem = await Item.findById(updatedItem._id).populate('category', 'name description');
    res.json(populatedItem);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

//paginationnn
