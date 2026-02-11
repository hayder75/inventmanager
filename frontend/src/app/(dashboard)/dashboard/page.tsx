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
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  today: {
    totalSales: string;
    cashCollected: string;
    bankCollected: string;
    creditSales: string;
    profit: string;
    expenses: string;
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
    createdAt: string;
    salespersonName: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
      currency: 'USD',
    }).format(parseFloat(value));
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


      {stats && (
        <>
          {/* Today's Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-dashboard-light/100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Total Sales</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.today.bills} bills today</p>
                </div>
                <div className="p-2 md:p-3 bg-dashboard-light/20 rounded-lg ml-2 flex-shrink-0">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-dashboard" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Cash Collected</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.cashCollected)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-green-100 rounded-lg ml-2 flex-shrink-0">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Bank Collected</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.bankCollected)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-indigo-100 rounded-lg ml-2 flex-shrink-0">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600">Credit Sales</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(stats.today.creditSales)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-yellow-100 rounded-lg ml-2 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only additional stats */}
          {isAdmin && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-emerald-500">
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

                <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Expenses Today</p>
                      <p className="text-lg md:text-2xl font-bold text-red-600 mt-1 truncate">
                        {formatCurrency(stats.today.expenses)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 bg-red-100 rounded-lg ml-2 flex-shrink-0">
                      <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-purple-500">
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

                <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-cyan-500">
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
              </div>

              {/* Recent Sales & Low Stock Alerts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Sales */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 md:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-dashboard mr-2" />
                        <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Sales</h2>
                      </div>
                      <Link href="/sales" className="text-xs md:text-sm text-dashboard hover:underline">
                        View all →
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    {stats.recentSales.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentSales.map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(sale.totalAmount)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {sale.salespersonName} • {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No sales today</p>
                    )}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                {stats.lowStockAlerts > 0 && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 md:p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 mr-2" />
                          <h2 className="text-base md:text-lg font-semibold text-gray-900">
                            Low Stock ({stats.lowStockAlerts})
                          </h2>
                        </div>
                        <Link href="/products" className="text-xs md:text-sm text-yellow-600 hover:underline">
                          View all →
                        </Link>
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="space-y-3">
                        {stats.lowStockProducts.slice(0, 5).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                Stock: {product.stockQty} | Alert: {product.lowStockAlert}
                              </p>
                            </div>
                            <Package className="h-5 w-5 text-yellow-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Sales Dashboard - Different view for sales users */}
          {!isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Sales for Sales Users */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-dashboard mr-2" />
                      <h2 className="text-base md:text-lg font-semibold text-gray-900">Today's Sales</h2>
                    </div>
                    <Link href="/sales" className="text-xs md:text-sm text-dashboard hover:underline">
                      View all →
                    </Link>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {stats.recentSales.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(sale.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No sales today</p>
                  )}
                </div>
              </div>

              {/* Quick Actions for Sales */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Link
                      href="/sales/new"
                      className="p-3 md:p-4 bg-dashboard-light/10 rounded-lg hover:bg-dashboard-light/20 transition-colors text-center"
                    >
                      <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-dashboard mx-auto mb-2" />
                      <p className="text-sm md:text-base font-medium text-gray-900">New Sale</p>
                    </Link>
                    <Link
                      href="/products"
                      className="p-3 md:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                    >
                      <Package className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm md:text-base font-medium text-gray-900">Products</p>
                    </Link>
                    <Link
                      href="/contacts"
                      className="p-3 md:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                    >
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm md:text-base font-medium text-gray-900">Contacts</p>
                    </Link>
                    <Link
                      href="/expenses/tracker"
                      className="p-3 md:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
                    >
                      <FileText className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm md:text-base font-medium text-gray-900">Expenses</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

