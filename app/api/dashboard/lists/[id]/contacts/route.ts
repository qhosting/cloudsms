
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/lists/[id]/contacts - Get contacts from a specific list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const tags = searchParams.get('tags') || '';

    const skip = (page - 1) * limit;

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

    // Build where clause
    const where: any = {
      contactListId: params.id,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'subscribed') {
      where.subscriptions = {
        some: {
          contactListId: params.id,
          status: 'SUBSCRIBED'
        }
      };
    } else if (status === 'unsubscribed') {
      where.subscriptions = {
        some: {
          contactListId: params.id,
          status: 'UNSUBSCRIBED'
        }
      };
    }

    if (tags) {
      const tagArray = tags.split(',');
      where.tags = {
        hasSome: tagArray
      };
    }

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          subscriptions: {
            where: { contactListId: params.id },
            select: { status: true, subscribedAt: true, unsubscribedAt: true, reason: true }
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where })
    ]);

    return NextResponse.json({
      contacts: contacts.map(contact => ({
        ...contact,
        subscriptionStatus: contact.subscriptions[0]?.status || 'SUBSCRIBED',
        subscriptionDetails: contact.subscriptions[0] || null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching list contacts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/lists/[id]/contacts - Add contacts to list
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
    const { contacts, fromListIds } = body;

    let addedContacts = 0;
    let errors = [];

    if (contacts && Array.isArray(contacts)) {
      // Add individual contacts
      for (const contactData of contacts) {
        try {
          const contact = await prisma.contact.create({
            data: {
              ...contactData,
              contactListId: params.id,
              isValid: true,
              isActive: true
            }
          });

          // Create subscription record
          await prisma.contactSubscription.create({
            data: {
              contactId: contact.id,
              contactListId: params.id,
              status: 'SUBSCRIBED',
              subscribedAt: new Date(),
              source: 'manual'
            }
          });

          // Log activity
          await prisma.contactActivity.create({
            data: {
              contactId: contact.id,
              type: 'LIST_ADDED',
              description: `Added to list: ${list.name}`
            }
          });

          addedContacts++;
        } catch (error: any) {
          errors.push(`Error adding contact ${contactData.phone}: ${error.message || 'Error desconocido'}`);
        }
      }
    }

    if (fromListIds && Array.isArray(fromListIds)) {
      // Copy contacts from other lists
      for (const sourceListId of fromListIds) {
        try {
          const sourceContacts = await prisma.contact.findMany({
            where: {
              contactListId: sourceListId,
              contactList: {
                companyId: session.user.companyId // Ensure same company
              }
            }
          });

          for (const sourceContact of sourceContacts) {
            try {
              // Check if contact already exists (by phone)
              const exists = await prisma.contact.findFirst({
                where: {
                  contactListId: params.id,
                  phone: sourceContact.phone
                }
              });

              if (!exists) {
                const newContact = await prisma.contact.create({
                  data: {
                    firstName: sourceContact.firstName,
                    lastName: sourceContact.lastName,
                    email: sourceContact.email,
                    phone: sourceContact.phone,
                    company: sourceContact.company,
                    jobTitle: sourceContact.jobTitle,
                    city: sourceContact.city,
                    state: sourceContact.state,
                    country: sourceContact.country,
                    zipCode: sourceContact.zipCode,
                    tags: sourceContact.tags,
                    customFields: sourceContact.customFields as any,
                    contactListId: params.id,
                    isValid: sourceContact.isValid,
                    isActive: sourceContact.isActive,
                    score: sourceContact.score
                  }
                });

                // Create subscription record
                await prisma.contactSubscription.create({
                  data: {
                    contactId: newContact.id,
                    contactListId: params.id,
                    status: 'SUBSCRIBED',
                    subscribedAt: new Date(),
                    source: 'copied_from_list'
                  }
                });

                addedContacts++;
              }
            } catch (error: any) {
              errors.push(`Error copying contact ${sourceContact.phone}: ${error.message || 'Error desconocido'}`);
            }
          }
        } catch (error: any) {
          errors.push(`Error processing source list ${sourceListId}: ${error.message || 'Error desconocido'}`);
        }
      }
    }

    // Update list statistics
    await updateListStatistics(params.id);

    return NextResponse.json({
      message: `${addedContacts} contactos agregados exitosamente`,
      addedContacts,
      errors
    });

  } catch (error) {
    console.error('Error adding contacts to list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
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

  const unsubscribedCount = await prisma.contactSubscription.count({
    where: {
      contactListId: listId,
      status: 'UNSUBSCRIBED'
    }
  });

  await prisma.contactList.update({
    where: { id: listId },
    data: {
      totalContacts: totalStats,
      validContacts: validStats,
      subscribedCount,
      unsubscribedCount
    }
  });
}
