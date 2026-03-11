import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes require a session cookie
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("__session");

    if (!sessionCookie) {
      const loginUrl = new URL("/layanan-inti", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cloud.umami.is https://va.vercel-scripts.com https://apis.google.com https://*.firebaseapp.com ${process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: https://lh3.googleusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    worker-src 'self' blob:;
    connect-src 'self' https: wss: https://cloud.umami.is https://vitals.vercel-insights.com https://*.googleapis.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
    frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://*.firebaseapp.com https://accounts.google.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);
  requestHeaders.set("x-middleware-request-x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
