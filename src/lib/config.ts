export const APP_NAME = "NOCASH Panel";

/** Games supported by the panel. Map of key → display name. */
export const GAMES: Record<string, string> = {
  PUBG: "PUBG Mobile",
};

export type DurationOption = {
  hours: number;
  label: string;
  price: number; // price per device
};

/** Key durations and per-device pricing. */
export const DURATIONS: DurationOption[] = [
  { hours: 1, label: "1 Hour", price: 10 },
  { hours: 5, label: "5 Hours", price: 20 },
  { hours: 24, label: "1 Day", price: 40 },
  { hours: 72, label: "3 Days", price: 100 },
  { hours: 168, label: "7 Days", price: 170 },
  { hours: 336, label: "14 Days", price: 300 },
  { hours: 720, label: "30 Days", price: 500 },
  { hours: 1440, label: "60 Days", price: 800 },
];

export function getDurationOption(hours: number): DurationOption | undefined {
  return DURATIONS.find((d) => d.hours === hours);
}

/** Cost of a single key: duration price × number of devices. */
export function keyCost(hours: number, maxDevices: number): number {
  const option = getDurationOption(hours);
  if (!option) return 0;
  return option.price * maxDevices;
}

export function getGameLabel(key: string): string {
  return GAMES[key] ?? key;
}
