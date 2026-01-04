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
  Wallet,
  FileText,
  BarChart3,
  DollarSign,
  TrendingDown,
  Globe,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles?: ('ADMIN' | 'SALES')[];
}

const adminMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Stock', href: '/stock/add', icon: Archive, roles: ['ADMIN'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'SALES'] },
  { name: 'Stock Adjustments', href: '/stock/adjustments', icon: Archive, roles: ['ADMIN'] },
  { name: 'Today\'s Sales', href: '/sales/today', icon: FileText, roles: ['ADMIN'] },
  { name: 'Bank Deposits', href: '/bank-deposits', icon: CreditCard, roles: ['ADMIN'] },
  { name: 'Cash Flow', href: '/cash-flow', icon: DollarSign, roles: ['ADMIN', 'SALES'] },
  { name: 'Profit & Loss', href: '/profit-loss', icon: TrendingDown, roles: ['ADMIN'] },
  { name: 'Credit Users', href: '/companies', icon: Building2, roles: ['ADMIN'] },
  { name: 'Contacts', href: '/contacts', icon: Users, roles: ['ADMIN', 'SALES'] },
  { name: 'Suppliers Owed', href: '/suppliers/owed', icon: Wallet, roles: ['ADMIN'] },
  { name: 'Payments Received', href: '/payments', icon: CreditCard, roles: ['ADMIN', 'SALES'] },
  { name: 'Expense Reports', href: '/expenses/reports', icon: FileText, roles: ['ADMIN'] },
  { name: 'Sales Performance', href: '/dashboard/performance', icon: BarChart3, roles: ['ADMIN'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Website', href: '/website', icon: Globe, roles: ['ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const salesMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Sale', href: '/sales/new', icon: ShoppingCart },
  { name: 'Sales', href: '/sales', icon: FileText },
  { name: 'Add Stock', href: '/stock/add', icon: Archive },
  { name: 'Stock Adjustments', href: '/stock/adjustments', icon: Archive },
  { name: 'Expense Tracker', href: '/expenses/tracker', icon: FileText },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Payments Received', href: '/payments', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : salesMenuItems;
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'SALES')
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Only match sub-routes if the href is not a parent of another menu item
    // This prevents /sales from matching /sales/new
    if (pathname?.startsWith(href + '/')) {
      // Check if there's a more specific menu item that matches
      const moreSpecificMatch = filteredMenuItems.find(item => 
        item.href !== href && pathname?.startsWith(item.href)
      );
      // Only return true if no more specific match exists
      return !moreSpecificMatch;
    }
    return false;
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
        className={`fixed inset-y-0 left-0 z-30 w-64 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#0064E0' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4 border-b border-gray-800">
            <h1 className="text-base md:text-xl font-bold truncate">Real-Bright-Trading</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 md:py-2">
            <div className="px-2 md:px-2 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 md:px-3 py-2 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors min-h-[36px] ${
                      active
                        ? 'bg-blue-400 text-white shadow-md'
                        : 'text-gray-200 hover:bg-blue-400/30 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-2 md:mr-2 h-4 w-4 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info */}
          <div className="border-t border-gray-800 p-3 md:p-4">
            <div className="flex items-center mb-2 md:mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-400 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-xs md:text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-2 md:ml-3 flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 md:px-4 py-2 text-xs md:text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="mr-2 md:mr-3 h-3 w-3 md:h-4 md:w-4" />
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
        {/* Easy Tech Branding - Hidden on mobile, centered at bottom */}
        <div className="hidden md:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200">
            <p className="text-lg font-bold" style={{ color: '#0082FB' }}>
              Easy Tech
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Powered by</p>
          </div>
        </div>
      </div>
    </div>
  );
}

