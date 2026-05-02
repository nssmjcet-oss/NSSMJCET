import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host');
  const { pathname, search } = request.nextUrl;

  // Check if the current host is the Vercel domain or the non-www custom domain
  const isOldDomain = hostname && (hostname.includes('vercel.app') || hostname === 'nssmjcet.in');
  
  if (isOldDomain && hostname !== 'www.nssmjcet.in') {
    // Perform a 301 Permanent Redirect to the primary WWW domain
    return NextResponse.redirect(
      `https://www.nssmjcet.in${pathname}${search}`,
      301
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|og-image.png|logo.png).*)',
  ],
};
