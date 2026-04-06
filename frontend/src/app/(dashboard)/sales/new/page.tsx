'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, X, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string | null;
  sellingPrice: string;
  stockQty: number;
}

interface Company {
  id: string;
  name: string;
  creditLimit: string;
  currentBalance: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  adminPrice: number;
  overriddenPrice?: number;
  finalPrice: number;
  subtotal: number;
  // Surplus management
  surplusAmount?: number;
  adminCutType?: 'percentage' | 'amount'; // How admin cut is specified
  adminCutValue?: number; // Percentage or amount value
  adminCutAmount?: number; // Calculated admin cut amount
  remainingSurplus?: number; // Surplus after admin's cut
  salespersonGetsCommission?: boolean;
  salespersonCommissionType?: 'percentage' | 'amount'; // How commission is specified
  salespersonCommissionValue?: number; // Percentage or amount value
  salespersonCommissionAmount?: number; // Calculated commission amount
}

export default function NewSalePage() {
  const router = useRouter();
  const [buyerType, setBuyerType] = useState<'walkin' | 'company'>('walkin');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT'; amount: number; bankType?: string }>>([]);
  const [bankTransferImage, setBankTransferImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    vat_enabled: false,
    tot_enabled: false,
  });

  useEffect(() => {
    fetchCompanies();
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings({
        vat_enabled: response.data.vat_enabled === 'true',
        tot_enabled: response.data.tot_enabled === 'true',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };
  
  // Auto-update payment methods when items change
  useEffect(() => {
    const total = calculateTotal();
    if (items.length > 0) {
      if (paymentMethods.length === 0) {
        // If credit user, auto-select CREDIT, otherwise CASH
        const defaultMethod = buyerType === 'company' ? 'CREDIT' : 'CASH';
        setPaymentMethods([{ method: defaultMethod, amount: total }]);
      } else if (paymentMethods.length === 1) {
        // Only auto-update if it's the first payment method and total changed
        setPaymentMethods([{ ...paymentMethods[0], amount: total }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map(i => i.subtotal).join(',')]);

  // Auto-select CREDIT when buyer type changes to company
  useEffect(() => {
    if (buyerType === 'company' && items.length > 0) {
      const total = calculateTotal();
      setPaymentMethods([{ method: 'CREDIT', amount: total }]);
    } else if (buyerType === 'walkin' && items.length > 0 && paymentMethods.length > 0 && paymentMethods[0].method === 'CREDIT') {
      // If switching from company to walkin, change to CASH
      const total = calculateTotal();
      setPaymentMethods([{ method: 'CASH', amount: total }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerType]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
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

  const addProduct = (product: Product) => {
    if (product.stockQty === 0) {
      alert('Product is out of stock');
      return;
    }
    const adminPrice = parseFloat(product.sellingPrice);
    const newItem: SaleItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      adminPrice,
      overriddenPrice: adminPrice,
      finalPrice: adminPrice,
      subtotal: adminPrice,
      surplusAmount: 0,
      adminCutType: 'percentage',
      adminCutValue: 0,
      adminCutAmount: 0,
      remainingSurplus: 0,
      salespersonGetsCommission: false,
      salespersonCommissionType: 'percentage',
      salespersonCommissionValue: 0,
      salespersonCommissionAmount: 0,
    };
    setItems([...items, newItem]);
    setSearchQuery('');
  };

  const handleAddNewProductDirectly = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a product name');
      return;
    }
    try {
      const response = await api.post('/api/products', {
        name: searchQuery.trim(),
        costPrice: 0,
        sellingPrice: 0,
        stockQty: 0,
      });
      const newProduct = response.data;
      if (newProduct) {
        addProductFromSearch(newProduct);
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
        <p className="text-gray-600 mt-1">Create a new sales transaction</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buyer Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Buyer Information</h2>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setBuyerType('walkin')}
              className={`px-4 py-2 rounded-lg ${
                buyerType === 'walkin'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Walk-in
            </button>
            <button
              type="button"
              onClick={() => setBuyerType('company')}
              className={`px-4 py-2 rounded-lg ${
                buyerType === 'company'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Credit User
            </button>
          </div>

          {buyerType === 'walkin' ? (
            <div className="text-sm text-gray-600">
              Walk-in customer - proceed to add products below
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Credit User
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select a credit user</option>
                {companies.map((company) => {
                  const availableCredit = parseFloat(company.creditLimit) - parseFloat(company.currentBalance);
                  return (
                    <option key={company.id} value={company.id}>
                      {company.name} (Limit: {parseFloat(company.creditLimit).toLocaleString()}, Available: {availableCredit.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Add Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Products</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Search products..."
            />
          </div>

          {searchQuery && (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProductFromSearch(product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-200 last:border-0"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.code} | Stock: {product.stockQty} | Price: ${parseFloat(product.sellingPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No products found. Just enter product name in search box above and click "Add to Sale" to create it automatically.
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Type product name here if not in list..."
            />
            <button
              type="button"
              onClick={handleAddNewProductDirectly}
              disabled={!searchQuery.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Add to Sale
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="mt-4 space-y-4">
              {items.map((item, index) => {
                const surplus = calculateSurplus(item);
                const hasSurplus = surplus > 0;
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateItem(index, { quantity: val === '' ? 1 : parseInt(val) || 1 });
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-600">x</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.overriddenPrice !== undefined ? item.overriddenPrice : (item.adminPrice || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newPrice = val === '' ? undefined : parseFloat(val);
                              updateItem(index, { overriddenPrice: isNaN(newPrice as number) ? undefined : newPrice });
                            }}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Enter price"
                          />
                          <span className="text-gray-600">=</span>
                          <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">(Admin: ${item.adminPrice.toFixed(2)})</span>
                        </div>
                        {hasSurplus && (
                          <div className="mt-2 text-sm text-green-600 font-medium">
                            Surplus: ${surplus.toFixed(2)}
                          </div>
                        )}
                        {!hasSurplus && item.finalPrice < item.adminPrice && (
                          <div className="mt-2 text-sm text-orange-600 font-medium">
                            Below Admin: ${(item.adminPrice - item.finalPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Surplus Management Section */}
                    {hasSurplus && (
                      <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                        <div className="text-sm font-semibold text-gray-700">Surplus Management</div>
                        
                        {/* Admin Cut */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Admin Cut Type</label>
                            <select
                              value={item.adminCutType || 'percentage'}
                              onChange={(e) => updateItem(index, { 
                                adminCutType: e.target.value as 'percentage' | 'amount',
                                adminCutValue: 0 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="percentage">Percentage</option>
                              <option value="amount">Amount</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {item.adminCutType === 'percentage' ? 'Admin Cut %' : 'Admin Cut Amount'}
                            </label>
                            <input
                              type="number"
                              step={item.adminCutType === 'percentage' ? '0.1' : '0.01'}
                              min="0"
                              max={item.adminCutType === 'percentage' ? '100' : surplus}
                              value={item.adminCutValue !== undefined && item.adminCutValue !== 0 ? item.adminCutValue : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateItem(index, { 
                                  adminCutValue: val === '' ? 0 : (parseFloat(val) || 0)
                                });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder={item.adminCutType === 'percentage' ? 'Enter %' : 'Enter amount'}
                            />
                          </div>
                        </div>
                        {item.adminCutAmount && item.adminCutAmount > 0 && (
                          <div className="text-xs text-dashboard">
                            Admin Cut: ${item.adminCutAmount.toFixed(2)} | Remaining Surplus: ${(item.remainingSurplus || 0).toFixed(2)}
                          </div>
                        )}

                        {/* Salesperson Commission */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.salespersonGetsCommission || false}
                            onChange={(e) => updateItem(index, { 
                              salespersonGetsCommission: e.target.checked,
                              salespersonCommissionValue: e.target.checked ? (item.salespersonCommissionValue || 0) : 0
                            })}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-700">Salesperson gets commission</label>
                        </div>

                        {item.salespersonGetsCommission && (
                          <div className="grid grid-cols-2 gap-2 pl-6">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Commission Type</label>
                              <select
                                value={item.salespersonCommissionType || 'percentage'}
                                onChange={(e) => updateItem(index, { 
                                  salespersonCommissionType: e.target.value as 'percentage' | 'amount',
                                  salespersonCommissionValue: 0
                                })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="percentage">Percentage</option>
                                <option value="amount">Amount</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {item.salespersonCommissionType === 'percentage' ? 'Commission %' : 'Commission Amount'}
                              </label>
                              <input
                                type="number"
                                step={item.salespersonCommissionType === 'percentage' ? '0.1' : '0.01'}
                                min="0"
                                max={item.salespersonCommissionType === 'percentage' ? '100' : (item.remainingSurplus || 0)}
                                value={item.salespersonCommissionValue !== undefined && item.salespersonCommissionValue !== 0 ? item.salespersonCommissionValue : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateItem(index, { 
                                    salespersonCommissionValue: val === '' ? 0 : (parseFloat(val) || 0)
                                  });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder={item.salespersonCommissionType === 'percentage' ? 'Enter %' : 'Enter amount'}
                              />
                            </div>
                          </div>
                        )}
                        {item.salespersonCommissionAmount && item.salespersonCommissionAmount > 0 && (
                          <div className="text-xs text-green-600 pl-6">
                            Salesperson Commission: ${item.salespersonCommissionAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <button
              type="button"
              onClick={addPaymentMethod}
              className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Payment
            </button>
          </div>

          {paymentMethods.map((pm, index) => (
            <div key={index} className="space-y-2 mb-4">
              <div className="flex items-center space-x-4">
                <select
                  value={pm.method}
                  onChange={(e) => {
                    const newMethod = e.target.value as any;
                    if (buyerType === 'walkin' && newMethod === 'CREDIT') {
                      return; // Don't allow credit for walk-in
                    }
                    if (buyerType === 'company' && newMethod !== 'CREDIT') {
                      // If credit user, force CREDIT
                      return;
                    }
                    const updated = [...paymentMethods];
                    updated[index] = { ...updated[index], method: newMethod, bankType: newMethod === 'BANK_TRANSFER' ? updated[index].bankType : undefined };
                    setPaymentMethods(updated);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={buyerType === 'company'}
                >
                  {buyerType === 'company' ? (
                    <option value="CREDIT">Credit</option>
                  ) : (
                    <>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </>
                  )}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={pm.amount || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updatePaymentMethod(index, pm.method, val === '' ? 0 : (parseFloat(val) || 0));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                />
                <button
                  type="button"
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {pm.method === 'BANK_TRANSFER' && buyerType === 'walkin' && (
                <div className="ml-0 space-y-2">
                  <select
                    value={pm.bankType?.startsWith('OTHER:') ? 'OTHER' : (pm.bankType || '')}
                    onChange={(e) => {
                      const updated = [...paymentMethods];
                      if (e.target.value === 'OTHER') {
                        updated[index] = { ...updated[index], bankType: 'OTHER:' };
                      } else {
                        updated[index] = { ...updated[index], bankType: e.target.value };
                      }
                      setPaymentMethods(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Bank</option>
                    <option value="CBE">CBE (Commercial Bank of Ethiopia)</option>
                    <option value="ABYSSINYA">Abyssinya Bank</option>
                    <option value="AWASH">Awash Bank</option>
                    <option value="TELEBIRR">Telebirr</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {pm.bankType?.startsWith('OTHER:') && (
                    <input
                      type="text"
                      value={pm.bankType.replace('OTHER:', '')}
                      onChange={(e) => {
                        const updated = [...paymentMethods];
                        updated[index] = { ...updated[index], bankType: `OTHER:${e.target.value}` };
                        setPaymentMethods(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter bank name"
                      required
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Receipt Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const formData = new FormData();
                          formData.append('image', file);
                          const response = await api.post('/api/upload/bank-transfer', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          setBankTransferImage(response.data.imageUrl);
                        } catch (error: any) {
                          alert(error.response?.data?.error || 'Failed to upload image');
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={uploadingImage}
                    />
                    {bankTransferImage && (
                      <div className="mt-2">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${bankTransferImage}`}
                          alt="Bank transfer receipt"
                          className="max-w-xs max-h-32 object-contain border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setBankTransferImage(null)}
                          className="mt-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {uploadingImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            {settings.vat_enabled && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT (7.5%):</span>
                <span>${calculateVAT().toFixed(2)}</span>
              </div>
            )}
            {settings.tot_enabled && !settings.vat_enabled && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>TOT (3%):</span>
                <span>${calculateTOT().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            {paymentMethods.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Payment Total: ${paymentMethods.reduce((sum, pm) => sum + pm.amount, 0).toFixed(2)}
                {Math.abs(calculateTotal() - paymentMethods.reduce((sum, pm) => sum + pm.amount, 0)) > 0.01 && (
                  <span className="text-red-600 ml-2">
                    (Difference: ${Math.abs(calculateTotal() - paymentMethods.reduce((sum, pm) => sum + pm.amount, 0)).toFixed(2)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
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
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Sale'}
          </button>
        </div>
      </form>
    </div>
  );
}

