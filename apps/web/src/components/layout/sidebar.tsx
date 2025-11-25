'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Gift,
  Settings,
  HelpCircle,
} from 'lucide-react';

/**
 * Navigation items configuration
 */
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: CreditCard,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: PieChart,
  },
  {
    label: 'Rewards',
    href: '/dashboard/rewards',
    icon: Gift,
  },
] as const;

const BOTTOM_NAV_ITEMS = [
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    label: 'Help',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
] as const;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Navigation link component
 */
function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

/**
 * Sidebar navigation component
 */
export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">G</span>
            </div>
            <span className="text-lg font-bold">Gnosis Pay</span>
          </Link>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActivePath(item.href)}
            />
          ))}
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-border p-4">
          <div className="space-y-1">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActivePath(item.href)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
