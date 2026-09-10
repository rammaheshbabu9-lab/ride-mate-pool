import { haversineKm } from "./places";

export type RideStatus =
  | "searching"
  | "matched"
  | "driver_arriving"
  | "started"
  | "completed"
  | "cancelled";

export const RIDE_STEPS: { key: RideStatus; label: string }[] = [
  { key: "searching", label: "Searching" },
  { key: "matched", label: "Matched" },
  { key: "driver_arriving", label: "Arriving" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Done" },
];

export const STATUS_LABEL: Record<RideStatus, string> = {
  searching: "Searching for a pool",
  matched: "Matched — finding a driver",
  driver_arriving: "Driver arriving",
  started: "Ride started",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function stepIndex(status: RideStatus): number {
  const i = RIDE_STEPS.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
}

export const ACTIVE_STATUSES: RideStatus[] = [
  "searching",
  "matched",
  "driver_arriving",
  "started",
];

export function rupees(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function km(value: number | string | null | undefined): string {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

export function etaMinutes(distanceKm: number): number {
  return Math.max(4, Math.round(distanceKm * 2.4));
}

export { haversineKm };

/** Turns any backend/network failure into something a rider can understand. */
export function friendlyError(error: unknown): string {
  const raw =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "";

  const map: [RegExp, string][] = [
    [/already have an active ride/i, "You already have a ride in progress."],
    [/too close/i, "Pickup and destination are too close for a ride."],
    [/no longer available/i, "Another driver just took this ride."],
    [/Only drivers/i, "This action is only available to drivers."],
    [/not assigned to you/i, "This ride is not assigned to you."],
    [/not on this ride/i, "You are not part of this ride."],
    [/Not allowed|permission|row-level security|policy/i, "You don't have access to that."],
    [/Invalid login credentials/i, "Wrong email or password."],
    [/User already registered/i, "That email already has an account. Try signing in."],
    [/Password should be/i, "Please use a password of at least 6 characters."],
    [/Email not confirmed/i, "Please confirm your email, then sign in."],
    [/duplicate key|unique constraint/i, "That request already exists."],
    [/fetch|network|Failed to send/i, "Network problem. Check your connection and try again."],
  ];
  for (const [re, msg] of map) if (re.test(raw)) return msg;
  return "Something went wrong. Please try again.";
}

export type GeoResult = { lat: number; lng: number };

export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Pick your area from the list instead.",
          2: "Couldn't get your location. Pick your area from the list instead.",
          3: "Location took too long. Pick your area from the list instead.",
        };
        reject(new Error(messages[err.code] ?? "Couldn't get your location."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}
