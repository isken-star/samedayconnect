const DEFAULT_APP_URL = "https://samedayconnect.co.uk";

export function getCanonicalAppUrl(): string {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) {
    return DEFAULT_APP_URL;
  }

  try {
    const url = new URL(raw);
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_APP_URL;
  }
}

export function getRootDomain(): string {
  const hostname = new URL(getCanonicalAppUrl()).hostname.toLowerCase();
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

export function normalizeHost(rawHost: string | null | undefined): string {
  if (!rawHost) {
    return "";
  }

  const trimmed = rawHost.trim().toLowerCase().replace(/\.$/, "");

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return parsed.hostname.toLowerCase();
  } catch {
    const [hostname] = trimmed.split(":");
    return hostname ?? "";
  }
}

export function extractCourierSlugFromHost(rawHost: string | null | undefined): string | null {
  const host = normalizeHost(rawHost);
  if (!host) {
    return null;
  }

  if (host.endsWith(".localhost")) {
    const prefix = host.slice(0, -".localhost".length);
    if (!prefix || prefix.includes(".")) {
      return null;
    }
    return prefix;
  }

  const rootDomain = getRootDomain();
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null;
  }

  const suffix = `.${rootDomain}`;
  if (!host.endsWith(suffix)) {
    return null;
  }

  const prefix = host.slice(0, -suffix.length);
  if (!prefix || prefix.includes(".") || prefix === "www") {
    return null;
  }

  return prefix;
}

