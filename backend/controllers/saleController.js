import asyncHandler from 'express-async-handler';
import Sale from '../models/Sale.js';
import Item from '../models/Item.js';

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const sortBy = req.query.sortBy || 'saleDate';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // Search filter
  if (search) {
    filter.$or = [
      { 'item.name': { $regex: search, $options: 'i' } },
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    filter.saleDate = {};
    if (startDate) {
      filter.saleDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.saleDate.$lte = new Date(endDate);
    }
  }

  const total = await Sale.countDocuments(filter);

  const sales = await Sale.find(filter)
    .populate('item', 'name price category')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
  console.log('➡️ Fetching sales:', { 
    page, limit, skip, search, startDate, endDate, sortBy, sortOrder 
  });

  res.json({
    sales,
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

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('item', 'name price');

  if (sale) {
    res.json(sale);
  } else {
    res.status(404);
    throw new Error('Sale not found');
  }
});

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
export const createSale = asyncHandler(async (req, res) => {
  const { item: itemId, quantity, saleDate } = req.body;

  // Check if item exists
  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Check if enough quantity is available
  if (item.quantity < quantity) {
    res.status(400);
    throw new Error(`Insufficient stock. Only ${item.quantity} items available`);
  }

  // Calculate total amount
  const totalAmount = item.price * quantity;

  // Create sale
  const sale = await Sale.create({
    item: itemId,
    quantity,
    totalAmount,
    saleDate: saleDate || new Date()
  });

  // Update item quantity
  item.quantity -= quantity;
  await item.save();

  const populatedSale = await Sale.findById(sale._id).populate('item', 'name price');
  res.status(201).json(populatedSale);
});

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private/Admin
export const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }

  const { item: itemId, quantity, saleDate } = req.body;
  
  // If quantity or item changed, handle stock adjustment
  if (quantity !== undefined && quantity !== sale.quantity) {
    const item = await Item.findById(itemId || sale.item);
    
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    // Calculate quantity difference
    const quantityDiff = sale.quantity - quantity;
    
    // Check if enough stock for increase
    if (quantityDiff < 0 && item.quantity < Math.abs(quantityDiff)) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${item.quantity} items available`);
    }

    // Update item quantity
    item.quantity += quantityDiff;
    await item.save();

    // Update sale
    sale.quantity = quantity;
    sale.totalAmount = item.price * quantity;
  }

  if (itemId) sale.item = itemId;
  if (saleDate) sale.saleDate = saleDate;

  const updatedSale = await sale.save();
  const populatedSale = await Sale.findById(updatedSale._id).populate('item', 'name price');
  res.json(populatedSale);
});

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
export const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);

  if (sale) {
    // Restore item quantity
    const item = await Item.findById(sale.item);
    if (item) {
      item.quantity += sale.quantity;
      await item.save();
    }

    await Sale.deleteOne({ _id: sale._id });
    res.json({ message: 'Sale removed and stock restored' });
  } else {
    res.status(404);
    throw new Error('Sale not found');
  }
});

// @desc    Get sales by date range
// @route   GET /api/sales/date-range
// @access  Private
export const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Start date and end date are required');
  }

  const sales = await Sale.find({
    saleDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
  .populate('item', 'name price category')
  .sort({ saleDate: -1 });

  res.json(sales);
});

//paginationnn

