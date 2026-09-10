import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Diamond } from "@/components/rp/shell";
import { Loader2 } from "@/components/rp/icons";
import { friendlyError } from "@/lib/ridepool";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · RidePool" },
      {
        name: "description",
        content: "Sign in or create your RidePool account to share rides and split fares.",
      },
      { property: "og:title", content: "Sign in · RidePool" },
      { property: "og:description", content: "Create your RidePool account in seconds." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter your email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) {
      toast.error("Google sign-in didn't work. Try email instead.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background px-4 pb-8 pt-10">
      <div className="flex items-center gap-2">
        <Diamond className="h-4 w-4 bg-leaf ring-2 ring-leaf/25" />
        <span className="font-display text-xl font-semibold tracking-tight">RidePool</span>
      </div>

      <h1 className="mt-6 max-w-[16ch] font-display text-[28px] font-semibold leading-tight">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Share your route. Pay less.</p>

      {emailSent ? (
        <div className="mt-6 rounded-[14px] bg-card p-4 ring-1 ring-border">
          <p className="text-sm font-semibold">Confirm your email</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Open it, then come back and sign in.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setMode("signin");
            }}
            className="mt-3 w-full rounded-[12px] bg-primary py-3 font-display text-[15px] font-medium text-primary-foreground"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-[12px] border border-input bg-card px-3 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="Mobile number"
                  className="w-full rounded-[12px] border border-input bg-card px-3 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full rounded-[12px] border border-input bg-card px-3 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Password"
              className="w-full rounded-[12px] border border-input bg-card px-3 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary py-3.5 font-display text-[15px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="mt-4 w-full rounded-[12px] border border-border bg-card py-3.5 text-sm font-medium disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-sm text-muted-foreground"
          >
            {mode === "signin" ? (
              <>
                New to RidePool? <span className="font-semibold text-leafdark">Create account</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="font-semibold text-leafdark">Sign in</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
