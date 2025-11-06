

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verify super admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      sms_price,
      whatsapp_price,
      default_credits,
      max_daily_messages,
      labsmobile_api_key,
      evolution_api_url,
      system_email,
    } = body;

    // Define the configs to update
    const configs = [
      { key: 'sms_price', value: sms_price, description: 'Precio por SMS en MXN' },
      { key: 'whatsapp_price', value: whatsapp_price, description: 'Precio por mensaje de WhatsApp en MXN' },
      { key: 'default_credits', value: default_credits, description: 'Créditos asignados por defecto a nuevas empresas' },
      { key: 'max_daily_messages', value: max_daily_messages, description: 'Máximo de mensajes por día por empresa' },
      { key: 'labsmobile_api_key', value: labsmobile_api_key, description: 'API Key de LabsMobile para SMS' },
      { key: 'evolution_api_url', value: evolution_api_url, description: 'URL de Evolution API para WhatsApp' },
      { key: 'system_email', value: system_email, description: 'Email del sistema para notificaciones' },
    ];

    // Update or create each configuration
    await Promise.all(
      configs.map(async (config) => {
        await prisma.systemConfig.upsert({
          where: { key: config.key },
          update: { 
            value: config.value,
            description: config.description 
          },
          create: {
            key: config.key,
            value: config.value,
            description: config.description,
          },
        });
      })
    );

    // Log admin activity
    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_SYSTEM_CONFIG',
        description: 'Configuración del sistema actualizada',
        metadata: {
          configs: configs.map(c => ({ key: c.key, value: c.value }))
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
