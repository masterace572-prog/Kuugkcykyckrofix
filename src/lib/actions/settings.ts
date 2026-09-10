"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireProfile } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

export async function updateServerSettings(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  await requireAdmin();

  const modname = String(formData.get("modname") ?? "").trim();
  const telegram = String(formData.get("telegram") ?? "").trim();
  const floatingText = String(formData.get("floating_text") ?? "").trim();
  const floatingStatus = String(formData.get("floating_status") ?? "").trim();
  const maintenance = formData.get("maintenance") === "on";

  if (!modname || modname.length > 100) return { ok: false, message: "Invalid mod name." };
  if (telegram.length > 100) return { ok: false, message: "Telegram handle is too long." };
  if (floatingText.length > 100) return { ok: false, message: "Floating text is too long." };
  if (floatingStatus.length > 100) return { ok: false, message: "Floating status is too long." };

  const rows = [
    { key: "modname", value: modname },
    { key: "telegram", value: telegram },
    { key: "floating_text", value: floatingText },
    { key: "floating_status", value: floatingStatus },
    { key: "maintenance", value: maintenance },
  ];

  const { error } = await supabase.from("app_settings").upsert(rows);
  if (error) return { ok: false, message: "Failed to save settings." };

  revalidatePath("/admin/server");
  return { ok: true, message: "Server settings saved." };
}

export async function updateAccount(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { user } = await requireProfile();

  const fullname = String(formData.get("fullname") ?? "").trim();
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");

  if (fullname && (fullname.length < 2 || fullname.length > 155)) {
    return { ok: false, message: "Full name must be 2–155 characters." };
  }

  // ── Update fullname ────────────────────────────────────────────
  if (fullname) {
    const { error } = await supabase
      .from("profiles")
      .update({ fullname })
      .eq("id", user.id);
    if (error) return { ok: false, message: "Failed to update name." };
  }

  // ── Optionally change password ─────────────────────────────────
  if (newPassword) {
    if (newPassword.length < 6 || newPassword.length > 72) {
      return { ok: false, message: "New password must be at least 6 characters." };
    }
    if (!currentPassword) {
      return { ok: false, message: "Enter your current password to change it." };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return { ok: false, message: "Supabase is not configured." };

    const verifyClient = createSupabaseClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return { ok: false, message: "Current password is incorrect." };
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (error) return { ok: false, message: "Failed to update password." };
  }

  revalidatePath("/settings");
  return {
    ok: true,
    message: fullname ? "Account details updated." : "Account updated.",
  };
}
