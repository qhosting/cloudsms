

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// GET session with impersonation check
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ session: null });
    }

    // Check for impersonation cookie
    const impersonationToken = request.cookies.get('impersonation')?.value;
    
    if (impersonationToken && session.user.role === 'SUPER_ADMIN') {
      try {
        const impersonationData = jwt.verify(impersonationToken, process.env.NEXTAUTH_SECRET!) as any;
        
        // Get impersonated user data
        const impersonatedUser = await prisma.user.findUnique({
          where: { id: impersonationData.targetUserId },
          include: { company: true }
        });

        if (impersonatedUser && impersonatedUser.isActive) {
          // Create impersonated session
          const impersonatedSession = {
            ...session,
            user: {
              id: impersonatedUser.id,
              email: impersonatedUser.email,
              name: `${impersonatedUser.firstName} ${impersonatedUser.lastName}`,
              role: impersonatedUser.role,
              companyId: impersonatedUser.companyId,
              companyName: impersonatedUser.company?.name || null,
              firstName: impersonatedUser.firstName,
              lastName: impersonatedUser.lastName,
              isImpersonating: true,
              originalUserId: session.user.id,
              originalUserEmail: session.user.email,
              originalRole: session.user.role,
              originalFirstName: session.user.firstName,
              originalLastName: session.user.lastName,
            }
          };
          
          return NextResponse.json({ session: impersonatedSession });
        }
      } catch (error) {
        console.log('Invalid impersonation token:', error);
      }
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error getting session with impersonation:', error);
    return NextResponse.json({ session: null });
  }
}
