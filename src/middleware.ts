import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    await auth.protect();
  }

  // Security headers
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy - Updated for Clerk and Umami
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cloud.umami.is https://va.vercel-scripts.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://clerk.parokibrayut.org; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: https://img.clerk.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "worker-src 'self' blob:; " +
    "connect-src 'self' https: wss: https://cloud.umami.is https://vitals.vercel-insights.com https://*.clerk.accounts.dev https://clerk.com https://clerk.parokibrayut.org; " +
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://*.clerk.accounts.dev https://clerk.parokibrayut.org; " +
    "frame-ancestors 'none';"
  );

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
