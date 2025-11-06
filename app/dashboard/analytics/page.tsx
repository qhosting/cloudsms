

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
        <p className="mt-2 text-gray-600">
          Análisis detallado del rendimiento de tus campañas SMS
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-orange-600" />
            Centro de Analíticas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Próximamente Disponible
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El centro de analíticas te proporcionará insights detallados 
              sobre el rendimiento y efectividad de tus campañas SMS.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Incluirá métricas como:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Tasas de entrega y apertura</li>
                <li>• Análisis de engagement</li>
                <li>• Comparativas por período</li>
                <li>• ROI de campañas</li>
                <li>• Reportes personalizables</li>
                <li>• Exportación de datos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
