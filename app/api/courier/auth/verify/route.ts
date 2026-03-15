import { NextResponse } from "next/server";

import { getSessionCookieOptions } from "@/src/lib/courierAuth/cookies";
import { generateToken, hashToken } from "@/src/lib/courierAuth/crypto";
import { verifyMagicLinkSchema } from "@/src/lib/courierAuth/schemas";
import { db } from "@/src/lib/db";

const ROLLING_SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const VERIFY_ERROR_PATH = "/courier/verify?status=invalid";
const VERIFY_EXPIRED_PATH = "/courier/verify?status=expired";

function redirectTo(path: string, request: Request) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = verifyMagicLinkSchema.safeParse({
    token: url.searchParams.get("token"),
  });

  if (!parsed.success) {
    return redirectTo(VERIFY_ERROR_PATH, request);
  }

  const tokenHash = hashToken(parsed.data.token);
  const magicToken = await db.magicLinkToken.findUnique({
    where: { tokenHash },
    include: { courier: true },
  });

  if (!magicToken || !magicToken.courier.isActive) {
    return redirectTo(VERIFY_ERROR_PATH, request);
  }

  const now = new Date();
  if (magicToken.usedAt) {
    return redirectTo(VERIFY_ERROR_PATH, request);
  }
  if (magicToken.expiresAt <= now) {
    return redirectTo(VERIFY_EXPIRED_PATH, request);
  }

  const rawSessionToken = generateToken();
  const sessionHash = hashToken(rawSessionToken);
  const sessionExpiresAt = new Date(Date.now() + ROLLING_SESSION_MS);

  try {
    await db.$transaction(async (tx) => {
      const updated = await tx.magicLinkToken.updateMany({
        where: {
          id: magicToken.id,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      if (updated.count !== 1) {
        throw new Error("Token already used.");
      }

      await tx.courierSession.create({
        data: {
          courierId: magicToken.courierId,
          sessionTokenHash: sessionHash,
          expiresAt: sessionExpiresAt,
          lastUsedAt: now,
        },
      });
    });
  } catch {
    return redirectTo(VERIFY_ERROR_PATH, request);
  }

  const response = redirectTo("/courier/dashboard", request);
  response.cookies.set("cc_courier_session", rawSessionToken, getSessionCookieOptions(sessionExpiresAt));
  return response;
}
