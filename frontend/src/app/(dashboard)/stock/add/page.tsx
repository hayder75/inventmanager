'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, X, Save } from 'lucide-react';

interface StockEntry {
  productId?: string;
  productName?: string;
  productCode?: string;
  category?: string;
  quantity: number;
  unit?: string; // 'pack' or 'pcs' or other
  costPrice: number;
  sellingPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
  supplierName?: string;
  status: 'FULLY_PAID' | 'PARTIALLY_PAID' | 'ON_CREDIT';
  owedAmount?: number;
  notes?: string;
}

export default function AddStockPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<StockEntry[]>([
    {
      quantity: 1,
      unit: 'pcs',
      costPrice: 0,
      sellingPrice: 0,
      supplierName: undefined,
      status: 'FULLY_PAID',
    },
  ]);
  const [sellingPriceManuallySet, setSellingPriceManuallySet] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<{ [key: number]: string }>({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const addEntry = () => {
    const newIndex = entries.length;
    setEntries([
      ...entries,
      {
        quantity: 1,
        unit: 'pcs',
        costPrice: 0,
        sellingPrice: 0,
        supplierName: undefined,
        status: 'FULLY_PAID',
      },
    ]);
    // Reset manual setting flag for new entry
    setSellingPriceManuallySet({ ...sellingPriceManuallySet, [newIndex]: false });
  };

  const updateEntry = (index: number, updates: Partial<StockEntry>) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], ...updates };
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
    // Clean up manual setting flags
    const newFlags: { [key: number]: boolean } = {};
    entries.forEach((_, i) => {
      if (i < index) {
        newFlags[i] = sellingPriceManuallySet[i] || false;
      } else if (i > index) {
        newFlags[i - 1] = sellingPriceManuallySet[i] || false;
      }
    });
    setSellingPriceManuallySet(newFlags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up entries - ensure selling price is set and supplier is optional
      const cleanedEntries = entries.map(entry => ({
        ...entry,
        sellingPrice: entry.sellingPrice || (entry.costPrice > 0 ? entry.costPrice * 1.5 : 0),
        supplierName: entry.supplierName || undefined,
      }));
      await api.post('/api/stock/add', cleanedEntries);
      router.push('/products');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add stock';
      if (error.response?.status === 403 || errorMessage.includes('permission')) {
        alert('Insufficient permissions. Please log out and log back in to refresh your session.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Stock</h1>
        <p className="text-gray-600 mt-1">Add single or batch stock entries</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Stock Entries</h2>
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </button>
          </div>

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Name/Code
                    </label>
                    <input
                      type="text"
                      value={entry.productName || ''}
                      onChange={(e) => updateEntry(index, { productName: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="Type to create new"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    {showNewCategoryInput[index] ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newCategoryName[index] || ''}
                          onChange={(e) => {
                            setNewCategoryName({ ...newCategoryName, [index]: e.target.value });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="New category name"
                          onBlur={() => {
                            if (newCategoryName[index]?.trim()) {
                              updateEntry(index, { category: newCategoryName[index].trim() });
                              if (!categories.includes(newCategoryName[index].trim())) {
                                setCategories([...categories, newCategoryName[index].trim()].sort());
                              }
                            }
                            setShowNewCategoryInput({ ...showNewCategoryInput, [index]: false });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCategoryName[index]?.trim()) {
                                updateEntry(index, { category: newCategoryName[index].trim() });
                                if (!categories.includes(newCategoryName[index].trim())) {
                                  setCategories([...categories, newCategoryName[index].trim()].sort());
                                }
                              }
                              setShowNewCategoryInput({ ...showNewCategoryInput, [index]: false });
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryInput({ ...showNewCategoryInput, [index]: false });
                            setNewCategoryName({ ...newCategoryName, [index]: '' });
                          }}
                          className="px-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <select
                          value={entry.category || ''}
                          onChange={(e) => {
                            if (e.target.value === '__new__') {
                              setShowNewCategoryInput({ ...showNewCategoryInput, [index]: true });
                            } else {
                              updateEntry(index, { category: e.target.value || undefined });
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                          <option value="__new__">+ Create New Category</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateEntry(index, { quantity: val === '' ? 1 : (parseInt(val) || 1) });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit *</label>
                    <select
                      value={entry.unit || 'pcs'}
                      onChange={(e) => updateEntry(index, { unit: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    >
                      <option value="pcs">Pieces</option>
                      <option value="pak">Pack</option>
                      <option value="reem">Reem</option>
                      <option value="set">Set</option>
                      <option value="roll">Roll</option>
                      <option value="pair">Pair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.costPrice !== undefined && entry.costPrice !== 0 ? entry.costPrice : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const costPrice = val === '' ? 0 : (parseFloat(val) || 0);
                        // Only auto-calculate selling price if it hasn't been manually set
                        if (!sellingPriceManuallySet[index] && costPrice > 0) {
                          const autoSellingPrice = costPrice * 1.5;
                          updateEntry(index, { costPrice, sellingPrice: autoSellingPrice });
                        } else {
                          updateEntry(index, { costPrice });
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.sellingPrice !== undefined && entry.sellingPrice !== 0 ? entry.sellingPrice : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const sellingPrice = val === '' ? 0 : (parseFloat(val) || 0);
                        updateEntry(index, { sellingPrice });
                        // Mark as manually set when user types
                        if (val !== '') {
                          setSellingPriceManuallySet({ ...sellingPriceManuallySet, [index]: true });
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={entry.supplierName || ''}
                      onChange={(e) => updateEntry(index, { supplierName: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={entry.batchNumber || ''}
                      onChange={(e) => updateEntry(index, { batchNumber: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={entry.expiryDate || ''}
                      onChange={(e) => updateEntry(index, { expiryDate: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status *</label>
                    <select
                      value={entry.status}
                      onChange={(e) => {
                        const status = e.target.value as any;
                        updateEntry(index, {
                          status,
                          owedAmount: status !== 'FULLY_PAID' ? entry.costPrice * entry.quantity : 0,
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    >
                      <option value="FULLY_PAID">Fully Paid</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                      <option value="ON_CREDIT">On Credit</option>
                    </select>
                  </div>
                  {entry.status !== 'FULLY_PAID' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount Owed</label>
                      <input
                        type="number"
                        step="0.01"
                        value={entry.owedAmount !== undefined ? entry.owedAmount : (entry.costPrice * entry.quantity || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateEntry(index, { owedAmount: val === '' ? 0 : (parseFloat(val) || 0) });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Enter amount"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={entry.notes || ''}
                    onChange={(e) => updateEntry(index, { notes: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <X className="h-4 w-4 inline mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Submit All'}
          </button>
        </div>
      </form>
    </div>
  );
}

