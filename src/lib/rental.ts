import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import hero from "@/assets/hero.jpg";
import alto from "@/assets/suzuki alto.jpg";
import cultus from "@/assets/suzuki cultus.jpg";
import city_5500 from "@/assets/City 5500 old shape 16 model.jpg";
import gli from "@/assets/toyota Gli.jpg";
import yaris from "@/assets/toyota Yaris.jpg";
import grande from "@/assets/toyota Grande.jpg";
import elentra from "@/assets/Hyundai Elentra.jpg";
import civic_x from "@/assets/honda civic x.jpg";
import civic_new from "@/assets/Civic new shape.jpg";
import sportage_old from "@/assets/Kia Sportage 16k old shape.jpg";
import oshan_x_7 from "@/assets/Oshan x 7.jpg";
import revo_dala from "@/assets/Revo dala.jpg";
import jac_dala from "@/assets/Jac dala.jpg";
import havel from "@/assets/Havel.jpeg";
import fortuner from "@/assets/Toyota Fortuner.jpg";
import prado from "@/assets/Prado.jpg";
import land_cruiser_v8 from "@/assets/Land cruiser V8.jpg";

export type Car = {
  id: string;
  name: string;
  slug: string;
  category: string;
  rate_per_day: number;
  seats: number;
  transmission: string;
  fuel: string;
  description: string;
  image_key: string;
  sort_order: number;
  is_active: boolean;
};

export type Availability = {
  car_id: string;
  start_date: string;
  end_date: string;
};

export const carImages: Record<string, string> = {
  // generic fallbacks
  hatchback: alto,
  sedan: city_5500,
  suv: fortuner,
  pickup: revo_dala,

  // specific cars
  alto,
  cultus,
  "city-5500": city_5500,
  gli,
  yaris,
  grande,
  elentra,
  "civic-x": civic_x,
  "civic-new": civic_new,
  "kia-sportage-16": sportage_old,
  "oshan-x-7": oshan_x_7,
  "revo-dala": revo_dala,
  "jac-dala": jac_dala,
  havel,
  fortuner,
  prado,
  "land-cruiser-v8": land_cruiser_v8,
};
export const carImage = (key: string) => carImages[key] ?? hero;

export const PURPOSES = [
  "Trip / Tour",
  "Wedding",
  "Business / Corporate",
  "Airport Pick & Drop",
  "Family Function",
  "Other",
] as const;

export const formatPKR = (n: number) =>
  "PKR " + new Intl.NumberFormat("en-PK").format(n);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// NOTE: order matters — more specific regexes should come before broader ones
// that could accidentally match the same name (e.g. "civic-new" before "civic-x"
// isn't an issue here since they're mutually exclusive, but keep this in mind
// when adding new cars).
const OVERRIDES: { nameTest: RegExp; key: string; rate: number }[] = [
  { nameTest: /\balto\b/i, key: "alto", rate: 4000 },
  { nameTest: /\bcultus\b/i, key: "cultus", rate: 5000 },
  { nameTest: /\bcity\b/i, key: "city-5500", rate: 5500 },
  { nameTest: /\bgli\b/i, key: "gli", rate: 6500 },
  { nameTest: /\byaris\b/i, key: "yaris", rate: 7000 },
  { nameTest: /\bgrande\b/i, key: "grande", rate: 12000 },
  { nameTest: /\belantra\b/i, key: "elentra", rate: 13000 }, // FIXED: was /elentr/i, never matched "Elantra"
  { nameTest: /civic.*\bx\b/i, key: "civic-x", rate: 10000 },
  { nameTest: /civic.*new|new shape/i, key: "civic-new", rate: 15000 },
  { nameTest: /\bsportage\b/i, key: "kia-sportage-16", rate: 16000 },
  { nameTest: /\boshan\b/i, key: "oshan-x-7", rate: 18000 },
  { nameTest: /\brevo\b/i, key: "revo-dala", rate: 28000 },
  { nameTest: /\bjac\b/i, key: "jac-dala", rate: 30000 },
  { nameTest: /\bhaval\b/i, key: "havel", rate: 30000 }, // FIXED: was /havel/i, real name is "Haval"
  { nameTest: /\bfortuner\b/i, key: "fortuner", rate: 35000 },
  { nameTest: /\bprado\b/i, key: "prado", rate: 40000 },
  { nameTest: /land.*v8|land cruiser|\bv8\b/i, key: "land-cruiser-v8", rate: 80000 },
];

export function useCars() {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      const list = (data ?? []) as Car[];

      const resolved = list.map((c) => {
        const found = OVERRIDES.find((o) => o.nameTest.test(c.name || ""));
        if (found) {
          return { ...c, image_key: found.key, rate_per_day: found.rate } as Car;
        }

        // No override matched — this car's name didn't hit any regex above.
        // Warn loudly instead of silently reusing a generic/wrong image.
        if (!c.image_key || !(c.image_key in carImages)) {
          console.warn(
            `[useCars] No image override matched for car "${c.name}" (id: ${c.id}). ` +
            `Falling back to category-based image. Check OVERRIDES regex list.`
          );
          const cat = (c.category || "").toLowerCase();
          if (cat.includes("suv")) return { ...c, image_key: "fortuner" } as Car;
          if (cat.includes("hatch") || cat.includes("city") || cat.includes("alto")) {
            return { ...c, image_key: "alto" } as Car;
          }
          return { ...c, image_key: "alto" } as Car;
        }

        return c;
      });

      const canonicalName = (car: Car) => {
        const found = OVERRIDES.find((o) => o.nameTest.test(car.name || ""));
        return found ? found.key : (car.name || "").toLowerCase().replace(/\s+/g, " ").trim();
      };

      const preferDuplicate = (current: Car, next: Car) => {
        const corolla = /\bcorolla\b/i;
        if (corolla.test(current.name) && !corolla.test(next.name)) return current;
        if (!corolla.test(current.name) && corolla.test(next.name)) return next;
        return current;
      };

      const deduped = new Map<string, Car>();
      for (const car of resolved) {
        const key = canonicalName(car);
        if (!deduped.has(key)) {
          deduped.set(key, car);
          continue;
        }
        deduped.set(key, preferDuplicate(deduped.get(key) as Car, car));
      }

      return Array.from(deduped.values());
    },
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_car_availability");
      if (error) throw error;
      return (data ?? []) as Availability[];
    },
    refetchInterval: 60_000,
  });
}

export type CarStatus = {
  booked: boolean;
  freeAt: Date | null;
  upcoming: Availability[];
};

export function carStatus(carId: string, slots: Availability[] | undefined): CarStatus {
  const now = Date.now();
  const mine = (slots ?? [])
    .filter((s) => s.car_id === carId)
    .sort((a, b) => +new Date(a.start_date) - +new Date(b.start_date));
  const active = mine.find(
    (s) => +new Date(s.start_date) <= now && +new Date(s.end_date) > now,
  );
  return {
    booked: Boolean(active),
    freeAt: active ? new Date(active.end_date) : null,
    upcoming: mine.filter((s) => +new Date(s.end_date) > now),
  };
}

export function overlapsBooked(
  start: Date,
  end: Date,
  carId: string,
  slots: Availability[] | undefined,
) {
  return (slots ?? []).some(
    (s) =>
      s.car_id === carId &&
      new Date(s.start_date) < end &&
      new Date(s.end_date) > start,
  );
}

export function rentalDays(start: Date, end: Date) {
  const ms = +end - +start;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}