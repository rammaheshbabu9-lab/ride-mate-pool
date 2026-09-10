import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen, Spinner } from "@/components/rp/shell";
import { LogOut } from "@/components/rp/icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError } from "@/lib/ridepool";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your profile · RidePool" },
      { name: "description", content: "Manage your RidePool account details and sign out." },
      { property: "og:title", content: "Your profile · RidePool" },
      { property: "og:description", content: "Manage your RidePool account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { loading, user, profile, roles, refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return <Spinner />;

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error(friendlyError(error));
      return;
    }
    await refresh();
    toast.success("Profile saved");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <Screen>
      <section className="px-4 pt-4">
        <h1 className="font-display text-[26px] font-semibold leading-tight">Your profile</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Signed in as {user.email} · {roles.join(", ") || "customer"}
        </p>

        <div className="mt-4 space-y-3 rounded-[14px] bg-card p-4 ring-1 ring-border">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Full name
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Phone
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="mt-1 w-full rounded-[10px] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="10-digit mobile number"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-[12px] bg-primary py-3 font-display text-[15px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <button
          onClick={signOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-card py-3 text-sm font-medium text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Driver and admin access is granted by the RidePool team — it can't be selected here.
        </p>
      </section>
    </Screen>
  );
}
