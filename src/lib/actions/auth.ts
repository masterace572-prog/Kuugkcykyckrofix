"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const USERNAME_RE = /^[a-zA-Z0-9_]{4,25}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterResult = {
  ok: boolean;
  message: string;
};

export async function registerUser(
  _prev: RegisterResult,
  formData: FormData
): Promise<RegisterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const fullname = String(formData.get("fullname") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const referral = String(formData.get("referral") ?? "").trim();

  // ── Validation ────────────────────────────────────────────────
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      message: "Username must be 4–25 characters (letters, numbers, underscore).",
    };
  }
  if (fullname && (fullname.length < 2 || fullname.length > 155)) {
    return { ok: false, message: "Full name must be between 2 and 155 characters." };
  }
  if (password.length < 6 || password.length > 72) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }
  if (!referral) {
    return { ok: false, message: "A referral code is required to register." };
  }

  const admin = createAdminClient();

  // ── Referral code check ───────────────────────────────────────
  const { data: code } = await admin
    .from("referral_codes")
    .select("*")
    .eq("code", referral)
    .single();

  if (!code) {
    return { ok: false, message: "Invalid referral code." };
  }
  if (code.used_by) {
    return { ok: false, message: "This referral code has already been used." };
  }

  // ── Username uniqueness ───────────────────────────────────────
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "This username is already taken." };
  }

  // ── Create the auth user (auto-confirmed) ─────────────────────
  let userId: string;
  try {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already been registered")) {
        return { ok: false, message: "An account with this email already exists." };
      }
      return { ok: false, message: error.message };
    }
    userId = created.user.id;
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to create account.",
    };
  }

  // ── Create the profile ────────────────────────────────────────
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      username,
      fullname: fullname || null,
      level: 2,
      saldo: Number(code.set_saldo) || 0,
      status: 1,
      uplink: code.created_by ?? null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return { ok: false, message: "Failed to finalize account. Please contact support." };
  }

  // ── Consume the referral code ─────────────────────────────────
  await admin
    .from("referral_codes")
    .update({ used_by: username })
    .eq("id", code.id);

  redirect("/login?registered=1");
}
