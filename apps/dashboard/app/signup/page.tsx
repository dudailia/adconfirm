"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // Step 1: create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("[signup] auth.signUp error:", authError);
      setError(authError?.message ?? "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: insert businesses row (succeeds regardless of RLS; row uses auth user id)
    const { error: insertError } = await supabase.from("businesses").insert({
      id: authData.user.id,
      name,
      email,
      plan: "free",
    });

    if (insertError) {
      console.error("[signup] businesses insert error:", insertError);
      setError(`Account created but profile setup failed: ${insertError.message}. Please contact support.`);
      setLoading(false);
      return;
    }

    // Step 3: check whether a session was issued (email confirmation may be required)
    if (!authData.session) {
      // Supabase email confirmation is enabled — user must confirm before logging in
      setConfirmed(true);
      setLoading(false);
      return;
    }

    // Session is live — navigate to dashboard
    window.location.replace("/dashboard");
  }

  // Shown after successful signup when email confirmation is required
  if (confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-xl text-center">
          <div className="mb-4 text-4xl">✉️</div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-muted-fg mb-6">
            We sent a confirmation link to <span className="text-white">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="block w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white text-center transition hover:bg-accent-hover"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold tracking-tight text-white">AdConfirm</div>
          <p className="mt-1 text-sm text-muted-fg">Create your business account</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-muted-fg">
              Company name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-muted-fg">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-muted-fg">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-fg">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
