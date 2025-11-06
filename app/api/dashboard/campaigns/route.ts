

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all campaigns for the user's company
export async function GET(request: NextRequest) {
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
      include: { company: true }
    });

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: 'Usuario no tiene empresa asociada' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      companyId: user.companyId,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get campaigns with pagination
    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          contactList: {
            select: {
              id: true,
              name: true,
              totalContacts: true,
            }
          },
          template: {
            select: {
              id: true,
              name: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          _count: {
            select: {
              messages: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
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
      include: { company: true }
    });

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: 'Usuario no tiene empresa asociada' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      message,
      type = 'IMMEDIATE',
      targetType = 'LIST',
      contactListId,
      scheduledAt,
      timezone = 'America/Mexico_City',
      templateId,
    } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la campaña es requerido' },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'El mensaje es requerido' },
        { status: 400 }
      );
    }

    if (targetType === 'LIST' && !contactListId) {
      return NextResponse.json(
        { error: 'Lista de contactos requerida para este tipo de campaña' },
        { status: 400 }
      );
    }

    if (type === 'SCHEDULED' && !scheduledAt) {
      return NextResponse.json(
        { error: 'Fecha de programación requerida' },
        { status: 400 }
      );
    }

    // Verify contact list belongs to company
    if (contactListId) {
      const contactList = await prisma.contactList.findFirst({
        where: {
          id: contactListId,
          companyId: user.companyId,
        }
      });

      if (!contactList) {
        return NextResponse.json(
          { error: 'Lista de contactos no encontrada' },
          { status: 404 }
        );
      }
    }

    // Calculate recipients count
    let totalRecipients = 0;
    if (targetType === 'LIST' && contactListId) {
      const contactList = await prisma.contactList.findUnique({
        where: { id: contactListId },
        select: { validContacts: true }
      });
      totalRecipients = contactList?.validContacts || 0;
    } else if (targetType === 'ALL_CONTACTS') {
      const contactLists = await prisma.contactList.findMany({
        where: { companyId: user.companyId },
        select: { validContacts: true }
      });
      totalRecipients = contactLists.reduce((sum, list) => sum + list.validContacts, 0);
    }

    // Calculate estimated cost (assuming 1 credit per SMS)
    const estimatedCost = totalRecipients * 1;

    // Check if company has enough credits
    if (user.company && user.company.credits < estimatedCost) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para enviar esta campaña' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        message: message.trim(),
        type,
        targetType,
        contactListId: contactListId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        timezone,
        templateId: templateId || null,
        totalRecipients,
        estimatedCost,
        companyId: user.companyId,
        createdById: user.id,
        status: type === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
      },
      include: {
        contactList: {
          select: {
            id: true,
            name: true,
            totalContacts: true,
          }
        },
        template: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
