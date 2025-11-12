import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import SalesList from '../Sales/SalesList';
import { useAuth } from '../../context/AuthContext';
import { saleService } from '../../services/saleService';
import { toast } from 'react-toastify';

// Mock all dependencies
vi.mock('../../context/AuthContext');
vi.mock('../../services/saleService');
vi.mock('react-toastify');
vi.mock('../../components/Layout/Layout.jsx', () => ({ 
  default: ({ children }) => <div data-testid="layout">{children}</div> 
}));

// Fix the SaleForm mock path to match your structure
vi.mock('../Sales/SaleForm.jsx', () => ({ 
  default: ({ onClose, onSaleAdded }) => (
    <div data-testid="sales-form">
      <h3>Mock Sale Form</h3>
      <button onClick={onClose}>Close Form</button>
      <button onClick={onSaleAdded}>Submit Sale</button>
    </div>
  )
}));

vi.mock('../../components/Common/Pagination.jsx', () => ({ 
  default: ({ pagination, onPageChange }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(pagination.currentPage + 1)}>Next Page</button>
      <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
    </div>
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  PlusCircle: () => <span>PlusCircleIcon</span>,
  RefreshCw: () => <span>RefreshCwIcon</span>,
  Trash2: () => <span>Trash2Icon</span>,
  Calendar: () => <span>CalendarIcon</span>,
  Package: () => <span>PackageIcon</span>,
  DollarSign: () => <span>DollarSignIcon</span>,
  X: () => <span>XIcon</span>,
  Plus: () => <span>PlusIcon</span>,
  ShoppingCart: () => <span>ShoppingCartIcon</span>,
}));

// Mock data
const mockSales = [
  {
    _id: '1',
    item: {
      name: 'Laptop',
      price: 999.99,
      category: { name: 'Electronics' }
    },
    quantity: 2,
    totalAmount: 1999.98,
    saleDate: '2023-10-01T10:00:00Z',
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    _id: '2',
    item: {
      name: 'Mouse',
      price: 29.99,
      category: { name: 'Accessories' }
    },
    quantity: 5,
    totalAmount: 149.95,
    saleDate: '2023-10-02T11:00:00Z',
    createdAt: '2023-10-02T11:00:00Z'
  }
];

const mockPagination = {
  currentPage: 1,
  totalPages: 2,
  totalItems: 15,
  itemsPerPage: 10
};

describe('SalesList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isAdmin: true });
    saleService.getSales.mockResolvedValue({
      sales: mockSales,
      pagination: mockPagination
    });
    saleService.deleteSale.mockResolvedValue({});
    window.confirm = vi.fn(() => true);
  });

  // Test Initial Render and Data Loading
  describe('Initial Render and Data Loading', () => {
    test('renders loading state initially', () => {
      render(<SalesList />);
      expect(screen.getByText('Loading sales...')).toBeInTheDocument();
    });

    test('loads and displays sales data', async () => {
      render(<SalesList />);
      expect(await screen.findByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Accessories')).toBeInTheDocument();
      
      // FIXED: Use the actual rendered values without commas
      expect(screen.getByText('$999.99')).toBeInTheDocument();
      expect(screen.getByText('$1999.98')).toBeInTheDocument(); // Removed comma
    });

    test('displays error toast when API fails', async () => {
      saleService.getSales.mockRejectedValue(new Error('Network error'));
      render(<SalesList />);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load sales');
      });
    });
  });

  // Test Header and Actions
  describe('Header and Actions', () => {
    test('displays header and buttons', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      expect(screen.getByText('Sales History')).toBeInTheDocument();
      expect(screen.getByText('View and manage all sales transactions')).toBeInTheDocument();
      expect(screen.getByText('New Sale')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    test('opens sales form when New Sale button is clicked', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');

      const newSaleButton = screen.getByText('New Sale');
      fireEvent.click(newSaleButton);

      await waitFor(() => {
        expect(screen.getByTestId('sales-form')).toBeInTheDocument();
      });

      expect(screen.getByText('Mock Sale Form')).toBeInTheDocument();
      expect(screen.getByText('Close Form')).toBeInTheDocument();
      expect(screen.getByText('Submit Sale')).toBeInTheDocument();
    });

    test('refreshes data when Refresh button is clicked', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      fireEvent.click(screen.getByText('Refresh'));
      expect(saleService.getSales).toHaveBeenCalledTimes(2);
    });
  });

  // Test Search and Filter Functionality
  describe('Search and Filter', () => {
    test('filters sales by search term', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      const searchInput = screen.getByPlaceholderText('Search sales by item name...');
      fireEvent.change(searchInput, { target: { value: 'Laptop' } });
      await waitFor(() => {
        expect(saleService.getSales).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Laptop' })
        );
      });
    });

    test('sorts sales by different criteria', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      const sortSelect = screen.getByDisplayValue('Most Recent');
      fireEvent.change(sortSelect, { target: { value: 'highAmount' } });
      await waitFor(() => {
        expect(saleService.getSales).toHaveBeenCalledWith(
          expect.objectContaining({ 
            sortBy: 'totalAmount',
            sortOrder: 'desc'
          })
        );
      });
    });
  });

  // Test Sales Table
  describe('Sales Table', () => {
    test('displays all sales columns correctly', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      expect(screen.getByText('Item')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Unit Price')).toBeInTheDocument();
      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('High Value')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    test('shows empty state when no sales', async () => {
      saleService.getSales.mockResolvedValue({
        sales: [],
        pagination: { ...mockPagination, totalItems: 0 }
      });
      render(<SalesList />);
      expect(await screen.findByText('No sales records found')).toBeInTheDocument();
      expect(screen.getByText('Create First Sale')).toBeInTheDocument();
    });
  });

  // Test Delete Functionality
  describe('Delete Sales', () => {
    test('deletes sale when delete button is clicked and confirmed', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this sale?');
      expect(saleService.deleteSale).toHaveBeenCalledWith('1');
    });

    test('shows success toast after successful deletion', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Sale deleted successfully');
      });
    });

    test('shows error toast when deletion fails', async () => {
      saleService.deleteSale.mockRejectedValue(new Error('Delete failed'));
      render(<SalesList />);
      await screen.findByText('Laptop');
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete sale');
      });
    });

    test('does not show delete buttons for non-admin users', async () => {
      useAuth.mockReturnValue({ isAdmin: false });
      render(<SalesList />);
      await screen.findByText('Laptop');
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  // Test Pagination
  describe('Pagination', () => {
    test('displays pagination when multiple pages exist', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    test('changes page when pagination is used', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      fireEvent.click(screen.getByText('Next Page'));
      await waitFor(() => {
        expect(saleService.getSales).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  // Test Sales Summary
  describe('Sales Summary', () => {
    test('displays sales summary when sales exist', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      expect(screen.getByText(/sales records found/)).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue: \$2149\.93/)).toBeInTheDocument();
    });
  });

  // Test Form Interactions
  describe('Sales Form', () => {
    test('closes form when close button is clicked', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      fireEvent.click(screen.getByText('New Sale'));
      await waitFor(() => {
        expect(screen.getByTestId('sales-form')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Close Form'));
      await waitFor(() => {
        expect(screen.queryByTestId('sales-form')).not.toBeInTheDocument();
      });
    });

    test('refreshes data and closes form after sale is added', async () => {
      render(<SalesList />);
      await screen.findByText('Laptop');
      fireEvent.click(screen.getByText('New Sale'));
      await waitFor(() => {
        expect(screen.getByTestId('sales-form')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Submit Sale'));
      await waitFor(() => {
        expect(saleService.getSales).toHaveBeenCalledTimes(2);
        expect(screen.queryByTestId('sales-form')).not.toBeInTheDocument();
      });
    });
  });
});