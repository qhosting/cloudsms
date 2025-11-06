

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react';

interface GlobalStatsCardsProps {
  stats: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalCampaigns: number;
    totalMessages: number;
    totalCreditsUsed: number;
  };
}

export function GlobalStatsCards({ stats }: GlobalStatsCardsProps) {
  const cards = [
    {
      title: 'Empresas Registradas',
      value: stats.totalCompanies.toLocaleString(),
      subtitle: `${stats.activeCompanies} activas este mes`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers.toLocaleString(),
      subtitle: 'Usuarios registrados',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Campañas Creadas',
      value: stats.totalCampaigns.toLocaleString(),
      subtitle: 'Campañas en total',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Mensajes Enviados',
      value: stats.totalMessages.toLocaleString(),
      subtitle: 'SMS entregados',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Créditos Consumidos',
      value: stats.totalCreditsUsed.toLocaleString(),
      subtitle: 'Créditos utilizados',
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Actividad del Sistema',
      value: `${Math.round((stats.activeCompanies / Math.max(stats.totalCompanies, 1)) * 100)}%`,
      subtitle: 'Empresas activas',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
