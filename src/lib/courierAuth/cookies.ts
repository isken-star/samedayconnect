export const COURIER_SESSION_COOKIE = "cc_courier_session";

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Keep auth on the main app host for now to avoid cross-subdomain session scope.
    path: "/",
    expires: expiresAt,
  };
}
