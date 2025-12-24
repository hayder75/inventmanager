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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {isAdmin ? 'Overview of your business today' : 'Your sales overview for today'}
        </p>
      </div>

      {stats && (
        <>
          {/* Today's Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.today.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.today.bills} bills today</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cash Collected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.today.cashCollected)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bank Collected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.today.bankCollected)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credit Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.today.creditSales)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only additional stats */}
          {isAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profit Today</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {formatCurrency(stats.today.profit)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Revenue - Cost</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Expenses Today</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {formatCurrency(stats.today.expenses)}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats.overview.totalProducts}
                      </p>
                      <Link href="/products" className="text-xs text-purple-600 hover:underline mt-1 inline-block">
                        View all →
                      </Link>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Credit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(stats.overview.pendingCredit)}
                      </p>
                      <Link href="/companies" className="text-xs text-cyan-600 hover:underline mt-1 inline-block">
                        View credits →
                      </Link>
                    </div>
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <Users className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sales & Low Stock Alerts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
                      </div>
                      <Link href="/sales" className="text-sm text-blue-600 hover:underline">
                        View all →
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
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
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">
                            Low Stock Alerts ({stats.lowStockAlerts})
                          </h2>
                        </div>
                        <Link href="/products" className="text-sm text-yellow-600 hover:underline">
                          View all →
                        </Link>
                      </div>
                    </div>
                    <div className="p-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales for Sales Users */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Today's Sales</h2>
                    </div>
                    <Link href="/sales" className="text-sm text-blue-600 hover:underline">
                      View all →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
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
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/sales/new"
                      className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                    >
                      <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">New Sale</p>
                    </Link>
                    <Link
                      href="/products"
                      className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                    >
                      <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Products</p>
                    </Link>
                    <Link
                      href="/contacts"
                      className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                    >
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Contacts</p>
                    </Link>
                    <Link
                      href="/expenses/tracker"
                      className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
                    >
                      <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Expenses</p>
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

