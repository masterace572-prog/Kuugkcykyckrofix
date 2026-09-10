"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { randomString } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

const USERNAME_RE = /^[a-zA-Z0-9_]{4,25}$/;

export async function updateUser(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { user, profile: me } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const fullname = String(formData.get("fullname") ?? "").trim();
  const level = Number(formData.get("level"));
  const status = Number(formData.get("status"));
  const saldo = Number(formData.get("saldo"));
  const uplink = String(formData.get("uplink") ?? "").trim();

  if (id === user.id) {
    return { ok: false, message: "Use account settings to edit your own profile." };
  }
  if (!USERNAME_RE.test(username)) {
    return { ok: false, message: "Username must be 4–25 characters (letters, numbers, underscore)." };
  }
  if (fullname && (fullname.length < 2 || fullname.length > 155)) {
    return { ok: false, message: "Full name must be 2–155 characters." };
  }
  if (level !== 1 && level !== 2) return { ok: false, message: "Invalid role." };
  if (status !== 0 && status !== 1) return { ok: false, message: "Invalid status." };
  if (!Number.isFinite(saldo) || saldo < 0) return { ok: false, message: "Invalid balance." };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", id)
    .maybeSingle();
  if (existing) return { ok: false, message: "Username is already taken." };

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      fullname: fullname || null,
      level,
      status,
      saldo,
      uplink: uplink || null,
    })
    .eq("id", id);

  if (error) return { ok: false, message: "Failed to update user." };

  await supabase.from("history").insert({
    user_do: me.username,
    info: `Updated user ${username}`,
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "User updated." };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { user } = await requireAdmin();

  if (id === user.id) return { ok: false, message: "You cannot delete your own account." };

  const { data: target } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", id)
    .maybeSingle();
  if (!target) return { ok: false, message: "User not found." };
  if (target.level === 1) return { ok: false, message: "You cannot delete an admin." };

  // Remove the user's profile and auth account.
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return { ok: false, message: "Failed to delete user." };

  revalidatePath("/admin/users");
  return { ok: true, message: "User deleted." };
}

export async function createReferral(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { profile } = await requireAdmin();

  const saldo = Number(formData.get("set_saldo"));
  if (!Number.isFinite(saldo) || saldo < 0) {
    return { ok: false, message: "Invalid balance amount." };
  }

  const code = "nocash" + randomString(6);

  const { error } = await supabase.from("referral_codes").insert({
    code,
    set_saldo: saldo,
    created_by: profile.username,
  });
  if (error) return { ok: false, message: "Failed to create referral code." };

  revalidatePath("/admin/referrals");
  return { ok: true, message: `Referral code created: ${code}` };
}

export async function deleteReferral(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  await requireAdmin();

  const { error } = await supabase.from("referral_codes").delete().eq("id", id);
  if (error) return { ok: false, message: "Failed to delete referral code." };

  revalidatePath("/admin/referrals");
  return { ok: true, message: "Referral code deleted." };
}
