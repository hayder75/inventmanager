'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  creditLimit: string;
  currentBalance: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.put(`/api/companies/${editingCompany.id}`, formData);
      } else {
        await api.post('/api/companies', formData);
      }
      setShowModal(false);
      setEditingCompany(null);
      setFormData({ name: '', phone: '', address: '', creditLimit: '' });
      fetchCompanies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save credit user');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      phone: company.phone || '',
      address: company.address || '',
      creditLimit: company.creditLimit,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credit user?')) return;
    try {
      await api.delete(`/api/companies/${id}`);
      fetchCompanies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCreditTaken = companies.reduce((sum, c) => sum + parseFloat(c.currentBalance), 0);
  const totalCreditLimit = companies.reduce((sum, c) => sum + parseFloat(c.creditLimit), 0);
  const totalAvailableCredit = totalCreditLimit - totalCreditTaken;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Credit Users</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage credit customers</p>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setFormData({ name: '', phone: '', address: '', creditLimit: '' });
            setShowModal(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Credit User
        </button>
      </div>

      {/* Credit Recap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-600">Total Credit Limit</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
            {formatCurrency(totalCreditLimit)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-600">Total Credit Taken</p>
          <p className="text-lg md:text-2xl font-bold text-yellow-600 mt-1 truncate">
            {formatCurrency(totalCreditTaken)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-600">Available Credit</p>
          <p className="text-lg md:text-2xl font-bold text-green-600 mt-1 truncate">
            {formatCurrency(totalAvailableCredit)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
              placeholder="Search credit users..."
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{company.name}</td>
                  <td className="px-6 py-4">{company.phone || 'N/A'}</td>
                  <td className="px-6 py-4">${parseFloat(company.creditLimit).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={parseFloat(company.currentBalance) > 0 ? 'text-yellow-600' : 'text-gray-600'}>
                      ${parseFloat(company.currentBalance).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
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
          {filteredCompanies.map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">{company.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{company.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="font-medium">${parseFloat(company.creditLimit).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className={`font-semibold ${parseFloat(company.currentBalance) > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    ${parseFloat(company.currentBalance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">
              {editingCompany ? 'Edit Credit User' : 'Add Credit User'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditLimit || ''}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="Enter credit limit"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCompany(null);
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
    </div>
  );
}

