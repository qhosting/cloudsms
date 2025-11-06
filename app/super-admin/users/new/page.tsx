

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import { CreateUserForm } from './_components/create-user-form';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Crear Usuario - Super Admin',
  description: 'Crear un nuevo usuario en el sistema',
};

async function getCompanies() {
  return await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);
  const companies = await getCompanies();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/super-admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Usuarios
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Usuario</h1>
          <p className="mt-2 text-gray-600">
            Agregar un nuevo usuario al sistema
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <CreateUserForm companies={companies} />
      </div>
    </div>
  );
}
