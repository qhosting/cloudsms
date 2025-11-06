

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET company details
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

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            campaigns: true,
            contactLists: true,
            transactions: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT update company
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

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      zipCode,
    } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another company
    if (email !== existingCompany.email) {
      const emailExists = await prisma.company.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe una empresa con este email' },
          { status: 400 }
        );
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone: phone || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        zipCode: zipCode || null,
      },
    });

    // Log admin activity
    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_COMPANY',
        entity: params.id,
        description: `Empresa "${name}" actualizada por super administrador`,
        metadata: {
          companyName: name,
          companyEmail: email,
          changes: {
            name: existingCompany.name !== name ? { from: existingCompany.name, to: name } : undefined,
            email: existingCompany.email !== email ? { from: existingCompany.email, to: email } : undefined,
            phone: existingCompany.phone !== (phone || null) ? { from: existingCompany.phone, to: phone || null } : undefined,
            website: existingCompany.website !== (website || null) ? { from: existingCompany.website, to: website || null } : undefined,
          }
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE company
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

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      select: { name: true, email: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: params.id },
    });

    // Log admin activity
    await prisma.adminLog.create({
      data: {
        action: 'DELETE_COMPANY',
        entity: params.id,
        description: `Empresa "${company.name}" eliminada por super administrador`,
        metadata: {
          companyName: company.name,
          companyEmail: company.email,
        },
        adminId: adminUser.id,
        adminEmail: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Empresa eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
