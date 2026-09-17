import type { Coord, Place } from "./types";

const EARTH_RADIUS_M = 6_371_000;
const EXIT_FACTOR = 1.15;

export type GeofenceTransition =
  | { type: "enter"; place: Place }
  | { type: "exit"; place: Place }
  | { type: "transfer"; from: Place; to: Place };

export function distanceMeters(a: Coord, b: Coord): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function matchPlace(
  coord: Coord,
  places: Place[],
  previousPlaceId: string | null,
): Place | null {
  const previous = places.find((place) => place.id === previousPlaceId) ?? null;
  if (previous) {
    const stayRadius = previous.radiusM * EXIT_FACTOR;
    if (distanceMeters(coord, previous) <= stayRadius) {
      return previous;
    }
  }

  let nearest: { place: Place; distance: number } | null = null;
  for (const place of places) {
    const distance = distanceMeters(coord, place);
    if (distance <= place.radiusM && (!nearest || distance < nearest.distance)) {
      nearest = { place, distance };
    }
  }
  return nearest?.place ?? null;
}

export function detectTransition(
  previous: Place | null,
  next: Place | null,
): GeofenceTransition | null {
  if (previous?.id === next?.id) return null;
  if (!previous && next) return { type: "enter", place: next };
  if (previous && !next) return { type: "exit", place: previous };
  if (previous && next) return { type: "transfer", from: previous, to: next };
  return null;
}

export function transitionCopy(transition: GeofenceTransition): {
  title: string;
  body: string;
} {
  if (transition.type === "enter") {
    return {
      title: `Saavuit: ${transition.place.name}`,
      body: "Paikka vaihtui. Kuvaa 10 sekunnin hetki?",
    };
  }
  if (transition.type === "exit") {
    return {
      title: `Lähdit: ${transition.place.name}`,
      body: "Liike havaittu. Kuvaa tämä siirtymä?",
    };
  }
  return {
    title: `${transition.from.name} → ${transition.to.name}`,
    body: "Paikka vaihtui. Kuvaa hetki?",
  };
}

export const DEMO_PLACES: Place[] = [
  {
    id: "place_home",
    name: "Koti",
    lat: 60.1699,
    lng: 24.9384,
    radiusM: 120,
    kind: "home",
  },
  {
    id: "place_cafe",
    name: "Kahvila",
    lat: 60.1712,
    lng: 24.9416,
    radiusM: 80,
    kind: "custom",
  },
  {
    id: "place_work",
    name: "Työ",
    lat: 60.186,
    lng: 24.831,
    radiusM: 150,
    kind: "custom",
  },
];

export const DEMO_OUTSIDE: Coord = { lat: 60.165, lng: 24.93 };

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
