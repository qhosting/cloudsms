

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET user details
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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            createdCampaigns: true,
            createdContactLists: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT update user
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      isActive,
      companyId,
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

    // Validate role and company
    if (role === 'COMPANY_ADMIN' && !companyId) {
      return NextResponse.json(
        { error: 'Los administradores de empresa deben tener una empresa asignada' },
        { status: 400 }
      );
    }

    if (role === 'SUPER_ADMIN' && companyId) {
      return NextResponse.json(
        { error: 'Los super administradores no pueden tener empresa asignada' },
        { status: 400 }
      );
    }

    // Validate company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Empresa no encontrada' },
          { status: 400 }
        );
      }
    }

    // Prevent modifying yourself if changing critical settings
    if (existingUser.email === session.user.email) {
      if (role !== 'SUPER_ADMIN' || !isActive) {
        return NextResponse.json(
          { error: 'No puedes modificar tu propio rol o desactivarte' },
          { status: 400 }
        );
      }
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
        companyId: companyId || null,
      },
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

    // Log admin activity
    const changes: any = {};
    if (existingUser.firstName !== firstName) changes.firstName = { from: existingUser.firstName, to: firstName };
    if (existingUser.lastName !== lastName) changes.lastName = { from: existingUser.lastName, to: lastName };
    if (existingUser.email !== email) changes.email = { from: existingUser.email, to: email };
    if (existingUser.role !== role) changes.role = { from: existingUser.role, to: role };
    if (existingUser.isActive !== isActive) changes.isActive = { from: existingUser.isActive, to: isActive };
    if (existingUser.companyId !== (companyId || null)) changes.companyId = { from: existingUser.companyId, to: companyId || null };

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_USER',
        entity: params.id,
        description: `Usuario "${firstName} ${lastName}" actualizado por super administrador`,
        metadata: {
          userEmail: email,
          changes
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE user
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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Delete user (this will cascade to related records based on schema)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Log admin activity
    await prisma.adminLog.create({
      data: {
        action: 'DELETE_USER',
        entity: params.id,
        description: `Usuario "${user.firstName} ${user.lastName}" eliminado por super administrador`,
        metadata: {
          userEmail: user.email,
          userRole: user.role,
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
