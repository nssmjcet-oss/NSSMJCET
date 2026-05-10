import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host');
  const { pathname, search } = request.nextUrl;

  // Block Vercel domain from being indexed by search engines
  if (hostname && hostname.includes('vercel.app')) {
    const redirectResponse = NextResponse.redirect(
      `https://www.nssmjcet.in${pathname}${search}`,
      { status: 301 }
    );
    // Tell Google to remove this Vercel URL from its index
    redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return redirectResponse;
  }

  // Redirect bare domain (nssmjcet.in) → www.nssmjcet.in
  if (hostname === 'nssmjcet.in') {
    return NextResponse.redirect(
      `https://www.nssmjcet.in${pathname}${search}`,
      { status: 301 }
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
