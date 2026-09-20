import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink, MapPin, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, TopBar } from "@/components/AppShell";
import fallbackImage from "@/assets/class-fallback.jpg";
import type { Listing } from "@/components/ListingCard";
import { categoryLabel, formatDateRange, formatPrice, typeLabel } from "@/lib/taxonomy";

export const Route = createFileRoute("/class/$id")({
  head: () => ({
    meta: [
      { title: "Class details — Madhura Masterclass Board" },
      {
        name: "description",
        content: "Full details of this class, workshop or competition on Madhura.",
      },
      { property: "og:title", content: "Class details — Madhura Masterclass Board" },
      {
        property: "og:description",
        content: "Full details of this class, workshop or competition on Madhura.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassDetail,
});

function ClassDetail() {
  const { id } = Route.useParams();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Listing | null;
    },
  });

  async function share() {
    const url = window.location.href;
    const title = data?.title ?? "Madhura listing";
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const isOnline = data?.listing_type === "online";
  const showMaps = Boolean(data?.map_location) && !isOnline;

  return (
    <AppShell
      active="board"
      showTabs={false}
      header={
        <TopBar
          title={data?.title ?? "Class details"}
          subtitle={data ? typeLabel(data.listing_type) : undefined}
          backTo="/"
          action={
            <button
              onClick={share}
              aria-label="Share this listing"
              className="tap grid size-9 place-items-center rounded-full border border-border bg-background text-foreground"
            >
              {copied ? <Check className="size-4 text-leaf" /> : <Share2 className="size-4" />}
            </button>
          }
        />
      }
      footer={
        data ? (
          <div className="safe-bottom z-20 flex-none border-t border-border bg-paper/95 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <p className="font-display text-lg">{formatPrice(data.is_free, data.price)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDateRange(data.start_date, data.end_date)}
                </p>
              </div>
              {showMaps ? (
                <a
                  href={data.map_location!}
                  target="_blank"
                  rel="noreferrer"
                  className="tap ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  <MapPin className="size-4" />
                  Venue
                  <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <button
                  onClick={share}
                  className="tap ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  <Share2 className="size-4" />
                  {copied ? "Link copied" : "Share listing"}
                </button>
              )}
            </div>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data ? (
        <div className="px-4 py-10">
          <div className="surface-card p-6 text-center">
            <h2 className="font-display text-xl">This listing is no longer available</h2>
            <Link
              to="/"
              className="tap mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Back to the board
            </Link>
          </div>
        </div>
      ) : (
        <article>
          <img
            src={data.image_url || fallbackImage}
            alt={data.title}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="px-4 py-4 pb-8">
            <div className="chip-label">
              {typeLabel(data.listing_type)} · {categoryLabel(data.category)}
              {data.subcategory ? ` · ${data.subcategory}` : ""}
            </div>
            <h2 className="mt-2 font-display text-2xl leading-snug">{data.title}</h2>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Price" value={formatPrice(data.is_free, data.price)} />
              <Stat
                label={data.listing_type === "competition" ? "Window" : "Dates"}
                value={formatDateRange(data.start_date, data.end_date)}
              />
              <Stat label="Where" value={isOnline ? "Online" : (data.city ?? "Bangalore")} />
            </div>

            {data.description ? (
              <section className="surface-card mt-4 p-4">
                <h3 className="chip-label mb-2">
                  About this {data.listing_type === "competition" ? "competition" : "class"}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {data.description}
                </p>
              </section>
            ) : null}

            {data.about_master ? (
              <section className="surface-card mt-4 p-4">
                <h3 className="chip-label mb-2">About the master</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {data.about_master}
                </p>
              </section>
            ) : null}

            {data.map_location ? (
              <section className="surface-card mt-4 p-4">
                <h3 className="chip-label mb-2">Venue</h3>
                <a
                  href={data.map_location}
                  target="_blank"
                  rel="noreferrer"
                  className="tap flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground"
                >
                  <MapPin className="size-4 text-clay" />
                  Open in Google Maps
                </a>
              </section>
            ) : null}
          </div>
        </article>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="chip-label">{label}</p>
      <p className="mt-1 truncate text-[13px] font-medium">{value}</p>
    </div>
  );
}
