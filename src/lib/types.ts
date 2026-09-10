export type Profile = {
  id: string;
  username: string;
  fullname: string | null;
  level: number; // 1 = admin, 2 = reseller
  saldo: number;
  status: number; // 1 = active, 0 = disabled
  uplink: string | null;
  created_at: string;
  updated_at: string;
};

export type LicenseKey = {
  id: number;
  game: string;
  user_key: string;
  duration: number;
  expired_date: string | null;
  max_devices: number;
  devices: string | null;
  status: number;
  registrator: string;
  created_at: string;
  updated_at: string;
};

export type ReferralCode = {
  id: string;
  code: string;
  set_saldo: number;
  used_by: string | null;
  created_by: string | null;
  created_at: string;
};

export type HistoryEntry = {
  id: number;
  keys_id: number | null;
  user_do: string | null;
  info: string;
  created_at: string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
};

export type DeviceCount = {
  used: number;
  max: number;
};

export function countDevices(devices: string | null): DeviceCount {
  if (!devices) return { used: 0, max: 0 };
  const list = devices
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  return { used: list.length, max: list.length };
}
