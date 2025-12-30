'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Key } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES';
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SALES' as 'ADMIN' | 'SALES',
    password: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, formData);
      } else {
        await api.post('/api/users', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'SALES', password: '' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await api.post(`/api/users/${editingUser?.id}/reset-password`, {
        newPassword: passwordData.newPassword,
      });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('Password reset successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to deactivate user');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage system users</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'SALES', password: '' });
            setShowModal(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            password: '',
                          });
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowPasswordModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Key className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <div className="flex space-x-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        password: '',
                      });
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setShowPasswordModal(true);
                    }}
                    className="text-yellow-600 hover:text-yellow-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Key className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                >
                  <option value="SALES">Sales</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                    required
                  />
                </div>
              )}
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px] w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">Reset Password</h2>
            <p className="text-sm text-gray-600 mb-4">User: {editingUser?.name}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px] w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

