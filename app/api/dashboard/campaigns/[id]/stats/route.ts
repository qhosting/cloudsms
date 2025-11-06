

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Get campaign statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: 'Usuario no tiene empresa asociada' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Get message statistics
    const messageStats = await prisma.message.groupBy({
      by: ['status'],
      where: { campaignId: params.id },
      _count: { status: true }
    });

    // Transform to easier format
    const stats = {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
    };

    messageStats.forEach(stat => {
      const count = stat._count.status;
      stats.total += count;
      
      switch (stat.status) {
        case 'PENDING':
          stats.pending = count;
          break;
        case 'SENT':
          stats.sent = count;
          break;
        case 'DELIVERED':
          stats.delivered = count;
          break;
        case 'FAILED':
          stats.failed = count;
          break;
      }
    });

    // Get hourly statistics if campaign is completed
    let hourlyStats: any[] = [];
    if (['COMPLETED', 'FAILED'].includes(campaign.status)) {
      hourlyStats = await prisma.campaignStats.findMany({
        where: { campaignId: params.id },
        orderBy: [
          { date: 'asc' },
          { hour: 'asc' }
        ]
      });
    }

    // Calculate delivery rate and success metrics
    const deliveryRate = stats.total > 0 ? (stats.delivered / stats.total * 100) : 0;
    const successRate = stats.total > 0 ? ((stats.sent + stats.delivered) / stats.total * 100) : 0;
    const failureRate = stats.total > 0 ? (stats.failed / stats.total * 100) : 0;

    // Get recent failed messages for analysis
    const recentFailures = await prisma.message.findMany({
      where: {
        campaignId: params.id,
        status: 'FAILED'
      },
      select: {
        id: true,
        phone: true,
        failReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt,
        totalRecipients: campaign.totalRecipients,
        creditsUsed: campaign.creditsUsed,
        estimatedCost: campaign.estimatedCost,
        actualCost: campaign.actualCost,
      },
      stats,
      metrics: {
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
      },
      hourlyStats,
      recentFailures,
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
