"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";

export function LoginForm({
  registered,
  disabled,
}: {
  registered: boolean;
  disabled: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  // If redirected here with a disabled account, clear the stale session.
  React.useEffect(() => {
    if (disabled) {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    }
  }, [disabled]);

  React.useEffect(() => {
    if (registered) {
      toast.success("Account created. You can now sign in.");
    }
  }, [registered]);

  // Redirect already-authenticated (and enabled) users to the dashboard.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", session.user.id)
          .maybeSingle();
        if (active && profile?.status === 1) {
          router.replace("/dashboard");
        }
      } catch {
        /* ignore */
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("invalid login")
            ? "Invalid email or password."
            : signInError.message
        );
        return;
      }
      const userId = data.user?.id;
      if (!userId) {
        setError("Unable to sign in. Please try again.");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", userId)
        .maybeSingle();

      if (!profile || profile.status !== 1) {
        await supabase.auth.signOut();
        setError("Your account is disabled. Contact your administrator.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (checking && !disabled) {
    return (
      <AuthShell title="Sign in">
        <div className="flex justify-center py-10">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your license keys"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {disabled ? (
          <Alert tone="danger">Your account has been disabled.</Alert>
        ) : null}
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
