// backend/controllers/statusControllers.js
import Item from '../models/Item.js';
import Category from '../models/Category.js';
import Sale from '../models/Sale.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalItems = await Item.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSales = await Sale.countDocuments();

    // Low stock logic - FIXED: using quantity instead of stock
    const lowQuantityProducts = await Item.find({ quantity: { $lt: 10 } })
      .select('name quantity')
      .sort({ quantity: 1 })
      .limit(10);

    const lowQuantity = lowQuantityProducts.length;

    // Today sales - FIXED: using totalAmount instead of amount
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesData = await Sale.aggregate([
      { $match: { saleDate: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Monthly sales chart - FIXED: using totalAmount and saleDate
    const currentYear = new Date().getFullYear();
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$saleDate' },
          totalSales: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      sales: monthlySales.find((m) => m._id === i + 1)?.totalSales || 0,
    }));

    // Recent sales - FIXED: populate item data and get last 5 sales
    const recentSales = await Sale.find()
      .populate('item', 'name price')
      .sort({ saleDate: -1 })
      .limit(5)
      .select('quantity totalAmount item');

    // Top categories - FIXED: get categories with most items
    const topCategories = await Category.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'category',
          as: 'items'
        }
      },
      {
        $project: {
          name: 1,
          itemCount: { $size: '$items' }
        }
      },
      { $sort: { itemCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalItems,
      totalCategories,
      totalSales,
      lowQuantity,
      lowQuantityProducts: lowQuantityProducts.map(item => ({
        name: item.name,
        quantity: item.quantity, // FIXED: using quantity instead of stock
      })),
      todaySales: todaySalesData[0]?.total || 0,
      monthlyData,
      topCategories: topCategories.map(cat => ({
        name: cat.name,
        value: cat.itemCount
      })),
      recentSales: recentSales.map(sale => ({
        productName: sale.item?.name || 'Unknown Item',
        quantity: sale.quantity,
        amount: sale.totalAmount
      })),
    });
  } catch (err) {
    console.error('❌ Dashboard stats error:', err);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};