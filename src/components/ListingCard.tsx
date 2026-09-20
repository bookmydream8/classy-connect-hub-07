import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
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
  const place = listing.listing_type === "online" ? "Online" : (listing.city ?? "Bangalore");

  return (
    <Link
      to="/class/$id"
      params={{ id: listing.id }}
      className="surface-card tap flex flex-col overflow-hidden active:scale-[0.99]"
    >
      <div className="relative">
        <img
          src={listing.image_url || fallbackImage}
          alt={listing.title}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-clay backdrop-blur">
          {typeLabel(listing.listing_type)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-marigold backdrop-blur">
          {formatPrice(listing.is_free, listing.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="chip-label">
          {categoryLabel(listing.category)}
          {listing.subcategory ? ` · ${listing.subcategory}` : ""}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-[17px] leading-snug">{listing.title}</h3>
        {listing.about_master ? (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{listing.about_master}</p>
        ) : null}
        <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span className="truncate">{formatDateRange(listing.start_date, listing.end_date)}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1 font-medium text-foreground">
            <MapPin className="size-3.5 text-clay" />
            {place}
          </span>
        </div>
      </div>
    </Link>
  );
}
