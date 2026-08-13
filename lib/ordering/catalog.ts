/** Source of truth aligned with Cap app (SDAPPdev) — May 2026 pricing. */

export type PackageId = "chill-pill" | "sandy-duo" | "shady-bunch" | "mega-drop";

export const PACKAGES: {
  id: PackageId;
  name: string;
  description: string;
  items: string[];
  image: string;
  popular?: boolean;
}[] = [
  {
    id: "chill-pill",
    name: "The Chill Pill",
    description: "Perfect for a simple beach day.",
    items: ["1 Beach Chair", "1 Umbrella", "1 Small Cooler with Ice"],
    image: "/assets/packages/chill-pill.png",
  },
  {
    id: "sandy-duo",
    name: "The Sandy Duo",
    description: "Great for two people looking to relax.",
    items: ["2 Beach Chairs", "1 Umbrella", "1 Small Cooler with Ice"],
    image: "/assets/packages/sandy-duo.png",
    popular: true,
  },
  {
    id: "shady-bunch",
    name: "The Shady Bunch",
    description: "A well-rounded setup for a small group.",
    items: ["4 Beach Chairs", "1 Beach Tent", "1 Large Cooler with Ice"],
    image: "/assets/packages/shady-bunch.png",
  },
  {
    id: "mega-drop",
    name: "The Mega Drop",
    description: "The ultimate beach experience for big groups.",
    items: ["8 Beach Chairs", "2 Beach Tents", "2 Large Coolers with Ice"],
    image: "/assets/packages/mega-drop.png",
  },
];

const PACKAGE_ROWS: Record<PackageId, Record<string, number>> = {
  "chill-pill": {
    "half-9-12": 34.99,
    "half-10-1": 34.99,
    "half-11-2": 39.99,
    "half-12-3": 39.99,
    "half-1-4": 39.99,
    "half-2-5": 34.99,
    "full-6hr": 49.99,
    "shore-8hr": 54.99,
  },
  "sandy-duo": {
    "half-9-12": 44.99,
    "half-10-1": 44.99,
    "half-11-2": 49.99,
    "half-12-3": 49.99,
    "half-1-4": 49.99,
    "half-2-5": 44.99,
    "full-6hr": 59.99,
    "shore-8hr": 64.99,
  },
  "shady-bunch": {
    "half-9-12": 64.99,
    "half-10-1": 64.99,
    "half-11-2": 64.99,
    "half-12-3": 64.99,
    "half-1-4": 64.99,
    "half-2-5": 64.99,
    "full-6hr": 74.99,
    "shore-8hr": 79.99,
  },
  "mega-drop": {
    "half-9-12": 119.99,
    "half-10-1": 119.99,
    "half-11-2": 129.99,
    "half-12-3": 129.99,
    "half-1-4": 129.99,
    "half-2-5": 119.99,
    "full-6hr": 149.99,
    "shore-8hr": 159.99,
  },
};

export function getPackageTierPrice(packageId: PackageId, slotId: string): number {
  return PACKAGE_ROWS[packageId]?.[slotId] ?? 0;
}

export function getPackageStartingFrom(packageId: PackageId): number {
  const vals = Object.values(PACKAGE_ROWS[packageId] ?? {});
  return vals.length ? Math.min(...vals) : 0;
}

export function billingTierHours(durationHours: number): number {
  const h = Number(durationHours);
  if (!Number.isFinite(h) || h <= 0) return 3;
  if (h <= 3) return 3;
  if (h <= 6) return 6;
  return 8;
}

const HALF_DAY_START_TO_SLOT: Record<string, string> = {
  "8:00 AM": "half-9-12",
  "9:00 AM": "half-9-12",
  "10:00 AM": "half-10-1",
  "11:00 AM": "half-11-2",
  "12:00 PM": "half-12-3",
  "1:00 PM": "half-1-4",
  "2:00 PM": "half-2-5",
  "3:00 PM": "half-1-4",
  "4:00 PM": "half-2-5",
};

export function resolvePricingSlotId(startTimeLabel: string, durationHours: number): string {
  const tier = billingTierHours(durationHours);
  if (tier >= 8) return "shore-8hr";
  if (tier >= 6) return "full-6hr";
  return HALF_DAY_START_TO_SLOT[startTimeLabel.trim()] ?? "half-9-12";
}

/** Afternoon starts (11:00 AM+) use premium half-day package tiers — same as Cap app. */
export function isPremiumSetupStart(startTimeLabel: string): boolean {
  const preset = startTimeLabel.trim();
  return (
    preset === "11:00 AM" ||
    preset === "12:00 PM" ||
    preset === "1:00 PM" ||
    preset === "2:00 PM" ||
    preset === "3:00 PM" ||
    preset === "4:00 PM"
  );
}

/** Custom gear — half-day display prices (à la carte). */
export const CUSTOM_GEAR = [
  { id: "beach-chair", name: "Beach Chair", price: 11.99, image: "/assets/items/beach-chair.png" },
  { id: "beach-tent", name: "Beach Tent", price: 24.99, image: "/assets/items/beach-tent.png" },
  { id: "umbrella", name: "Beach Umbrella", price: 20.99, image: "/assets/items/umbrella.png" },
  { id: "small-cooler", name: "Small Cooler + Ice", price: 12.99, image: "/assets/items/small-cooler.png" },
  { id: "large-cooler", name: "Large Cooler + Ice", price: 18.99, image: "/assets/items/large-cooler.png" },
] as const;

export const CUSTOM_GEAR_PRICES: Record<string, { half: number; full: number; shore: number }> = {
  "beach-chair": { half: 11.99, full: 16.35, shore: 19.62 },
  "beach-tent": { half: 24.99, full: 34.99, shore: 41.99 },
  umbrella: { half: 20.99, full: 29.99, shore: 37.99 },
  "small-cooler": { half: 12.99, full: 15.99, shore: 19.99 },
  "large-cooler": { half: 18.99, full: 23.99, shore: 29.99 },
};

export function customGearUnitPrice(sku: string, durationHours: number): number {
  const row = CUSTOM_GEAR_PRICES[sku];
  if (!row) return 0;
  const tier = billingTierHours(durationHours);
  if (tier >= 8) return row.shore;
  if (tier >= 6) return row.full;
  return row.half;
}

export const CUSTOM_MIN_SUBTOTAL_USD = 24.99;
export const DELIVERY_FEE = 6.99;
export const ON_DEMAND_PACKAGE_SURCHARGE_USD = 11.99;
export const GEAR_TIP_PRESETS = [0, 3, 5, 10] as const;
export const FOOD_TIP_PRESETS = [2, 3, 5] as const;
export const FOOD_TIP_DEFAULT = 3;
export const FOOD_ONLY_WINDOW_HOURS = 2;
export const FOOD_SCHEDULE_LABEL = "10:00 AM – 4:00 PM Eastern";
export const FOOD_ASAP_ETA_LABEL = "Ready in ~45 min";
export const SERVICE_AREA_LABEL = "42nd–86th Street";

export const DURATION_OPTIONS = [
  { id: "half", hours: 3, label: "Half Day", detail: "3 hours" },
  { id: "full", hours: 6, label: "Full Day", detail: "6 hours" },
  { id: "shore", hours: 8, label: "Shore Day", detail: "8 hours" },
] as const;

export const GEAR_SETUP_START_TIMES = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
] as const;

export const FOOD_DELIVERY_START_TIMES = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
] as const;

export type FoodMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  section: string;
  image: string;
  options?: {
    id: string;
    label: string;
    required?: boolean;
    choices: { id: string; label: string }[];
  }[];
};

export const FOOD_RESTAURANTS = [
  {
    id: "watermans",
    name: "Waterman's",
    cuisine: "Surfside American",
    rating: 4.7,
    etaLabel: "25–40 min",
    deliveryFee: 8.99,
    minimumOrder: 24.99,
    tagline: "Home of the Orange Crush",
    heroImage: "/assets/food/food-watermans-restaurant.jpg",
    logoImage: "/assets/food/food-watermans-logo.png",
    menu: [
      {
        id: "beach-burger",
        name: "Beach Burger",
        description: "Served with French fries",
        price: 19.49,
        section: "Handhelds",
        image: "/assets/food/food-beach-burger.jpg",
        options: [
          {
            id: "cheese",
            label: "Cheese",
            required: true,
            choices: [
              { id: "mozzarella", label: "Mozzarella" },
              { id: "cheddar", label: "Cheddar" },
              { id: "swiss", label: "Swiss" },
              { id: "american", label: "American" },
              { id: "bleu", label: "Bleu" },
            ],
          },
        ],
      },
      {
        id: "chicken-avocado-jetty-wrap",
        name: "Chicken Avocado Jetty Wrap",
        description: "Served with French fries",
        price: 17.24,
        section: "Handhelds",
        image: "/assets/food/food-chicken-wrap.jpg",
      },
      {
        id: "smothered-chicken-sandwich",
        name: "Smothered Chicken Sandwich",
        description: "Served with French fries",
        price: 19.49,
        section: "Handhelds",
        image: "/assets/food/food-chicken-sandwich.jpg",
      },
      {
        id: "blackened-sandwich-wrap",
        name: "Blackened Sandwich Wrap",
        description: "Served with French fries",
        price: 19.49,
        section: "Handhelds",
        image: "/assets/food/food-blackened-wrap.jpg",
      },
      {
        id: "coconut-shrimp-wrap",
        name: "Coconut Shrimp Wrap",
        description: "Served with French fries",
        price: 19.49,
        section: "Handhelds",
        image: "/assets/food/food-coconut-shrimp.jpg",
      },
    ] satisfies FoodMenuItem[],
  },
] as const;

export function getFoodRestaurant(id: string) {
  return FOOD_RESTAURANTS.find((r) => r.id === id);
}
