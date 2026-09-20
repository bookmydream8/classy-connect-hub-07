import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, MapPin, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, TopBar } from "@/components/AppShell";
import { useSession } from "@/lib/useSession";
import {
  CATEGORIES,
  CITIES,
  DEFAULT_CITY,
  LISTING_TYPES,
  type CategoryId,
  type ListingType,
} from "@/lib/taxonomy";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a class — Madhura Masterclass Board" },
      {
        name: "description",
        content: "List a physical class, an online class or a competition for learners across India.",
      },
      { property: "og:title", content: "Post a class — Madhura Masterclass Board" },
      {
        property: "og:description",
        content: "List a physical class, an online class or a competition for learners across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

const inputCls = "h-12 rounded-xl border-input bg-card";
const selectCls =
  "h-12 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none";
const textareaCls = "rounded-xl border-input bg-card";

function PostPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [listingType, setListingType] = useState<ListingType>("physical");
  const [category, setCategory] = useState<CategoryId>("music");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aboutMaster, setAboutMaster] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [mapLocation, setMapLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subOptions = useMemo(
    () => CATEGORIES.find((c) => c.id === category)?.options ?? [],
    [category],
  );
  const needsPlace = listingType !== "online";

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          user_id: user!.id,
          listing_type: listingType,
          category,
          subcategory: subcategory || null,
          title: title.trim(),
          description: description.trim(),
          about_master: aboutMaster.trim(),
          image_url: imageUrl.trim() || null,
          is_free: isFree,
          price: isFree ? 0 : Number(price || 0),
          start_date: startDate || null,
          end_date: endDate || null,
          city: needsPlace ? city : null,
          map_location: needsPlace ? mapLocation.trim() || null : null,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      navigate({ to: "/class/$id", params: { id: data.id } });
    },
    onError: () => setError("Could not publish. Please check the fields and try again."),
  });

  const header = <TopBar title="Post a class" subtitle="Takes a minute" backTo="/" />;

  if (!loading && !user) {
    return (
      <AppShell active="post" header={header}>
        <div className="px-4 py-8">
          <div className="surface-card p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marigold font-display text-xl">
              म
            </span>
            <h2 className="mt-3 font-display text-xl">Sign in to post</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only signed-in members can add a class, an online session or a competition.
            </p>
            <Link
              to="/auth"
              className="tap mt-5 block h-12 rounded-xl bg-primary text-center leading-12 text-sm font-semibold text-primary-foreground"
            >
              Continue with Google
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="post" header={header}>
      <form
        className="space-y-4 px-4 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!title.trim()) {
            setError("Please add a class name.");
            return;
          }
          mutation.mutate();
        }}
      >
        <Card title="What are you posting?">
          <div className="grid grid-cols-3 gap-2">
            {LISTING_TYPES.map((t) => {
              const Icon = t.id === "online" ? Globe : t.id === "competition" ? Trophy : MapPin;
              const on = listingType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setListingType(t.id)}
                  className={`tap flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[11px] font-medium transition-colors ${
                    on
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={on ? 2.4 : 1.9} />
                  {t.label.replace(" class", "")}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Focus">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  setSubcategory("");
                }}
                className={`tap shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                  category === c.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Specific focus"
            className={selectCls}
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="">Any {CATEGORIES.find((c) => c.id === category)?.label.toLowerCase()}</option>
            {subOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Card>

        <Card title="Class details">
          <Input
            aria-label="Class name"
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Class name — e.g. Tabla foundations"
          />
          <Textarea
            aria-label="Description"
            className={textareaCls}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What learners cover, weekly schedule, level…"
          />
          <Textarea
            aria-label="About the master"
            className={textareaCls}
            rows={3}
            value={aboutMaster}
            onChange={(e) => setAboutMaster(e.target.value)}
            placeholder="About the master / teacher — name, training, years…"
          />
        </Card>

        <Card title="Cover image">
          <Input
            aria-label="Image link"
            className={inputCls}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste an image link (optional)"
            inputMode="url"
          />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-32 w-full rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              No link? We'll show a Madhura cover instead.
            </p>
          )}
        </Card>

        <Card title="Pricing">
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map((free) => (
              <button
                key={String(free)}
                type="button"
                onClick={() => setIsFree(free)}
                className={`tap h-11 rounded-xl border text-sm font-medium transition-colors ${
                  isFree === free
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {free ? "Free" : "Paid"}
              </button>
            ))}
          </div>
          {!isFree ? (
            <Input
              aria-label="Price in rupees"
              type="number"
              min="0"
              inputMode="numeric"
              className={inputCls}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in ₹"
            />
          ) : null}
        </Card>

        <Card title="Dates">
          <div className="grid grid-cols-2 gap-2">
            <Input
              aria-label="Start date"
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              aria-label="End date"
              type="date"
              className={inputCls}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </Card>

        {needsPlace ? (
          <Card title="Where">
            <select
              aria-label="City"
              className={selectCls}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              aria-label="Google Maps link"
              className={inputCls}
              value={mapLocation}
              onChange={(e) => setMapLocation(e.target.value)}
              placeholder="Google Maps link to the venue"
              inputMode="url"
            />
          </Card>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-paper/95 px-4 py-3 backdrop-blur-xl">
          {error ? <p className="mb-2 text-center text-xs text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="tap h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-4">
      <h2 className="chip-label mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
