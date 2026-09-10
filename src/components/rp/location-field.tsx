import { useState } from "react";
import { Navigation, Loader2 } from "@/components/rp/icons";
import { getCurrentPosition } from "@/lib/ridepool";
import { nearestPlace, searchPlaces, type Place } from "@/lib/places";
import { toast } from "sonner";

export type Location = { lat: number; lng: number; address: string; city?: string };

type Props = {
  kind: "pickup" | "destination";
  value: Location | null;
  onChange: (loc: Location) => void;
};

export function LocationField({ kind, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const results: Place[] = searchPlaces(query);

  async function useMyLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const near = nearestPlace(pos.lat, pos.lng);
      onChange({
        lat: pos.lat,
        lng: pos.lng,
        address: `My location · ${near.name}`,
        city: near.city,
      });
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't get your location.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${kind === "pickup" ? "bg-leaf" : "bg-clay"}`}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] uppercase tracking-wide text-muted-foreground">
            {kind === "pickup" ? "Pickup" : "Destination"}
          </span>
          <span className="block truncate text-sm font-medium">
            {value ? value.address : kind === "pickup" ? "Choose pickup" : "Choose destination"}
          </span>
        </span>
      </button>

      {open && (
        <div className="rp-rise border-t border-border bg-card px-3 py-3">
          {kind === "pickup" && (
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-secondary py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Use my current location
            </button>
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area or city"
            className="w-full rounded-[10px] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {results.length === 0 && (
              <li className="px-1 py-2 text-xs text-muted-foreground">
                No area found. Try another name.
              </li>
            )}
            {results.map((p) => (
              <li key={`${p.city}-${p.name}`}>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      lat: p.lat,
                      lng: p.lng,
                      address: `${p.name}, ${p.city}`,
                      city: p.city,
                    });
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-sm hover:bg-secondary"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.city}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
