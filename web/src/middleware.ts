import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple password protection middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes - no auth needed
  const publicRoutes = ['/', '/login', '/api/login'];
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Check for auth cookie
  const authCookie = request.cookies.get('ih-auth');
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to login for pages, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
