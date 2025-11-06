
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ListEditForm from '../../_components/list-edit-form';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  params: { id: string };
}

export default async function EditListPage({ params }: PageProps) {
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
      }
    }
  });

  if (!list) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/lists/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Lista
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Lista</h1>
          <p className="mt-2 text-gray-600">
            Modifica la configuración de {list.name}
          </p>
        </div>
      </div>

      <ListEditForm listId={params.id} initialData={list} />
    </div>
  );
}
