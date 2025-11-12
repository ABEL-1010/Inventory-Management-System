import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import UserList from '../Users/UserList';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userServices';

// Mock all dependencies
vi.mock('../../context/AuthContext');
vi.mock('../../services/userServices');
vi.mock('../../components/Common/Button', () => ({ 
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}));
vi.mock('../../components/Common/LoadingSpinner', () => ({ 
  default: ({ text }) => <div>Loading: {text}</div>
}));
vi.mock('../../components/Layout/Layout', () => ({ 
  default: ({ children }) => <div>{children}</div> 
}));
vi.mock('../Users/UserForm', () => ({ 
  default: ({ onClose }) => (
    <div data-testid="user-form">
      <button onClick={onClose}>Close Form</button>
    </div>
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Edit: () => <span>Edit</span>,
  Trash2: () => <span>Delete</span>,
  Shield: () => <span>Shield</span>,
  User: () => <span>User</span>,
}));

// Mock data
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    isActive: true,
    lastLogin: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    isActive: false,
    lastLogin: null,
    createdAt: '2024-01-02T00:00:00Z'
  }
];

const mockCurrentUser = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

describe('UserList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockCurrentUser });
    userService.getUsers.mockResolvedValue(mockUsers);
    userService.deleteUser.mockResolvedValue({});
    
    // More robust window.confirm mock
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn(() => true),
    });
  });

  test('renders loading state initially', () => {
    userService.getUsers.mockImplementation(() => new Promise(() => {}));
    render(<UserList />);
    expect(screen.getByText('Loading: Loading users...')).toBeInTheDocument();
  });

  test('loads and displays users data', async () => {
    render(<UserList />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('displays error message when API fails', async () => {
    userService.getUsers.mockRejectedValue(new Error('Network error'));
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load users: Network error')).toBeInTheDocument();
    });
  });

  test('filters users by search term', async () => {
    render(<UserList />);
    await screen.findByText('John Doe');
    
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('deletes user when delete button is clicked - detailed debug', async () => {
  render(<UserList />);
  await screen.findByText('John Doe');

  // Debug: Check all interactive elements
  const allButtons = screen.getAllByRole('button');
  console.log('All buttons:', allButtons.map(btn => ({
    text: btn.textContent,
    disabled: btn.disabled,
    type: btn.type
  })));

  // Get all delete buttons and inspect them
  const deleteButtons = screen.getAllByText('Delete');
  console.log('Delete buttons details:', deleteButtons.map((btn, index) => ({
    index,
    text: btn.textContent,
    parent: btn.parentElement?.textContent,
    disabled: btn.disabled,
    onclick: btn.onclick
  })));

  // Try clicking each delete button and see what happens
  for (let i = 0; i < deleteButtons.length; i++) {
    console.log(`--- Testing delete button ${i} ---`);
    
    // Reset the mock
    window.confirm.mockClear();
    userService.deleteUser.mockClear();
    
    // Click the button
    fireEvent.click(deleteButtons[i]);
    
    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`Button ${i} - confirm called:`, window.confirm.mock.calls.length);
    console.log(`Button ${i} - deleteUser called:`, userService.deleteUser.mock.calls);
    
    if (window.confirm.mock.calls.length > 0) {
      console.log(`SUCCESS: Button ${i} triggered confirm!`);
      console.log('Confirm was called with:', window.confirm.mock.calls[0]);
      break;
    }
  }
});
  test('shows empty state when no users', async () => {
    userService.getUsers.mockResolvedValue([]);
    render(<UserList />);
    expect(await screen.findByText('No users found')).toBeInTheDocument();
  });

  test('handles malformed user data gracefully', async () => {
    const malformedUsers = [
      {
        _id: '1',
        name: 'Valid User',
        email: 'valid@example.com',
        role: 'user',
        isActive: true
      },
      {
        _id: '2',
        // Missing name and email intentionally
        role: 'user'
      }
    ];

    userService.getUsers.mockResolvedValue(malformedUsers);
    render(<UserList />);

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText('Valid User')).toBeInTheDocument();
    });
  });
});