import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type SessionContext = {
  user: { id: string; email: string };
  profile: Profile;
};

/**
 * Returns the authenticated user and their profile, redirecting to /login
 * when the session is missing, the profile does not exist, or the account
 * has been disabled.
 */
export async function requireProfile(): Promise<SessionContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== 1) redirect("/login?error=disabled");

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: profile as Profile,
  };
}

export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await requireProfile();
  if (ctx.profile.level !== 1) redirect("/dashboard");
  return ctx;
}
