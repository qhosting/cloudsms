

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ArrowLeft, FileSpreadsheet } from 'lucide-react';

export default async function ImportContactsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Contactos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importar Contactos</h1>
          <p className="mt-2 text-gray-600">
            Sube tus contactos desde archivos Excel o CSV
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-600" />
            Importador de Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Herramienta en Desarrollo
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El importador de contactos te permitirá subir miles de contactos 
              de forma rápida y sencilla desde tus archivos.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Soportará:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Archivos Excel (.xlsx, .xls)</li>
                <li>• Archivos CSV</li>
                <li>• Validación de números telefónicos</li>
                <li>• Detección de duplicados</li>
                <li>• Mapeo de campos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
