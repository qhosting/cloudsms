
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSMSViaLabMobile } from '@/lib/sms-sender';

export const dynamic = 'force-dynamic';

// POST - Send campaign immediately
export async function POST(
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
      include: { company: true }
    });

    if (!user || !user.companyId || !user.company) {
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
          include: {
            contacts: {
              where: { isValid: true }
            }
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

    // Can only send draft or scheduled campaigns
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden enviar campañas en borrador o programadas' },
        { status: 400 }
      );
    }

    // Check if company has enough credits
    if (user.company.credits < campaign.estimatedCost) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para enviar esta campaña' },
        { status: 400 }
      );
    }

    // Get target contacts
    let contacts: any[] = [];
    
    if (campaign.targetType === 'LIST' && campaign.contactList) {
      contacts = campaign.contactList.contacts;
    } else if (campaign.targetType === 'ALL_CONTACTS') {
      // Get all contacts from all lists of the company
      const allContactLists = await prisma.contactList.findMany({
        where: { companyId: user.companyId },
        include: {
          contacts: {
            where: { isValid: true }
          }
        }
      });
      
      // Flatten and deduplicate by phone number
      const phoneSet = new Set();
      contacts = allContactLists
        .flatMap(list => list.contacts)
        .filter(contact => {
          if (phoneSet.has(contact.phone)) {
            return false;
          }
          phoneSet.add(contact.phone);
          return true;
        });
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No hay contactos válidos para enviar' },
        { status: 400 }
      );
    }

    // Start transaction to update campaign and create messages
    await prisma.$transaction(async (tx) => {
      // Update campaign status
      await tx.campaign.update({
        where: { id: params.id },
        data: {
          status: 'SENDING',
          startedAt: new Date(),
          totalRecipients: contacts.length,
        }
      });

      // Create message records for each contact
      const messageData = contacts.map(contact => {
        // Replace variables in message
        let personalizedMessage = campaign.message;
        if (contact.firstName) {
          personalizedMessage = personalizedMessage.replace(/\{firstName\}/g, contact.firstName);
        }
        if (contact.lastName) {
          personalizedMessage = personalizedMessage.replace(/\{lastName\}/g, contact.lastName);
        }
        if (contact.company) {
          personalizedMessage = personalizedMessage.replace(/\{company\}/g, contact.company);
        }
        
        return {
          phone: contact.phone,
          message: personalizedMessage,
          campaignId: params.id,
          contactId: contact.id,
          status: 'PENDING' as const,
          creditsUsed: 1,
        };
      });

      // Create messages in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < messageData.length; i += batchSize) {
        const batch = messageData.slice(i, i + batchSize);
        await tx.message.createMany({
          data: batch,
        });
      }

      // Deduct credits from company
      await tx.company.update({
        where: { id: user.companyId! },
        data: {
          credits: {
            decrement: contacts.length
          }
        }
      });

      // Create credit transaction
      await tx.creditTransaction.create({
        data: {
          type: 'USAGE',
          amount: -contacts.length,
          balance: user.company!.credits - contacts.length,
          description: `Envío de campaña: ${campaign.name}`,
          reference: params.id,
          companyId: user.companyId!,
        }
      });
    });

    // Enviar SMS reales a través de LabMobile (no más simulación)
    // Ejecutar en segundo plano
    setImmediate(async () => {
      try {
        const result = await sendSMSViaLabMobile(params.id, user.companyId!);
        
        if (!result.success) {
          console.error('Error sending SMS via LabMobile:', result.errors);
        } else {
          console.log(`SMS campaign sent: ${result.sentCount} sent, ${result.failedCount} failed`);
        }
      } catch (error) {
        console.error('Error in SMS sending background task:', error);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Campaña enviada exitosamente',
      totalMessages: contacts.length
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
