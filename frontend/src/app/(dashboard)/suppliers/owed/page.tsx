'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DollarSign, Plus, Search } from 'lucide-react';

interface SupplierOwed {
  id: string;
  product: { name: string };
  supplierName: string;
  owedAmount: string;
  remainingOwed: string;
  createdAt: string;
}

export default function SuppliersOwedPage() {
  const [suppliers, setSuppliers] = useState<SupplierOwed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    supplierName: '',
    notes: '',
  });

  useEffect(() => {
    fetchSuppliersOwed();
  }, []);

  const fetchSuppliersOwed = async () => {
    try {
      const response = await api.get('/api/suppliers/owed');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers owed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/suppliers/pay', {
        stockEntryIds: selectedEntries,
        ...paymentData,
      });
      setShowPaymentModal(false);
      setSelectedEntries([]);
      setPaymentData({ amount: '', method: 'CASH', supplierName: '', notes: '' });
      fetchSuppliersOwed();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const toggleEntry = (id: string) => {
    setSelectedEntries(
      selectedEntries.includes(id)
        ? selectedEntries.filter(e => e !== id)
        : [...selectedEntries, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers Owed</h1>
          <p className="text-gray-600 mt-1">Track and pay supplier balances</p>
        </div>
        {selectedEntries.length > 0 && (
          <button
            onClick={() => {
              const supplier = suppliers.find(s => selectedEntries.includes(s.id));
              setPaymentData({
                ...paymentData,
                supplierName: supplier?.supplierName || '',
              });
              setShowPaymentModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Payment ({selectedEntries.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search by supplier name, product, or amount..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntries(suppliers.map(s => s.id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Owed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers
                .filter((supplier) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    supplier.supplierName.toLowerCase().includes(query) ||
                    supplier.product.name.toLowerCase().includes(query) ||
                    supplier.owedAmount.toLowerCase().includes(query) ||
                    supplier.remainingOwed.toLowerCase().includes(query)
                  );
                })
                .map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(supplier.id)}
                      onChange={() => toggleEntry(supplier.id)}
                    />
                  </td>
                  <td className="px-6 py-4">{new Date(supplier.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{supplier.supplierName}</td>
                  <td className="px-6 py-4">{supplier.product.name}</td>
                  <td className="px-6 py-4">${parseFloat(supplier.owedAmount).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-yellow-600">
                    ${parseFloat(supplier.remainingOwed).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Supplier Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  value={paymentData.supplierName}
                  onChange={(e) => setPaymentData({ ...paymentData, supplierName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount || ''}
                  placeholder="Enter amount"
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as any })}
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
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
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

