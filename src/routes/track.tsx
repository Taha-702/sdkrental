import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/rental";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Booking — New Sadiqabad Rent a Car" },
      {
        name: "description",
        content:
          "Enter your booking reference and phone number to see whether your car rental request has been approved.",
      },
      { property: "og:title", content: "Track Your Booking" },
      { property: "og:description", content: "Check the approval status of your rental request." },
    ],
  }),
  component: Track,
});

type Result = {
  reference: string;
  car_name: string;
  customer_name: string;
  status: string;
  start_date: string;
  end_date: string;
  destination: string;
  purpose: string;
  admin_note: string | null;
  created_at: string;
};

function Track() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error } = await supabase.rpc("track_booking", {
      _reference: reference,
      _phone: phone,
    });
    setLoading(false);
    if (error) return setError(error.message);
    const row = (data as Result[])?.[0];
    if (!row) return setError("No booking found for that reference and phone number.");
    setResult(row);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold">Track your booking</h1>
          <p className="mt-2 text-muted-foreground">
            Use the reference you received when you sent your request.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <form onSubmit={search} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <Label htmlFor="ref">Booking reference</Label>
            <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="A1B2C3D4" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ph">Phone number used for booking</Label>
            <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03001234567" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Check status
          </Button>
        </form>

        {error && (
          <p className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference</p>
                <p className="text-xl font-bold tracking-widest text-primary">{result.reference}</p>
                <p className="mt-2 text-sm text-muted-foreground">Please save this booking reference or take a screenshot — you'll need it to track your booking status.</p>
              </div>
              <StatusBadge status={result.status} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Vehicle", result.car_name],
                ["Customer", result.customer_name],
                ["Pickup", formatDate(result.start_date)],
                ["Return", formatDate(result.end_date)],
                ["Destination", result.destination],
                ["Reason", result.purpose],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {result.admin_note && (
              <p className="rounded-md bg-secondary px-4 py-3 text-sm">
                <span className="font-semibold">Message from us: </span>
                {result.admin_note}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {result.status === "pending"
                ? "Your request is waiting for admin approval. We will call you on the number provided."
                : result.status === "approved"
                  ? "Your booking is confirmed. The vehicle is reserved for your dates."
                  : "This booking is no longer active. Feel free to send a new request."}
            </p>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
