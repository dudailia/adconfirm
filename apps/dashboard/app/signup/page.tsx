"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError || !authData.user) {
      setError(authError?.message ?? "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("businesses").insert({
      id: authData.user.id,
      name,
      email,
      plan: "free",
    });
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    window.location.replace("/dashboard");
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
