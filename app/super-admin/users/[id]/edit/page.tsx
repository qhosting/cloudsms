

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import { EditUserForm } from './_components/edit-user-form';
import { ArrowLeft } from 'lucide-react';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditUserPageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true, email: true }
  });

  return {
    title: `Editar ${user?.firstName || 'Usuario'} ${user?.lastName || ''} - Super Admin`,
    description: `Modificar información del usuario ${user?.email || 'No encontrado'}`,
  };
}

async function getUserWithCompanies(id: string) {
  const [user, companies] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  ]);

  return { user, companies };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { user, companies } = await getUserWithCompanies(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/super-admin/users/${user.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="mt-2 text-gray-600">
            Modificar información de {user.firstName} {user.lastName}
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <EditUserForm user={user} companies={companies} />
      </div>
    </div>
  );
}
