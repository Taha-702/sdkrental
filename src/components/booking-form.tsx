import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PURPOSES,
  formatPKR,
  overlapsBooked,
  rentalDays,
  type Availability,
  type Car,
} from "@/lib/rental";

const schema = z.object({
  customer_name: z.string().trim().min(3, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  cnic: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{7}-?\d$/, "CNIC format: 35202-1234567-1"),
  email: z.string().trim().email("Invalid email").max(120).optional().or(z.literal("")),
  destination: z.string().trim().min(2, "Where will the car go?").max(120),
  purpose: z.string(),
  purpose_other: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

const localNow = (offsetHours = 2) => {
  const d = new Date(Date.now() + offsetHours * 3600_000);
  d.setMinutes(0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function BookingForm({ car, slots }: { car: Car; slots: Availability[] | undefined }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    cnic: "",
    email: "",
    destination: "",
    purpose: PURPOSES[0] as string,
    purpose_other: "",
    notes: "",
  });
  const [start, setStart] = useState(localNow(2));
  const [end, setEnd] = useState(localNow(26));
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const startDate = new Date(start);
  const endDate = new Date(end);
  const validRange = !isNaN(+startDate) && !isNaN(+endDate) && endDate > startDate;
  const days = validRange ? rentalDays(startDate, endDate) : 1;
  const clash = validRange && overlapsBooked(startDate, endDate, car.id, slots);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (!validRange) {
      toast.error("Return date must be after the pickup date");
      return;
    }
    if (clash) {
      toast.error("This car is already booked for those dates. Please choose another slot.");
      return;
    }
    if (parsed.data.purpose === "Other" && !parsed.data.purpose_other) {
      toast.error("Please describe the reason for booking");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.rpc("create_booking", {
      _car_id: car.id,
      _customer_name: parsed.data.customer_name,
      _phone: parsed.data.phone,
      _cnic: parsed.data.cnic,
      _email: parsed.data.email || "",
      _purpose: parsed.data.purpose,
      _purpose_other: parsed.data.purpose_other || "",
      _destination: parsed.data.destination,
      _start_date: startDate.toISOString(),
      _end_date: endDate.toISOString(),
      _with_driver: false,
      _notes: parsed.data.notes || "",
    });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    setReference(data as string);
    qc.invalidateQueries({ queryKey: ["availability"] });
    toast.success("Booking request sent! Our admin will review it shortly.");
  }

  if (reference) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/10 p-6 text-center">
        <CalendarCheck className="mx-auto size-8 text-success" />
        <h3 className="mt-3 text-lg font-semibold">Request received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your booking reference is
        </p>
        <p className="mt-2 text-2xl font-bold tracking-widest text-primary">{reference}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>IMPORTANT: </strong>
          Save this reference or take a screenshot — you'll need it to track your booking status.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Request this car</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pickup">Pickup date & time</Label>
          <Input id="pickup" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ret">Return date & time</Label>
          <Input id="ret" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
      </div>

      {clash && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This car is already booked during the selected period. Pick different dates or another car.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Ali Raza" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03001234567" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cnic">CNIC</Label>
          <Input id="cnic" value={form.cnic} onChange={(e) => set("cnic", e.target.value)} placeholder="35202-1234567-1" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Reason for booking</Label>
          <Select value={form.purpose} onValueChange={(v) => set("purpose", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PURPOSES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dest">Where will the car go?</Label>
          <Input id="dest" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Lahore → Murree" required />
        </div>
      </div>

      {form.purpose === "Other" && (
        <div className="space-y-1.5">
          <Label htmlFor="other">Please specify the reason</Label>
          <Input id="other" value={form.purpose_other} onChange={(e) => set("purpose_other", e.target.value)} />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Additional notes (optional)</Label>
        <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything we should know?" />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          {days} × 24 hours @ {formatPKR(car.rate_per_day)}
        </span>
        <span className="text-base font-bold text-primary">
          {formatPKR(car.rate_per_day * days)}
        </span>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={saving || clash}>
        {saving && <Loader2 className="size-4 animate-spin" />}
        Send booking request
      </Button>
    </form>
  );
}
