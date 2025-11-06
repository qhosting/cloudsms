

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface MessageTrendsProps {
  data: Array<{
    sentAt: Date | null;
    _count: number;
  }>;
}

export function MessageTrends({ data }: MessageTrendsProps) {
  // Process data for display
  const processedData = data.slice(0, 7).map((item, index) => ({
    day: `Día ${index + 1}`,
    messages: item._count,
    date: item.sentAt ? new Date(item.sentAt).toLocaleDateString('es-MX') : 'N/A'
  }));

  const maxMessages = Math.max(...processedData.map(d => d.messages), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
          Tendencia de Mensajes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay datos de mensajes disponibles
            </p>
          ) : (
            processedData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-600 w-16">
                  {item.day}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.messages / maxMessages) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 w-16 text-right">
                  {item.messages.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {processedData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Promedio diario:</span>
              <span className="font-medium">
                {Math.round(processedData.reduce((sum, item) => sum + item.messages, 0) / processedData.length).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
