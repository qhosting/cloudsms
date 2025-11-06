

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// GET impersonation status
export async function GET(request: NextRequest) {
  try {
    const impersonationToken = request.cookies.get('impersonation')?.value;

    if (!impersonationToken) {
      return NextResponse.json({
        isImpersonating: false
      });
    }

    try {
      const impersonationData = jwt.verify(impersonationToken, process.env.NEXTAUTH_SECRET!) as any;
      
      return NextResponse.json({
        isImpersonating: true,
        impersonationData: {
          originalUserEmail: impersonationData.originalUserEmail,
          targetUserEmail: impersonationData.targetUserEmail,
          targetUserId: impersonationData.targetUserId,
          startedAt: impersonationData.startedAt
        }
      });
    } catch (error) {
      // Invalid token
      return NextResponse.json({
        isImpersonating: false
      });
    }
  } catch (error) {
    console.error('Error checking impersonation status:', error);
    return NextResponse.json({
      isImpersonating: false
    });
  }
}
