import { Capacitor } from "@capacitor/core";

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function ensureLocationPermission(): Promise<boolean> {
  if (!isNativePlatform()) return true;
  const { Geolocation } = await import("@capacitor/geolocation");
  const status = await Geolocation.checkPermissions();
  if (status.location === "granted" || status.coarseLocation === "granted") return true;
  const requested = await Geolocation.requestPermissions({ permissions: ["location"] });
  return requested.location === "granted" || requested.coarseLocation === "granted";
}
