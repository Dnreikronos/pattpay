import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Detect if it's the checkout subdomain
  const isCheckoutDomain =
    hostname.startsWith("checkout.") ||
    hostname === "checkout.localhost:3000" ||
    hostname === "checkout.localhost";

  // If on checkout subdomain
  if (isCheckoutDomain) {
    // Block access to main site routes
    if (url.pathname.startsWith("/dashboard") || url.pathname === "/") {
      // Rewrite to checkout root
      url.pathname = "/checkout";
      return NextResponse.rewrite(url);
    }

    // Already on checkout routes - allow
    if (url.pathname.startsWith("/checkout")) {
      return NextResponse.next();
    }

    // Any other route - redirect to checkout
    url.pathname = "/checkout";
    return NextResponse.rewrite(url);
  }

  // On main domain - block access to checkout routes directly
  if (url.pathname.startsWith("/checkout")) {
    return NextResponse.redirect(new URL("/", request.url));
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
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
