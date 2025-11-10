import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userServices';
import Button from '../../components/Common/Button';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Layout from '../../components/Layout/Layout';
import UserForm from './UserForm';
import { Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      setError('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = filters.status === '' || 
                         (filters.status === 'active' && user.isActive) ||
                         (filters.status === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.updateUser(editingUser._id, userData);
        setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
      } else {
        const newUser = await userService.createUser(userData);
        setUsers([...users, newUser]);
      }
      handleFormClose();
    } catch (error) {
      alert('Error saving user: ' + error.message);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return { text: 'Admin', color: 'bg-purple-100 text-purple-800', icon: Shield };
    }
    return { text: 'User', color: 'bg-blue-100 text-blue-800', icon: UserIcon };
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { text: 'Active', color: 'bg-green-100 text-green-800' }
      : { text: 'Inactive', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading users..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 text-white hover:bg-amber-700 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border">
          {/* Left: Search */}
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Right: Filters */}
          <div className="flex space-x-2 text-sm">
            <select 
              value={filters.role} 
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const statusBadge = getStatusBadge(user.isActive);
                  const RoleIcon = roleBadge.icon;
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEdit(user)}
                          disabled={user._id === currentUser._id}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDelete(user._id)}
                          disabled={user._id === currentUser._id}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No users found</div>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="mt-4"
                >
                  Create Your First User
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        )}
      </div>
    </Layout>
  );
};

export default UserList;