import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen, Spinner, Diamond } from "@/components/rp/shell";
import { RoutePreview } from "@/components/rp/route-preview";
import { StatusTimeline } from "@/components/rp/status-timeline";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { etaMinutes, friendlyError, km, rupees, STATUS_LABEL, type RideStatus } from "@/lib/ridepool";

export const Route = createFileRoute("/ride/$rideId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live ride · RidePool" },
      { name: "description", content: "Track your pooled ride, driver and fare share live." },
      { property: "og:title", content: "Live ride · RidePool" },
      { property: "og:description", content: "Track your pooled ride and fare share live." },
    ],
  }),
  component: RidePage,
});

function RidePage() {
  const { rideId } = Route.useParams();
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const ride = useQuery({
    queryKey: ["ride", rideId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("rides").select("*").eq("id", rideId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const passengers = useQuery({
    queryKey: ["ride-passengers", rideId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ride_passengers")
        .select("id, customer_id, pickup_address, destination_address, individual_fare, pickup_order, status")
        .eq("ride_id", rideId)
        .order("pickup_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const driverId = ride.data?.driver_id ?? null;
  const driver = useQuery({
    queryKey: ["ride-driver", driverId],
    enabled: !!driverId,
    queryFn: async () => {
      const [{ data: prof }, { data: drv }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", driverId!).maybeSingle(),
        supabase
          .from("drivers")
          .select("rating, city, vehicles(vehicle_number, vehicle_type)")
          .eq("profile_id", driverId!)
          .maybeSingle(),
      ]);
      return { prof, drv } as {
        prof: { full_name: string | null; phone: string | null } | null;
        drv: {
          rating: number;
          city: string | null;
          vehicles: { vehicle_number: string; vehicle_type: string } | null;
        } | null;
      };
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`ride-${rideId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rides", filter: `id=eq.${rideId}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["ride", rideId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ride_passengers", filter: `ride_id=eq.${rideId}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["ride-passengers", rideId] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [rideId, user, queryClient]);

  if (loading || !user) return <Spinner />;
  if (ride.isLoading) return <Spinner label="Loading your ride" />;
  if (ride.isError || !ride.data) {
    return (
      <Screen>
        <div className="px-4 pt-10 text-center">
          <p className="font-display text-lg font-semibold">Ride not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This ride may have been cancelled or is not yours.
          </p>
        </div>
      </Screen>
    );
  }

  const r = ride.data;
  const status = r.status as RideStatus;
  const active = passengers.data?.filter((p) => p.status === "active") ?? [];
  const mine = passengers.data?.find((p) => p.customer_id === user.id) ?? null;
  const shared = Math.max(0, active.length - 1);

  async function cancel() {
    setCancelling(true);
    const { error } = await supabase.rpc("cancel_my_ride", { _ride_id: rideId });
    setCancelling(false);
    if (error) {
      toast.error(friendlyError(error));
      return;
    }
    toast.success("Ride cancelled");
    void queryClient.invalidateQueries();
    void navigate({ to: "/" });
  }

  const canCancel =
    mine?.status === "active" && ["searching", "matched", "driver_arriving"].includes(status);

  return (
    <Screen subtitle={r.city ?? undefined}>
      <section className="mt-3 px-4">
        <RoutePreview pickupLabel={r.pickup_address} dropLabel={r.destination_address} />
      </section>

      <section className="mt-4 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold">Live ride</h1>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-leafdark">
            {status !== "cancelled" && status !== "completed" && (
              <span className="h-1.5 w-1.5 rounded-full bg-leaf rp-pulse" />
            )}
            {STATUS_LABEL[status]}
          </span>
        </div>

        <StatusTimeline status={status} />

        <div className="mt-3 rounded-[14px] bg-card p-3 ring-1 ring-border">
          {driverId ? (
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-semibold">
                {(driver.data?.prof?.full_name ?? "D").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {driver.data?.prof?.full_name || "Your driver"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driver.data?.drv?.vehicles?.vehicle_type ?? "Auto"} ·{" "}
                  {driver.data?.drv?.vehicles?.vehicle_number ?? "—"}
                  {driver.data?.prof?.phone ? ` · ${driver.data.prof.phone}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-semibold">
                  {rupees(mine?.individual_fare ?? r.pooled_fare)}
                </p>
                <p className="text-[10px] text-muted-foreground">your share</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {status === "cancelled" ? "Ride cancelled" : "Looking for a driver"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {status === "cancelled"
                    ? "No driver was assigned."
                    : "We'll notify you the moment a driver accepts."}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold">
                  {rupees(mine?.individual_fare ?? r.pooled_fare)}
                </p>
                <p className="text-[10px] text-muted-foreground">your share</p>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Diamond className="h-2 w-2 shrink-0 bg-leaf" />
            {shared > 0 && <Diamond className="h-2 w-2 shrink-0 bg-leaf" />}
            <div className="h-[2px] flex-1 rounded-full bg-leaf" />
            <Diamond className="h-2 w-2 shrink-0 bg-clay" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {shared === 0 ? "No co-passenger yet" : `${shared} shared passenger${shared > 1 ? "s" : ""}`}
            </span>
            <span>
              {km(r.estimated_distance_km)} · ETA {etaMinutes(Number(r.estimated_distance_km))} min
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-[14px] bg-card p-3 ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground">Pickup sequence</p>
          <ol className="mt-2 space-y-2">
            {active.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {p.pickup_address} → {p.destination_address}
                </span>
                <span className="shrink-0 text-xs font-semibold">{rupees(p.individual_fare)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Payment: {r.payment_status === "paid" ? "Paid" : "Pay the driver at drop-off"}
          </p>
        </div>

        {canCancel && (
          <button
            onClick={cancel}
            disabled={cancelling}
            className="mt-3 w-full rounded-[12px] border border-border bg-card py-3 text-sm font-medium text-destructive disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel my ride"}
          </button>
        )}
      </section>
    </Screen>
  );
}
