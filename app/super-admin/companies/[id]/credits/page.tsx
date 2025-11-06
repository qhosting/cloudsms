

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import { CreditManagementForm } from './_components/credit-management-form';
import { CreditTransactionsList } from './_components/credit-transactions-list';
import { ArrowLeft } from 'lucide-react';

interface CreditManagementPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CreditManagementPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { name: true }
  });

  return {
    title: `Gestión de Créditos - ${company?.name || 'Empresa'} - Super Admin`,
    description: `Administrar créditos de la empresa ${company?.name || 'No encontrada'}`,
  };
}

async function getCompanyWithTransactions(id: string) {
  return await prisma.company.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }
    }
  });
}

export default async function CreditManagementPage({ params }: CreditManagementPageProps) {
  const company = await getCompanyWithTransactions(params.id);

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Créditos</h1>
          <p className="mt-2 text-gray-600">
            Administrar créditos de {company.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditManagementForm company={company} />
        <CreditTransactionsList transactions={company.transactions} />
      </div>
    </div>
  );
}
