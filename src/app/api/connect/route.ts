import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppSettings } from "@/lib/settings";

export const runtime = "nodejs";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

function addHours(iso: string | null, hours: number): string {
  const base = iso ? new Date(iso) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString();
  base.setHours(base.getHours() + hours);
  return base.toISOString();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "nocash-panel",
    version: "1.0.0",
  });
}

export async function POST(request: NextRequest) {
  const staticWords = process.env.STATIC_WORDS || "nocash-panel-secret";

  let game: string | null = null;
  let userKey: string | null = null;
  let serial: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      game = String(body.game ?? "").trim();
      userKey = String(body.user_key ?? body.userKey ?? "").trim();
      serial = String(body.serial ?? "").trim();
    } else {
      const form = await request.formData();
      game = String(form.get("game") ?? "").trim();
      userKey = String(form.get("user_key") ?? "").trim();
      serial = String(form.get("serial") ?? "").trim();
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  if (!game || !userKey || !serial) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const settings = await getAppSettings(admin);

  if (settings.maintenance) {
    return NextResponse.json({ ok: false, error: "maintenance" }, { status: 503 });
  }

  const { data: key } = await admin
    .from("keys_code")
    .select("*")
    .eq("user_key", userKey)
    .eq("game", game)
    .maybeSingle();

  if (!key) {
    return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
  }

  if (key.status !== 1) {
    return NextResponse.json({ ok: false, error: "key_inactive" }, { status: 403 });
  }

  const devices: string[] = key.devices
    ? key.devices.split(",").map((d: string) => d.trim()).filter(Boolean)
    : [];

  // Activate on first use by setting the expiry from now + duration.
  let expired = key.expired_date;
  if (!expired) {
    expired = addHours(null, key.duration);
    await admin.from("keys_code").update({ expired_date: expired }).eq("id", key.id);
  } else if (new Date(expired).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "key_expired" }, { status: 403 });
  }

  // Bind the device serial.
  if (!devices.includes(serial)) {
    if (devices.length >= Number(key.max_devices)) {
      return NextResponse.json({ ok: false, error: "device_limit" }, { status: 403 });
    }
    devices.push(serial);
    await admin
      .from("keys_code")
      .update({ devices: devices.join(",") })
      .eq("id", key.id);
  }

  const token = md5(`${game}-${userKey}-${serial}-${staticWords}`);

  return NextResponse.json({
    ok: true,
    token,
    modname: settings.modname,
    telegram: settings.telegram,
    floating_text: settings.floating_text,
    floating_status: settings.floating_status,
    expiry: expired,
    rng: Date.now(),
  });
}
