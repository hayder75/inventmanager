'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, Download, FileText } from 'lucide-react';

interface ExpenseReport {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalExpenses: string;
    totalCount: number;
    byType: Array<{
      type: string;
      count: number;
      total: string;
    }>;
  };
  expenses: Array<{
    id: string;
    expenseType: string;
    expenseDate: string;
    description: string;
    amount: string;
    paymentMethod: string;
    bankType: string | null;
    bankTransferImageUrl: string | null;
    customPaymentNote: string | null;
    creator: { name: string };
  }>;
}

export default function ExpenseReportsPage() {
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (selectedDate) {
      fetchReport();
    }
  }, [reportType, selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/expenses/reports', {
        params: {
          reportType,
          date: selectedDate,
        },
      });
      setReport(response.data);
    } catch (error) {
      console.error('Failed to fetch expense report:', error);
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

  const exportToCSV = () => {
    if (!report) return;

    // Format numbers for easy reading
    const formatNumber = (value: string) => {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const csv = [
      ['Real Bright Trading PLC - Expense Report'],
      [`Report Period: ${report.period.startDate} to ${report.period.endDate}`],
      [`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`],
      [],
      ['SUMMARY'],
      ['Item', 'Value'],
      ['Total Expenses (USD)', formatNumber(report.summary.totalExpenses)],
      ['Total Number of Expenses', report.summary.totalCount],
      [],
      ['EXPENSES BY TYPE'],
      ['Expense Type', 'Count', 'Total Amount (USD)'],
      ...report.summary.byType.map((item) => [
        item.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        item.count.toString(),
        formatNumber(item.total)
      ]),
      [],
      ['DETAILED EXPENSES'],
      ['Date', 'Type', 'Description', 'Amount (USD)', 'Payment Method', 'Salesperson'],
      ...report.expenses.map((exp) => [
        exp.expenseDate,
        exp.expenseType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes in description
        formatNumber(exp.amount),
        exp.paymentMethod.replace('_', ' '),
        exp.creator.name
      ]),
    ]
      .map((row) => Array.isArray(row) ? row.join(',') : row)
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${reportType}-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Reports</h1>
          <p className="text-gray-600 mt-1">View detailed expense reports</p>
        </div>
        {report && (
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(report.summary.totalExpenses)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Count</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {report.summary.totalCount}
                  </p>
                </div>
                <div className="p-3 bg-dashboard-light/20 rounded-lg">
                  <FileText className="h-6 w-6 text-dashboard" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {report.period.startDate} to {report.period.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses by Type */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Expenses by Type</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.summary.byType.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Expenses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Detailed Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Salesperson
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.expenseType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded text-xs ${expense.paymentMethod === 'CASH'
                              ? 'bg-green-100 text-green-800'
                              : expense.paymentMethod === 'BANK_TRANSFER'
                                ? 'bg-blue-100 text-blue-800'
                                : expense.paymentMethod === 'SALES'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {expense.paymentMethod === 'CASH' ? 'Cash'
                            : expense.paymentMethod === 'BANK_TRANSFER'
                              ? `Bank${expense.bankType ? ` - ${expense.bankType.startsWith('OTHER:') ? expense.bankType.replace('OTHER:', '') : expense.bankType}` : ''}`
                              : expense.paymentMethod === 'OTHER'
                                ? `Other${expense.customPaymentNote ? `: ${expense.customPaymentNote}` : ''}`
                                : expense.paymentMethod === 'SALES'
                                  ? `Sales${expense.customPaymentNote ? `: ${expense.customPaymentNote}` : ''}`
                                  : expense.paymentMethod}
                        </span>
                        {expense.bankTransferImageUrl && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${expense.bankTransferImageUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                          >
                            Receipt
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.creator.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.expenses.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No expenses found for this period
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

