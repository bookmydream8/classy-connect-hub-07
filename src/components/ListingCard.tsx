import { Link } from "@tanstack/react-router";
import fallbackImage from "@/assets/class-fallback.jpg";
import { categoryLabel, formatDateRange, formatPrice, typeLabel } from "@/lib/taxonomy";

export interface Listing {
  id: string;
  listing_type: string;
  title: string;
  description: string;
  about_master: string;
  image_url: string | null;
  is_free: boolean;
  price: number | string;
  start_date: string | null;
  end_date: string | null;
  category: string;
  subcategory: string | null;
  city: string | null;
  map_location: string | null;
  created_at: string;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to="/class/$id"
      params={{ id: listing.id }}
      className="surface-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div className="relative">
        <img
          src={listing.image_url || fallbackImage}
          alt={listing.title}
          className="aspect-[16/10] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-clay backdrop-blur">
          {typeLabel(listing.listing_type)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-marigold backdrop-blur">
          {formatPrice(listing.is_free, listing.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="chip-label mb-2">
          {categoryLabel(listing.category)}
          {listing.subcategory ? ` · ${listing.subcategory}` : ""}
        </div>
        <h3 className="font-display text-lg leading-snug">{listing.title}</h3>
        {listing.about_master ? (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{listing.about_master}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatDateRange(listing.start_date, listing.end_date)}</span>
          <span>·</span>
          <span>{listing.listing_type === "online" ? "Online" : (listing.city ?? "Bangalore")}</span>
        </div>
      </div>
    </Link>
  );
}
