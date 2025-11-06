

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, ArrowLeft, FileText } from 'lucide-react';

export default async function CreditHistoryPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/credits">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Créditos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Créditos</h1>
          <p className="mt-2 text-gray-600">
            Revisa todas tus transacciones de créditos SMS
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-green-600" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <FileText className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Próximamente Disponible
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El historial completo de transacciones te permitirá revisar 
              todas tus recargas, usos y movimientos de créditos.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Incluirá:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Historial completo de recargas</li>
                <li>• Detalle de uso por campaña</li>
                <li>• Filtros por fecha y tipo</li>
                <li>• Exportación a Excel/PDF</li>
                <li>• Gráficos de consumo</li>
                <li>• Reportes mensuales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
