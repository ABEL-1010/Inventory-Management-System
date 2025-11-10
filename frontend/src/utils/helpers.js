export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US');
};

export const getStockStatus = (quantity) => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity < 10) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusColor = (quantity) => {
  const status = getStockStatus(quantity);
  switch (status) {
    case 'in_stock': return '#10b981';
    case 'low_stock': return '#f59e0b';
    case 'out_of_stock': return '#ef4444';
    default: return '#6b7280';
  }
};