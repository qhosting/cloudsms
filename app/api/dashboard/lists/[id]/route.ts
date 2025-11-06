
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/lists/[id] - Get specific list details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const list = await prisma.contactList.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true }
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit for performance
          include: {
            subscriptions: {
              where: { contactListId: params.id }
            }
          }
        },
        subscriptions: {
          include: {
            contact: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        },
        _count: {
          select: {
            contacts: true,
            subscriptions: {
              where: { status: 'SUBSCRIBED' }
            }
          }
        }
      }
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      );
    }

    // Calculate additional statistics
    const subscribedContacts = list._count.subscriptions;
    const unsubscribedContacts = await prisma.contactSubscription.count({
      where: {
        contactListId: params.id,
        status: 'UNSUBSCRIBED'
      }
    });

    const recentActivity = await prisma.contactActivity.findMany({
      where: {
        contact: {
          contactListId: params.id
        }
      },
      include: {
        contact: {
          select: { firstName: true, lastName: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      ...list,
      subscribedContacts,
      unsubscribedContacts,
      recentActivity,
      _count: undefined
    });

  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/lists/[id] - Update list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      tags,
      color,
      allowAutoUpdate,
      segmentCriteria,
      isActive
    } = body;

    // Check if list exists and belongs to company
    const existingList = await prisma.contactList.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    });

    if (!existingList) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== existingList.name) {
      const nameExists = await prisma.contactList.findFirst({
        where: {
          companyId: session.user.companyId,
          name: name.trim(),
          id: { not: params.id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe una lista con este nombre' },
          { status: 400 }
        );
      }
    }

    // Update the list
    const updatedList = await prisma.contactList.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(tags && { tags }),
        ...(color !== undefined && { color }),
        ...(allowAutoUpdate !== undefined && { allowAutoUpdate }),
        ...(segmentCriteria !== undefined && { segmentCriteria }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // If segmentation criteria changed and it's a dynamic list, re-apply segmentation
    if (segmentCriteria && existingList.type === 'DYNAMIC') {
      await reapplyDynamicSegmentation(params.id, segmentCriteria, session.user.companyId);
    }

    return NextResponse.json(updatedList);

  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/lists/[id] - Delete list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if list exists and belongs to company
    const existingList = await prisma.contactList.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    });

    if (!existingList) {
      return NextResponse.json(
        { error: 'Lista no encontrada' },
        { status: 404 }
      );
    }

    // Check if list is being used in any active campaigns
    const activeCampaigns = await prisma.campaign.count({
      where: {
        contactListId: params.id,
        status: { in: ['DRAFT', 'SCHEDULED', 'SENDING'] }
      }
    });

    if (activeCampaigns > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una lista que está siendo usada en campañas activas' },
        { status: 400 }
      );
    }

    // Delete the list (cascading deletes will handle related records)
    await prisma.contactList.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Lista eliminada exitosamente' });

  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to re-apply dynamic segmentation
async function reapplyDynamicSegmentation(
  listId: string,
  criteria: any,
  companyId: string
) {
  // Clear existing contacts
  await prisma.contact.deleteMany({
    where: { contactListId: listId }
  });

  // Get all contacts from the company
  const allContacts = await prisma.contact.findMany({
    where: {
      contactList: {
        companyId
      }
    }
  });

  // Apply filtering based on criteria
  const matchingContacts = applyContactFilters(allContacts, criteria);

  // Add matching contacts to the list
  for (const contact of matchingContacts) {
    try {
      await prisma.contact.create({
        data: {
          ...contact,
          id: undefined, // Generate new ID
          contactListId: listId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.warn(`Could not add contact ${contact.phone}:`, error);
    }
  }

  // Update list statistics
  await updateListStatistics(listId);
}

// Helper function to apply contact filters (imported from main route)
function applyContactFilters(contacts: any[], criteria: any): any[] {
  if (!criteria) return contacts;

  return contacts.filter(contact => {
    for (const rule of criteria.rules || []) {
      const { field, operator, value } = rule;
      const contactValue = getContactFieldValue(contact, field);

      if (!matchesRule(contactValue, operator, value)) {
        return false;
      }
    }
    return true;
  });
}

function getContactFieldValue(contact: any, field: string): any {
  const fieldMap: Record<string, any> = {
    'firstName': contact.firstName,
    'lastName': contact.lastName,
    'email': contact.email,
    'phone': contact.phone,
    'company': contact.company,
    'city': contact.city,
    'state': contact.state,
    'country': contact.country,
    'tags': contact.tags,
    'score': contact.score,
    'messageCount': contact.messageCount,
    'lastMessageAt': contact.lastMessageAt,
    'createdAt': contact.createdAt
  };

  return fieldMap[field] || null;
}

function matchesRule(contactValue: any, operator: string, ruleValue: any): boolean {
  switch (operator) {
    case 'equals':
      return contactValue === ruleValue;
    case 'not_equals':
      return contactValue !== ruleValue;
    case 'contains':
      return contactValue?.toString().toLowerCase().includes(ruleValue.toLowerCase());
    case 'not_contains':
      return !contactValue?.toString().toLowerCase().includes(ruleValue.toLowerCase());
    case 'starts_with':
      return contactValue?.toString().toLowerCase().startsWith(ruleValue.toLowerCase());
    case 'ends_with':
      return contactValue?.toString().toLowerCase().endsWith(ruleValue.toLowerCase());
    case 'greater_than':
      return Number(contactValue) > Number(ruleValue);
    case 'less_than':
      return Number(contactValue) < Number(ruleValue);
    case 'greater_equal':
      return Number(contactValue) >= Number(ruleValue);
    case 'less_equal':
      return Number(contactValue) <= Number(ruleValue);
    case 'in':
      return Array.isArray(ruleValue) && ruleValue.includes(contactValue);
    case 'not_in':
      return Array.isArray(ruleValue) && !ruleValue.includes(contactValue);
    case 'has_tag':
      return Array.isArray(contactValue) && contactValue.includes(ruleValue);
    case 'not_has_tag':
      return !Array.isArray(contactValue) || !contactValue.includes(ruleValue);
    default:
      return false;
  }
}

async function updateListStatistics(listId: string) {
  const [totalStats, validStats] = await Promise.all([
    prisma.contact.count({
      where: { contactListId: listId }
    }),
    prisma.contact.count({
      where: { 
        contactListId: listId,
        isValid: true 
      }
    })
  ]);

  const subscribedCount = await prisma.contactSubscription.count({
    where: {
      contactListId: listId,
      status: 'SUBSCRIBED'
    }
  });

  await prisma.contactList.update({
    where: { id: listId },
    data: {
      totalContacts: totalStats,
      validContacts: validStats,
      subscribedCount
    }
  });
}
