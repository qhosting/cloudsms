

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditTeamMemberForm } from './_components/edit-team-member-form';
import { ArrowLeft } from 'lucide-react';

interface EditTeamMemberPageProps {
  params: {
    id: string;
  };
}

async function getTeamMember(userId: string, companyId: string) {
  return await prisma.user.findFirst({
    where: { 
      id: userId,
      companyId,
      role: {
        not: 'SUPER_ADMIN' // Don't show super admins in team view
      }
    }
  });
}

export default async function EditTeamMemberPage({ params }: EditTeamMemberPageProps) {
  const session = await getServerSession(authOptions);
  
  // Only allow COMPANY_ADMIN to edit team members
  if (!session || session.user.role !== 'COMPANY_ADMIN' || !session.user.companyId) {
    redirect('/dashboard/team');
  }

  const teamMember = await getTeamMember(params.id, session.user.companyId);

  if (!teamMember) {
    notFound();
  }

  // Prevent editing yourself (admins should use settings)
  if (teamMember.id === session.user.id) {
    redirect('/dashboard/team');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/team/${teamMember.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Miembro del Equipo</h1>
          <p className="mt-2 text-gray-600">
            Modificar información de {teamMember.firstName} {teamMember.lastName}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <EditTeamMemberForm user={teamMember} />
      </div>
    </div>
  );
}
