'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Eye, Search, Printer } from 'lucide-react';
import Link from 'next/link';

interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  company: { name: string } | null;
  walkinName: string | null;
  totalAmount: string;
  totalPaid: string;
  totalCredit: string;
  salesperson: { name: string };
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('/api/sales');
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
    return new Date(dateString).toLocaleDateString();
  };

  const handlePrint = async (saleId: string) => {
    try {
      // Fetch sale data first
      const response = await api.get(`/api/sales/${saleId}`);
      const saleData = response.data;
      
      // Create print window with invoice content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const formatCurrency = (value: string) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(parseFloat(value));
        };
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${saleData.invoiceNumber}</title>
              <style>
                @media print {
                  @page { margin: 0.5cm; }
                  body { margin: 0; }
                }
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  max-width: 800px; 
                  margin: 0 auto;
                }
                .company-header {
                  text-align: center;
                  border-bottom: 2px solid #333;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
                }
                .company-header h1 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: bold;
                  color: #333;
                }
                .company-header p {
                  margin: 5px 0;
                  font-size: 14px;
                  color: #666;
                }
                .invoice-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                  padding: 15px;
                  background-color: #f9f9f9;
                }
                .invoice-info-left, .invoice-info-right {
                  flex: 1;
                }
                .invoice-info-left {
                  padding-right: 20px;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0; 
                }
                th, td { 
                  border: 1px solid #ddd; 
                  padding: 10px; 
                  text-align: left; 
                }
                th { 
                  background-color: #f2f2f2; 
                  font-weight: bold;
                }
                .totals {
                  margin-top: 20px;
                  padding: 15px;
                  background-color: #f9f9f9;
                }
                .totals p {
                  margin: 5px 0;
                  display: flex;
                  justify-content: space-between;
                }
                .total { 
                  font-weight: bold; 
                  font-size: 18px; 
                  border-top: 2px solid #333;
                  padding-top: 10px;
                  margin-top: 10px;
                }
                .footer {
                  margin-top: 60px;
                  display: flex;
                  justify-content: space-between;
                  padding-top: 40px;
                  border-top: 1px solid #ddd;
                }
                .signature-box, .stamp-box {
                  width: 200px;
                  text-align: center;
                }
                .signature-box {
                  border-bottom: 1px solid #333;
                  padding-bottom: 50px;
                }
                .stamp-box {
                  border: 2px dashed #999;
                  padding: 20px;
                  min-height: 80px;
                }
                .signature-label, .stamp-label {
                  font-weight: bold;
                  margin-top: 10px;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="company-header">
                <h1>Real Bright Trading PLC</h1>
                <p>Hawasa</p>
                <p>Phone: 0912345678</p>
              </div>
              
              <div class="invoice-info">
                <div class="invoice-info-left">
                  <p><strong>Invoice Number:</strong> ${saleData.invoiceNumber}</p>
                  <p><strong>Date:</strong> ${new Date(saleData.createdAt).toLocaleDateString()}</p>
                  <p><strong>Salesperson:</strong> ${saleData.salesperson.name}</p>
                </div>
                <div class="invoice-info-right">
                  <p><strong>Customer:</strong> ${saleData.company?.name || saleData.walkinName || 'N/A'}</p>
                  ${saleData.walkinPhone ? `<p><strong>Phone:</strong> ${saleData.walkinPhone}</p>` : ''}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${saleData.items.map((item: any) => `
                    <tr>
                      <td>${item.product.name}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.finalPrice)}</td>
                      <td>${formatCurrency(item.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals">
                <p><span>Subtotal:</span> <span>${formatCurrency(saleData.subtotal || '0')}</span></p>
                ${parseFloat(saleData.vatAmount || '0') > 0 ? `<p><span>VAT (7.5%):</span> <span>${formatCurrency(saleData.vatAmount)}</span></p>` : ''}
                ${parseFloat(saleData.totAmount || '0') > 0 ? `<p><span>TOT (3%):</span> <span>${formatCurrency(saleData.totAmount)}</span></p>` : ''}
                <p class="total"><span>Total Amount:</span> <span>${formatCurrency(saleData.totalAmount)}</span></p>
                <p><span>Paid:</span> <span>${formatCurrency(saleData.totalPaid)}</span></p>
                ${parseFloat(saleData.totalCredit) > 0 ? `<p><span>Credit:</span> <span>${formatCurrency(saleData.totalCredit)}</span></p>` : ''}
              </div>
              
              <div class="footer">
                <div class="signature-box">
                  <div class="signature-label">Signature</div>
                </div>
                <div class="stamp-box">
                  <div class="stamp-label">Stamp</div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Failed to print invoice:', error);
      alert('Failed to print invoice');
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.walkinName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">View all sales transactions</p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Sale
        </Link>
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
              placeholder="Search by invoice, company, or walk-in name..."
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salesperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.company?.name || sale.walkinName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.salesperson.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(sale.totalPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {formatCurrency(sale.totalCredit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handlePrint(sale.id)}
                        className="text-gray-600 hover:text-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Print Invoice"
                      >
                        <Printer className="h-5 w-5" />
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
          {filteredSales.map((sale) => (
            <div key={sale.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{sale.invoiceNumber}</h3>
                  <p className="text-xs text-gray-500">{formatDate(sale.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/sales/${sale.id}`}
                    className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handlePrint(sale.id)}
                    className="text-gray-600 hover:text-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Print Invoice"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium truncate">{sale.company?.name || sale.walkinName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Salesperson</p>
                  <p className="font-medium truncate">{sale.salesperson.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold">{formatCurrency(sale.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-medium text-green-600">{formatCurrency(sale.totalPaid)}</p>
                </div>
                {parseFloat(sale.totalCredit) > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Credit</p>
                    <p className="font-medium text-yellow-600">{formatCurrency(sale.totalCredit)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

