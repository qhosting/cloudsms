

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart3, Activity } from 'lucide-react';

export function AnalyticsCharts() {
  // Datos simulados para mostrar
  const messageStatusData = [
    { status: 'Entregados', count: 2847, color: 'bg-green-500' },
    { status: 'Enviados', count: 156, color: 'bg-blue-500' },
    { status: 'Fallidos', count: 43, color: 'bg-red-500' },
    { status: 'Pendientes', count: 12, color: 'bg-yellow-500' },
  ];

  const total = messageStatusData.reduce((sum, item) => sum + item.count, 0);

  const hourlyActivity = [
    { hour: '00', activity: 5 },
    { hour: '01', activity: 2 },
    { hour: '02', activity: 1 },
    { hour: '03', activity: 0 },
    { hour: '04', activity: 1 },
    { hour: '05', activity: 3 },
    { hour: '06', activity: 12 },
    { hour: '07', activity: 28 },
    { hour: '08', activity: 45 },
    { hour: '09', activity: 67 },
    { hour: '10', activity: 89 },
    { hour: '11', activity: 78 },
    { hour: '12', activity: 56 },
    { hour: '13', activity: 67 },
    { hour: '14', activity: 89 },
    { hour: '15', activity: 78 },
    { hour: '16', activity: 56 },
    { hour: '17', activity: 45 },
    { hour: '18', activity: 34 },
    { hour: '19', activity: 23 },
    { hour: '20', activity: 12 },
    { hour: '21', activity: 8 },
    { hour: '22', activity: 5 },
    { hour: '23', activity: 3 },
  ];

  const maxActivity = Math.max(...hourlyActivity.map(h => h.activity));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Message Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5 text-purple-600" />
            Distribución de Estados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.count / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de mensajes:</span>
              <span className="font-medium">{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-indigo-600" />
            Actividad por Hora (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 space-x-1">
            {hourlyActivity.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                <div className="w-full bg-gray-200 rounded-sm flex items-end justify-center relative">
                  <div
                    className="bg-indigo-500 rounded-sm w-full"
                    style={{
                      height: `${Math.max((item.activity / maxActivity) * 80, 2)}px`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 transform rotate-45 origin-left">
                  {item.hour}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hora pico:</span>
              <span className="font-medium">
                {hourlyActivity.find(h => h.activity === maxActivity)?.hour}:00
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
