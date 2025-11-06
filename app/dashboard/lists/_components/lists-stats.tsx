
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, List, TrendingUp, Target, Zap, UserCheck } from 'lucide-react';

interface ListsStats {
  totalLists: number;
  totalContacts: number;
  totalSubscribed: number;
  staticLists: number;
  dynamicLists: number;
  segmentedLists: number;
  averageListSize: number;
  subscriptionRate: number;
}

export default function ListsStats() {
  const [stats, setStats] = useState<ListsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/lists/stats');
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching lists stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Listas',
      value: stats.totalLists.toLocaleString(),
      icon: List,
      color: 'text-blue-600'
    },
    {
      title: 'Total Contactos',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Suscritos',
      value: stats.totalSubscribed.toLocaleString(),
      icon: UserCheck,
      color: 'text-purple-600'
    },
    {
      title: 'Listas Dinámicas',
      value: stats.dynamicLists.toString(),
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      title: 'Tamaño Promedio',
      value: Math.round(stats.averageListSize).toLocaleString(),
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'Tasa de Suscripción',
      value: `${stats.subscriptionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Icon className={`h-4 w-4 mr-2 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
