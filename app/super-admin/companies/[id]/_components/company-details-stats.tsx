

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, List, CreditCard } from 'lucide-react';

interface CompanyDetailsStatsProps {
  company: {
    _count: {
      users: number;
      campaigns: number;
      contactLists: number;
      transactions: number;
    };
    credits: number;
  };
}

export function CompanyDetailsStats({ company }: CompanyDetailsStatsProps) {
  const stats = [
    {
      title: 'Usuarios',
      value: company._count.users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Campañas',
      value: company._count.campaigns,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Listas de Contactos',
      value: company._count.contactLists,
      icon: List,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Transacciones',
      value: company._count.transactions,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex items-center p-6">
            <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
