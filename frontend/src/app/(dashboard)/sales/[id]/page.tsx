'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Printer } from 'lucide-react';

interface SaleItem {
  product: { name: string };
  quantity: number;
  finalPrice: string;
  subtotal: string;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  company: { name: string } | null;
  walkinName: string | null;
  walkinPhone: string | null;
  subtotal: string;
  vatAmount: string;
  totAmount: string;
  totalAmount: string;
  totalPaid: string;
  totalCredit: string;
  items: SaleItem[];
  salesperson: { name: string };
}

export default function SaleDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const isPrintMode = searchParams?.get('print') === 'true';

  useEffect(() => {
    if (params.id) {
      fetchSale(params.id as string);
    }
  }, [params.id]);

  const fetchSale = async (id: string) => {
    try {
      const response = await api.get(`/api/sales/${id}`);
      setSale(response.data);
    } catch (error) {
      console.error('Failed to fetch sale:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sale) {
    return <div>Sale not found</div>;
  }

  const handlePrint = () => {
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${sale.invoiceNumber}</title>
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
              <p>Phone: 0916581943 / 0993939599</p>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-info-left">
                <p><strong>Invoice Number:</strong> ${sale.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</p>
                <p><strong>Salesperson:</strong> ${sale.salesperson.name}</p>
              </div>
              <div class="invoice-info-right">
                <p><strong>Customer:</strong> ${sale.company?.name || sale.walkinName || 'N/A'}</p>
                ${sale.walkinPhone ? `<p><strong>Phone:</strong> ${sale.walkinPhone}</p>` : ''}
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
                ${sale.items.map(item => `
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
              <p><span>Subtotal:</span> <span>${formatCurrency(sale.subtotal || '0')}</span></p>
              ${parseFloat(sale.vatAmount || '0') > 0 ? `<p><span>VAT (7.5%):</span> <span>${formatCurrency(sale.vatAmount)}</span></p>` : ''}
              ${parseFloat(sale.totAmount || '0') > 0 ? `<p><span>TOT (3%):</span> <span>${formatCurrency(sale.totAmount)}</span></p>` : ''}
              <p class="total"><span>Total Amount:</span> <span>${formatCurrency(sale.totalAmount)}</span></p>
              <p><span>Paid:</span> <span>${formatCurrency(sale.totalPaid)}</span></p>
              ${parseFloat(sale.totalCredit) > 0 ? `<p><span>Credit:</span> <span>${formatCurrency(sale.totalCredit)}</span></p>` : ''}
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
  };

  return (
    <div className={`space-y-6 ${isPrintMode ? 'print:block' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
          <p className="text-gray-600 mt-1">Invoice: {sale.invoiceNumber}</p>
        </div>
        {!isPrintMode && (
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Invoice
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">{new Date(sale.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Salesperson</p>
            <p className="font-medium">{sale.salesperson.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium">
              {sale.company?.name || sale.walkinName || 'N/A'}
            </p>
          </div>
          {sale.walkinPhone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{sale.walkinPhone}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4">Items</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{item.product.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{formatCurrency(item.finalPrice)}</td>
                  <td className="px-4 py-2">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(sale.subtotal || '0')}</span>
          </div>
          {parseFloat(sale.vatAmount || '0') > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">VAT (7.5%):</span>
              <span className="font-medium text-yellow-600">{formatCurrency(sale.vatAmount)}</span>
            </div>
          )}
          {parseFloat(sale.totAmount || '0') > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">TOT (3%):</span>
              <span className="font-medium text-yellow-600">{formatCurrency(sale.totAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold">Total Amount:</span>
            <span className="font-bold text-lg">{formatCurrency(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between mb-2 text-green-600">
            <span>Paid:</span>
            <span>{formatCurrency(sale.totalPaid)}</span>
          </div>
          {parseFloat(sale.totalCredit) > 0 && (
            <div className="flex justify-between text-yellow-600">
              <span>Credit:</span>
              <span>{formatCurrency(sale.totalCredit)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

