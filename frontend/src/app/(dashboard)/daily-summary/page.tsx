'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Receipt, 
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface SalespersonSummary {
  salesperson: {
    id: string;
    name: string;
    email: string;
  };
  sales: {
    cashSales: string;
    cashCount: number;
    bankSales: string;
    bankCount: number;
    creditSales: string;
    creditCount: number;
  };
  payments: {
    received: string;
    receivedCount: number;
  };
  expenses: {
    total: string;
    count: number;
    details: Array<{
      id: string;
      type: string;
      description: string;
      amount: string;
      paymentMethod: string;
    }>;
  };
  totals: {
    totalReceived: string;
    totalExpenses: string;
    netAmount: string;
  };
}

interface DailySummaryData {
  date: string;
  salespersons: SalespersonSummary[];
  overall: {
    totalCashSales: string;
    totalBankSales: string;
    totalCreditSales: string;
    totalPaymentsReceived: string;
    totalExpenses: string;
    netAmount: string;
  };
}

export default function DailySummaryPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSalesperson, setExpandedSalesperson] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/daily/summary?date=${selectedDate}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
    }).format(parseFloat(value) || 0);
  };

  const isAdmin = user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Daily Summary</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {isAdmin ? 'Overview of all salespeople daily takings' : 'Your daily sales and expenses summary'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {summary && (
        <>
          {/* Overall Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Cash Sales</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(summary.overall.totalCashSales)}</p>
                </div>
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Bank Sales</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(summary.overall.totalBankSales)}</p>
                </div>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Credit Sales</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(summary.overall.totalCreditSales)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Payments Rec'd</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(summary.overall.totalPaymentsReceived)}</p>
                </div>
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Expenses</p>
                  <p className="text-lg font-bold text-red-600 truncate">{formatCurrency(summary.overall.totalExpenses)}</p>
                </div>
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-dashboard">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Net Amount</p>
                  <p className="text-lg font-bold text-dashboard truncate">{formatCurrency(summary.overall.netAmount)}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-dashboard" />
              </div>
            </div>
          </div>

          {/* Per Salesperson Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Salesperson Details</h2>
            
            {summary.salespersons.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No sales data for this date
              </div>
            ) : (
              summary.salespersons.map((sp) => (
                <div key={sp.salesperson.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Header - clickable to expand */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSalesperson(expandedSalesperson === sp.salesperson.id ? null : sp.salesperson.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{sp.salesperson.name}</h3>
                          <p className="text-sm text-gray-500">{sp.salesperson.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-dashboard">{formatCurrency(sp.totals.netAmount)}</p>
                        <p className="text-xs text-gray-500">Net Amount</p>
                      </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Cash</p>
                        <p className="font-semibold text-green-600">{formatCurrency(sp.sales.cashSales)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Bank</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(sp.sales.bankSales)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Credit</p>
                        <p className="font-semibold text-yellow-600">{formatCurrency(sp.sales.creditSales)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="font-semibold text-red-600">{formatCurrency(sp.expenses.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedSalesperson === sp.salesperson.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sales Breakdown */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Sales Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm text-gray-600">Cash Sales ({sp.sales.cashCount} bills)</span>
                              <span className="font-medium text-green-600">{formatCurrency(sp.sales.cashSales)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm text-gray-600">Bank Sales ({sp.sales.bankCount} bills)</span>
                              <span className="font-medium text-blue-600">{formatCurrency(sp.sales.bankSales)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm text-gray-600">Credit Sales ({sp.sales.creditCount} bills)</span>
                              <span className="font-medium text-yellow-600">{formatCurrency(sp.sales.creditSales)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expenses */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Expenses</h4>
                          {sp.expenses.count === 0 ? (
                            <p className="text-sm text-gray-500">No expenses</p>
                          ) : (
                            <div className="space-y-2">
                              {sp.expenses.details.map((expense) => (
                                <div key={expense.id} className="flex justify-between items-center p-2 bg-white rounded">
                                  <div>
                                    <span className="text-sm text-gray-600">{expense.description}</span>
                                    <span className="text-xs text-gray-400 ml-2">({expense.paymentMethod})</span>
                                  </div>
                                  <span className="font-medium text-red-600">{formatCurrency(expense.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total Calculation */}
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Total Received:</span>
                            <span className="font-medium">{formatCurrency(sp.totals.totalReceived)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Less Expenses:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(sp.totals.totalExpenses)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-1">
                            <span>Net Amount to Turn In:</span>
                            <span className="text-dashboard">{formatCurrency(sp.totals.netAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
