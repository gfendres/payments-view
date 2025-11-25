'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/features/auth';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard layout component with sidebar and header
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isConnected } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isConnected) {
      router.push('/');
    }
  }, [isAuthenticated, isConnected, router]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDark(!isDark);
    // In a real app, this would update the HTML class and persist to localStorage
    document.documentElement.classList.toggle('dark');
  };

  // Close sidebar on route change (mobile)
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 animate-pulse text-4xl">🔐</div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
        />

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
