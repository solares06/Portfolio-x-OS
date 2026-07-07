import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  const isOSSubdomain = host.startsWith("os.");

  // Keep these paths at the root, don't rewrite them
  const rootPaths = ["/login", "/auth/callback", "/api"];
  const isRootPath = rootPaths.some((p) => pathname.startsWith(p));

  // Determine the base response (rewrite or pass-through)
  let initialResponse: NextResponse;
  
  if (isRootPath) {
    initialResponse = NextResponse.next();
  } else if (isOSSubdomain) {
    // Rewrite os.domain.com/projects to /os/projects
    initialResponse = NextResponse.rewrite(new URL(`/os${pathname}`, request.url));
  } else {
    // Rewrite domain.com/about to /public/about
    initialResponse = NextResponse.rewrite(new URL(`/public${pathname}`, request.url));
  }

  // If public site, we just return the initial rewrite, no auth needed
  if (!isOSSubdomain && !isRootPath) {
    return initialResponse;
  }

  // OS subdomain or root paths (/login) — verify session
  const { supabaseResponse, user } = await updateSession(request, initialResponse);

  // Unauthenticated users trying to access OS routes get redirected to /login
  if (!user && !isRootPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users hitting /login get redirected to /os (which corresponds to /)
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
