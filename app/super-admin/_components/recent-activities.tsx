

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Building2, UserPlus, MessageSquare, Settings } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'company' | 'user' | 'campaign' | 'system';
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Datos de ejemplo para mostrar funcionamiento
  const sampleActivities = [
    {
      id: '1',
      action: 'Nueva empresa registrada',
      description: 'CloudMX Demo Company se registró en el sistema',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      type: 'company' as const
    },
    {
      id: '2', 
      action: 'Usuario creado',
      description: 'admin@cloudmx.com fue agregado como administrador',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      type: 'user' as const
    },
    {
      id: '3',
      action: 'Campaña enviada',
      description: 'Holiday Promotion - 3 mensajes enviados',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'campaign' as const
    },
    {
      id: '4',
      action: 'Configuración actualizada',
      description: 'Precio por SMS actualizado a $0.50 MXN',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'system' as const
    }
  ];

  const displayActivities = activities.length > 0 ? activities : sampleActivities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <UserPlus className="h-4 w-4" />;
      case 'campaign':
        return <MessageSquare className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'company':
        return <Badge className="bg-blue-100 text-blue-800">Empresa</Badge>;
      case 'user':
        return <Badge className="bg-green-100 text-green-800">Usuario</Badge>;
      case 'campaign':
        return <Badge className="bg-purple-100 text-purple-800">Campaña</Badge>;
      case 'system':
        return <Badge className="bg-orange-100 text-orange-800">Sistema</Badge>;
      default:
        return <Badge variant="secondary">Actividad</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-indigo-600" />
          Actividad Reciente del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.action}</h4>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
              <div className="ml-4">
                {getActivityBadge(activity.type)}
              </div>
            </div>
          ))}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin actividad reciente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Las actividades del sistema aparecerán aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
