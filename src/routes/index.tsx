import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Sheet } from "@/components/Sheet";
import { ListingCard, type Listing } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { profileOf, useSession } from "@/lib/useSession";
import {
  CATEGORIES,
  CITIES,
  DEFAULT_CITY,
  LISTING_TYPES,
  categoryLabel,
  type CategoryId,
  type ListingType,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Madhura — Masterclass board for classes & competitions" },
      {
        name: "description",
        content:
          "Find physical classes, online classes and competitions across music, Indian languages, curriculum, trading and AI tools.",
      },
      { property: "og:title", content: "Madhura — Masterclass board" },
      {
        property: "og:description",
        content:
          "Find physical classes, online classes and competitions across music, Indian languages, curriculum, trading and AI tools.",
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
  const [types, setTypes] = useState<ListingType[]>([]);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { user } = useSession();
  const { name, avatar } = profileOf(user);

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
    if (types.length && !types.includes(l.listing_type as ListingType)) return false;
    if (l.listing_type !== "online" && l.city && l.city !== city) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = `${l.title} ${l.about_master} ${l.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const activeFilters =
    types.length + (subcategory ? 1 : 0) + (city !== DEFAULT_CITY ? 1 : 0);

  function toggleType(id: ListingType) {
    setTypes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function resetFilters() {
    setTypes([]);
    setSubcategory(null);
    setCity(DEFAULT_CITY);
  }

  const header = (
    <header className="safe-top z-30 flex-none bg-paper/75 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 pt-6 pb-5">
        <span className="grid size-10 place-items-center rounded-full bg-marigold font-display text-lg font-semibold text-foreground">
          म
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[22px] leading-snug">Madhura</span>
          <span className="chip-label block">Masterclass board</span>
        </span>
        <div className="ml-auto">
          {user ? (
            <Link
              to="/profile"
              aria-label="Your profile"
              className="tap grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-secondary font-display text-sm"
            >
              {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : name.slice(0, 1).toUpperCase()}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="tap rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="px-6 pb-5">
        <div className="flex h-12 items-center gap-2 rounded-lg border border-input bg-paper/80 px-3.5 shadow-card">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes, masters, competitions"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <Button variant="ghost" size="icon" onClick={() => setQuery("")} aria-label="Clear search" className="tap size-7 text-muted-foreground">
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );

  return (
    <AppShell
      active="board"
      header={header}
      overlay={
        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Filters"
          footer={
            <div className="flex gap-2">
              <Button variant="outline"
                onClick={resetFilters}
                className="tap h-12 flex-1 rounded-xl border border-input bg-background text-sm font-medium"
              >
                Show everything
              </Button>
              <Button
                onClick={() => setSheetOpen(false)}
                className="tap h-12 flex-[1.4] rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                Show {listings.length} result{listings.length === 1 ? "" : "s"}
              </Button>
            </div>
          }
        >
          <p className="chip-label mb-2">Format</p>
          <div className="space-y-2">
            {LISTING_TYPES.map((t) => {
              const on = types.includes(t.id);
              return (
                <Button variant={on ? "secondary" : "outline"}
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`tap flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                    on ? "border-primary bg-primary/10" : "border-border bg-background"
                  }`}
                >
                  <span
                    className={`grid size-5 place-items-center rounded-md border ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    }`}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                  {t.label}
                </Button>
              );
            })}
          </div>

          <p className="chip-label mb-2 mt-6">City</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Button variant={city === c ? "default" : "secondary"}
                key={c}
                onClick={() => setCity(c)}
                className={`tap rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                  city === c ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c}
              </Button>
            ))}
          </div>

          {subOptions.length ? (
            <>
              <p className="chip-label mb-2 mt-6">
                {categoryLabel(category)} — focus
              </p>
              <div className="flex flex-wrap gap-2">
                {subOptions.map((o) => (
                  <Button variant={subcategory === o ? "default" : "secondary"}
                    key={o}
                    onClick={() => setSubcategory(subcategory === o ? null : o)}
                    className={`tap rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                      subcategory === o ? "bg-marigold text-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </Sheet>
      }
    >
      <div className="sticky top-0 z-20 border-b border-border/60 bg-paper/80 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-3">
          <Chip active={category === "all"} onClick={() => {
            setCategory("all");
            setSubcategory(null);
          }}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              active={category === c.id}
              onClick={() => {
                setCategory(c.id);
                setSubcategory(null);
              }}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="px-6 pt-7">
        <h1 className="font-display text-[25px] leading-snug">
          {category === "all" ? "Discover your next class" : categoryLabel(category)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading
            ? "Loading the board…"
            : `${listings.length} class${listings.length === 1 ? "" : "es"} in ${city} and online`}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 px-6">
        <Button variant="outline"
          onClick={() => setSheetOpen(true)}
          className="tap flex h-9 items-center gap-2 rounded-full border border-input bg-paper/80 px-3 text-xs font-medium"
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeFilters ? (
            <span className="grid size-[18px] place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeFilters}
            </span>
          ) : null}
        </Button>
        <Button variant="outline"
          onClick={() => setSheetOpen(true)}
          className="tap flex h-9 items-center gap-1.5 rounded-full border border-input bg-paper/80 px-3 text-xs font-medium"
        >
          <MapPin className="size-3.5 text-primary" />
          {city}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      {subOptions.length ? (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar px-6">
          {subOptions.map((o) => (
            <Button variant={subcategory === o ? "default" : "secondary"}
              key={o}
              onClick={() => setSubcategory(subcategory === o ? null : o)}
              className={`tap shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                subcategory === o
                  ? "bg-marigold text-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {o}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="px-6 pt-6 pb-8">
        {!isLoading && listings.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <h2 className="font-display text-xl">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different filter, or be the first to post for this focus.
            </p>
            <Link
              to="/post"
              className="tap mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Post a class
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {listings[0] ? <div><p className="chip-label mb-3 text-primary">Featured on the board</p><ListingCard listing={listings[0]} /></div> : null}
            {listings.length > 1 ? (
              <div className="space-y-4">
                <h2 className="font-display text-lg">More to explore</h2>
                {listings.slice(1).map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant={active ? "default" : "secondary"}
      onClick={onClick}
      className={`tap shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-paper/70 text-secondary-foreground"
      }`}
    >
      {children}
    </Button>
  );
}
