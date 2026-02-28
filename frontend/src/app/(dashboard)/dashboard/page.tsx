'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  TrendingDown,
  Users,
  ShoppingCart,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  BadgeDollarSign,
  Zap,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface SaleItem {
  productName: string;
  quantity: number;
  saleUnit: string;
  adminPrice: string;
  finalPrice: string;
  overriddenPrice: string | null;
  subtotal: string;
  surplusAmount: string;
}

interface DashboardStats {
  today: {
    totalSales: string;
    cashCollected: string;
    bankCollected: string;
    creditSales: string;
    profit: string;
    expenses: string;
    netAmount: string;
    bills: number;
  };
  overview: {
    totalProducts: number;
    totalContacts: number;
    pendingCredit: string;
  };
  lowStockAlerts: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stockQty: number;
    lowStockAlert: number;
  }>;
  recentSales: Array<{
    id: string;
    totalAmount: string;
    totalPaid: string;
    bankType: string | null;
    createdAt: string;
    salespersonName: string;
    items: SaleItem[];
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminDetails, setShowAdminDetails] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        today: { totalSales: '0', cashCollected: '0', bankCollected: '0', creditSales: '0', profit: '0', expenses: '0', netAmount: '0', bills: 0 },
        overview: { totalProducts: 0, totalContacts: 0, pendingCredit: '0' },
        lowStockAlerts: 0,
        lowStockProducts: [],
        recentSales: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
    }).format(parseFloat(value) || 0);
  };

  const getPaymentBadge = (bankType: string | null) => {
    if (!bankType) return { label: 'Cash', color: 'bg-green-100 text-green-700' };
    if (bankType === 'CBE') return { label: 'CBE', color: 'bg-blue-100 text-blue-700' };
    if (bankType === 'ABYSSINYA') return { label: 'Abyssinya', color: 'bg-indigo-100 text-indigo-700' };
    if (bankType === 'AWASH') return { label: 'Awash', color: 'bg-purple-100 text-purple-700' };
    if (bankType === 'TELEBIRR') return { label: 'Telebirr', color: 'bg-cyan-100 text-cyan-700' };
    if (bankType.startsWith('OTHER:')) return { label: bankType.replace('OTHER:', ''), color: 'bg-gray-100 text-gray-700' };
    return { label: bankType, color: 'bg-gray-100 text-gray-700' };
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          {isAdmin ? 'Overview of your business today' : 'Your sales overview for today'}
        </p>
      </div>

      {isAdmin && (
        <Link
          href="/dashboard/products-metrics"
          className="block w-full bg-gradient-to-r from-dashboard to-indigo-700 hover:from-dashboard-dark hover:to-indigo-800 text-white p-4 md:p-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Package className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Products with Category and Total</h2>
                <p className="text-dashboard-light/20 text-sm md:text-base">Overview of inventory distribution and total Birr value</p>
              </div>

            </div>
            <ArrowUpRight className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          {/* Subtle background pattern/glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </Link>
      )}


      {stats !== null && (
        <>
          {/* Today's Stats Cards - Row 1: Sales Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-dashboard-light/100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Total Sales</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{stats.today.bills} bills</p>
                </div>
                <div className="p-2 bg-dashboard-light/20 rounded-lg ml-2 flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-dashboard" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Cash Collected</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.cashCollected)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg ml-2 flex-shrink-0">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Bank Collected</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.bankCollected)}
                  </p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg ml-2 flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Credit Sales</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.creditSales)}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg ml-2 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Expenses</p>
                  <p className="text-lg font-bold text-red-600 mt-1 truncate">
                    {formatCurrency(stats.today.expenses)}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg ml-2 flex-shrink-0">
                  <Receipt className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Net Amount</p>
                  <p className={`text-lg font-bold mt-1 truncate ${parseFloat(stats.today.netAmount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.today.netAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">After expenses</p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg ml-2 flex-shrink-0">
                  <BadgeDollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only additional stats */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setShowAdminDetails(!showAdminDetails)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-dashboard mr-2" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Admin Insights & Overview</h2>
                </div>
                {showAdminDetails ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {showAdminDetails && (
                <div className="p-4 bg-gray-50/50">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border-l-4 border-emerald-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-gray-600">Profit Today</p>
                          <p className="text-lg md:text-2xl font-bold text-emerald-600 mt-1 truncate">
                            {formatCurrency(stats.today.profit)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Revenue - Cost</p>
                        </div>
                        <div className="p-2 md:p-3 bg-emerald-100 rounded-lg ml-2 flex-shrink-0">
                          <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border-l-4 border-purple-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-gray-600">Total Products</p>
                          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
                            {stats.overview.totalProducts}
                          </p>
                          <Link href="/products" className="text-xs text-purple-600 hover:underline mt-1 inline-block">
                            View all →
                          </Link>
                        </div>
                        <div className="p-2 md:p-3 bg-purple-100 rounded-lg ml-2 flex-shrink-0">
                          <Package className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border-l-4 border-cyan-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-gray-600">Pending Credit</p>
                          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                            {formatCurrency(stats.overview.pendingCredit)}
                          </p>
                          <Link href="/companies" className="text-xs text-cyan-600 hover:underline mt-1 inline-block">
                            View credits →
                          </Link>
                        </div>
                        <div className="p-2 md:p-3 bg-cyan-100 rounded-lg ml-2 flex-shrink-0">
                          <Users className="h-5 w-5 md:h-6 md:w-6 text-cyan-600" />
                        </div>
                      </div>
                    </div>

                    {stats.lowStockAlerts > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-gray-600">Low Stock Alerts</p>
                            <p className="text-lg md:text-2xl font-bold text-orange-600 mt-1">
                              {stats.lowStockAlerts}
                            </p>
                            <Link href="/products" className="text-xs text-orange-600 hover:underline mt-1 inline-block">
                              View items →
                            </Link>
                          </div>
                          <div className="p-2 md:p-3 bg-orange-100 rounded-lg ml-2 flex-shrink-0">
                            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Today's Sales Feed + Quick Actions / Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Today's Sales (takes 2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-dashboard mr-2" />
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Today's Sales</h2>
                    <span className="ml-2 px-2 py-0.5 bg-dashboard-light/20 text-dashboard text-xs font-medium rounded-full">
                      {stats.recentSales.length}
                    </span>
                  </div>
                  <Link href="/sales" className="text-xs md:text-sm text-dashboard hover:underline">
                    View all →
                  </Link>
                </div>
              </div>
              <div className="p-4 md:p-6">
                {stats.recentSales.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSales.map((sale) => {
                      const paymentBadge = getPaymentBadge(sale.bankType);
                      const hasOverprice = sale.items.some(item => parseFloat(item.surplusAmount || '0') > 0);
                      const totalSurplus = sale.items.reduce((sum, item) => sum + parseFloat(item.surplusAmount || '0'), 0);

                      return (
                        <Link
                          key={sale.id}
                          href={`/sales/${sale.id}`}
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Product names */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                {sale.items.slice(0, 3).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center text-sm font-medium text-gray-900">
                                    <Tag className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                                    {item.productName}
                                    <span className="text-gray-400 ml-1 text-xs">×{item.quantity}</span>
                                    {idx < Math.min(sale.items.length, 3) - 1 && <span className="text-gray-300 ml-1">,</span>}
                                  </span>
                                ))}
                                {sale.items.length > 3 && (
                                  <span className="text-xs text-gray-400">+{sale.items.length - 3} more</span>
                                )}
                              </div>
                              {/* Time & Salesperson */}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{new Date(sale.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span>{sale.salespersonName}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${paymentBadge.color}`}>
                                  {paymentBadge.label}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900">{formatCurrency(sale.totalPaid)}</p>
                              {hasOverprice && totalSurplus > 0 && (
                                <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1">
                                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                  +{formatCurrency(totalSurplus.toString())}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Overpriced items detail */}
                          {hasOverprice && (
                            <div className="mt-2 pt-2 border-t border-gray-200/60">
                              <div className="flex flex-wrap gap-2">
                                {sale.items.filter(item => parseFloat(item.surplusAmount || '0') > 0).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                    {item.productName}: {formatCurrency(item.adminPrice)} → {formatCurrency(item.finalPrice)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No sales today yet</p>
                    <Link href="/sales/new" className="mt-2 inline-block text-sm text-dashboard hover:underline">
                      Create a sale →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Actions + Low Stock */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-amber-500 mr-2" />
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/sales/new"
                      className="p-3 bg-dashboard-light/10 rounded-lg hover:bg-dashboard-light/20 transition-colors text-center group"
                    >
                      <ShoppingCart className="h-6 w-6 text-dashboard mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">New Sale</p>
                    </Link>
                    <Link
                      href="/expenses/tracker"
                      className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center group"
                    >
                      <Receipt className="h-6 w-6 text-red-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">Add Expense</p>
                    </Link>
                    <Link
                      href="/daily-summary"
                      className="p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-center group"
                    >
                      <FileText className="h-6 w-6 text-emerald-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">Daily Summary</p>
                    </Link>
                    <Link
                      href="/products"
                      className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center group"
                    >
                      <Package className="h-6 w-6 text-purple-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">Products</p>
                    </Link>
                    <Link
                      href="/contacts"
                      className="p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors text-center group"
                    >
                      <Users className="h-6 w-6 text-cyan-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">Contacts</p>
                    </Link>
                    <Link
                      href="/companies"
                      className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center group"
                    >
                      <CreditCard className="h-6 w-6 text-amber-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">Companies</p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {stats.lowStockAlerts > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 mr-2" />
                        <h2 className="text-base font-semibold text-gray-900">
                          Low Stock ({stats.lowStockAlerts})
                        </h2>
                      </div>
                      <Link href="/products" className="text-xs text-yellow-600 hover:underline">
                        View all →
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {stats.lowStockProducts.slice(0, 5).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              Stock: <span className="text-red-600 font-medium">{product.stockQty}</span> / Alert: {product.lowStockAlert}
                            </p>
                          </div>
                          <Package className="h-4 w-4 text-yellow-600 ml-2 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
