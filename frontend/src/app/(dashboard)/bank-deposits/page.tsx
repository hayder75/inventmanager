'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Filter, X, DollarSign } from 'lucide-react';

interface BankDeposit {
  id: string;
  invoiceNumber: string;
  bankType: string | null;
  amount: string;
  createdAt: string;
  salesperson: { name: string };
  walkinName: string | null;
  company: { name: string } | null;
}

export default function BankDepositsPage() {
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [bankFilter, setBankFilter] = useState<string>('');

  useEffect(() => {
    fetchDeposits();
  }, [dateFilter, bankFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      if (bankFilter) params.bankType = bankFilter;

      const response = await api.get('/api/sales/bank-deposits', { params });
      setDeposits(response.data);
    } catch (error) {
      console.error('Failed to fetch bank deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBankSummary = () => {
    const summary: Record<string, { count: number; total: number }> = {};
    deposits.forEach(deposit => {
      // Only include bank transfers (exclude cash where bankType is null)
      if (!deposit.bankType) return;
      const bank = deposit.bankType;
      if (!summary[bank]) {
        summary[bank] = { count: 0, total: 0 };
      }
      summary[bank].count++;
      summary[bank].total += parseFloat(deposit.amount);
    });
    return summary;
  };

  const bankSummary = getBankSummary();
  const banks = Object.keys(bankSummary).sort();

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      deposit.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.salesperson.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deposit.walkinName && deposit.walkinName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (deposit.company && deposit.company.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBankDisplayName = (bankType: string | null) => {
    if (!bankType) return 'Cash';
    if (bankType.startsWith('OTHER:')) {
      return bankType.replace('OTHER:', '');
    }
    const bankNames: Record<string, string> = {
      'CBE': 'CBE (Commercial Bank of Ethiopia)',
      'ABYSSINYA': 'Abyssinya Bank',
      'AWASH': 'Awash Bank',
      'TELEBIRR': 'Telebirr',
    };
    return bankNames[bankType] || bankType;
  };

  const handleBankClick = (bank: string) => {
    setSelectedBank(bank);
    setShowModal(true);
  };

  const getModalDeposits = () => {
    if (!selectedBank) return [];
    return filteredDeposits.filter(d => {
      return d.bankType === selectedBank;
    });
  };

  const modalDeposits = getModalDeposits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bank Deposits</h1>
        <p className="text-gray-600 mt-1">View bank deposit transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Type</label>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Banks</option>
              <option value="CBE">CBE</option>
              <option value="ABYSSINYA">Abyssinya Bank</option>
              <option value="AWASH">Awash Bank</option>
              <option value="TELEBIRR">Telebirr</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Search by invoice, salesperson, customer..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {banks.map((bank) => (
          <div
            key={bank}
            onClick={() => handleBankClick(bank)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{getBankDisplayName(bank)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(bankSummary[bank].total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {bankSummary[bank].count} transaction{bankSummary[bank].count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {getBankDisplayName(selectedBank || '')} - Transaction Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBank(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Search transactions..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modalDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    modalDeposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{deposit.invoiceNumber}</td>
                        <td className="px-4 py-3">{formatDate(deposit.createdAt)}</td>
                        <td className="px-4 py-3">
                          {deposit.walkinName || deposit.company?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3">{deposit.salesperson.name}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(deposit.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {modalDeposits.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total:</td>
                      <td className="px-4 py-3 font-bold text-lg">
                        {formatCurrency(
                          modalDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

