'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Package, FileText, Receipt, 
  BarChart3, Settings, Wallet, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers/', label: 'Customers', icon: Users },
  { href: '/products/', label: 'Products', icon: Package },
  { href: '/invoices/', label: 'Invoices', icon: FileText },
  { href: '/expenses/', label: 'Expenses', icon: Wallet },
  { href: '/reports/', label: 'Reports', icon: BarChart3 },
  { href: '/settings/', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">Billing Pro</h1>
            <p className="text-xs text-gray-500">Advance System</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href.slice(0, -1));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
              )} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white">
          <p className="text-sm font-semibold">Advance Billing</p>
          <p className="text-xs text-primary-100 mt-1">v1.0.0 • Local Storage</p>
        </div>
      </div>
    </aside>
  );
}
