"use client";

import { useState } from "react";

const SUCCESS_MESSAGE = "If an account exists for that email, we’ve sent a sign-in link.";

export default function CourierLoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    await fetch("/api/courier/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    setSubmitting(false);
    setMessage(SUCCESS_MESSAGE);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section className="content-panel w-full space-y-5 rounded-2xl border border-[var(--border-subtle)] p-6">
        <header className="space-y-2">
          <h1 className="section-title text-3xl">Courier sign in</h1>
          <p className="support-copy">
            Enter your email and we&apos;ll send a secure sign-in link.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-main)]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-input px-3 py-2"
              placeholder="you@samedayconnect.co.uk"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="gradient-button inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send sign-in link"}
          </button>
        </form>

        {message ? (
          <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--text-main)]">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
