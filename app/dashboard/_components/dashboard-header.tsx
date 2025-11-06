

'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DashboardHeader() {
  const { data: session } = useSession() || {};

  return (
    <div className="hidden lg:block">
      <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Search */}
          <form className="relative flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Buscar
            </label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
            <Input
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Buscar..."
              type="search"
              name="search"
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User info */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.role === 'COMPANY_ADMIN' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {session?.user?.firstName?.charAt(0)}{session?.user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
