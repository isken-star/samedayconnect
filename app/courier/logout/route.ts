import { NextResponse } from "next/server";

import { COURIER_SESSION_COOKIE } from "@/src/lib/courierAuth/cookies";
import { revokeCourierSessionByToken } from "@/src/lib/courierAuth/session";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COURIER_SESSION_COOKIE}=`));
  const rawToken = tokenCookie?.slice(COURIER_SESSION_COOKIE.length + 1);

  if (rawToken) {
    await revokeCourierSessionByToken(decodeURIComponent(rawToken)).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/courier/login", request.url));
  response.cookies.delete(COURIER_SESSION_COOKIE);
  return response;
}
