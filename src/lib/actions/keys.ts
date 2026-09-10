"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/session";
import { GAMES, getDurationOption, keyCost } from "@/lib/config";
import { randomString } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

const MAX_BULK = 500;

export async function generateKeys(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { user, profile } = await requireProfile();

  const game = String(formData.get("game") ?? "").trim();
  const duration = Number(formData.get("duration"));
  const maxDevices = Number(formData.get("max_devices"));
  const quantity = Number(formData.get("quantity") ?? 1);
  const useCustom = formData.get("custom") === "on";
  const customLicense = String(formData.get("custom_license") ?? "").trim();

  if (!GAMES[game]) return { ok: false, message: "Invalid game selected." };
  const durationOpt = getDurationOption(duration);
  if (!durationOpt) return { ok: false, message: "Invalid duration." };
  if (!Number.isInteger(maxDevices) || maxDevices < 1 || maxDevices > 50) {
    return { ok: false, message: "Devices must be between 1 and 50." };
  }

  const count = useCustom ? 1 : quantity;
  if (!Number.isInteger(count) || count < 1 || count > MAX_BULK) {
    return { ok: false, message: `Quantity must be between 1 and ${MAX_BULK}.` };
  }

  const perKey = keyCost(duration, maxDevices);
  const total = perKey * count;

  if (useCustom) {
    if (customLicense.length < 3 || customLicense.length > 25) {
      return { ok: false, message: "Custom key must be 3–25 characters." };
    }
    if (!/^[a-zA-Z0-9]+$/.test(customLicense)) {
      return { ok: false, message: "Custom key may only contain letters and numbers." };
    }
  }

  const keys: string[] = [];
  if (useCustom) {
    keys.push(customLicense);
  } else {
    for (let i = 0; i < count; i++) {
      keys.push(`${duration}x${profile.username}x${randomString(5)}`);
    }
  }

  // Check for key collisions before inserting.
  const { data: dupes } = await supabase
    .from("keys_code")
    .select("user_key")
    .in("user_key", keys);
  if (dupes && dupes.length > 0) {
    return {
      ok: false,
      message: "A generated key already exists. Please try again.",
    };
  }

  // Atomically deduct the balance (only if sufficient).
  const { error: deductError } = await supabase
    .from("profiles")
    .update({ saldo: profile.saldo - total })
    .eq("id", user.id)
    .gte("saldo", total);

  if (deductError) {
    return { ok: false, message: "Failed to process balance." };
  }

  // Re-verify the deduction succeeded.
  const { data: afterDeduct } = await supabase
    .from("profiles")
    .select("saldo")
    .eq("id", user.id)
    .single();
  if (!afterDeduct || afterDeduct.saldo === profile.saldo) {
    return { ok: false, message: "Insufficient balance." };
  }

  const rows = keys.map((userKey) => ({
    game,
    user_key: userKey,
    duration,
    max_devices: maxDevices,
    status: 1,
    registrator: profile.username,
  }));

  const { error: insertError } = await supabase.from("keys_code").insert(rows);
  if (insertError) {
    // Refund on failure.
    await supabase
      .from("profiles")
      .update({ saldo: profile.saldo })
      .eq("id", user.id);
    return { ok: false, message: "Failed to generate keys." };
  }

  await supabase.from("history").insert({
    user_do: profile.username,
    info: `Generated ${GAMES[game]} · ${durationOpt.label} · ${maxDevices} device(s) · ${count} key(s)`,
  });

  revalidatePath("/keys");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: `Generated ${count} key${count > 1 ? "s" : ""} successfully.`,
  };
}

export async function deleteKey(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  await requireProfile();

  const { error } = await supabase.from("keys_code").delete().eq("id", id);
  if (error) return { ok: false, message: "Failed to delete key." };

  revalidatePath("/keys");
  revalidatePath("/dashboard");
  return { ok: true, message: "Key deleted." };
}

export async function deleteAllKeys(): Promise<ActionResult> {
  const supabase = await createClient();
  await requireProfile();

  const { error } = await supabase.from("keys_code").delete().gte("id", 0);
  if (error) return { ok: false, message: "Failed to delete keys." };

  revalidatePath("/keys");
  revalidatePath("/dashboard");
  return { ok: true, message: "All keys deleted." };
}

export async function deleteExpiredKeys(): Promise<ActionResult> {
  const supabase = await createClient();
  await requireProfile();

  const { error } = await supabase
    .from("keys_code")
    .delete()
    .lt("expired_date", new Date().toISOString());
  if (error) return { ok: false, message: "Failed to delete keys." };

  revalidatePath("/keys");
  revalidatePath("/dashboard");
  return { ok: true, message: "Expired keys deleted." };
}

export async function deleteUnusedKeys(): Promise<ActionResult> {
  const supabase = await createClient();
  await requireProfile();

  const { error } = await supabase
    .from("keys_code")
    .delete()
    .is("expired_date", null);
  if (error) return { ok: false, message: "Failed to delete keys." };

  revalidatePath("/keys");
  revalidatePath("/dashboard");
  return { ok: true, message: "Unused keys deleted." };
}

export async function editKey(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { profile } = await requireProfile();

  const id = Number(formData.get("id"));
  const game = String(formData.get("game") ?? "").trim();
  const userKey = String(formData.get("user_key") ?? "").trim();
  const duration = Number(formData.get("duration"));
  const maxDevices = Number(formData.get("max_devices"));
  const status = Number(formData.get("status"));
  const expiredDate = String(formData.get("expired_date") ?? "").trim();

  if (!Number.isInteger(id)) return { ok: false, message: "Invalid key." };
  if (!GAMES[game]) return { ok: false, message: "Invalid game." };
  if (!getDurationOption(duration)) return { ok: false, message: "Invalid duration." };
  if (!Number.isInteger(maxDevices) || maxDevices < 1) {
    return { ok: false, message: "Invalid device limit." };
  }
  if (status !== 0 && status !== 1) return { ok: false, message: "Invalid status." };
  if (!/^[a-zA-Z0-9]+$/.test(userKey) || userKey.length < 3) {
    return { ok: false, message: "Invalid key value." };
  }

  let expired: string | null = null;
  if (expiredDate) {
    const d = new Date(expiredDate);
    if (Number.isNaN(d.getTime())) return { ok: false, message: "Invalid expiry date." };
    expired = d.toISOString();
  }

  const { error } = await supabase
    .from("keys_code")
    .update({
      game,
      user_key: userKey,
      duration,
      max_devices: maxDevices,
      status,
      expired_date: expired,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, message: "That key value already exists." };
    return { ok: false, message: "Failed to update key." };
  }

  await supabase.from("history").insert({
    user_do: profile.username,
    info: `Updated key ${userKey}`,
  });

  revalidatePath("/keys");
  revalidatePath("/dashboard");
  return { ok: true, message: "Key updated." };
}
