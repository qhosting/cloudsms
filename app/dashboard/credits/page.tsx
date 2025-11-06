

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus, History } from 'lucide-react';

export default async function CreditsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créditos SMS</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu saldo de créditos para envío de mensajes
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/credits/history">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              Historial
            </Button>
          </Link>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Recargar Créditos
          </Button>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
            Sistema de Créditos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <CreditCard className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Módulo en Desarrollo
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El sistema completo de créditos te permitirá recargar tu saldo 
              y gestionar todos tus pagos de forma automática.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Funcionalidades incluirán:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Recarga con SPEI y tarjetas</li>
                <li>• Integración con Openpay</li>
                <li>• Recarga automática</li>
                <li>• Historial detallado</li>
                <li>• Alertas de saldo bajo</li>
                <li>• Facturación automática</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
