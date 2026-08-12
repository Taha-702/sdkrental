import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Clock3, BadgeCheck, ArrowRight, PhoneCall } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { useAvailability, useCars } from "@/lib/rental";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Sadiqabad Rent a Car — Car Rental in Pakistan, 24-Hour Rates" },
      {
        name: "description",
        content:
          "Rent Alto, Civic, Fortuner, Prado, Land Cruiser and more with clear 24-hour rates. Check live availability and request your booking online.",
      },
      { property: "og:title", content: "New Sadiqabad Rent a Car — Car Rental with Live Availability" },
      {
        property: "og:description",
        content: "Browse our fleet, see which cars are free today and request a booking in minutes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: cars } = useCars();
  const { data: slots } = useAvailability();
  const featured = (cars ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Luxury SUV and sedan ready for rental"
          width={1600}
          height={912}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-primary-foreground/25">
            <Clock3 className="size-3.5" /> All rates are for 24 hours
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl">
            Rent the right car, at the right price — in minutes
          </h1>
          <p className="mt-4 max-w-xl text-primary-foreground/85">
            From an economical Alto to a Land Cruiser V8. Check live availability, pick your
            dates and send a booking request. No account needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/fleet">
                Browse the fleet <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <Link to="/track">Track my booking</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-lg sm:grid-cols-3">

          {[
            { icon: ShieldCheck, title: "Verified vehicles", text: "Maintained, insured and inspected before every trip." },
            { icon: BadgeCheck, title: "Admin approved", text: "Every request is reviewed so dates never clash." },
            { icon: PhoneCall, title: "24/7 support", text: "Call us any time during your rental period." },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <f.icon className="size-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Popular vehicles</h2>
            <p className="text-sm text-muted-foreground">Live availability updated in real time.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/fleet">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} slots={slots} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">How booking works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-4">
            {[
              ["Pick a car", "Check whether it is free for your dates."],
              ["Share details", "Name, phone, CNIC, purpose and destination."],
              ["Admin approves", "We confirm the vehicle and lock your dates."],
              ["Drive away", "Collect the keys and enjoy the ride."],
            ].map(([title, text], i) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
