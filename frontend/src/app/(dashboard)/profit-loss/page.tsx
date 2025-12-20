'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProfitLoss {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    totalSales: string;
    totalSalesWithTax: string;
    surplus: string;
    totalRevenueWithSurplus: string;
  };
  costOfGoodsSold: {
    totalPurchases: string;
  };
  grossProfit: string;
  expenses: {
    total: string;
    breakdown: Array<{
      type: string;
      amount: string;
    }>;
  };
  liabilities: {
    vatCollected: string;
    totCollected: string;
    totalLiabilities: string;
  };
  netProfit: string;
  summary: {
    totalSales: string;
    totalSalesWithTax: string;
    totalPurchases: string;
    grossProfit: string;
    totalExpenses: string;
    vatCollected: string;
    totCollected: string;
    netProfit: string;
  };
}

interface DailySale {
  date: string;
  amount: string;
}

interface DailySaleDetail {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  totalAmount: string;
  totalPaid: string;
  salesperson: { name: string };
  company: { name: string } | null;
  walkinName: string | null;
}

export default function ProfitLossPage() {
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailySalesDetails, setDailySalesDetails] = useState<DailySaleDetail[]>([]);
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchProfitLoss();
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchDailySales();
  }, [currentDate, selectedYear]);

  const fetchDailySales = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await api.get('/api/cash-flow/daily-sales', {
        params: {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
        },
      });
      setDailySales(response.data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    }
  };

  const getDailySaleAmount = (day: number): string | null => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const sale = dailySales.find(s => s.date === dateStr);
    return sale ? sale.amount : null;
  };

  const fetchProfitLoss = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (viewMode === 'daily') {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewMode === 'weekly') {
        const day = selectedDate.getDay();
        const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(selectedDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewMode === 'monthly') {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
      }

      const response = await api.get('/api/profit-loss', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      setProfitLoss(response.data);
    } catch (error) {
      console.error('Failed to fetch profit & loss:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const exportToCSV = () => {
    if (!profitLoss) return;

    // Format numbers for easy reading (remove currency symbols, keep numbers)
    const formatNumber = (value: string) => {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const csv = [
      ['Real Bright Trading PLC - Profit & Loss Report'],
      [`Report Period: ${profitLoss.period.startDate} to ${profitLoss.period.endDate}`],
      [`Report Type: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`],
      [],
      ['REVENUE'],
      ['Item', 'Amount (USD)'],
      ['Total Sales', formatNumber(profitLoss.revenue.totalSales)],
      ...(parseFloat(profitLoss.revenue.surplus) > 0 ? [
        ['Surplus Revenue (from price overrides)', formatNumber(profitLoss.revenue.surplus)],
        ['Total Revenue', formatNumber(profitLoss.revenue.totalRevenueWithSurplus || profitLoss.revenue.totalSales)],
      ] : []),
      [],
      ['COST OF GOODS SOLD'],
      ['Item', 'Amount (USD)'],
      ['Total Purchases', formatNumber(profitLoss.costOfGoodsSold.totalPurchases)],
      [],
      ['GROSS PROFIT'],
      ['Item', 'Amount (USD)'],
      ['Gross Profit', formatNumber(profitLoss.grossProfit)],
      [],
      ['EXPENSES'],
      ['Expense Type', 'Amount (USD)'],
      ...profitLoss.expenses.breakdown.map((e) => [
        e.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        formatNumber(e.amount)
      ]),
      ['Total Expenses', formatNumber(profitLoss.expenses.total)],
      [],
      ['NET PROFIT'],
      ['Item', 'Amount (USD)'],
      ['Net Profit', formatNumber(profitLoss.netProfit)],
    ]
      .map((row) => Array.isArray(row) ? row.join(',') : row)
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${viewMode}-${selectedDate?.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setSelectedYear(prev => {
      const newYear = direction === 'prev' ? prev - 1 : prev + 1;
      setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
      return newYear;
    });
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setSelectedDayForModal(clickedDate);
    
    // Fetch daily sales details for the clicked date
    try {
      const startOfDay = new Date(clickedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(clickedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await api.get('/api/sales', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
      });
      setDailySalesDetails(response.data);
      setShowDailyModal(true);
    } catch (error) {
      console.error('Failed to fetch daily sales details:', error);
    }

    if (viewMode === 'daily') {
      fetchProfitLoss();
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isDateInRange = (day: number) => {
    if (!profitLoss || !selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const start = new Date(profitLoss.period.startDate);
    const end = new Date(profitLoss.period.endDate);
    return date >= start && date <= end;
  };

  if (loading && !profitLoss) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Report</h1>
          <p className="text-gray-600 mt-1">Financial performance overview</p>
        </div>
        {profitLoss && (
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">View Mode:</label>
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  setSelectedDate(new Date());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View - Full Width */}
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateYear('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => navigateYear('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold min-w-[150px] text-center">{monthName}</h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-16" />
          ))}
          {days.map((day) => {
            const isSelected = isDateSelected(day);
            const inRange = isDateInRange(day);
            const dailyAmount = getDailySaleAmount(day);
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`h-16 p-1 rounded text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : inRange
                    ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xs">{day}</span>
                {dailyAmount && (
                  <span className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-white' : 'text-green-600 font-semibold'
                  }`}>
                    ${parseFloat(dailyAmount).toFixed(0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {profitLoss && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(profitLoss.revenue.totalSales)}
                  </p>
                  {parseFloat(profitLoss.revenue.totalSalesWithTax) !== parseFloat(profitLoss.revenue.totalSales) && (
                    <p className="text-xs text-gray-500 mt-1">
                      With Tax: {formatCurrency(profitLoss.revenue.totalSalesWithTax)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(profitLoss.costOfGoodsSold.totalPurchases)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(profitLoss.grossProfit)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(profitLoss.expenses.total)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      parseFloat(profitLoss.netProfit) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(profitLoss.netProfit)}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    parseFloat(profitLoss.netProfit) >= 0
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  {parseFloat(profitLoss.netProfit) >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
              <p className="text-sm text-gray-600 mt-1">
                Period: {profitLoss.period.startDate} to {profitLoss.period.endDate}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Revenue Section */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Revenue</h3>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-medium">{formatCurrency(profitLoss.revenue.totalSales)}</span>
                  </div>
                  {parseFloat(profitLoss.revenue.surplus) > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Surplus Revenue (from price overrides)</span>
                      <span className="font-medium text-purple-600">{formatCurrency(profitLoss.revenue.surplus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-900">Total Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(profitLoss.revenue.totalRevenueWithSurplus || profitLoss.revenue.totalSales)}
                    </span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  Cost of Goods Sold (COGS)
                </h3>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Purchases</span>
                    <span className="font-medium">
                      {formatCurrency(profitLoss.costOfGoodsSold.totalPurchases)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between py-3 border-t-2 border-b-2 border-gray-300">
                <span className="font-semibold text-gray-900">Gross Profit</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(profitLoss.grossProfit)}
                </span>
              </div>

              {/* Expenses Section */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Expenses</h3>
                <div className="pl-4 space-y-2">
                  {profitLoss.expenses.breakdown.map((expense, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-600">{expense.type.replace('_', ' ')}</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-900">Total Expenses</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(profitLoss.expenses.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Liabilities Section */}
              {(parseFloat(profitLoss.liabilities.vatCollected) > 0 || parseFloat(profitLoss.liabilities.totCollected) > 0) && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Tax Liabilities</h3>
                  <div className="pl-4 space-y-2">
                    {parseFloat(profitLoss.liabilities.vatCollected) > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">VAT Collected (7.5%)</span>
                        <span className="font-medium text-yellow-600">
                          {formatCurrency(profitLoss.liabilities.vatCollected)}
                        </span>
                      </div>
                    )}
                    {parseFloat(profitLoss.liabilities.totCollected) > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">TOT Collected (3%)</span>
                        <span className="font-medium text-yellow-600">
                          {formatCurrency(profitLoss.liabilities.totCollected)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold text-gray-900">Total Tax Liabilities</span>
                      <span className="font-bold text-yellow-600">
                        {formatCurrency(profitLoss.liabilities.totalLiabilities)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Tax liabilities must be remitted to the government and are not included in net profit calculation.
                    </p>
                  </div>
                </div>
              )}

              {/* Net Profit */}
              <div className="flex justify-between py-4 border-t-2 border-gray-300 bg-gray-50 rounded-lg px-4">
                <span className="text-lg font-bold text-gray-900">Net Profit</span>
                <span
                  className={`text-2xl font-bold ${
                    parseFloat(profitLoss.netProfit) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(profitLoss.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Daily Sales Details Modal */}
      {showDailyModal && selectedDayForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sales Details - {selectedDayForModal.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Total Sales: {formatCurrency(
                      dailySalesDetails.reduce((sum, sale) => sum + parseFloat(sale.totalPaid), 0).toString()
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowDailyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {dailySalesDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sales recorded on this day
                </div>
              ) : (
                <div className="space-y-4">
                  {dailySalesDetails.map((sale) => (
                    <div key={sale.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">Invoice: {sale.invoiceNumber}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Customer: {sale.company?.name || sale.walkinName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Salesperson: {sale.salesperson.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Time: {new Date(sale.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(sale.totalPaid)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: {formatCurrency(sale.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
