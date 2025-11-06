

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from './_components/dashboard-stats';
import { RecentCampaigns } from './_components/recent-campaigns';
import { CreditBalance } from './_components/credit-balance';
import { QuickActions } from './_components/quick-actions';

async function getDashboardData(companyId: string) {
  const [company, campaigns, users, contactLists] = await Promise.all([
    // Company data with credits
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        credits: true,
      }
    }),

    // Recent campaigns
    prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        deliveredCount: true,
        failedCount: true,
        creditsUsed: true,
        createdAt: true,
      }
    }),

    // Users count
    prisma.user.count({
      where: { companyId, isActive: true }
    }),

    // Contact lists count
    prisma.contactList.count({
      where: { companyId }
    })
  ]);

  // Calculate campaign stats
  const totalCampaigns = await prisma.campaign.count({
    where: { companyId }
  });

  const totalMessagesSent = await prisma.campaign.aggregate({
    where: { companyId },
    _sum: { sentCount: true }
  });

  const totalCreditsUsed = await prisma.campaign.aggregate({
    where: { companyId },
    _sum: { creditsUsed: true }
  });

  return {
    company,
    campaigns,
    stats: {
      totalCampaigns,
      totalMessagesSent: totalMessagesSent._sum.sentCount || 0,
      totalCreditsUsed: totalCreditsUsed._sum.creditsUsed || 0,
      activeUsers: users,
      contactLists,
    }
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    return <div>Error: No se pudo cargar la información de la empresa</div>;
  }

  const dashboardData = await getDashboardData(session.user.companyId);

  if (!dashboardData.company) {
    return <div>Error: Empresa no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {session.user.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Panel de control de {dashboardData.company.name}
        </p>
      </div>

      {/* Quick Stats */}
      <DashboardStats stats={dashboardData.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Campaigns and Actions */}
        <div className="lg:col-span-2 space-y-6">
          <RecentCampaigns campaigns={dashboardData.campaigns} />
          <QuickActions />
        </div>

        {/* Right Column - Credits and Info */}
        <div className="space-y-6">
          <CreditBalance 
            credits={dashboardData.company.credits}
            companyName={dashboardData.company.name}
          />
          
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{dashboardData.company.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <p className="text-sm text-gray-900">
                    {session.user.role === 'COMPANY_ADMIN' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
                  <p className="text-sm text-gray-900">{dashboardData.stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
