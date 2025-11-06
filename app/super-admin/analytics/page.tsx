

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCharts } from './_components/analytics-charts';
import { CompanyRanking } from './_components/company-ranking';
import { MessageTrends } from './_components/message-trends';
import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics - Super Admin',
  description: 'Análisis detallado del sistema y uso de la plataforma',
};

async function getAnalyticsData() {
  const [
    // Messages by day (last 30 days)
    messagesByDay,
    // Companies by usage
    companiesByUsage,
    // Total statistics
    totalStats
  ] = await Promise.all([
    // Messages aggregated by day
    prisma.message.groupBy({
      by: ['sentAt'],
      _count: true,
      where: {
        sentAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        sentAt: 'asc'
      }
    }),
    
    // Companies ranked by message count
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        _count: {
          select: {
            campaigns: true,
            users: true
          }
        }
      },
      orderBy: {
        campaigns: {
          _count: 'desc'
        }
      },
      take: 10
    }),
    
    // Overall stats
    {
      totalMessages: await prisma.message.count(),
      totalCampaigns: await prisma.campaign.count(),
      totalCompanies: await prisma.company.count(),
      totalCreditsUsed: await prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'USAGE' }
      })
    }
  ]);

  return {
    messagesByDay,
    companiesByUsage,
    totalStats: {
      ...totalStats,
      totalCreditsUsed: Math.abs(totalStats.totalCreditsUsed._sum.amount || 0)
    }
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics del Sistema</h1>
        <p className="mt-2 text-gray-600">
          Análisis detallado del uso y rendimiento de la plataforma
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalMessages.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalCampaigns.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalCompanies.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Consumidos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalCreditsUsed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MessageTrends data={data.messagesByDay} />
        <CompanyRanking companies={data.companiesByUsage} />
      </div>

      <AnalyticsCharts />
    </div>
  );
}
