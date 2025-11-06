

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
    const isSuperAdminPage = req.nextUrl.pathname.startsWith('/super-admin');
    const isRootPage = req.nextUrl.pathname === '/';

    // Check for impersonation
    let effectiveToken = token;
    let isImpersonating = false;
    const impersonationToken = req.cookies.get('impersonation')?.value;

    if (impersonationToken && token?.role === 'SUPER_ADMIN') {
      try {
        const impersonationData = jwt.verify(impersonationToken, process.env.NEXTAUTH_SECRET!) as any;
        
        // Create effective token for impersonated user
        effectiveToken = {
          ...token,
          id: impersonationData.targetUserId,
          email: impersonationData.targetUserEmail,
          role: 'COMPANY_ADMIN', // Treat as company admin during impersonation
          companyId: 'impersonated',
        };
        isImpersonating = true;
      } catch (error) {
        // Invalid impersonation token, clear it and continue
        const response = NextResponse.next();
        response.cookies.set('impersonation', '', { maxAge: 0 });
      }
    }

    // If user is authenticated and tries to access auth pages, redirect to appropriate dashboard
    if (isAuthPage && isAuth) {
      if (token?.role === 'SUPER_ADMIN' && !isImpersonating) {
        return NextResponse.redirect(new URL('/super-admin', req.url));
      } else if (['COMPANY_ADMIN', 'USER'].includes(effectiveToken?.role as string) || isImpersonating) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // If user is authenticated and accesses root, redirect to appropriate dashboard
    if (isRootPage && isAuth) {
      if (token?.role === 'SUPER_ADMIN' && !isImpersonating) {
        return NextResponse.redirect(new URL('/super-admin', req.url));
      } else if (['COMPANY_ADMIN', 'USER'].includes(effectiveToken?.role as string) || isImpersonating) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect dashboard routes - allow COMPANY_ADMIN, USER, and impersonated sessions
    if (isDashboardPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      
      if (token?.role === 'SUPER_ADMIN' && !isImpersonating) {
        return NextResponse.redirect(new URL('/super-admin', req.url));
      }
      
      if (!['COMPANY_ADMIN', 'USER'].includes(effectiveToken?.role as string) && !isImpersonating) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Protect super-admin routes - only allow real SUPER_ADMIN (not impersonated)
    if (isSuperAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      
      if (token?.role !== 'SUPER_ADMIN' || isImpersonating) {
        // Redirect non-super-admins or impersonated sessions to dashboard
        if (['COMPANY_ADMIN', 'USER'].includes(effectiveToken?.role as string) || isImpersonating) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          return NextResponse.redirect(new URL('/auth/signin', req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and home page for everyone
        if (
          req.nextUrl.pathname.startsWith('/auth') || 
          req.nextUrl.pathname === '/' ||
          req.nextUrl.pathname.startsWith('/api/auth')
        ) {
          return true;
        }

        // For all other pages, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)',
  ],
};
