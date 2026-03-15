interface RateEntry {
  count: number;
  resetAtMs: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 10;

const emailBucket = new Map<string, RateEntry>();
const ipBucket = new Map<string, RateEntry>();
const WINDOW_SECONDS = Math.floor(WINDOW_MS / 1000);

function consume(map: Map<string, RateEntry>, key: string, max: number, nowMs: number): boolean {
  const existing = map.get(key);
  if (!existing || existing.resetAtMs <= nowMs) {
    map.set(key, { count: 1, resetAtMs: nowMs + WINDOW_MS });
    return true;
  }

  if (existing.count >= max) {
    return false;
  }

  existing.count += 1;
  map.set(key, existing);
  return true;
}

function getRetryAfterMs(map: Map<string, RateEntry>, key: string, nowMs: number): number {
  const entry = map.get(key);
  if (!entry || entry.resetAtMs <= nowMs) {
    return 0;
  }
  return Math.max(0, entry.resetAtMs - nowMs);
}

function checkMagicLinkRateLimitLocal({
  email,
  ip,
  nowMs = Date.now(),
}: {
  email: string;
  ip: string;
  nowMs?: number;
}) {
  // TODO: replace with shared Redis limiter for multi-instance deployment.
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedIp = ip.trim() || "unknown";

  const emailAllowed = consume(emailBucket, normalizedEmail, MAX_PER_EMAIL, nowMs);
  const ipAllowed = consume(ipBucket, normalizedIp, MAX_PER_IP, nowMs);

  if (emailAllowed && ipAllowed) {
    return { allowed: true as const, retryAfterSeconds: 0 };
  }

  const retryAfterMs = Math.max(
    getRetryAfterMs(emailBucket, normalizedEmail, nowMs),
    getRetryAfterMs(ipBucket, normalizedIp, nowMs),
  );

  return {
    allowed: false as const,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

async function incrementUpstashKey(baseKey: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash credentials missing.");
  }

  const key = `${baseKey}:${Math.floor(Date.now() / WINDOW_MS)}`;
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, WINDOW_SECONDS, "NX"],
      ["TTL", key],
    ]),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Upstash pipeline failed (${response.status}): ${details}`);
  }

  const data = (await response.json()) as Array<{ result?: number }>;
  const count = Number(data[0]?.result ?? 0);
  const ttl = Number(data[2]?.result ?? WINDOW_SECONDS);
  return {
    count,
    ttlSeconds: Number.isFinite(ttl) && ttl > 0 ? ttl : WINDOW_SECONDS,
  };
}

export async function checkMagicLinkRateLimit({
  email,
  ip,
  nowMs = Date.now(),
}: {
  email: string;
  ip: string;
  nowMs?: number;
}) {
  const useUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!useUpstash) {
    // TODO: for production with multiple instances, configure Upstash/Redis.
    return checkMagicLinkRateLimitLocal({ email, ip, nowMs });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedIp = ip.trim() || "unknown";

    const [emailState, ipState] = await Promise.all([
      incrementUpstashKey(`courier_magic_link:email:${normalizedEmail}`),
      incrementUpstashKey(`courier_magic_link:ip:${normalizedIp}`),
    ]);

    const allowed = emailState.count <= MAX_PER_EMAIL && ipState.count <= MAX_PER_IP;
    return {
      allowed: allowed as true | false,
      retryAfterSeconds: allowed ? 0 : Math.max(emailState.ttlSeconds, ipState.ttlSeconds),
    };
  } catch {
    // Safe fallback keeps auth flow available even if Upstash is unreachable.
    return checkMagicLinkRateLimitLocal({ email, ip, nowMs });
  }
}

export function __resetRateLimitForTests() {
  emailBucket.clear();
  ipBucket.clear();
}
