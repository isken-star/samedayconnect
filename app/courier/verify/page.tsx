import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CourierVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (token) {
    redirect(`/api/courier/auth/verify?token=${encodeURIComponent(token)}`);
  }

  const isExpired = params.status === "expired";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section className="glass-card w-full space-y-4 rounded-2xl p-6 text-center shadow-[0_0_28px_rgba(168,85,247,0.12)]">
        <h1 className="text-2xl font-semibold">{isExpired ? "Link expired" : "Sign-in link invalid"}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {isExpired
            ? "Your sign-in link has expired. Request a new one to continue."
            : "This sign-in link is invalid or has already been used. Request a new link to continue."}
        </p>
        <Link
          href="/courier/login"
          className="gradient-button inline-flex rounded-xl px-5 py-2.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
