
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ListCreationForm from '../_components/list-creation-form';

export default async function NewListPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/lists">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Listas
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Lista</h1>
          <p className="mt-2 text-gray-600">
            Crea una nueva lista para organizar tus contactos
          </p>
        </div>
      </div>

      <ListCreationForm />
    </div>
  );
}
