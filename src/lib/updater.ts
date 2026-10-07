const RELEASE_API = "https://api.github.com/repos/vili-pet/snappit-daily/releases/tags/latest";
export const APK_URL =
  "https://github.com/vili-pet/snappit-daily/releases/latest/download/snappit-daily.apk";

/** Build number baked in at CI time; 0 for local dev builds. */
export const BUILD_NUMBER = Number(import.meta.env.VITE_BUILD_NUMBER ?? 0);

export type UpdateCheck =
  | { status: "up-to-date" }
  | { status: "available"; build: number }
  | { status: "dev-build"; build: number }
  | { status: "offline" };

/**
 * Compares this build against the rolling "latest" GitHub release.
 * The release title carries the CI run number ("1.0.<run>").
 */
export async function checkForUpdate(): Promise<UpdateCheck> {
  try {
    const response = await fetch(`${RELEASE_API}?t=${Date.now()}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return { status: "offline" };
    const release = (await response.json()) as { name?: string };
    const match = /^1\.0\.(\d+)$/.exec(release.name ?? "");
    if (!match) return { status: "offline" };
    const build = Number(match[1]);
    if (BUILD_NUMBER === 0) return { status: "dev-build", build };
    return build > BUILD_NUMBER ? { status: "available", build } : { status: "up-to-date" };
  } catch {
    return { status: "offline" };
  }
}

/**
 * Opens the latest APK in the system browser, which handles the download and
 * install prompt. target="_blank" is what Capacitor routes to the external
 * browser on Android.
 */
export function openLatestApk(): void {
  window.open(APK_URL, "_blank");
}
