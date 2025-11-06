

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Get campaign by ID
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
      },
      include: {
        contactList: {
          select: {
            id: true,
            name: true,
            totalContacts: true,
            validContacts: true,
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            content: true,
            variables: true,
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
        company: {
          select: {
            id: true,
            name: true,
            credits: true,
          }
        },
        messages: {
          select: {
            id: true,
            status: true,
            phone: true,
            sentAt: true,
            deliveredAt: true,
            failReason: true,
            creditsUsed: true,
          },
          take: 100, // Limit for performance
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            messages: true,
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Update campaign
export async function PUT(
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

    // Can only edit draft and scheduled campaigns
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden editar campañas en borrador o programadas' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      message,
      type,
      targetType,
      contactListId,
      scheduledAt,
      timezone,
      templateId,
    } = body;

    // Validation
    if (name && !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la campaña no puede estar vacío' },
        { status: 400 }
      );
    }

    if (message && !message.trim()) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
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

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (message !== undefined) updateData.message = message.trim();
    if (type !== undefined) updateData.type = type;
    if (targetType !== undefined) updateData.targetType = targetType;
    if (contactListId !== undefined) updateData.contactListId = contactListId;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (templateId !== undefined) updateData.templateId = templateId;

    // Recalculate recipients if target changed
    if (targetType !== undefined || contactListId !== undefined) {
      let totalRecipients = 0;
      const finalTargetType = targetType || campaign.targetType;
      const finalContactListId = contactListId !== undefined ? contactListId : campaign.contactListId;

      if (finalTargetType === 'LIST' && finalContactListId) {
        const contactList = await prisma.contactList.findUnique({
          where: { id: finalContactListId },
          select: { validContacts: true }
        });
        totalRecipients = contactList?.validContacts || 0;
      } else if (finalTargetType === 'ALL_CONTACTS') {
        const contactLists = await prisma.contactList.findMany({
          where: { companyId: user.companyId },
          select: { validContacts: true }
        });
        totalRecipients = contactLists.reduce((sum, list) => sum + list.validContacts, 0);
      }

      updateData.totalRecipients = totalRecipients;
      updateData.estimatedCost = totalRecipients * 1; // 1 credit per SMS
    }

    // Update status based on type
    if (type !== undefined) {
      updateData.status = type === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT';
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
      include: {
        contactList: {
          select: {
            id: true,
            name: true,
            totalContacts: true,
            validContacts: true,
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

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(
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

    // Can only delete draft campaigns
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar campañas en borrador' },
        { status: 400 }
      );
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
