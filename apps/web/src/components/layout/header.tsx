'use client';

import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { Button } from '@payments-view/ui';

import { useAuthContext } from '@/features/auth';

interface HeaderProps {
  onMenuClick?: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

/**
 * Dashboard header component
 */
export function Header({ onMenuClick, isDark = true, onThemeToggle }: HeaderProps) {
  const { walletAddress, signOut } = useAuthContext();

  const abbreviatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {/* Notification badge */}
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="sm" onClick={onThemeToggle}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Wallet info */}
        <div className="hidden items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-1.5 sm:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
            <span className="text-xs font-bold text-white">
              {walletAddress?.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium">{abbreviatedAddress}</span>
        </div>

        {/* Sign out button */}
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
