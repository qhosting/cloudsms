
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/lists/[id]/subscriptions - Get subscription analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify list belongs to company
    const list = await prisma.contactList.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      );
    }

    // Get subscription statistics
    const subscriptionStats = await prisma.contactSubscription.groupBy({
      by: ['status'],
      where: { contactListId: params.id },
      _count: { status: true }
    });

    const totalSubscriptions = subscriptionStats.reduce((acc, stat) => acc + stat._count.status, 0);

    // Get recent subscription activities
    const recentSubscriptions = await prisma.contactSubscription.findMany({
      where: { contactListId: params.id },
      include: {
        contact: {
          select: { firstName: true, lastName: true, phone: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    // Get unsubscription reasons
    const unsubscribeReasons = await prisma.contactSubscription.groupBy({
      by: ['reason'],
      where: {
        contactListId: params.id,
        status: 'UNSUBSCRIBED',
        reason: { not: null }
      },
      _count: { reason: true }
    });

    // Calculate subscription rate over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const subscriptionTrend = await prisma.contactSubscription.findMany({
      where: {
        contactListId: params.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        status: true,
        createdAt: true,
        subscribedAt: true,
        unsubscribedAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format statistics
    const stats = {
      total: totalSubscriptions,
      subscribed: subscriptionStats.find(s => s.status === 'SUBSCRIBED')?._count.status || 0,
      unsubscribed: subscriptionStats.find(s => s.status === 'UNSUBSCRIBED')?._count.status || 0,
      pending: subscriptionStats.find(s => s.status === 'PENDING')?._count.status || 0,
      bounced: subscriptionStats.find(s => s.status === 'BOUNCED')?._count.status || 0,
      complained: subscriptionStats.find(s => s.status === 'COMPLAINED')?._count.status || 0
    };

    return NextResponse.json({
      stats,
      recentSubscriptions,
      unsubscribeReasons,
      subscriptionTrend,
      list: {
        id: list.id,
        name: list.name,
        type: list.type
      }
    });

  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/lists/[id]/subscriptions - Bulk update subscriptions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify list belongs to company
    const list = await prisma.contactList.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, contactIds, reason, source } = body;

    if (!action || !['subscribe', 'unsubscribe', 'resubscribe'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida' },
        { status: 400 }
      );
    }

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de contactos requeridos' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const errors = [];

    for (const contactId of contactIds) {
      try {
        // Verify contact belongs to the list
        const contact = await prisma.contact.findFirst({
          where: {
            id: contactId,
            contactListId: params.id
          }
        });

        if (!contact) {
          errors.push(`Contacto ${contactId} no encontrado en la lista`);
          continue;
        }

        // Get or create subscription record
        let subscription = await prisma.contactSubscription.findUnique({
          where: {
            contactId_contactListId: {
              contactId,
              contactListId: params.id
            }
          }
        });

        const now = new Date();

        if (!subscription) {
          // Create new subscription record
          subscription = await prisma.contactSubscription.create({
            data: {
              contactId,
              contactListId: params.id,
              status: action === 'subscribe' ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
              subscribedAt: action === 'subscribe' ? now : null,
              unsubscribedAt: action === 'unsubscribe' ? now : null,
              reason: action === 'unsubscribe' ? reason : null,
              source: source || 'manual'
            }
          });
        } else {
          // Update existing subscription
          const updateData: any = {
            updatedAt: now
          };

          if (action === 'subscribe' || action === 'resubscribe') {
            updateData.status = 'SUBSCRIBED';
            updateData.subscribedAt = now;
            updateData.unsubscribedAt = null;
            updateData.reason = null;
          } else if (action === 'unsubscribe') {
            updateData.status = 'UNSUBSCRIBED';
            updateData.unsubscribedAt = now;
            updateData.reason = reason;
          }

          subscription = await prisma.contactSubscription.update({
            where: { id: subscription.id },
            data: updateData
          });
        }

        // Log activity
        await prisma.contactActivity.create({
          data: {
            contactId,
            type: action === 'unsubscribe' ? 'UNSUBSCRIBED' : 'SUBSCRIBED',
            description: `${action === 'unsubscribe' ? 'Unsubscribed from' : 'Subscribed to'} list: ${list.name}`,
            metadata: {
              listId: params.id,
              listName: list.name,
              reason: reason || null,
              source: source || 'manual'
            }
          }
        });

        updatedCount++;
      } catch (error: any) {
        console.error(`Error updating subscription for contact ${contactId}:`, error);
        errors.push(`Error actualizando contacto ${contactId}: ${error.message || 'Error desconocido'}`);
      }
    }

    // Update list statistics
    await updateListStatistics(params.id);

    return NextResponse.json({
      message: `${updatedCount} suscripciones actualizadas exitosamente`,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error updating subscriptions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to update list statistics
async function updateListStatistics(listId: string) {
  const subscribedCount = await prisma.contactSubscription.count({
    where: {
      contactListId: listId,
      status: 'SUBSCRIBED'
    }
  });

  const unsubscribedCount = await prisma.contactSubscription.count({
    where: {
      contactListId: listId,
      status: 'UNSUBSCRIBED'
    }
  });

  await prisma.contactList.update({
    where: { id: listId },
    data: {
      subscribedCount,
      unsubscribedCount
    }
  });
}
