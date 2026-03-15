"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ThemeProvider } from "@/src/context/ThemeContext";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/quote", label: "Quote" },
  { href: "/contact", label: "Contact" },
  { href: "/join", label: "Join" },
];

const BRAND_NAME = "SAME DAY CONNECT";

function BrandLockup({ href }: { href: string }) {
  return (
    <Link href={href} className="brand-lockup group flex shrink-0 flex-col items-start rounded-lg py-0.5">
      <span className="brand-prefix whitespace-nowrap text-[0.64rem] leading-none font-medium tracking-[0.18em] sm:text-[0.68rem]">
        part of
      </span>
      <span className="brand-wordmark whitespace-nowrap text-xs leading-none font-black tracking-[0.08em] sm:text-sm lg:text-base">
        {BRAND_NAME}
      </span>
    </Link>
  );
}

function Header({ siteLabel }: { siteLabel?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = DEFAULT_NAV_LINKS;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/quote") {
      return pathname?.startsWith("/quote") || pathname?.startsWith("/booking");
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--surface-header)]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLockup href="/" />
          {siteLabel ? (
            <span className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--text-main)] md:inline-flex">
              {siteLabel}
            </span>
          ) : null}
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition ${
                isActive(item.href)
                  ? "text-[var(--accent-soft)]"
                  : "text-[var(--text-subtle)] hover:text-[var(--text-main)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] p-2 text-[var(--accent-soft)] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-header)] px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-2 py-1 text-sm ${
                  isActive(item.href)
                    ? "bg-[var(--chip-bg)] text-[var(--accent-soft)]"
                    : "text-[var(--text-subtle)] hover:bg-[var(--chip-bg)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer({ siteLabel }: { siteLabel?: string | null }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-header)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-6 text-sm text-[var(--text-subtle)] sm:px-6">
        <p>
          © 2026 {siteLabel ?? "Same Day Connect"}. Transparent pricing. Real couriers.
        </p>
      </div>
    </footer>
  );
}

export function AppShell({
  children,
  siteLabel,
}: {
  children: React.ReactNode;
  siteLabel?: string | null;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)]">
        <Header siteLabel={siteLabel} />
        {children}
        <Footer siteLabel={siteLabel} />
      </div>
    </ThemeProvider>
  );
}
