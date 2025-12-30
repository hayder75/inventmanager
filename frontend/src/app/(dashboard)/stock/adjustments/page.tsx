'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stockQty: number;
}

interface Adjustment {
  id: string;
  product: { name: string };
  qtyChange: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  creator: { name: string };
}

interface Product {
  id: string;
  name: string;
  stockQty: number;
  category: string | null;
}

export default function StockAdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    qtyChange: '',
    adjustmentType: 'DECREASE' as 'INCREASE' | 'DECREASE',
    reason: 'CORRECTION',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchAdjustments();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      const response = await api.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAdjustments = async () => {
    try {
      const response = await api.get('/api/stock/adjustments');
      setAdjustments(response.data);
    } catch (error) {
      console.error('Failed to fetch adjustments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.qtyChange || parseFloat(formData.qtyChange.toString()) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    try {
      const qtyChange = formData.adjustmentType === 'DECREASE' 
        ? -Math.abs(parseFloat(formData.qtyChange.toString()))
        : Math.abs(parseFloat(formData.qtyChange.toString()));
      await api.post('/api/stock/adjust', {
        ...formData,
        qtyChange,
      });
      setShowModal(false);
      setFormData({ productId: '', qtyChange: '', adjustmentType: 'DECREASE', reason: 'CORRECTION', notes: '' });
      fetchAdjustments();
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600 mt-1">Manual stock corrections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Adjustment
        </button>
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
              placeholder="Search by product name, reason, notes, or creator..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adjustments
                .filter((adj) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    adj.product.name.toLowerCase().includes(query) ||
                    adj.reason.toLowerCase().includes(query) ||
                    adj.notes?.toLowerCase().includes(query) ||
                    adj.creator.name.toLowerCase().includes(query) ||
                    adj.qtyChange.toString().includes(query)
                  );
                })
                .map((adj) => (
                <tr key={adj.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(adj.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{adj.product.name}</td>
                  <td className="px-6 py-4">
                    <span className={adj.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}>
                      {adj.qtyChange > 0 ? '+' : ''}{adj.qtyChange}
                    </span>
                  </td>
                  <td className="px-6 py-4">{adj.reason.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{adj.notes || 'N/A'}</td>
                  <td className="px-6 py-4">{adj.creator.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Stock Adjustment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setFormData({ ...formData, productId: '' }); // Reset product when category changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
                <select
                  value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  required
                >
                  <option value="DECREASE">Decrease (Deduct)</option>
                  <option value="INCREASE">Increase (Add)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.qtyChange || ''}
                  onChange={(e) => setFormData({ ...formData, qtyChange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="DAMAGE">Damage</option>
                  <option value="THEFT">Theft</option>
                  <option value="GIFT">Gift</option>
                  <option value="CORRECTION">Correction</option>
                  <option value="COUNT_ERROR">Count Error</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="RETURNED">Returned</option>
                  <option value="OTHER">Other</option>
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

