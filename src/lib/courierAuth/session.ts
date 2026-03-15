import type { Courier } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

import { COURIER_SESSION_COOKIE, getSessionCookieOptions } from "./cookies";
import { generateToken, hashToken } from "./crypto";

const ROLLING_SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const ABSOLUTE_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function getAbsoluteExpiry(createdAt: Date): Date {
  return new Date(createdAt.getTime() + ABSOLUTE_SESSION_MS);
}

function getRollingExpiry(now = new Date()): Date {
  return new Date(now.getTime() + ROLLING_SESSION_MS);
}

export async function createCourierSession(courierId: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = getRollingExpiry(now);

  const session = await db.courierSession.create({
    data: {
      courierId,
      sessionTokenHash: tokenHash,
      expiresAt,
      lastUsedAt: now,
    },
  });

  return { token, session };
}

export async function revokeCourierSessionByToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await db.courierSession.deleteMany({
    where: { sessionTokenHash: tokenHash },
  });
}

export async function clearCourierSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COURIER_SESSION_COOKIE);
}

export async function setCourierSessionCookie(rawToken: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(COURIER_SESSION_COOKIE, rawToken, getSessionCookieOptions(expiresAt));
}

export async function getAuthenticatedCourier(): Promise<Courier | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COURIER_SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const session = await db.courierSession.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: { courier: true },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  const absoluteExpiry = getAbsoluteExpiry(session.createdAt);

  if (session.expiresAt <= now || absoluteExpiry <= now) {
    return null;
  }

  return session.courier;
}

export async function refreshCourierSessionInRoute(request: Request, response: NextResponse) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COURIER_SESSION_COOKIE}=`));
  const rawToken = tokenCookie?.slice(COURIER_SESSION_COOKIE.length + 1);

  if (!rawToken) {
    return;
  }

  const decodedToken = decodeURIComponent(rawToken);
  const tokenHash = hashToken(decodedToken);
  const session = await db.courierSession.findUnique({
    where: { sessionTokenHash: tokenHash },
  });

  if (!session) {
    response.cookies.delete(COURIER_SESSION_COOKIE);
    return;
  }

  const now = new Date();
  const absoluteExpiry = getAbsoluteExpiry(session.createdAt);
  if (session.expiresAt <= now || absoluteExpiry <= now) {
    await db.courierSession.deleteMany({ where: { id: session.id } });
    response.cookies.delete(COURIER_SESSION_COOKIE);
    return;
  }

  const refreshedExpiry = getRollingExpiry(now);
  const nextExpiry = refreshedExpiry < absoluteExpiry ? refreshedExpiry : absoluteExpiry;

  await db.courierSession.update({
    where: { id: session.id },
    data: {
      lastUsedAt: now,
      expiresAt: nextExpiry,
    },
  });

  response.cookies.set(COURIER_SESSION_COOKIE, decodedToken, getSessionCookieOptions(nextExpiry));
}
