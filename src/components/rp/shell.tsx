import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Clock, Home, Shield, SteeringWheel, User } from "@/components/rp/icons";
import { useAuth } from "@/hooks/useAuth";

export function Diamond({ className = "" }: { className?: string }) {
  return <span className={`inline-block rotate-45 rounded-[2px] ${className}`} />;
}

export function BrandHeader({ subtitle }: { subtitle?: string | undefined }) {
  const { profile } = useAuth();
  const initial = (profile?.full_name || profile?.email || "R").trim().charAt(0).toUpperCase();
  return (
    <header className="flex items-center justify-between px-4 pt-3">
      <Link to="/" className="flex items-center gap-2">
        <Diamond className="h-3.5 w-3.5 bg-leaf ring-2 ring-leaf/25" />
        <span className="font-display text-lg font-semibold tracking-tight">RidePool</span>
      </Link>
      <div className="flex items-center gap-3">
        {subtitle ? (
          <span className="text-[11px] font-medium text-muted-foreground">{subtitle}</span>
        ) : null}
        <Link
          to="/profile"
          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground"
          aria-label="Your profile"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { isDriver, isAdmin } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/", label: "Home", Icon: Home },
    ...(isDriver ? [{ to: "/driver", label: "Drive", Icon: SteeringWheel }] : []),
    { to: "/history", label: "Rides", Icon: Clock },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", Icon: Shield }] : []),
    { to: "/profile", label: "You", Icon: User },
  ] as const;

  return (
    <nav className="sticky bottom-0 z-20 mt-6 border-t border-border bg-card/95 backdrop-blur">
      <div
        className="mx-auto grid max-w-md px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium ${
                active ? "text-leafdark" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Screen({ children, subtitle }: { children: ReactNode; subtitle?: string | undefined }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background pb-2">
      <BrandHeader subtitle={subtitle} />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}

export function DividerMotif() {
  return (
    <div className="mt-5 flex items-center gap-2 px-4">
      <Diamond className="h-2 w-2 bg-foreground/30" />
      <div className="h-px flex-1 bg-border" />
      <Diamond className="h-2 w-2 bg-foreground/30" />
      <div className="h-px flex-1 bg-border" />
      <Diamond className="h-2 w-2 bg-foreground/30" />
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <div className="flex items-center gap-1.5">
        <Diamond className="h-2.5 w-2.5 bg-leaf rp-pulse" />
        <Diamond className="h-2.5 w-2.5 bg-leaf rp-pulse" />
        <Diamond className="h-2.5 w-2.5 bg-clay rp-pulse" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
