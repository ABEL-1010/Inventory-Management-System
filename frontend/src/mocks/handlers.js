import { rest } from 'msw';

let mockSales = [
  {
    _id: '1',
    item: { name: 'Laptop', category: { name: 'Electronics' }, price: 1200 },
    quantity: 1,
    totalAmount: 1200,
    saleDate: '2024-10-10T10:00:00Z',
  },
  {
    _id: '2',
    item: { name: 'Book', category: { name: 'Stationery' }, price: 10 },
    quantity: 5,
    totalAmount: 50,
    saleDate: '2024-10-12T10:00:00Z',
  },
];

export const handlers = [
  rest.get('/api/sales', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        sales: mockSales,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockSales.length,
          itemsPerPage: 10,
        },
      })
    );
  }),

  rest.delete('/api/sales/:id', (req, res, ctx) => {
    const { id } = req.params;
    mockSales = mockSales.filter((s) => s._id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Deleted' }));
  }),
];
