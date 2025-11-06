

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, List, CreditCard } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalCampaigns: number;
    totalMessagesSent: number;
    totalCreditsUsed: number;
    activeUsers: number;
    contactLists: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: 'Campañas Totales',
      value: stats.totalCampaigns,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Mensajes Enviados',
      value: stats.totalMessagesSent,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Créditos Usados',
      value: stats.totalCreditsUsed,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Listas de Contactos',
      value: stats.contactLists,
      icon: List,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="flex items-center p-6">
            <div className={`p-2 rounded-lg ${item.bgColor} mr-4`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {item.value.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
