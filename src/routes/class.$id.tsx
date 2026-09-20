import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import fallbackImage from "@/assets/class-fallback.jpg";
import type { Listing } from "@/components/ListingCard";
import { categoryLabel, formatDateRange, formatPrice, typeLabel } from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";

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
  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Listing | null;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data ? (
          <div className="surface-card p-8 text-center">
            <h1 className="font-display text-2xl">This listing is no longer available</h1>
            <Button asChild className="mt-4">
              <Link to="/">Back to the board</Link>
            </Button>
          </div>
        ) : (
          <article className="surface-card overflow-hidden">
            <img
              src={data.image_url || fallbackImage}
              alt={data.title}
              className="aspect-[16/7] w-full object-cover"
            />
            <div className="p-6 sm:p-8">
              <div className="chip-label">
                {typeLabel(data.listing_type)} · {categoryLabel(data.category)}
                {data.subcategory ? ` · ${data.subcategory}` : ""}
              </div>
              <h1 className="mt-2 font-display text-3xl">{data.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {formatPrice(data.is_free, data.price)}
                </span>
                <span>{formatDateRange(data.start_date, data.end_date)}</span>
                {data.listing_type !== "online" ? <span>{data.city ?? "Bangalore"}</span> : <span>Online</span>}
              </div>

              {data.description ? (
                <section className="mt-6">
                  <h2 className="font-display text-lg">About this {data.listing_type === "competition" ? "competition" : "class"}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {data.description}
                  </p>
                </section>
              ) : null}

              {data.about_master ? (
                <section className="mt-6">
                  <h2 className="font-display text-lg">About the master</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {data.about_master}
                  </p>
                </section>
              ) : null}

              {data.map_location ? (
                <section className="mt-6">
                  <h2 className="font-display text-lg">Venue</h2>
                  <a
                    href={data.map_location}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-primary underline"
                  >
                    Open location in Google Maps
                  </a>
                </section>
              ) : null}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
