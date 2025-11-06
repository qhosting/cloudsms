

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    let { type, amount, description } = body;

    // Validation
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Tipo, cantidad y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Parse and validate amount
    let numAmount = parseInt(amount);
    if (isNaN(numAmount)) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número válido' },
        { status: 400 }
      );
    }

    // Handle different transaction types
    let finalAmount = numAmount;
    switch (type) {
      case 'PURCHASE':
      case 'REFUND':
        finalAmount = Math.abs(numAmount); // Always positive
        break;
      case 'USAGE':
        finalAmount = -Math.abs(numAmount); // Always negative
        break;
      case 'ADJUSTMENT':
        // Keep the sign as provided by user (can be positive or negative)
        finalAmount = numAmount;
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de transacción no válido' },
          { status: 400 }
        );
    }

    // Calculate new balance
    const newBalance = company.credits + finalAmount;

    // Prevent negative balances
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'La transacción resultaría en un saldo negativo' },
        { status: 400 }
      );
    }

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update company credits
      const updatedCompany = await tx.company.update({
        where: { id: params.id },
        data: { credits: newBalance },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          type,
          amount: finalAmount,
          balance: newBalance,
          description,
          companyId: params.id,
        },
      });

      // Log admin activity
      await tx.adminLog.create({
        data: {
          action: 'CREDIT_ADJUSTMENT',
          entity: params.id,
          description: `Ajuste de créditos para "${company.name}": ${finalAmount > 0 ? '+' : ''}${finalAmount} créditos`,
          metadata: {
            companyName: company.name,
            transactionType: type,
            amount: finalAmount,
            previousBalance: company.credits,
            newBalance: newBalance,
            description: description
          },
          adminId: adminUser.id,
          adminEmail: adminUser.email,
        },
      });

      return { updatedCompany, transaction };
    });

    return NextResponse.json({
      success: true,
      message: 'Transacción procesada exitosamente',
      transaction: result.transaction,
      newBalance: result.updatedCompany.credits,
    });
  } catch (error) {
    console.error('Error processing credit transaction:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
