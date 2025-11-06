

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// POST start impersonation
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
        { error: 'Solo super administradores pueden usar impersonación' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Don't allow impersonating other super admins
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No puedes impersonar a otros super administradores' },
        { status: 403 }
      );
    }

    // Only allow impersonating active users
    if (!targetUser.isActive) {
      return NextResponse.json(
        { error: 'No puedes impersonar usuarios inactivos' },
        { status: 400 }
      );
    }

    // Create impersonation token
    const impersonationData = {
      originalUserId: adminUser.id,
      originalUserEmail: adminUser.email,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      startedAt: new Date().toISOString(),
    };

    const impersonationToken = jwt.sign(
      impersonationData,
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '8h' }
    );

    // Log impersonation start
    await prisma.adminLog.create({
      data: {
        action: 'START_IMPERSONATION',
        entity: targetUser.id,
        description: `Super admin inició impersonación de usuario "${targetUser.firstName} ${targetUser.lastName}"`,
        metadata: {
          targetUserEmail: targetUser.email,
          targetUserRole: targetUser.role,
          targetCompanyId: targetUser.companyId,
          impersonationToken: impersonationToken.slice(-10) // Last 10 chars for identification
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    // Set impersonation cookie
    const response = NextResponse.json({
      success: true,
      message: `Impersonando a ${targetUser.firstName} ${targetUser.lastName}`,
      targetUser: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role,
        company: targetUser.company
      }
    });

    // Set httpOnly cookie for impersonation
    response.cookies.set('impersonation', impersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error starting impersonation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE end impersonation
export async function DELETE(request: NextRequest) {
  try {
    const impersonationToken = request.cookies.get('impersonation')?.value;

    if (!impersonationToken) {
      return NextResponse.json(
        { error: 'No hay sesión de impersonación activa' },
        { status: 400 }
      );
    }

    let impersonationData;
    try {
      impersonationData = jwt.verify(impersonationToken, process.env.NEXTAUTH_SECRET!) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token de impersonación inválido' },
        { status: 401 }
      );
    }

    // Log impersonation end
    await prisma.adminLog.create({
      data: {
        action: 'END_IMPERSONATION',
        entity: impersonationData.targetUserId,
        description: `Super admin finalizó impersonación de usuario "${impersonationData.targetUserEmail}"`,
        metadata: {
          targetUserEmail: impersonationData.targetUserEmail,
          duration: Math.round((Date.now() - new Date(impersonationData.startedAt).getTime()) / 1000 / 60) + ' minutos'
        },
        adminId: impersonationData.originalUserId,
        adminEmail: impersonationData.originalUserEmail,
      },
    });

    // Clear impersonation cookie
    const response = NextResponse.json({
      success: true,
      message: 'Impersonación finalizada exitosamente'
    });

    response.cookies.set('impersonation', '', {
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
