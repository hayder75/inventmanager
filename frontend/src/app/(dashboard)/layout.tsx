'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Check localStorage as fallback in case state hasn't updated yet
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (!token || !savedUser) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check localStorage as fallback if user state is null but we have saved data
  if (!user) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          // User exists in localStorage, just wait for state to sync
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          );
        }
      } catch {
        // Invalid user data, redirect to login
        router.push('/login');
        return null;
      }
    }
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

