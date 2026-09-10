import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "driver" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isDriver: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  loading: true,
  session: null,
  user: null,
  profile: null,
  roles: [],
  isDriver: false,
  isAdmin: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(userId: string | undefined) {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, email, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  }

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      // Defer database reads out of the auth callback.
      setTimeout(() => {
        void load(next?.user?.id);
      }, 0);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await load(data.session?.user?.id);
      setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      isDriver: roles.includes("driver"),
      isAdmin: roles.includes("admin"),
      refresh: () => load(session?.user?.id),
    }),
    [loading, session, profile, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
