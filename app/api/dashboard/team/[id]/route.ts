

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT update team member
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

    // Verify company admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'COMPANY_ADMIN' || !adminUser.companyId) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores de empresa pueden editar usuarios.' },
        { status: 403 }
      );
    }

    // Check if team member exists and belongs to the same company
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (existingUser.companyId !== adminUser.companyId) {
      return NextResponse.json(
        { error: 'No puedes editar usuarios de otra empresa' },
        { status: 403 }
      );
    }

    // Prevent editing yourself (should use profile settings instead)
    if (existingUser.id === adminUser.id) {
      return NextResponse.json(
        { error: 'No puedes editarte a ti mismo desde esta sección' },
        { status: 400 }
      );
    }

    // Prevent editing super admins
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No puedes editar super administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      isActive,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'Nombre, apellido, email y rol son requeridos' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        );
      }
    }

    // Only allow USER and COMPANY_ADMIN roles for team members
    if (!['USER', 'COMPANY_ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol no válido para miembros de equipo' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        role,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE team member
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

    // Verify company admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'COMPANY_ADMIN' || !adminUser.companyId) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores de empresa pueden eliminar usuarios.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true,
        role: true,
        companyId: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.companyId !== adminUser.companyId) {
      return NextResponse.json(
        { error: 'No puedes eliminar usuarios de otra empresa' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (user.id === adminUser.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Prevent deleting super admins
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No puedes eliminar super administradores' },
        { status: 403 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
