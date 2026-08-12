import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock, Cog, Fuel, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { carImage, carStatus, formatDate, formatPKR, useAvailability, useCars } from "@/lib/rental";

export const Route = createFileRoute("/cars/$slug")({
  head: () => ({
    meta: [
      { title: "Book This Car — New Sadiqabad Rent a Car" },
      {
        name: "description",
        content:
          "See this vehicle's 24-hour rate, current availability and upcoming booked dates, then send a booking request online.",
      },
      { property: "og:title", content: "Book This Car — New Sadiqabad Rent a Car" },
      { property: "og:description", content: "Live availability and instant booking requests." },
    ],
  }),
  component: CarDetail,
});

function CarDetail() {
  const { slug } = Route.useParams();
  const { data: cars, isLoading } = useCars();
  const { data: slots } = useAvailability();
  const car = (cars ?? []).find((c) => c.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="py-24 text-center text-muted-foreground">Loading vehicle…</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Vehicle not found</h1>
          <Button asChild className="mt-6"><Link to="/fleet">Back to fleet</Link></Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const status = carStatus(car.id, slots);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/fleet"><ArrowLeft className="size-4" /> Back to fleet</Link>
        </Button>

        <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-xl border border-border bg-secondary">
              <img
                src={carImage(car.image_key)}
                alt={car.name}
                width={1024}
                height={700}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {car.category}
                </span>
                <h1 className="text-3xl font-bold">{car.name}</h1>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{formatPKR(car.rate_per_day)}</div>
                <div className="text-xs text-muted-foreground">per 24 hours</div>
              </div>
            </div>

            <p className="mt-3 text-muted-foreground">{car.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: `${car.seats} seats` },
                { icon: Cog, label: car.transmission },
                { icon: Fuel, label: car.fuel },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <s.icon className="size-4 text-primary" /> {s.label}
                </div>
              ))}
            </div>

            <div
              className={`mt-6 rounded-xl border p-5 ${
                status.booked ? "border-destructive/40 bg-destructive/5" : "border-success/40 bg-success/10"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {status.booked ? (
                  <><Clock className="size-5 text-destructive" /> Currently booked</>
                ) : (
                  <><CheckCircle2 className="size-5 text-success" /> Available right now</>
                )}
              </div>
              {status.booked && status.freeAt && (
                <p className="mt-1 text-sm text-muted-foreground">
                  This car becomes free on{" "}
                  <span className="font-medium text-foreground">{formatDate(status.freeAt)}</span>.
                </p>
              )}
              {status.upcoming.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold">Booked periods</h2>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {status.upcoming.map((u) => (
                      <li key={u.start_date}>
                        {formatDate(u.start_date)} → {formatDate(u.end_date)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {status.upcoming.length === 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  No confirmed bookings ahead — any dates you pick are open.
                </p>
              )}
            </div>
          </div>

          <BookingForm car={car} slots={slots} />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
