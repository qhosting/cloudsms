

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST reset user password
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

    // Verify super admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Solo super administradores pueden resetear contraseñas' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Don't allow resetting other super admin passwords
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No puedes cambiar la contraseña de otros super administradores' },
        { status: 403 }
      );
    }

    // Prevent resetting your own password (use profile settings instead)
    if (targetUser.email === session.user.email) {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propia contraseña desde aquí. Usa la configuración de perfil.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    // Validation
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Nueva contraseña requerida' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'La contraseña es demasiado larga' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: params.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Log password reset action
    await prisma.adminLog.create({
      data: {
        action: 'RESET_USER_PASSWORD',
        entity: params.id,
        description: `Super admin reseteo la contraseña del usuario "${targetUser.firstName} ${targetUser.lastName}"`,
        metadata: {
          targetUserEmail: targetUser.email,
          targetUserRole: targetUser.role,
          targetUserActive: targetUser.isActive,
          passwordLength: newPassword.length
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Contraseña actualizada exitosamente para ${targetUser.firstName} ${targetUser.lastName}`,
      user: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
