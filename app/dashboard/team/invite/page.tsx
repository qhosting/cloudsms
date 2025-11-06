

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InviteUserForm } from './_components/invite-user-form';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Invitar Usuario - Dashboard',
  description: 'Invita un nuevo usuario a tu empresa',
};

export default async function InviteUserPage() {
  const session = await getServerSession(authOptions);
  
  // Only allow COMPANY_ADMIN to invite users
  if (!session || session.user.role !== 'COMPANY_ADMIN' || !session.user.companyId) {
    redirect('/dashboard');
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/team">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Equipo
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invitar Usuario</h1>
          <p className="mt-2 text-gray-600">
            Agrega un nuevo miembro a tu equipo
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <InviteUserForm companyId={session.user.companyId} />
      </div>
    </div>
  );
}
