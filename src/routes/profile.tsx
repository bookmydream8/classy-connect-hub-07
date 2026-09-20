import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, TopBar } from "@/components/AppShell";
import { profileOf, useSession } from "@/lib/useSession";
import type { Listing } from "@/components/ListingCard";
import { formatPrice, formatDateRange, typeLabel } from "@/lib/taxonomy";
import fallbackImage from "@/assets/class-fallback.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Madhura Masterclass Board" },
      {
        name: "description",
        content: "See the classes and competitions you posted on Madhura, or sign out.",
      },
      { property: "og:title", content: "Your profile — Madhura Masterclass Board" },
      {
        property: "og:description",
        content: "See the classes and competitions you posted on Madhura.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useSession();
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: mine, isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  const { name, avatar, email } = profileOf(user);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
  }

  return (
    <AppShell active="profile" header={<TopBar title="Profile" subtitle="Madhura" backTo="/" />}>
      <div className="px-4 py-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        ) : !user ? (
          <div className="surface-card p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marigold font-display text-xl">
              म
            </span>
            <h2 className="mt-3 font-display text-xl">You're browsing as a guest</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with Google to post a class and manage your listings.
            </p>
            <Link
              to="/auth"
              className="tap mt-5 block h-12 rounded-xl bg-primary text-center leading-12 text-sm font-semibold text-primary-foreground"
            >
              Continue with Google
            </Link>
          </div>
        ) : (
          <>
            <div className="surface-card flex items-center gap-3 p-4">
              <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-secondary font-display text-lg">
                {avatar ? (
                  <img src={avatar} alt="" className="size-full object-cover" />
                ) : (
                  name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="font-display text-lg">My listings</h2>
              <Link to="/post" className="text-xs font-medium text-primary">
                Post new
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !mine?.length ? (
                <div className="surface-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nothing posted yet. Your classes and competitions will show up here.
                  </p>
                  <Link
                    to="/post"
                    className="tap mt-4 inline-flex h-11 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
                  >
                    Post your first class
                  </Link>
                </div>
              ) : (
                mine.map((l) => (
                  <div key={l.id} className="surface-card flex items-center gap-3 p-3">
                    <Link to="/class/$id" params={{ id: l.id }} className="tap shrink-0">
                      <img
                        src={l.image_url || fallbackImage}
                        alt=""
                        className="size-16 rounded-xl object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px]">{l.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {typeLabel(l.listing_type)} · {formatPrice(l.is_free, l.price)} ·{" "}
                        {formatDateRange(l.start_date, l.end_date)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {confirmId === l.id ? (
                          <>
                            <button
                              onClick={() => remove.mutate(l.id)}
                              className="tap h-7 rounded-full bg-destructive px-3 text-[11px] font-semibold text-destructive-foreground"
                            >
                              {remove.isPending ? "Deleting…" : "Yes, delete"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="tap h-7 rounded-full border border-input px-3 text-[11px] font-medium"
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setConfirmId(l.id)}
                              className="tap flex h-7 items-center gap-1.5 rounded-full border border-input px-3 text-[11px] font-medium text-muted-foreground"
                            >
                              <Trash2 className="size-3" /> Delete
                            </button>
                            <Link
                              to="/class/$id"
                              params={{ id: l.id }}
                              className="tap flex h-7 items-center gap-1.5 rounded-full bg-secondary px-3 text-[11px] font-medium text-secondary-foreground"
                            >
                              <Link2 className="size-3" /> View
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={signOut}
              className="tap mt-6 h-11 w-full rounded-xl border border-input bg-background text-sm font-medium text-muted-foreground"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
