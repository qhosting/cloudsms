
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/lists - Get all lists for a company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      companyId: session.user.companyId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    // Get lists with pagination
    const [lists, total] = await Promise.all([
      prisma.contactList.findMany({
        where,
        include: {
          createdBy: {
            select: { firstName: true, lastName: true, email: true }
          },
          _count: {
            select: {
              contacts: true,
              subscriptions: {
                where: { status: 'SUBSCRIBED' }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.contactList.count({ where })
    ]);

    return NextResponse.json({
      lists: lists.map(list => ({
        ...list,
        subscribedContacts: list._count.subscriptions,
        totalContacts: list._count.contacts,
        _count: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/lists - Create a new list
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type = 'STATIC',
      segmentCriteria,
      tags = [],
      color,
      allowAutoUpdate = false,
      sourceListIds = []
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la lista es requerido' },
        { status: 400 }
      );
    }

    // Check if name already exists for this company
    const existingList = await prisma.contactList.findFirst({
      where: {
        companyId: session.user.companyId,
        name: name.trim()
      }
    });

    if (existingList) {
      return NextResponse.json(
        { error: 'Ya existe una lista con este nombre' },
        { status: 400 }
      );
    }

    // Create the list
    const newList = await prisma.contactList.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        type,
        segmentCriteria: segmentCriteria || null,
        tags,
        color,
        allowAutoUpdate: type === 'DYNAMIC' ? allowAutoUpdate : false,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // If this is a segment from other lists, copy contacts
    if (type === 'SEGMENT' && sourceListIds.length > 0) {
      await copyContactsFromLists(newList.id, sourceListIds, segmentCriteria);
    }

    // If this is a dynamic list, apply initial segmentation
    if (type === 'DYNAMIC' && segmentCriteria) {
      await applyDynamicSegmentation(newList.id, segmentCriteria, session.user.companyId);
    }

    return NextResponse.json(newList, { status: 201 });

  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to copy contacts from source lists based on criteria
async function copyContactsFromLists(
  targetListId: string,
  sourceListIds: string[],
  criteria: any
) {
  // Implementation would depend on the specific criteria format
  // For now, copy all contacts from source lists
  const contacts = await prisma.contact.findMany({
    where: {
      contactListId: { in: sourceListIds }
    }
  });

  // Apply filtering based on criteria if provided
  let filteredContacts = contacts;
  if (criteria) {
    filteredContacts = applyContactFilters(contacts, criteria);
  }

  // Create contacts in the new list
  for (const contact of filteredContacts) {
    try {
      await prisma.contact.create({
        data: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.jobTitle,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          zipCode: contact.zipCode,
          birthDate: contact.birthDate,
          gender: contact.gender,
          tags: contact.tags,
          customFields: contact.customFields as any,
          isValid: contact.isValid,
          isActive: contact.isActive,
          score: contact.score,
          messageCount: contact.messageCount,
          campaignCount: contact.campaignCount,
          lastMessageAt: contact.lastMessageAt,
          lastOpenedAt: contact.lastOpenedAt,
          contactListId: targetListId
        }
      });
    } catch (error) {
      // Handle duplicate contacts gracefully
      console.warn(`Could not copy contact ${contact.phone}:`, error);
    }
  }

  // Update list statistics
  await updateListStatistics(targetListId);
}

// Helper function to apply dynamic segmentation
async function applyDynamicSegmentation(
  listId: string,
  criteria: any,
  companyId: string
) {
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

  // Add matching contacts to the dynamic list
  for (const contact of matchingContacts) {
    try {
      await prisma.contact.create({
        data: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.jobTitle,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          zipCode: contact.zipCode,
          birthDate: contact.birthDate,
          gender: contact.gender,
          tags: contact.tags,
          customFields: contact.customFields as any,
          isValid: contact.isValid,
          isActive: contact.isActive,
          score: contact.score,
          messageCount: contact.messageCount,
          campaignCount: contact.campaignCount,
          lastMessageAt: contact.lastMessageAt,
          lastOpenedAt: contact.lastOpenedAt,
          contactListId: listId
        }
      });
    } catch (error) {
      // Handle duplicates gracefully
      console.warn(`Could not add contact ${contact.phone} to dynamic list:`, error);
    }
  }

  // Update list statistics
  await updateListStatistics(listId);
}

// Helper function to apply contact filters based on criteria
function applyContactFilters(contacts: any[], criteria: any): any[] {
  if (!criteria) return contacts;

  return contacts.filter(contact => {
    // Apply each criteria rule
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

// Helper function to get contact field value
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

// Helper function to check if a value matches a rule
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

// Helper function to update list statistics
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
