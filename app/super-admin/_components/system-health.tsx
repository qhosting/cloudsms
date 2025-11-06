

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Server, 
  Database,
  Wifi,
  Clock
} from 'lucide-react';

export function SystemHealth() {
  // Simulamos el estado del sistema
  const healthChecks = [
    {
      name: 'Base de Datos',
      status: 'healthy',
      icon: Database,
      message: 'Funcionando correctamente',
      lastCheck: '2 min'
    },
    {
      name: 'API de SMS',
      status: 'healthy', 
      icon: Wifi,
      message: 'Conectado a LabsMobile',
      lastCheck: '5 min'
    },
    {
      name: 'Servidor',
      status: 'healthy',
      icon: Server,
      message: 'Carga: 23%',
      lastCheck: '1 min'
    },
    {
      name: 'Cola de Mensajes',
      status: 'warning',
      icon: Clock,
      message: '12 mensajes pendientes',
      lastCheck: '30 seg'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Saludable</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5 text-green-600" />
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthChecks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <check.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{check.name}</h4>
                  <p className="text-sm text-gray-500">{check.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(check.status)}
                {getStatusBadge(check.status)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">Sistema Operativo</p>
              <p className="text-sm text-green-700">
                Todos los servicios principales funcionando correctamente
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
