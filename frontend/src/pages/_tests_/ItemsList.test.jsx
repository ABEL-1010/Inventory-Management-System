import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock the components and dependencies FIRST
vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn()
}));

vi.mock('../../services/itemService', () => ({
  itemService: {
    getItems: vi.fn(),
    deleteItem: vi.fn(),
    updateItem: vi.fn(),
    createItem: vi.fn(),
  }
}));

vi.mock('../../components/Common/Button.jsx', () => ({ 
  default: ({ children, onClick, variant, size, className }) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  )
}));

vi.mock('../../components/Common/LoadingSpinner.jsx', () => ({ 
  default: ({ text }) => <div data-testid="loading-spinner">Loading: {text}</div>
}));

vi.mock('../../components/Layout/Layout.jsx', () => ({ 
  default: ({ children }) => <div data-testid="layout">{children}</div> 
}));

vi.mock('../Items/ItemForm.jsx', () => ({ 
  default: ({ item, onSubmit, onClose }) => (
    <div data-testid="item-form">
      <h3>{item ? 'Edit Item' : 'Add Item'}</h3>
      <button onClick={onClose}>Close Form</button>
      <button onClick={() => onSubmit({ name: 'Test Item', price: 100 })}>Submit Item</button>
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

// Mock external libraries
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn()
  },
  write: vi.fn(() => new ArrayBuffer(10))
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

// Import the component AFTER all mocks
import ItemsList from '../Items/ItemsList';
import { useApp } from '../../context/AppContext';
import { itemService } from '../../services/itemService';

// Mock data
const mockItems = [
  {
    _id: '1',
    name: 'Laptop',
    description: 'Gaming laptop with high performance',
    price: 999.99,
    category: { _id: 'cat1', name: 'Electronics' },
    quantity: 10,
    minStock: 5,
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    category: { _id: 'cat2', name: 'Accessories' },
    quantity: 3,
    minStock: 10,
    createdAt: '2023-10-02T11:00:00Z'
  }
];

const mockCategories = [
  { _id: 'cat1', name: 'Electronics' },
  { _id: 'cat2', name: 'Accessories' }
];

const mockPagination = {
  currentPage: 1,
  totalPages: 2,
  totalItems: 15,
  itemsPerPage: 10
};

describe('ItemsList Component', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    useApp.mockReturnValue({
      state: {
        loading: false,
        items: mockItems,
        categories: mockCategories,
        error: null
      },
      dispatch: mockDispatch
    });

    itemService.getItems.mockResolvedValue({
      items: mockItems,
      pagination: mockPagination
    });

    itemService.deleteItem.mockResolvedValue({});
    itemService.updateItem.mockResolvedValue({});
    itemService.createItem.mockResolvedValue({});

    window.confirm = vi.fn(() => true);
    global.URL.createObjectURL = vi.fn();
  });

  // Test Initial Render and Data Loading
  describe('Initial Render and Data Loading', () => {
    test('renders loading state initially', () => {
      useApp.mockReturnValue({
        state: { loading: true, items: [], categories: [], error: null },
        dispatch: mockDispatch
      });

      render(<ItemsList />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('loads and displays basic items data', async () => {
      render(<ItemsList />);

      // Wait for API call
      await waitFor(() => {
        expect(itemService.getItems).toHaveBeenCalledTimes(1);
      });

      // Use more flexible waiting and checking
      const laptopElement = await screen.findByText('Laptop', {}, { timeout: 3000 });
      expect(laptopElement).toBeInTheDocument();

      const mouseElement = await screen.findByText('Wireless Mouse', {}, { timeout: 3000 });
      expect(mouseElement).toBeInTheDocument();

      // Check if we can at least find the table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  // Test that the component structure renders
  describe('Component Structure', () => {
    test('renders the main layout and headers', async () => {
      render(<ItemsList />);

      // Check basic structure
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByText('Item List')).toBeInTheDocument();
      expect(screen.getByText('Manage your items')).toBeInTheDocument();
      expect(screen.getByText('+ Add New Item')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    });
  });

  // Test CRUD Operations
  describe('CRUD Operations', () => {
    test('opens add item form when Add New Item button is clicked', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      fireEvent.click(screen.getByText('+ Add New Item'));

      await waitFor(() => {
        expect(screen.getByTestId('item-form')).toBeInTheDocument();
      });
    });

    test('deletes item when delete button is clicked', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      expect(itemService.deleteItem).toHaveBeenCalledWith('1');
    });
  });

  // Test Search Functionality
  describe('Search and Filter', () => {
    test('triggers search when typing in search box', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      const searchInput = screen.getByPlaceholderText('Search items...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(itemService.getItems).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'test' })
        );
      });
    });

    test('filters items by category', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'cat1' } });

      await waitFor(() => {
        expect(itemService.getItems).toHaveBeenCalledWith(
          expect.objectContaining({ category: 'cat1' })
        );
      });
    });
  });

  // Test Pagination
  describe('Pagination', () => {
    test('displays pagination when multiple pages exist', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    test('changes page when pagination is used', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      fireEvent.click(screen.getByText('Next Page'));

      await waitFor(() => {
        expect(itemService.getItems).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  // Test Stock Status
  describe('Stock Status', () => {
    test('displays correct stock status badges', async () => {
      render(<ItemsList />);
      await screen.findByText('Laptop');

      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });
  });

  // Test Empty State
  describe('Empty State', () => {
    test('shows empty state when no items', async () => {
      useApp.mockReturnValue({
        state: { loading: false, items: [], categories: mockCategories, error: null },
        dispatch: mockDispatch
      });

      itemService.getItems.mockResolvedValue({
        items: [],
        pagination: { ...mockPagination, totalItems: 0 }
      });

      render(<ItemsList />);

      expect(await screen.findByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Item')).toBeInTheDocument();
    });
  });
});