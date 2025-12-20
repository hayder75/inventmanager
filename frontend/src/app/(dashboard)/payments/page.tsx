'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Company {
  id: string;
  name: string;
  currentBalance: string;
}

interface Payment {
  id: string;
  company: { name: string };
  amount: string;
  method: string;
  createdAt: string;
  salesperson: { name: string };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    amount: '',
    method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    notes: '',
  });

  useEffect(() => {
    fetchCompaniesWithBalance();
    fetchPayments();
  }, []);

  const fetchCompaniesWithBalance = async () => {
    try {
      const response = await api.get('/api/payments/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/payments/receive', formData);
      setShowModal(false);
      setFormData({ companyId: '', amount: '', method: 'CASH', notes: '' });
      fetchCompaniesWithBalance();
      fetchPayments();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Received</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ADMIN' ? 'View payment history' : 'Record payments from companies'}
          </p>
        </div>
        {user?.role === 'SALES' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Receive Payment
          </button>
        )}
      </div>

      {/* Companies with Balance - Only for SALES */}
      {user?.role === 'SALES' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Companies with Outstanding Balance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, companyId: company.id });
                    setShowModal(true);
                  }}
                >
                  <p className="font-medium">{company.name}</p>
                  <p className="text-yellow-600 font-semibold mt-1">
                    Balance: {formatCurrency(company.currentBalance)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Payment History</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search by company name or amount..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments
                .filter((payment) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    payment.company.name.toLowerCase().includes(query) ||
                    payment.amount.toLowerCase().includes(query) ||
                    parseFloat(payment.amount).toString().includes(query)
                  );
                })
                .map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{payment.company.name}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4">{payment.method.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{payment.salesperson.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Receive Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Balance: {formatCurrency(c.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

