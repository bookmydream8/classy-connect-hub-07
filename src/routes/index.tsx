import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard, type Listing } from "@/components/ListingCard";
import {
  CATEGORIES,
  CITIES,
  DEFAULT_CITY,
  LISTING_TYPES,
  type CategoryId,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Madhura — Masterclass board for classes & competitions" },
      {
        name: "description",
        content:
          "Discover physical classes, online classes and competitions across music, languages, curriculum, trading and AI tools in Indian cities.",
      },
      { property: "og:title", content: "Madhura — Masterclass board" },
      {
        property: "og:description",
        content:
          "Discover physical classes, online classes and competitions across music, languages, curriculum, trading and AI tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [types, setTypes] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const subOptions = useMemo(
    () => (category === "all" ? [] : (CATEGORIES.find((c) => c.id === category)?.options ?? [])),
    [category],
  );

  const listings = (data ?? []).filter((l) => {
    if (category !== "all" && l.category !== category) return false;
    if (subcategory && l.subcategory !== subcategory) return false;
    if (types.length && !types.includes(l.listing_type)) return false;
    if (l.listing_type !== "online" && l.city && l.city !== city) return false;
    return true;
  });

  function toggleType(id: string) {
    setTypes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="sticky top-[61px] z-20 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <button
            onClick={() => {
              setCategory("all");
              setSubcategory(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === "all"
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setSubcategory(null);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === c.id
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="chip-label">City</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-8 rounded-full border border-input bg-background px-3 text-xs"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
            {subOptions.length ? (
              <div className="surface-card p-4">
                <p className="chip-label mb-3">
                  {CATEGORIES.find((c) => c.id === category)?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subOptions.map((o) => (
                    <button
                      key={o}
                      onClick={() => setSubcategory(subcategory === o ? null : o)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        subcategory === o
                          ? "bg-marigold text-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="surface-card p-4">
              <p className="chip-label mb-3">Format</p>
              <div className="space-y-2 text-sm">
                {LISTING_TYPES.map((t) => (
                  <label key={t.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-primary)]"
                      checked={types.includes(t.id)}
                      onChange={() => toggleType(t.id)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5">
              <h1 className="font-display text-3xl">Learn from a master near you</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLoading
                  ? "Loading the board…"
                  : `${listings.length} listing${listings.length === 1 ? "" : "s"} in ${city} and online`}
              </p>
            </div>

            {!isLoading && listings.length === 0 ? (
              <div className="surface-card p-10 text-center">
                <h2 className="font-display text-xl">Nothing here yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to post a class or competition for this filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
