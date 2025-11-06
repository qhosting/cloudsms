

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { GlobalStatsCards } from './_components/global-stats-cards';
import { RecentActivities } from './_components/recent-activities';
import { TopCompanies } from './_components/top-companies';
import { SystemHealth } from './_components/system-health';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard - SMS CloudMX',
  description: 'Panel de control del super administrador',
};

async function getGlobalStats() {
  const [
    totalCompanies,
    activeCompanies,
    totalUsers,
    totalCampaigns,
    totalMessages,
    totalCreditsUsed,
    recentCompanies,
    recentActivities
  ] = await Promise.all([
    // Total companies
    prisma.company.count(),
    
    // Active companies (have sent at least one campaign in the last 30 days)
    prisma.company.count({
      where: {
        campaigns: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    }),
    
    // Total users
    prisma.user.count({
      where: {
        role: {
          in: ['COMPANY_ADMIN', 'USER']
        }
      }
    }),
    
    // Total campaigns
    prisma.campaign.count(),
    
    // Total messages sent
    prisma.message.count({
      where: {
        status: {
          in: ['SENT', 'DELIVERED']
        }
      }
    }),
    
    // Total credits used
    prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'USAGE'
      }
    }),
    
    // Recent companies (last 7 days)
    prisma.company.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            campaigns: true
          }
        }
      }
    }),
    
    // Recent admin activities (we'll create this later)
    []
  ]);

  return {
    totalCompanies,
    activeCompanies,
    totalUsers,
    totalCampaigns,
    totalMessages,
    totalCreditsUsed: Math.abs(totalCreditsUsed._sum.amount || 0),
    recentCompanies,
    recentActivities
  };
}

export default async function SuperAdminDashboard() {
  const stats = await getGlobalStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Global</h1>
        <p className="mt-2 text-gray-600">
          Vista general del sistema SMS CloudMX
        </p>
      </div>

      <GlobalStatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopCompanies companies={stats.recentCompanies} />
        <SystemHealth />
      </div>

      <RecentActivities activities={stats.recentActivities} />
    </div>
  );
}
