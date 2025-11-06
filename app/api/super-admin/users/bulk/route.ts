

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST bulk user actions
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
    const { userIds, action } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Lista de IDs de usuario requerida' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Acción requerida' },
        { status: 400 }
      );
    }

    // Get users to be modified
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron usuarios válidos' },
        { status: 404 }
      );
    }

    // Prevent modifying super admins or self
    const invalidUsers = users.filter(user => 
      user.role === 'SUPER_ADMIN' || user.email === session.user.email
    );

    if (invalidUsers.length > 0) {
      return NextResponse.json(
        { error: 'No puedes modificar super administradores o tu propia cuenta' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let actionDescription = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        actionDescription = 'Usuarios activados masivamente';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        actionDescription = 'Usuarios desactivados masivamente';
        break;
      case 'make_user':
        updateData = { role: 'USER' };
        actionDescription = 'Rol cambiado a Usuario masivamente';
        break;
      case 'make_admin':
        updateData = { role: 'COMPANY_ADMIN' };
        actionDescription = 'Rol cambiado a Administrador de Empresa masivamente';
        break;
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    // Execute bulk update
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        },
        role: {
          not: 'SUPER_ADMIN' // Extra safety check
        }
      },
      data: updateData
    });

    // Log bulk action
    await prisma.adminLog.create({
      data: {
        action: 'BULK_USER_ACTION',
        entity: 'MULTIPLE_USERS',
        description: actionDescription,
        metadata: {
          action: action,
          userCount: result.count,
          userIds: userIds,
          users: users.map(u => ({
            id: u.id,
            email: u.email,
            name: `${u.firstName} ${u.lastName}`
          }))
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Acción aplicada a ${result.count} usuarios exitosamente`,
      processedCount: result.count,
      action: actionDescription
    });
  } catch (error) {
    console.error('Error in bulk user action:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
