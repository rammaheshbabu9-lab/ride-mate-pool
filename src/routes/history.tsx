import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Screen, Spinner } from "@/components/rp/shell";
import { ChevronRight } from "@/components/rp/icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { km, rupees, STATUS_LABEL, type RideStatus } from "@/lib/ridepool";

export const Route = createFileRoute("/history")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ride history · RidePool" },
      { name: "description", content: "Every RidePool trip you have taken, with fares and status." },
      { property: "og:title", content: "Ride history · RidePool" },
      { property: "og:description", content: "Every RidePool trip you have taken." },
    ],
  }),
  component: HistoryPage,
});

type Row = {
  id: string;
  individual_fare: number;
  status: string;
  rides: {
    id: string;
    pickup_address: string;
    destination_address: string;
    estimated_distance_km: number;
    status: RideStatus;
    ride_type: string;
    created_at: string;
  } | null;
};

function HistoryPage() {
  const { loading, user, isDriver } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const passengerRides = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ride_passengers")
        .select(
          "id, individual_fare, status, rides(id, pickup_address, destination_address, estimated_distance_km, status, ride_type, created_at)",
        )
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const drivenRides = useQuery({
    queryKey: ["driven", user?.id],
    enabled: !!user && isDriver,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select("id, pickup_address, destination_address, estimated_distance_km, status, created_at")
        .eq("driver_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) return <Spinner />;

  return (
    <Screen>
      <section className="px-4 pt-4">
        <h1 className="font-display text-[26px] font-semibold leading-tight">Your rides</h1>

        {passengerRides.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">Loading your rides…</p>
        )}
        {passengerRides.isError && (
          <p className="mt-4 text-sm text-destructive">Couldn't load your rides. Pull to retry.</p>
        )}
        {passengerRides.data?.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No rides yet. Book your first pool from the home screen.
          </p>
        )}

        <div className="mt-3 space-y-2">
          {(passengerRides.data ?? []).map((row) =>
            row.rides ? (
              <Link
                key={row.id}
                to="/ride/$rideId"
                params={{ rideId: row.rides.id }}
                className="flex items-center gap-3 rounded-[14px] bg-card p-3 ring-1 ring-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {row.rides.pickup_address} → {row.rides.destination_address}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(row.rides.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {km(row.rides.estimated_distance_km)} ·{" "}
                    {row.rides.ride_type === "pool" ? "Pool" : "Normal"} ·{" "}
                    {STATUS_LABEL[row.rides.status]}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-base font-semibold">
                    {rupees(row.individual_fare)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">your share</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : null,
          )}
        </div>

        {isDriver && (
          <>
            <h2 className="mt-6 font-display text-lg font-semibold">Rides you drove</h2>
            <div className="mt-2 space-y-2">
              {(drivenRides.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No completed drives yet.</p>
              )}
              {(drivenRides.data ?? []).map((r) => (
                <Link
                  key={r.id}
                  to="/ride/$rideId"
                  params={{ rideId: r.id }}
                  className="block rounded-[14px] bg-card p-3 ring-1 ring-border"
                >
                  <p className="truncate text-sm font-semibold">
                    {r.pickup_address} → {r.destination_address}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {km(r.estimated_distance_km)} · {STATUS_LABEL[r.status as RideStatus]}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </Screen>
  );
}
