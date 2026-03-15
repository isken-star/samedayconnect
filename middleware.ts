import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { extractCourierSlugFromHost } from "@/src/lib/domain";
import { COURIER_SESSION_COOKIE } from "@/src/lib/courierAuth/cookies";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const courierSlug = extractCourierSlugFromHost(requestHost);

  if (courierSlug) {
    requestHeaders.set("x-courier-slug", courierSlug);
  }

  if (!request.nextUrl.pathname.startsWith("/courier/dashboard")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const token = request.cookies.get(COURIER_SESSION_COOKIE)?.value;
  if (token) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const loginUrl = new URL("/courier/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
