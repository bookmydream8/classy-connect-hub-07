export type CategoryId = "music" | "language" | "curriculum" | "trading" | "ai_tools";
export type ListingType = "physical" | "online" | "competition";

export const CATEGORIES: { id: CategoryId; label: string; options: string[] }[] = [
  {
    id: "music",
    label: "Music",
    options: [
      "Flute",
      "Guitar",
      "Tabla",
      "Dance",
      "Sitar",
      "Violin",
      "Veena",
      "Keyboard",
      "Vocal — Carnatic",
      "Vocal — Hindustani",
      "Drums",
      "Mridangam",
    ],
  },
  {
    id: "language",
    label: "Language",
    options: [
      "Kannada",
      "Hindi",
      "Tamil",
      "Telugu",
      "Malayalam",
      "Marathi",
      "Bengali",
      "Gujarati",
      "Punjabi",
      "Odia",
      "Assamese",
      "Urdu",
      "Sanskrit",
      "Konkani",
      "English",
    ],
  },
  {
    id: "curriculum",
    label: "Curriculum",
    options: [
      "CBSE",
      "ICSE",
      "State Board",
      "IB",
      "Maths",
      "Science",
      "Olympiad",
      "Competitive Exams",
    ],
  },
  {
    id: "trading",
    label: "Trading / Stock",
    options: ["Equities", "Options", "Futures", "Technical Analysis", "Mutual Funds", "Crypto"],
  },
  {
    id: "ai_tools",
    label: "AI Tools",
    options: [
      "Prompting",
      "ChatGPT",
      "Image Generation",
      "Automation",
      "Data & Analytics",
      "AI for Business",
    ],
  },
];

export const LISTING_TYPES: { id: ListingType; label: string }[] = [
  { id: "physical", label: "Physical class" },
  { id: "online", label: "Online class" },
  { id: "competition", label: "Competition" },
];

export const CITIES = [
  "Bangalore",
  "Mysore",
  "Hubli",
  "Mangalore",
  "Chennai",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi",
  "Kolkata",
  "Ahmedabad",
  "Kochi",
  "Jaipur",
];

export const DEFAULT_CITY = "Bangalore";

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function typeLabel(id: string) {
  return LISTING_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function formatPrice(isFree: boolean, price: number | string | null) {
  if (isFree) return "Free";
  const value = Number(price ?? 0);
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatDateRange(start: string | null, end: string | null) {
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return fmt(start);
  return "Dates to be announced";
}
