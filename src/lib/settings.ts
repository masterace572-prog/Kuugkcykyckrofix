import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSettings = {
  modname: string;
  telegram: string;
  floating_text: string;
  floating_status: string;
  maintenance: boolean;
};

export const SETTING_DEFAULTS: AppSettings = {
  modname: "NOCASH KURO PANEL",
  telegram: "@NOCASH_xD",
  floating_text: "@NOCASH_xD",
  floating_status: "Safe",
  maintenance: false,
};

export const SETTING_KEYS: (keyof AppSettings)[] = [
  "modname",
  "telegram",
  "floating_text",
  "floating_status",
  "maintenance",
];

export async function getAppSettings(
  supabase: SupabaseClient
): Promise<AppSettings> {
  const { data } = await supabase.from("app_settings").select("key, value");
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }

  return {
    modname:
      typeof map.modname === "string" ? map.modname : SETTING_DEFAULTS.modname,
    telegram:
      typeof map.telegram === "string" ? map.telegram : SETTING_DEFAULTS.telegram,
    floating_text:
      typeof map.floating_text === "string"
        ? map.floating_text
        : SETTING_DEFAULTS.floating_text,
    floating_status:
      typeof map.floating_status === "string"
        ? map.floating_status
        : SETTING_DEFAULTS.floating_status,
    maintenance: map.maintenance === true,
  };
}
