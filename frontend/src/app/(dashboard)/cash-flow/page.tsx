'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CashFlow {
  date: string;
  openingBalance: string;
  cashSales: string;
  bankDeposits: string;
  surplus: string;
  expenses: string;
  closingBalance: string;
  totalAmount?: string; // Opening + Daily Sales + Surplus
  breakdown: {
    cashIn: {
      cashSales: string;
      bankDeposits: string;
      surplus: string;
      total: string;
    };
    cashOut: {
      expenses: string;
    };
  };
}

interface Expense {
  id: string;
  expenseType: string;
  expenseDate: string;
  description: string;
  amount: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  createdAt: string;
  creator: { name: string };
}

export default function CashFlowPage() {
  const { user } = useAuth();
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<{ amount: string; notes: string } | null>(null);
  const [openingBalanceInput, setOpeningBalanceInput] = useState({ amount: '', notes: '' });
  const [expenseForm, setExpenseForm] = useState({
    expenseType: 'OTHER' as 'RENT' | 'UTILITIES' | 'SALARIES' | 'COMMISSION' | 'SUPPLIES' | 'MARKETING' | 'TRANSPORTATION' | 'MAINTENANCE' | 'INSURANCE' | 'TAXES' | 'OTHER',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    paymentMethod: 'CASH' as 'CASH' | 'BANK_TRANSFER',
  });

  useEffect(() => {
    fetchCashFlow();
    fetchTodayExpenses();
    fetchOpeningBalance();
  }, [selectedDate]);

  const fetchOpeningBalance = async () => {
    try {
      const response = await api.get('/api/cash-flow/opening-balance', {
        params: { date: selectedDate },
      });
      if (response.data) {
        setOpeningBalance({
          amount: response.data.amount,
          notes: response.data.notes || '',
        });
        setOpeningBalanceInput({
          amount: response.data.amount,
          notes: response.data.notes || '',
        });
      } else {
        setOpeningBalance(null);
        setOpeningBalanceInput({ amount: '', notes: '' });
      }
    } catch (error) {
      console.error('Failed to fetch opening balance:', error);
    }
  };

  const handleSetOpeningBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/cash-flow/opening-balance', {
        date: selectedDate,
        amount: parseFloat(openingBalanceInput.amount),
        notes: openingBalanceInput.notes,
      });
      setShowOpeningBalanceModal(false);
      fetchCashFlow();
      fetchOpeningBalance();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to set opening balance');
    }
  };

  const fetchCashFlow = async () => {
    try {
      const response = await api.get('/api/cash-flow', {
        params: { date: selectedDate },
      });
      setCashFlow(response.data);
    } catch (error) {
      console.error('Failed to fetch cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayExpenses = async () => {
    try {
      const today = new Date(selectedDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await api.get('/api/expenses', {
        params: {
          startDate: today.toISOString().split('T')[0],
          endDate: tomorrow.toISOString().split('T')[0],
        },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/expenses', expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({ 
        expenseType: 'OTHER', 
        expenseDate: new Date().toISOString().split('T')[0],
        description: '', 
        amount: '', 
        paymentMethod: 'CASH' 
      });
      fetchCashFlow();
      fetchTodayExpenses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add expense');
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Cash Flow Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Track daily cash flow and expenses</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 md:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
            />
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {cashFlow && (
        <>
          {/* Summary Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.role === 'ADMIN' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-3 md:gap-4`}>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Opening Balance</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(cashFlow.openingBalance)}
                  </p>
                  {openingBalance && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {openingBalance.notes && `Note: ${openingBalance.notes}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setShowOpeningBalanceModal(true)}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 min-h-[44px]"
                    >
                      {openingBalance ? 'Edit' : 'Set'}
                    </button>
                  )}
                  <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Cash Sales</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600 mt-1 truncate">
                    {formatCurrency(cashFlow.cashSales)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-green-100 rounded-lg ml-2 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Bank Deposits</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600 mt-1 truncate">
                    {formatCurrency(cashFlow.bankDeposits)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg ml-2 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-600">Surplus Revenue</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600 mt-1 truncate">
                      {formatCurrency(cashFlow.surplus || '0')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">From price overrides</p>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-100 rounded-lg ml-2 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Expenses</p>
                  <p className="text-lg md:text-2xl font-bold text-red-600 mt-1 truncate">
                    {formatCurrency(cashFlow.expenses)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-red-100 rounded-lg ml-2 flex-shrink-0">
                  <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Total Cash Available</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600 mt-1 truncate">
                    {formatCurrency(cashFlow.totalAmount || (parseFloat(cashFlow.openingBalance) + parseFloat(cashFlow.cashSales) + parseFloat(cashFlow.bankDeposits) - parseFloat(cashFlow.expenses)).toString())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    Opening: {formatCurrency(cashFlow.openingBalance)} + Cash Sales: {formatCurrency(cashFlow.cashSales)} + Bank: {formatCurrency(cashFlow.bankDeposits)} - Expenses: {formatCurrency(cashFlow.expenses)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg ml-2 flex-shrink-0">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold mb-4">Cash Flow Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cash In</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Sales:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(cashFlow.breakdown.cashIn.cashSales)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Deposits:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(cashFlow.breakdown.cashIn.bankDeposits)}
                    </span>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surplus Revenue:</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(cashFlow.breakdown.cashIn.surplus || '0')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">Total Cash In:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(cashFlow.breakdown.cashIn.total)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cash Out</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expenses:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(cashFlow.breakdown.cashOut.expenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold">Today's Expenses</h2>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
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
                      Added By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.expenseType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            expense.paymentMethod === 'CASH'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {expense.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.creator.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {expenses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No expenses recorded for this date
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {expense.expenseType.replace('_', ' ')}
                        </span>
                        <span className="text-base font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                        <span
                          className={`px-2 py-1 rounded ${
                            expense.paymentMethod === 'CASH'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {expense.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Added by: {expense.creator.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type *
                </label>
                <select
                  value={expenseForm.expenseType}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="RENT">Rent</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="SALARIES">Salaries</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="SUPPLIES">Supplies</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="TAXES">Taxes</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount || ''}
                  placeholder="Enter amount"
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

