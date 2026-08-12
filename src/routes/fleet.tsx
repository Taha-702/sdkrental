import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CarCard } from "@/components/car-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAvailability, useCars, carStatus } from "@/lib/rental";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Our Fleet — Cars Available for Rent | New Sadiqabad Rent a Car" },
      {
        name: "description",
        content:
          "See every car we rent with 24-hour pricing and live availability: Alto, Cultus, City, GLi, Yaris, Civic, Sportage, Fortuner, Prado, Land Cruiser V8 and more.",
      },
      { property: "og:title", content: "Our Fleet — New Sadiqabad Rent a Car" },
      { property: "og:description", content: "Live availability and 24-hour rates for our full rental fleet." },
    ],
  }),
  component: Fleet,
});

function Fleet() {
  const { data: cars, isLoading } = useCars();
  const { data: slots } = useAvailability();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [onlyFree, setOnlyFree] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((cars ?? []).map((c) => c.category)))],
    [cars],
  );

  const filtered = (cars ?? []).filter((c) => {
    if (cat !== "All" && c.category !== cat) return false;
    if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (onlyFree && carStatus(c.id, slots).booked) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold">Our Fleet</h1>
          <p className="mt-2 text-muted-foreground">
            {cars?.length ?? 0} vehicles · all rates are for a full 24 hours
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search a car…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cat === c ? "default" : "outline"}
                onClick={() => setCat(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant={onlyFree ? "default" : "outline"}
            onClick={() => setOnlyFree((v) => !v)}
          >
            Available now
          </Button>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-muted-foreground">Loading vehicles…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No cars match your filters.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((car) => (
              <CarCard key={car.id} car={car} slots={slots} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
