

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all templates for the user's company
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {
      companyId: user.companyId,
      isActive: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            campaigns: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, content, category = 'general', variables = [] } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la plantilla es requerido' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'El contenido de la plantilla es requerido' },
        { status: 400 }
      );
    }

    // Check for duplicate name in company
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        name: name.trim(),
        companyId: user.companyId,
        isActive: true,
      }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Ya existe una plantilla con este nombre' },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name: name.trim(),
        content: content.trim(),
        category: category.trim(),
        variables: Array.isArray(variables) ? variables : [],
        companyId: user.companyId,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
