

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
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
      // Company data
      companyName,
      companyEmail,
      companyPhone,
      companyWebsite,
      initialCredits,
      
      // Admin user data
      firstName,
      lastName,
      email,
      password,
      jobTitle,
    } = body;

    // Validation
    if (!companyName || !companyEmail || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Ya existe una empresa registrada con este correo electrónico' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario registrado con este correo electrónico' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const credits = parseInt(initialCredits) || 100;

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone,
          website: companyWebsite,
          credits,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          jobTitle,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
      });

      // Create initial credit transaction
      if (credits > 0) {
        await tx.creditTransaction.create({
          data: {
            type: 'PURCHASE',
            amount: credits,
            balance: credits,
            description: 'Créditos iniciales asignados por super administrador',
            companyId: company.id,
          },
        });
      }

      // Log admin activity
      await tx.adminLog.create({
        data: {
          action: 'CREATE_COMPANY',
          entity: company.id,
          description: `Empresa "${companyName}" creada por super administrador`,
          metadata: {
            companyName,
            companyEmail,
            adminEmail: email,
            initialCredits: credits
          },
          adminId: adminUser.id,
          adminEmail: adminUser.email,
        },
      });

      return { company, user };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Empresa creada exitosamente',
        companyId: result.company.id,
        userId: result.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
