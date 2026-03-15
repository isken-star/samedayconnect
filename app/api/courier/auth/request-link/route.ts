import { NextResponse } from "next/server";

import { generateToken, hashToken } from "@/src/lib/courierAuth/crypto";
import { checkMagicLinkRateLimit } from "@/src/lib/courierAuth/rateLimit";
import { requestMagicLinkSchema } from "@/src/lib/courierAuth/schemas";
import { db } from "@/src/lib/db";
import { getCanonicalAppUrl } from "@/src/lib/domain";
import { getEmailProvider } from "@/src/lib/email";

const GENERIC_SUCCESS_MESSAGE = "If an account exists for that email, we’ve sent a sign-in link.";
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestMagicLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip = getRequestIp(request);
  const rate = await checkMagicLinkRateLimit({ email, ip });

  if (!rate.allowed) {
    return NextResponse.json(
      { message: GENERIC_SUCCESS_MESSAGE },
      {
        status: 429,
        headers: {
          "Retry-After": `${rate.retryAfterSeconds}`,
        },
      },
    );
  }

  const courier = await db.courier.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      isActive: true,
    },
    select: { id: true, email: true },
  });

  if (courier?.email) {
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await db.magicLinkToken.create({
      data: {
        courierId: courier.id,
        tokenHash,
        expiresAt,
        requestIp: ip,
      },
    });

    const baseUrl = process.env.APP_BASE_URL?.trim()
      ? getCanonicalAppUrl()
      : new URL(request.url).origin;
    const signInUrl = `${baseUrl}/courier/verify?token=${encodeURIComponent(rawToken)}`;

    await getEmailProvider().sendMagicLink({
      toEmail: courier.email,
      signInUrl,
    });
  }

  return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
}
