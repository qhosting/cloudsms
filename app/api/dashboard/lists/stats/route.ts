
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/lists/stats - Get lists statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get basic list counts
    const listStats = await prisma.contactList.groupBy({
      by: ['type'],
      where: { companyId: session.user.companyId },
      _count: { type: true },
      _sum: { 
        totalContacts: true,
        subscribedCount: true 
      }
    });

    // Get total lists
    const totalLists = await prisma.contactList.count({
      where: { companyId: session.user.companyId }
    });

    // Calculate aggregated stats
    let totalContacts = 0;
    let totalSubscribed = 0;
    let staticLists = 0;
    let dynamicLists = 0;
    let segmentedLists = 0;
    let importedLists = 0;

    listStats.forEach(stat => {
      totalContacts += stat._sum.totalContacts || 0;
      totalSubscribed += stat._sum.subscribedCount || 0;
      
      switch (stat.type) {
        case 'STATIC':
          staticLists = stat._count.type;
          break;
        case 'DYNAMIC':
          dynamicLists = stat._count.type;
          break;
        case 'SEGMENT':
          segmentedLists = stat._count.type;
          break;
        case 'IMPORTED':
          importedLists = stat._count.type;
          break;
      }
    });

    // Calculate average list size
    const averageListSize = totalLists > 0 ? totalContacts / totalLists : 0;

    // Calculate subscription rate
    const subscriptionRate = totalContacts > 0 ? (totalSubscribed / totalContacts) * 100 : 0;

    return NextResponse.json({
      totalLists,
      totalContacts,
      totalSubscribed,
      staticLists,
      dynamicLists,
      segmentedLists,
      importedLists,
      averageListSize,
      subscriptionRate
    });

  } catch (error) {
    console.error('Error fetching lists stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
