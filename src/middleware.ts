import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // If Clerk needs to handle a handshake redirect or status cleanup, 
  // let it process this without overriding its response with custom headers.
  if (
    request.nextUrl.searchParams.has("__clerk_hs_reason") ||
    request.nextUrl.searchParams.has("__clerk_status")
  ) {
    return;
  }

  if (isAdminRoute(request)) {
    await auth.protect();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cloud.umami.is https://va.vercel-scripts.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://clerk.parokibrayut.org ${process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: https://img.clerk.com;
    font-src 'self' data: https://fonts.gstatic.com;
    worker-src 'self' blob:;
    connect-src 'self' https: wss: https://cloud.umami.is https://vitals.vercel-insights.com https://*.clerk.accounts.dev https://clerk.com https://clerk.parokibrayut.org;
    frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://*.clerk.accounts.dev https://clerk.parokibrayut.org;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  
  // Also set these to ensure Next.js specifically picks them up for the rendering engine
  // This is required in Next 13+ to ensure the nonce is applied to native Next.js scripts
  requestHeaders.set("Content-Security-Policy", cspHeader);
  requestHeaders.set("x-middleware-request-x-nonce", nonce);

  // We need to pass the updated headers to the Request so the App Router consumes it
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Set the final CSP on the Outbound Response
  response.headers.set("Content-Security-Policy", cspHeader);

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
