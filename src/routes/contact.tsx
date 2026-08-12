import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact New Sadiqabad Rent a Car — Call or WhatsApp for a Car" },
      {
        name: "description",
        content:
          "Call, email or visit New Sadiqabad Rent a Car to reserve a car. Our booking desk is open 24/7 for rentals across the country.",
      },
      { property: "og:title", content: "Contact New Sadiqabad Rent a Car" },
      { property: "og:description", content: "Phone, email and office details for booking a rental car." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold">Contact us</h1>
          <p className="mt-2 text-muted-foreground">We are available 24 hours a day, every day.</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Phone, title: "Phone", value: "0300 0290285" },
          { icon: MessageCircle, title: "WhatsApp", value: "0300 0290285" },
          { icon: Mail, title: "Email", value: "booking@rental.com" },
          { icon: MapPin, title: "Office", value: "Al=hameed commercial market, JDW road, near Shera colony, Sadiqabad" },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-6">
            <c.icon className="size-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="text-xl font-bold">Want a car for specific dates?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The fastest way is to send a booking request online — you will get a reference
            number you can use to track approval.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild><Link to="/fleet">Book a car</Link></Button>
            <Button asChild variant="outline"><Link to="/track">Track a booking</Link></Button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
