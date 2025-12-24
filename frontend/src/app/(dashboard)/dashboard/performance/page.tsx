'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { RotateCcw } from 'lucide-react';

interface Performance {
  salespersonId: string;
  salespersonName: string;
  bills: number;
  cash: string;
  bank: string;
  creditGiven: string;
  totalSold: string;
  extraFromOverride: string;
  profitContributed: string;
  commission: string;
}

export default function SalesPerformancePage() {
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchPerformance();
  }, [filter, selectedDate]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (filter === 'daily') {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'weekly') {
        const day = selectedDate.getDay();
        const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(selectedDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'monthly') {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'yearly') {
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
      }

      const params: any = {};
      if (startDate && endDate) {
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const response = await api.get('/api/dashboard/sales-performance', { params });
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
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

  const handleResetCommission = async (salespersonId: string, salespersonName: string) => {
    if (!confirm(`Reset commission for ${salespersonName}? This will set their commission to $0.00.`)) {
      return;
    }

    try {
      await api.post(`/api/users/${salespersonId}/reset-commission`);
      alert('Commission reset successfully');
      fetchPerformance();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reset commission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getFilterLabel = () => {
    if (filter === 'all') return 'All Time';
    if (filter === 'daily') return selectedDate.toLocaleDateString();
    if (filter === 'weekly') {
      const day = selectedDate.getDay();
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(selectedDate.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    }
    if (filter === 'monthly') {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (filter === 'yearly') {
      return selectedDate.getFullYear().toString();
    }
    return '';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sales Performance</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">{getFilterLabel()}</p>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px] ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {filter !== 'all' && (
            <div className="w-full md:w-auto">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full md:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cash</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Given</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extra from Override</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit Contributed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {performance.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                  No sales performance data available. Create some sales to see performance metrics.
                </td>
              </tr>
            ) : (
              performance.map((perf) => (
                <tr key={perf.salespersonId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{perf.salespersonName}</td>
                  <td className="px-6 py-4">{perf.bills}</td>
                  <td className="px-6 py-4">{formatCurrency(perf.cash)}</td>
                  <td className="px-6 py-4">{formatCurrency(perf.bank)}</td>
                  <td className="px-6 py-4 text-yellow-600">{formatCurrency(perf.creditGiven)}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(perf.totalSold)}</td>
                  <td className="px-6 py-4 text-green-600">{formatCurrency(perf.extraFromOverride)}</td>
                  <td className="px-6 py-4 font-semibold text-primary-600">{formatCurrency(perf.profitContributed)}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(perf.commission)}</td>
                  <td className="px-6 py-4">
                    {parseFloat(perf.commission) > 0 && (
                      <button
                        onClick={() => handleResetCommission(perf.salespersonId, perf.salespersonName)}
                        className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]"
                        title="Reset Commission"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {performance.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No sales performance data available. Create some sales to see performance metrics.
          </div>
        ) : (
          performance.map((perf) => (
            <div key={perf.salespersonId} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">{perf.salespersonName}</h3>
                {parseFloat(perf.commission) > 0 && (
                  <button
                    onClick={() => handleResetCommission(perf.salespersonId, perf.salespersonName)}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Bills</p>
                  <p className="text-base font-semibold">{perf.bills}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Sold</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(perf.totalSold)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cash</p>
                  <p className="text-base font-medium">{formatCurrency(perf.cash)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank</p>
                  <p className="text-base font-medium">{formatCurrency(perf.bank)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Credit Given</p>
                  <p className="text-base font-medium text-yellow-600">{formatCurrency(perf.creditGiven)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="text-base font-semibold text-green-600">{formatCurrency(perf.commission)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Extra from Override</p>
                  <p className="text-base font-medium text-green-600">{formatCurrency(perf.extraFromOverride)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profit Contributed</p>
                  <p className="text-base font-semibold text-primary-600">{formatCurrency(perf.profitContributed)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

