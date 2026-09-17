import { useEffect, useState } from "react";
import { inspectCameraSupport } from "../lib/media";
import type { PermissionKind } from "../lib/types";

async function queryPermission(name: PermissionName): Promise<PermissionKind> {
  if (!navigator.permissions?.query) return "prompt";
  try {
    const status = await navigator.permissions.query({ name });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") {
      return status.state;
    }
    return "prompt";
  } catch {
    return "prompt";
  }
}

export function usePermissions() {
  const support = inspectCameraSupport();
  const [camera, setCamera] = useState<PermissionKind>(
    support.getUserMedia ? "prompt" : "unsupported",
  );
  const [location, setLocation] = useState<PermissionKind>(
    typeof navigator !== "undefined" && "geolocation" in navigator ? "prompt" : "unsupported",
  );

  useEffect(() => {
    if (!support.getUserMedia) return;
    void queryPermission("camera" as PermissionName).then(setCamera);
  }, [support.getUserMedia]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    void queryPermission("geolocation").then(setLocation);
  }, []);

  return { camera, location, support };
}
