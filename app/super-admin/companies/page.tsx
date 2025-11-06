

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { prisma } from '@/lib/db';
import { CompaniesTable } from './_components/companies-table';
import { Plus, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestión de Empresas - Super Admin',
  description: 'Administra todas las empresas registradas en el sistema',
};

async function getCompanies() {
  return await prisma.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          campaigns: true,
          transactions: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
          <p className="mt-2 text-gray-600">
            Administra todas las empresas registradas en la plataforma
          </p>
        </div>
        <Link href="/super-admin/companies/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar empresas..."
            className="pl-10"
          />
        </div>
      </div>

      <CompaniesTable companies={companies} />
    </div>
  );
}
