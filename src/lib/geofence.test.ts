import { describe, expect, it } from "vitest";
import {
  DEMO_OUTSIDE,
  DEMO_PLACES,
  detectTransition,
  distanceMeters,
  matchPlace,
} from "./geofence";

const home = DEMO_PLACES[0];
const cafe = DEMO_PLACES[1];

describe("geofence transitions", () => {
  it("measures a short distance inside the home fence", () => {
    const inside = { lat: home.lat + 0.0003, lng: home.lng };
    expect(distanceMeters(home, inside)).toBeLessThan(home.radiusM);
  });

  it("enters a place from outside", () => {
    const next = matchPlace(home, DEMO_PLACES, null);
    expect(next?.id).toBe("place_home");
    expect(detectTransition(null, next)).toEqual({ type: "enter", place: home });
  });

  it("exits a place when moving outside the hysteresis ring", () => {
    const far = DEMO_OUTSIDE;
    const next = matchPlace(far, DEMO_PLACES, home.id);
    expect(next).toBeNull();
    expect(detectTransition(home, next)).toEqual({ type: "exit", place: home });
  });

  it("keeps the current place inside the exit hysteresis band", () => {
    const edge = { lat: home.lat + 0.0012, lng: home.lng };
    const distance = distanceMeters(home, edge);
    expect(distance).toBeGreaterThan(home.radiusM);
    expect(distance).toBeLessThan(home.radiusM * 1.15);
    expect(matchPlace(edge, DEMO_PLACES, home.id)?.id).toBe("place_home");
  });

  it("transfers from home to cafe without a null gap", () => {
    const next = matchPlace(cafe, DEMO_PLACES, home.id);
    expect(next?.id).toBe("place_cafe");
    expect(detectTransition(home, next)).toEqual({
      type: "transfer",
      from: home,
      to: cafe,
    });
  });

  it("does not emit a transition when staying put", () => {
    expect(detectTransition(home, home)).toBeNull();
  });
});
