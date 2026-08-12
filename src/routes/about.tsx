import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldCheck, Clock3, Wrench, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About New Sadiqabad Rent a Car — Trusted Car Rental Service" },
      {
        name: "description",
        content:
          "New Sadiqabad Rent a Car offers self-drive and with-driver car rentals with transparent 24-hour rates, verified vehicles and admin-approved bookings.",
      },
      { property: "og:title", content: "About New Sadiqabad Rent a Car" },
      { property: "og:description", content: "Who we are and how our rental process protects your booking." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold">About us</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            We have been renting cars for families, corporate clients and wedding events for
            years — with one simple promise: the car you book is the car you get.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { icon: Clock3, title: "Honest 24-hour pricing", text: "Every rate on this site covers a full 24 hours. No hidden hourly add-ons." },
            { icon: ShieldCheck, title: "Verified documents", text: "CNIC and phone verification keeps both our customers and vehicles safe." },
            { icon: Wrench, title: "Maintained fleet", text: "Each vehicle is serviced and inspected between rentals." },
            { icon: HandCoins, title: "No double bookings", text: "Requests are approved manually, so two customers can never hold the same dates." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-primary p-8 text-primary-foreground">
          <h2 className="text-xl font-bold">Ready to book?</h2>
          <p className="mt-1 text-primary-foreground/85">
            Pick a vehicle and send your request — we usually reply within the hour.
          </p>
          <Button asChild variant="secondary" className="mt-5">
            <Link to="/fleet">See available cars</Link>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
