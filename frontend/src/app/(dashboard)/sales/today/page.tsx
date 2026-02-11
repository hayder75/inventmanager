'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, Filter, X, Search } from 'lucide-react';

interface SaleItem {
  id: string;
  product: { name: string; code: string | null };
  quantity: number;
  adminPrice: string;
  overriddenPrice: string | null;
  finalPrice: string;
  subtotal: string;
  adminSubtotal: string; // Subtotal at admin price
  surplusAmount: string; // Extra amount from price override
}

interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  company: { name: string } | null;
  walkinName: string | null;
  totalAmount: string;
  items: SaleItem[];
  salesperson: { name: string; id: string };
}

interface Salesperson {
  id: string;
  name: string;
}

export default function TodaySalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

  useEffect(() => {
    fetchSalespeople();
    fetchSales();
  }, [selectedDate, selectedSalesperson]);

  const fetchSalespeople = async () => {
    try {
      const response = await api.get('/api/users', {
        params: { role: 'SALES', isActive: 'true' },
      });
      setSalespeople(response.data);
    } catch (error) {
      console.error('Failed to fetch salespeople:', error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      if (selectedSalesperson !== 'all') {
        params.salespersonId = selectedSalesperson;
      }

      const response = await api.get('/api/sales', { params });
      setSales(response.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Flatten all items from all sales for detailed view
  const allItems = sales.flatMap(sale =>
    sale.items.map(item => {
      const adminPrice = parseFloat(item.adminPrice);
      const finalPrice = parseFloat(item.overriddenPrice || item.adminPrice);
      const quantity = item.quantity;
      const adminSubtotal = adminPrice * quantity;
      const finalSubtotal = finalPrice * quantity;
      const surplusAmount = finalSubtotal - adminSubtotal;
      
      return {
        ...item,
        saleInvoice: sale.invoiceNumber,
        saleDate: sale.createdAt,
        customer: sale.company?.name || sale.walkinName || 'N/A',
        salesperson: sale.salesperson.name,
        salespersonId: sale.salesperson.id,
        adminSubtotal: adminSubtotal.toString(),
        surplusAmount: surplusAmount.toString(),
      };
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredItems = allItems.filter(item => {
    if (selectedSalesperson !== 'all' && item.salespersonId !== selectedSalesperson) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.saleInvoice.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.product.name.toLowerCase().includes(query) ||
        item.product.code?.toLowerCase().includes(query) ||
        item.salesperson.toLowerCase().includes(query) ||
        item.finalPrice.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-600 mt-1">
            Detailed list of all products sold
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search by invoice number, customer, product, salesperson, or amount..."
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Filters:</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm text-gray-600">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Salesperson:</label>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[150px]"
            >
              <option value="all">All Salespeople</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedDate !== new Date().toISOString().split('T')[0] || selectedSalesperson !== 'all') && (
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setSelectedSalesperson('all');
              }}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Sales (Admin Price)</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(
              filteredItems.reduce((sum, item) => sum + parseFloat(item.adminSubtotal), 0).toString()
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Surplus Amount</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {formatCurrency(
              filteredItems.reduce((sum, item) => sum + parseFloat(item.surplusAmount), 0).toString()
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Received</p>
          <p className="text-xl font-bold text-dashboard mt-1">
            {formatCurrency(
              sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0).toString()
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{sales.length}</p>
        </div>
      </div>

      {/* Detailed Items List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            All Items Sold {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : `on ${new Date(selectedDate).toLocaleDateString()}`}
            {selectedSalesperson !== 'all' && ` by ${salespeople.find(sp => sp.id === selectedSalesperson)?.name}`}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admin Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sold Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admin Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Surplus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salesperson
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    No sales found for the selected filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                const hasOverride = item.overriddenPrice && 
                  parseFloat(item.overriddenPrice) > parseFloat(item.adminPrice);
                const soldPrice = item.overriddenPrice || item.adminPrice;
                
                return (
                  <tr
                    key={`${item.saleInvoice}-${index}`}
                    className={`hover:bg-gray-50 ${
                      hasOverride ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.saleInvoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.saleDate).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        {item.product.code && (
                          <div className="text-xs text-gray-500">{item.product.code}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(item.adminPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          hasOverride ? 'text-orange-600' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(soldPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.adminSubtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseFloat(item.surplusAmount) > 0 ? (
                        <span className="font-medium text-green-600">
                          +{formatCurrency(item.surplusAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dashboard">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.salesperson}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && sales.length > 0 && (
          <div className="p-6 text-center text-gray-500">
            No items match the selected filters
          </div>
        )}
        {sales.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No sales recorded for the selected date
          </div>
        )}
      </div>
    </div>
  );
}

