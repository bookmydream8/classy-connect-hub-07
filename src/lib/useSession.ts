import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function profileOf(user: { email?: string; user_metadata?: Record<string, unknown> } | null) {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta["full_name"] as string | undefined) ??
    (meta["name"] as string | undefined) ??
    (user?.email?.split("@")[0] ?? "Member");
  const avatar =
    (meta["avatar_url"] as string | undefined) ?? (meta["picture"] as string | undefined) ?? null;
  return { name, avatar, email: user?.email ?? "" };
}
