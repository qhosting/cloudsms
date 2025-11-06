

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Upload } from 'lucide-react';

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu base de datos de contactos
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/contacts/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </Link>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-600" />
            Gestión de Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Módulo en Desarrollo
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El módulo completo de gestión de contactos estará disponible pronto.
              Podrás organizar y administrar toda tu base de datos de contactos.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Funcionalidades incluirán:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Importación desde Excel/CSV</li>
                <li>• Gestión de campos personalizados</li>
                <li>• Segmentación avanzada</li>
                <li>• Historial de mensajes</li>
                <li>• Sincronización con CRM</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
