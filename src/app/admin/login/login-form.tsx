"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [allowCreate, setAllowCreate] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorParam === "auth" ? "Sign in failed. Please try again." : "",
  );
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    void supabase.rpc("admin_exists").then(({ data }) => {
      const exists = data === true;
      setAllowCreate(!exists);
      if (!exists) setMode("create");
    });
  }, []);

  async function goToDashboard() {
    router.push("/admin");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (!isSupabaseConfigured()) {
      setError("Supabase is not connected yet.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (mode === "create") {
      const origin = window.location.origin;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() || email },
          emailRedirectTo: `${origin}/auth/callback?next=/admin`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setInfo("Account created. Check email if confirmation is on, then sign in.");
        setMode("signin");
        setLoading(false);
        return;
      }

      const { error: bootstrapError } = await supabase.rpc("bootstrap_admin");
      if (bootstrapError) {
        setError(bootstrapError.message);
        setLoading(false);
        return;
      }

      await goToDashboard();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await goToDashboard();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-text-on-brand">
              M
            </span>
            <div>
              <h1 className="font-semibold text-text-primary">
                {mode === "create" ? "Create account" : "Sign in"}
              </h1>
              <p className="text-sm text-text-muted">Kitchen dashboard</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "create" && (
              <Input
                label="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              minLength={6}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            {info && <p className="text-sm text-success">{info}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "create"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>
          {allowCreate && (
            <p className="mt-6 text-center text-sm text-text-muted">
              {mode === "create" ? (
                <button
                  type="button"
                  className="hover:text-brand"
                  onClick={() => setMode("signin")}
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  type="button"
                  className="hover:text-brand"
                  onClick={() => setMode("create")}
                >
                  Create account
                </button>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
