

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TeamTable } from './_components/team-table';

export const metadata = {
  title: 'Gestión de Equipo - Dashboard',
  description: 'Gestiona los usuarios de tu empresa',
};

async function getTeamMembers(companyId: string) {
  return await prisma.user.findMany({
    where: { 
      companyId,
      // Exclude super admins from company team view
      role: {
        not: 'SUPER_ADMIN'
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          createdCampaigns: true,
          createdContactLists: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Acceso Denegado
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  const teamMembers = await getTeamMembers(session.user.companyId);
  const isCompanyAdmin = session.user.role === 'COMPANY_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipo</h1>
          <p className="mt-2 text-gray-600">
            Administra los usuarios de tu empresa
          </p>
        </div>
        {isCompanyAdmin && (
          <Link href="/dashboard/team/invite">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Invitar Usuario
            </Button>
          </Link>
        )}
      </div>

      <TeamTable 
        teamMembers={teamMembers} 
        currentUser={{
          id: session.user.id,
          role: session.user.role,
          email: session.user.email || ''
        }}
        canManage={isCompanyAdmin}
      />
    </div>
  );
}
