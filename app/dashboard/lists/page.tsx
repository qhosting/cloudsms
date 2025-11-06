
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import ListsTable from './_components/lists-table';
import ListsStats from './_components/lists-stats';

export default async function ListsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listas de Contactos</h1>
          <p className="mt-2 text-gray-600">
            Organiza y segmenta tus contactos para campañas más efectivas
          </p>
        </div>
        <Link href="/dashboard/lists/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Lista
          </Button>
        </Link>
      </div>

      {/* Statistics Overview */}
      <ListsStats />

      {/* Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Listas</CardTitle>
        </CardHeader>
        <CardContent>
          <ListsTable />
        </CardContent>
      </Card>
    </div>
  );
}
