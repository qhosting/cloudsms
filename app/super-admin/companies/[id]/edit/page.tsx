

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import { EditCompanyForm } from './_components/edit-company-form';
import { ArrowLeft } from 'lucide-react';

interface EditCompanyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditCompanyPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { name: true }
  });

  return {
    title: `Editar ${company?.name || 'Empresa'} - Super Admin`,
    description: `Modificar información de la empresa ${company?.name || 'No encontrada'}`,
  };
}

async function getCompany(id: string) {
  return await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      city: true,
      state: true,
      country: true,
      zipCode: true,
      credits: true,
      createdAt: true
    }
  });
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const company = await getCompany(params.id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/super-admin/companies/${company.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Empresa</h1>
          <p className="mt-2 text-gray-600">
            Modificar información de {company.name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <EditCompanyForm company={company} />
      </div>
    </div>
  );
}
