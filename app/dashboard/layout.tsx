

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from './_components/dashboard-sidebar';
import { DashboardHeader } from './_components/dashboard-header';

export const metadata: Metadata = {
  title: 'Dashboard - SMS CloudMX',
  description: 'Panel de control para gestionar tus campañas de SMS',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect super admin to their dashboard
  if (session.user.role === 'SUPER_ADMIN') {
    redirect('/super-admin');
  }

  // Only allow COMPANY_ADMIN and USER roles
  if (!['COMPANY_ADMIN', 'USER'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
