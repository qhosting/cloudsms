

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';
import { UsersTable } from './_components/users-table';

export const metadata: Metadata = {
  title: 'Gestión de Usuarios - Super Admin',
  description: 'Administra todos los usuarios del sistema',
};

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Administra todos los usuarios registrados en la plataforma
          </p>
        </div>
        <Link href="/super-admin/users/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </Link>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
