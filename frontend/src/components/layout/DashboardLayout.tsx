'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Building2,
  Users,
  Package,
  Archive,
  CreditCard,
  TrendingUp,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  Wallet,
  FileText,
  BarChart3,
  DollarSign,
  TrendingDown,
  Globe,
  Calendar,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  roles?: ('ADMIN' | 'SALES')[];
}

interface MenuCategory {
  title: string;
  icon: any;
  items: MenuItem[];
  roles?: ('ADMIN' | 'SALES')[];
}

const adminMenuCategories: MenuCategory[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ name: 'Overview', href: '/dashboard', icon: LayoutDashboard }]
  },
  {
    title: 'Inventory',
    icon: Archive,
    items: [
      { name: 'Add Stock', href: '/stock/add', icon: Archive },
      { name: 'Stock Adjustment', href: '/stock/adjustments', icon: Archive },
      { name: 'Products', href: '/products', icon: Package },
    ]
  },
  {
    title: 'Sales',
    icon: ShoppingCart,
    items: [
      { name: 'Today Sales', href: '/sales/today', icon: FileText },
      { name: 'Payment Received', href: '/payments', icon: CreditCard },
      { name: 'Credit Users', href: '/companies', icon: Building2 },
      { name: 'Sales Adjustments', href: '/sales/adjustments', icon: FileText },
      { name: 'Adjustment Approvals', href: '/sales/adjustments/approvals', icon: FileText, roles: ['ADMIN'] },
    ]
  },
  {
    title: 'Finance',
    icon: DollarSign,
    items: [
      { name: 'Cash Flow', href: '/cash-flow', icon: DollarSign },
      { name: 'Bank Deposit', href: '/bank-deposits', icon: CreditCard },
      { name: 'Profit & Loss', href: '/profit-loss', icon: TrendingDown },
      { name: 'Daily Summary', href: '/daily-summary', icon: Calendar },
      { name: 'Expense Report', href: '/expenses/reports', icon: FileText },
      { name: 'Sales Performance', href: '/dashboard/performance', icon: BarChart3 },
    ]
  },
  {
    title: 'Suppliers',
    icon: Wallet,
    items: [
      { name: 'Suppliers Owed', href: '/suppliers/owed', icon: Wallet },
      { name: 'Contacts', href: '/contacts', icon: Users },
    ]
  },
  {
    title: 'System',
    icon: Settings,
    items: [
      { name: 'Users Management', href: '/users', icon: Users },
      { name: 'Website Settings', href: '/website', icon: Globe },
      { name: 'System Settings', href: '/settings', icon: Settings },
    ]
  }
];

const salesMenuCategories: MenuCategory[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { name: 'Overview', href: '/dashboard' },
      { name: 'Daily Summary', href: '/daily-summary' }
    ]
  },
  {
    title: 'Inventory',
    icon: Archive,
    items: [
      { name: 'Add Stock', href: '/stock/add' },
      { name: 'Products', href: '/products' },
      { name: 'Stock Adjustments', href: '/stock/adjustments' },
    ]
  },
  {
    title: 'Sales',
    icon: ShoppingCart,
    items: [
      { name: 'New Sale', href: '/sales/new' },
      { name: 'Sales List', href: '/sales' },
      { name: 'Payments Received', href: '/payments' },
      { name: 'Daily Summary', href: '/daily-summary' },
      { name: 'Sales Adjustments', href: '/sales/adjustments' },
    ]
  },
  {
    title: 'Suppliers & Contacts',
    icon: Users,
    items: [
      { name: 'Contacts', href: '/contacts' },
    ]
  },
  {
    title: 'Expenses',
    icon: FileText,
    items: [
      { name: 'Expense Tracker', href: '/expenses/tracker' },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const categories = user?.role === 'ADMIN' ? adminMenuCategories : salesMenuCategories;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleCategory = (title: string) => {
    setOpenCategory(prev => prev === title ? null : title);
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    return false;
  };

  const isCategoryActive = (category: MenuCategory) => {
    return category.items.some(item => pathname === item.href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ backgroundColor: '#1921D9' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4 border-b border-white/10">
            <h1 className="text-base md:text-xl font-bold truncate">Real-Bright-Trading</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 md:py-4 scrollbar-hide">
            <div className="px-3 space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isOpen = openCategory === category.title;
                const categoryActive = isCategoryActive(category);

                return (
                  <div key={category.title} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-[15px] font-semibold rounded-xl transition-all ${categoryActive
                        ? 'bg-white/20 text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`mr-3 h-5 w-5 transition-transform ${categoryActive ? 'scale-110' : ''}`} />
                        <span>{category.title}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      ) : (
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      )}
                    </button>

                    {/* Dropdown Items */}
                    {isOpen && (
                      <div className="ml-4 pl-1 mt-1 space-y-1 border-l border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                        {category.items.map((item) => {
                          const active = isActive(item.href);
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
                                ? 'bg-dashboard-light text-white shadow-sm'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                              {ItemIcon && <ItemIcon className="mr-2 h-4 w-4 opacity-70" />}
                              <span className="truncate">{item.name}</span>
                              {active && <div className="ml-auto w-1 h-1 bg-white rounded-full" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* User info */}
          <div className="border-t border-white/10 p-4 bg-black/5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-400 flex items-center justify-center shadow-lg border-2 border-white/20 flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-red-500/80 hover:bg-red-600 rounded-xl transition-all shadow-md active:scale-95"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <Menu className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative p-1">
                <Bell className="h-5 w-5 md:h-6 md:w-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-400 flex items-center justify-center shadow-md">
                  <span className="text-xs font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs md:text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6 relative min-h-screen pb-20">{children}</main>
        {/* EnglesTech Branding - Hidden on mobile, non-blocking */}
        <div className="hidden lg:block fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-4 z-[5] pointer-events-none select-none opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border border-gray-200">
            <p className="text-sm font-bold" style={{ color: '#1921D9' }}>
              EnglesTech
            </p>
            <p className="text-[10px] text-gray-500">Powered by</p>
          </div>
        </div>
      </div>
    </div>
  );
}

