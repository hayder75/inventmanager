'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, DollarSign, FileText, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Expense {
  id: string;
  expenseType: string;
  expenseDate: string;
  description: string;
  amount: string;
  paymentMethod: string;
  bankType: string | null;
  bankTransferImageUrl: string | null;
  customPaymentNote: string | null;
  createdAt: string;
  creator?: { id: string; name: string };
}

export default function ExpenseTrackerPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    paymentMethod: 'CASH' as string,
    bankType: '' as string,
    bankTransferImageUrl: '' as string,
    customPaymentNote: '' as string,
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/expenses');
      // Filter to show only current user's expenses for sales (excluding commissions)
      if (user?.role === 'SALES') {
        setExpenses(response.data.filter((exp: any) =>
          exp.creator?.id === user.id && exp.expenseType !== 'COMMISSION'
        ));
      } else {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExpenseForm({
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      paymentMethod: 'CASH',
      bankType: '',
      bankTransferImageUrl: '',
      customPaymentNote: '',
    });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/expenses', {
        expenseType: 'OTHER', // Miscellaneous expenses
        expenseDate: expenseForm.expenseDate,
        description: expenseForm.description,
        amount: expenseForm.amount,
        paymentMethod: expenseForm.paymentMethod,
        bankType: expenseForm.paymentMethod === 'BANK_TRANSFER' ? expenseForm.bankType : null,
        bankTransferImageUrl: expenseForm.paymentMethod === 'BANK_TRANSFER' ? expenseForm.bankTransferImageUrl : null,
        customPaymentNote: ['OTHER', 'SALES'].includes(expenseForm.paymentMethod) ? expenseForm.customPaymentNote : null,
      });
      setShowAddModal(false);
      resetForm();
      fetchExpenses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const getPaymentMethodLabel = (method: string, bankType?: string | null, customNote?: string | null) => {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'BANK_TRANSFER':
        if (bankType) {
          if (bankType.startsWith('OTHER:')) {
            return `Bank - ${bankType.replace('OTHER:', '')}`;
          }
          return `Bank - ${bankType}`;
        }
        return 'Bank Transfer';
      case 'OTHER':
        return customNote ? `Other: ${customNote}` : 'Other';
      case 'SALES':
        return customNote ? `Sales: ${customNote}` : 'Sales';
      default:
        return method;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'BANK_TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      case 'SALES':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Record and track miscellaneous expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-600">Total Expenses</p>
            <p className="text-lg md:text-2xl font-bold text-red-600 mt-1 truncate">
              {formatCurrency(totalExpenses.toString())}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <div className="p-2 md:p-3 bg-red-100 rounded-lg ml-2 flex-shrink-0">
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Expense History</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search by description, amount, or payment method..."
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses
                .filter((expense) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    expense.description.toLowerCase().includes(query) ||
                    expense.amount.toLowerCase().includes(query) ||
                    expense.paymentMethod.toLowerCase().includes(query) ||
                    expense.expenseType.toLowerCase().includes(query) ||
                    (expense.bankType || '').toLowerCase().includes(query) ||
                    (expense.customPaymentNote || '').toLowerCase().includes(query) ||
                    (expense.creator?.name || '').toLowerCase().includes(query)
                  );
                })
                .length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'No expenses found matching your search' : 'No expenses recorded yet'}
                  </td>
                </tr>
              ) : (
                expenses
                  .filter((expense) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      expense.description.toLowerCase().includes(query) ||
                      expense.amount.toLowerCase().includes(query) ||
                      expense.paymentMethod.toLowerCase().includes(query) ||
                      expense.expenseType.toLowerCase().includes(query) ||
                      (expense.bankType || '').toLowerCase().includes(query) ||
                      (expense.customPaymentNote || '').toLowerCase().includes(query) ||
                      (expense.creator?.name || '').toLowerCase().includes(query)
                    );
                  })
                  .map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getPaymentMethodBadge(expense.paymentMethod)}`}>
                          {getPaymentMethodLabel(expense.paymentMethod, expense.bankType, expense.customPaymentNote)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.paymentMethod === 'BANK_TRANSFER' && expense.bankTransferImageUrl && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${expense.bankTransferImageUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-xs"
                          >
                            View Receipt
                          </a>
                        )}
                        {expense.customPaymentNote && !['OTHER', 'SALES'].includes(expense.paymentMethod) && (
                          <span className="text-xs text-gray-500">{expense.customPaymentNote}</span>
                        )}
                        {!expense.bankTransferImageUrl && !expense.customPaymentNote && '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {expense.creator?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-3">
          {expenses
            .filter((expense) => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              return (
                expense.description.toLowerCase().includes(query) ||
                expense.amount.toLowerCase().includes(query) ||
                expense.paymentMethod.toLowerCase().includes(query)
              );
            })
            .map((expense) => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getPaymentMethodBadge(expense.paymentMethod)}`}>
                    {getPaymentMethodLabel(expense.paymentMethod, expense.bankType, expense.customPaymentNote)}
                  </span>
                  {expense.creator && (
                    <span className="text-xs text-gray-500">by {expense.creator.name}</span>
                  )}
                </div>
                {expense.paymentMethod === 'BANK_TRANSFER' && expense.bankTransferImageUrl && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${expense.bankTransferImageUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            ))}
          {expenses.filter((expense) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return expense.description.toLowerCase().includes(query) || expense.amount.toLowerCase().includes(query);
          }).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                {searchQuery ? 'No expenses found matching your search' : 'No expenses recorded yet'}
              </p>
            )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Miscellaneous Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Notes *
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="e.g., Paid person after admin called to take care of something"
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
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({
                    ...expenseForm,
                    paymentMethod: e.target.value,
                    bankType: '',
                    bankTransferImageUrl: '',
                    customPaymentNote: '',
                  })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank</option>
                  <option value="OTHER">Other</option>
                  <option value="SALES">Sales</option>
                </select>
              </div>

              {/* Bank Transfer Fields */}
              {expenseForm.paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Bank *
                    </label>
                    <select
                      value={expenseForm.bankType.startsWith('OTHER:') ? 'OTHER' : expenseForm.bankType}
                      onChange={(e) => {
                        if (e.target.value === 'OTHER') {
                          setExpenseForm({ ...expenseForm, bankType: 'OTHER:' });
                        } else {
                          setExpenseForm({ ...expenseForm, bankType: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                      required
                    >
                      <option value="">Select Bank</option>
                      <option value="CBE">CBE (Commercial Bank of Ethiopia)</option>
                      <option value="ABYSSINYA">Abyssinya Bank</option>
                      <option value="AWASH">Awash Bank</option>
                      <option value="TELEBIRR">Telebirr</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  {expenseForm.bankType.startsWith('OTHER:') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={expenseForm.bankType.replace('OTHER:', '')}
                        onChange={(e) => setExpenseForm({ ...expenseForm, bankType: `OTHER:${e.target.value}` })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                        placeholder="Enter bank name"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Receipt Image
                    </label>
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
                          setExpenseForm(prev => ({ ...prev, bankTransferImageUrl: response.data.imageUrl }));
                        } catch (error: any) {
                          alert(error.response?.data?.error || 'Failed to upload image');
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={uploadingImage}
                    />
                    {expenseForm.bankTransferImageUrl && (
                      <div className="mt-2">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${expenseForm.bankTransferImageUrl}`}
                          alt="Bank transfer receipt"
                          className="max-w-xs max-h-32 object-contain border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setExpenseForm(prev => ({ ...prev, bankTransferImageUrl: '' }))}
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

              {/* Other Payment Note */}
              {expenseForm.paymentMethod === 'OTHER' && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={expenseForm.customPaymentNote}
                    onChange={(e) => setExpenseForm({ ...expenseForm, customPaymentNote: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                    placeholder="Type something about this payment method..."
                  />
                </div>
              )}

              {/* Sales Payment Note */}
              {expenseForm.paymentMethod === 'SALES' && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={expenseForm.customPaymentNote}
                    onChange={(e) => setExpenseForm({ ...expenseForm, customPaymentNote: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                    placeholder="Type something about this sales expense..."
                  />
                </div>
              )}

              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px] w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 min-h-[44px] w-full md:w-auto"
                >
                  {submitting ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
