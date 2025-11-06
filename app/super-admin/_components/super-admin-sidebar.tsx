

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Settings,
  BarChart3,
  Users,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Empresas', href: '/super-admin/companies', icon: Building2 },
  { name: 'Usuarios', href: '/super-admin/users', icon: Users },
  { name: 'Analíticas', href: '/super-admin/analytics', icon: BarChart3 },
  { name: 'Transacciones', href: '/super-admin/transactions', icon: CreditCard },
  { name: 'Logs', href: '/super-admin/logs', icon: FileText },
  { name: 'Configuración', href: '/super-admin/settings', icon: Settings },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-red-600" />
          <div className="ml-3">
            <p className="text-lg font-semibold text-gray-900">Super Admin</p>
            <p className="text-sm text-gray-500">Control Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-1',
                  isActive
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
