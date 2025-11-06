
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Settings, UserPlus, Download, TrendingUp } from 'lucide-react';
import ListDetailsView from '../_components/list-details-view';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  params: { id: string };
}

export default async function ListDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    redirect('/auth/signin');
  }

  // Fetch list details from server
  const list = await prisma.contactList.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true, email: true }
      },
      _count: {
        select: {
          contacts: true,
          subscriptions: {
            where: { status: 'SUBSCRIBED' }
          }
        }
      }
    }
  });

  if (!list) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/lists">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Listas
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              {list.color && (
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: list.color }}
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            </div>
            {list.description && (
              <p className="mt-2 text-gray-600">{list.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href={`/dashboard/lists/${params.id}/segment`}>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Segmentar
            </Button>
          </Link>
          <Link href={`/dashboard/lists/${params.id}/contacts/add`}>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Contactos
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Link href={`/dashboard/lists/${params.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <ListDetailsView listId={params.id} initialData={list} />
    </div>
  );
}
