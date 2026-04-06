'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, X, Save, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  stockQty: number;
  costPrice: string;
  sellingPrice: string;
}

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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<{ [key: number]: string }>({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<{ [key: number]: boolean }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<{ [key: number]: string }>({});
  const [showProductDropdown, setShowProductDropdown] = useState<{ [key: number]: boolean }>({});
  const productDropdownRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    Object.keys(productDropdownRef.current).forEach((index) => {
      const ref = productDropdownRef.current[parseInt(index)];
      if (ref && !ref.contains(e.target as Node)) {
        setShowProductDropdown((prev) => ({ ...prev, [parseInt(index)]: false }));
      }
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addEntry = () => {
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
  };

  const updateEntry = (index: number, updates: Partial<StockEntry>) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], ...updates };
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedEntries = entries.map((entry, index) => {
        const searchValue = productSearch[index] || '';
        const isNewProduct = searchValue && !entry.productId;
        
        return {
          ...entry,
          productName: isNewProduct ? searchValue : entry.productName,
          productCode: isNewProduct ? entry.productCode : entry.productCode,
          sellingPrice: entry.sellingPrice || (entry.costPrice > 0 ? entry.costPrice * 1.5 : 0),
          supplierName: entry.supplierName || undefined,
        };
      });
      
      const validEntries = cleanedEntries.filter(entry => entry.productName || entry.productId);
      if (validEntries.length === 0) {
        alert('Please add at least one product');
        setLoading(false);
        return;
      }

      await api.post('/api/stock/add', validEntries);
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
                  <div className="relative" ref={(el) => { productDropdownRef.current[index] = el; }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Name/Code
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch[index] || ''}
                        onChange={(e) => {
                          setProductSearch({ ...productSearch, [index]: e.target.value });
                          setShowProductDropdown({ ...showProductDropdown, [index]: true });
                        }}
                        onFocus={() => {
                          setShowProductDropdown({ ...showProductDropdown, [index]: true });
                        }}
                        className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Search or type new"
                      />
                      {entry.productName && (
                        <button
                          type="button"
                          onClick={() => {
                            updateEntry(index, { productId: undefined, productName: undefined, productCode: undefined });
                            setProductSearch({ ...productSearch, [index]: '' });
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {showProductDropdown[index] && (productSearch[index] || entry.productName) && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {products
                          .filter(p => 
                            p.name.toLowerCase().includes((productSearch[index] || '').toLowerCase()) ||
                            p.code?.toLowerCase().includes((productSearch[index] || '').toLowerCase())
                          )
                          .slice(0, 10)
                          .map(product => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                updateEntry(index, { 
                                  productId: product.id, 
                                  productName: product.name, 
                                  productCode: product.code || undefined,
                                  category: product.category || undefined,
                                  costPrice: parseFloat(product.costPrice) || 0,
                                  sellingPrice: parseFloat(product.sellingPrice) || 0
                                });
                                setProductSearch({ ...productSearch, [index]: product.name });
                                setShowProductDropdown({ ...showProductDropdown, [index]: false });
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <div className="text-sm font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.code} | Stock: {product.stockQty}</div>
                            </button>
                          ))}
                        </div>
                      )}
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
                        const sellingPrice = entry.sellingPrice || (costPrice > 0 ? costPrice * 1.5 : 0);
                        updateEntry(index, { costPrice, sellingPrice });
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
                        updateEntry(index, { sellingPrice: val === '' ? 0 : (parseFloat(val) || 0) });
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

