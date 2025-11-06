

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { CompanyDetailsStats } from './_components/company-details-stats';
import { CompanyUsers } from './_components/company-users';
import { CompanyCampaigns } from './_components/company-campaigns';
import { CreditHistory } from './_components/credit-history';
import { ArrowLeft, Edit, Building2, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyDetailsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CompanyDetailsPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { name: true }
  });

  return {
    title: `${company?.name || 'Empresa'} - Super Admin`,
    description: `Detalles de la empresa ${company?.name || 'No encontrada'}`,
  };
}

async function getCompanyDetails(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      campaigns: {
        select: {
          id: true,
          name: true,
          status: true,
          totalRecipients: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          creditsUsed: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
      transactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      _count: {
        select: {
          users: true,
          campaigns: true,
          contactLists: true,
          transactions: true
        }
      }
    }
  });

  return company;
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
  const company = await getCompanyDetails(params.id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/super-admin/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="mt-1 text-gray-600">
              Registrada {formatDistanceToNow(company.createdAt, { 
                addSuffix: true,
                locale: es
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/super-admin/companies/${company.id}/credits`}>
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Gestionar Créditos
            </Button>
          </Link>
          <Link href={`/super-admin/companies/${company.id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Editar Empresa
            </Button>
          </Link>
        </div>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{company.email}</p>
            </div>
            {company.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                <p className="mt-1 text-sm text-gray-900">{company.phone}</p>
              </div>
            )}
            {company.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sitio Web</h3>
                <a 
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  {company.website}
                </a>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Créditos Actuales</h3>
              <div className="mt-1 flex items-center space-x-2">
                <Badge 
                  variant={company.credits > 100 ? "default" : company.credits > 0 ? "secondary" : "destructive"}
                  className="flex items-center"
                >
                  <CreditCard className="mr-1 h-3 w-3" />
                  {company.credits}
                </Badge>
              </div>
            </div>
            {company.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {company.address}
                  {company.city && `, ${company.city}`}
                  {company.state && `, ${company.state}`}
                  {company.zipCode && ` ${company.zipCode}`}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Estado</h3>
              <Badge className="mt-1 bg-green-100 text-green-800">
                Activa
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <CompanyDetailsStats company={company} />

      {/* Users and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyUsers users={company.users} companyId={company.id} />
        <CompanyCampaigns campaigns={company.campaigns} companyId={company.id} />
      </div>

      {/* Credit History */}
      <CreditHistory transactions={company.transactions} companyId={company.id} />
    </div>
  );
}
