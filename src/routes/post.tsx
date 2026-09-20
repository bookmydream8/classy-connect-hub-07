import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/lib/useSession";
import {
  CATEGORIES,
  CITIES,
  DEFAULT_CITY,
  LISTING_TYPES,
  type CategoryId,
  type ListingType,
} from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a class — Madhura Masterclass Board" },
      {
        name: "description",
        content:
          "List a physical class, an online class or a competition for learners across India.",
      },
      { property: "og:title", content: "Post a class — Madhura Masterclass Board" },
      {
        property: "og:description",
        content:
          "List a physical class, an online class or a competition for learners across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

const fieldClass = "mt-1";

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
      const { data, error } = await supabase
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
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      navigate({ to: "/class/$id", params: { id: data.id } });
    },
    onError: () => setError("Could not publish. Please check the fields and try again."),
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-20">
          <div className="surface-card p-8 text-center">
            <h1 className="font-display text-2xl">Sign in to post</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Only signed-in members can add a class or competition.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/auth">Continue with Google</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl">Post a class</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share a physical class, an online class or a competition.
        </p>

        <form
          className="surface-card mt-6 space-y-5 p-6"
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
          <div>
            <Label>Type</Label>
            <div className={`flex flex-wrap gap-2 ${fieldClass}`}>
              {LISTING_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setListingType(t.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    listingType === t.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${fieldClass}`}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryId);
                  setSubcategory("");
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subcategory">Focus</Label>
              <select
                id="subcategory"
                className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${fieldClass}`}
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option value="">Any</option>
                {subOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Class name</Label>
            <Input
              id="title"
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tabla foundations — 6 week course"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className={fieldClass}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What learners will cover, schedule, level…"
            />
          </div>

          <div>
            <Label htmlFor="master">About the master / teacher</Label>
            <Textarea
              id="master"
              className={fieldClass}
              rows={3}
              value={aboutMaster}
              onChange={(e) => setAboutMaster(e.target.value)}
              placeholder="Name, training, years of experience…"
            />
          </div>

          <div>
            <Label htmlFor="image">Image link</Label>
            <Input
              id="image"
              className={fieldClass}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… (optional)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Pricing</Label>
              <div className={`flex gap-2 ${fieldClass}`}>
                {[true, false].map((free) => (
                  <button
                    type="button"
                    key={String(free)}
                    onClick={() => setIsFree(free)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      isFree === free
                        ? "bg-foreground text-background"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {free ? "Free" : "Paid"}
                  </button>
                ))}
              </div>
            </div>
            {!isFree ? (
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  className={fieldClass}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="start">Start date</Label>
              <Input
                id="start"
                type="date"
                className={fieldClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end">End date</Label>
              <Input
                id="end"
                type="date"
                className={fieldClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {needsPlace ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${fieldClass}`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="map">Google Maps link</Label>
                <Input
                  id="map"
                  className={fieldClass}
                  value={mapLocation}
                  onChange={(e) => setMapLocation(e.target.value)}
                  placeholder="https://maps.google.com/…"
                />
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Publishing…" : "Publish listing"}
          </Button>
        </form>
      </main>
    </div>
  );
}
