import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedCourier } from "@/src/lib/courierAuth/session";

export default async function CourierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courier = await getAuthenticatedCourier();

  if (!courier) {
    redirect("/courier/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Courier dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{courier.displayName}</h1>
          <p className="text-sm text-[var(--text-muted)]">{courier.email}</p>
        </div>
        <Link
          href="/courier/logout"
          className="secondary-button rounded-xl px-4 py-2 text-sm font-medium"
        >
          Log out
        </Link>
      </header>
      {children}
    </main>
  );
}
