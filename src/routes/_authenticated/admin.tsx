import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CalendarClock,
  Car as CarIcon,
  CheckCircle2,
  Clock,
  LogOut,
  Trash2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatPKR, rentalDays, type Car, useCars } from "@/lib/rental";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Booking Dashboard — New Sadiqabad Rent a Car Admin" },
      { name: "description", content: "Review, approve and manage all car rental booking requests." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booking Dashboard — New Sadiqabad Rent a Car Admin" },
      { property: "og:description", content: "Internal booking management dashboard." },
    ],
  }),
  component: AdminDashboard,
});

type Booking = {
  id: string;
  reference: string;
  car_id: string;
  customer_name: string;
  phone: string;
  cnic: string;
  email: string | null;
  purpose: string;
  purpose_other: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  with_driver: boolean;
  notes: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function AdminDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cars } = useCars();
  const [action, setAction] = useState<{ booking: Booking; type: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [carAction, setCarAction] = useState<"new" | "edit" | null>(null);
  const [carForm, setCarForm] = useState<Partial<Car> | null>(null);
  const [carBusy, setCarBusy] = useState(false);

  const carName = useMemo(() => {
    const map = new Map((cars ?? []).map((c) => [c.id, c]));
    return (id: string) => map.get(id);
  }, [cars]);

  const bookings = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const notifications = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          qc.invalidateQueries({ queryKey: ["admin-bookings"] });
          qc.invalidateQueries({ queryKey: ["admin-notifications"] });
          qc.invalidateQueries({ queryKey: ["availability"] });
          if (payload.eventType === "INSERT") {
            toast.info("New booking request received");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const list = bookings.data ?? [];
  const pending = list.filter((b) => b.status === "pending");
  const approved = list.filter((b) => b.status === "approved");
  const unread = (notifications.data ?? []).filter((n) => !n.is_read);

  const activeNow = approved.filter(
    (b) => new Date(b.start_date) <= new Date() && new Date(b.end_date) > new Date(),
  ).length;

  const revenue = approved.reduce((sum, b) => {
    const car = carName(b.car_id);
    return sum + (car ? car.rate_per_day * rentalDays(new Date(b.start_date), new Date(b.end_date)) : 0);
  }, 0);

  async function updateStatus(
    booking: Booking,
    status: "pending" | "approved" | "rejected" | "cancelled" | "completed",
    adminNote: string,
  ) {
    setBusy(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status, admin_note: adminNote || null })
      .eq("id", booking.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${booking.reference} ${status}`);
    setAction(null);
    setNote("");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    qc.invalidateQueries({ queryKey: ["availability"] });
  }

  async function remove(booking: Booking) {
    const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking deleted");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    qc.invalidateQueries({ queryKey: ["availability"] });
  }

  function openCarDialog(type: "new" | "edit", car?: Car) {
    setCarAction(type);
    setCarForm(
      car
        ? { ...car }
        : {
            name: "",
            slug: "",
            category: "Economy",
            rate_per_day: 0,
            seats: 4,
            transmission: "Manual",
            fuel: "Petrol",
            description: "",
            image_key: "sedan",
            sort_order: 0,
            is_active: true,
          },
    );
  }

  function closeCarDialog() {
    setCarAction(null);
    setCarForm(null);
    setCarBusy(false);
  }

  function updateCarField<K extends keyof Car>(key: K, value: Car[K]) {
    setCarForm((current) => ({ ...(current ?? {}), [key]: value }));
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function saveCar() {
    if (!carForm) return;
    const name = (carForm.name ?? "").trim();
    const slug = (carForm.slug ?? slugify(name)).trim();
    const category = (carForm.category ?? "").trim();
    if (!name || !slug || !category) {
      toast.error("Name, slug and category are required.");
      return;
    }

    const payload = {
      name,
      slug,
      category,
      rate_per_day: Number(carForm.rate_per_day ?? 0),
      seats: Number(carForm.seats ?? 4),
      transmission: (carForm.transmission ?? "Manual").trim(),
      fuel: (carForm.fuel ?? "Petrol").trim(),
      description: (carForm.description ?? "").trim(),
      image_key: (carForm.image_key ?? "sedan").trim(),
      sort_order: Number(carForm.sort_order ?? 0),
      is_active: carForm.is_active ?? true,
    };

    setCarBusy(true);
    if (carAction === "new") {
      const { error } = await supabase.from("cars").insert([payload]);
      setCarBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Car created successfully.");
    } else if (carAction === "edit" && carForm.id) {
      const { error } = await supabase.from("cars").update(payload).eq("id", carForm.id);
      setCarBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Car updated successfully.");
    } else {
      setCarBusy(false);
      return;
    }

    qc.invalidateQueries({ queryKey: ["cars"] });
    closeCarDialog();
  }

  async function deleteCar(car: Car) {
    if (!window.confirm(`Delete ${car.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("cars").delete().eq("id", car.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Car removed.");
    qc.invalidateQueries({ queryKey: ["cars"] });
  }

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const Row = ({ b }: { b: Booking }) => {
    const car = carName(b.car_id);
    const days = rentalDays(new Date(b.start_date), new Date(b.end_date));
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{car?.name ?? "Vehicle"}</span>
              <StatusBadge status={b.status} />
            </div>
            <p className="mt-1 text-xs tracking-widest text-muted-foreground">REF {b.reference}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary">
              {car ? formatPKR(car.rate_per_day * days) : "—"}
            </div>
            <div className="text-xs text-muted-foreground">{days} × 24h</div>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          {[
            ["Customer", b.customer_name],
            ["Phone", b.phone],
            ["CNIC", b.cnic],
            ["Pickup", formatDate(b.start_date)],
            ["Return", formatDate(b.end_date)],
            ["Destination", b.destination],
            ["Reason", b.purpose === "Other" ? b.purpose_other || "Other" : b.purpose],
            ["Driver", b.with_driver ? "With driver" : "Self-drive"],
            ["Requested", formatDate(b.created_at)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {b.notes && <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm">{b.notes}</p>}
        {b.admin_note && (
          <p className="mt-3 rounded-md bg-primary/5 px-3 py-2 text-sm">
            <span className="font-semibold">Admin note: </span>{b.admin_note}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {b.status === "pending" && (
            <>
              <Button size="sm" variant="success" onClick={() => setAction({ booking: b, type: "approve" })}>
                <CheckCircle2 className="size-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAction({ booking: b, type: "reject" })}>
                <XCircle className="size-4" /> Reject
              </Button>
            </>
          )}
          {b.status === "approved" && (
            <>
              <Button size="sm" variant="outline" onClick={() => updateStatus(b, "completed", b.admin_note ?? "")}>
                Mark completed
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(b, "cancelled", b.admin_note ?? "")}>
                Cancel booking
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => remove(b)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>
    );
  };

  const Section = ({ items }: { items: Booking[] }) =>
    items.length === 0 ? (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        Nothing here yet.
      </p>
    ) : (
      <div className="space-y-4">
        {items.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CarIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">New Sadiqabad Rent a Car</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => openCarDialog("new")}>Add car</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-4" />
                  {unread.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unread.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold">Notifications</span>
                  <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {(notifications.data ?? []).length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
                  )}
                  {(notifications.data ?? []).map((n) => (
                    <div key={n.id} className={`border-b border-border px-4 py-3 ${n.is_read ? "" : "bg-primary/5"}`}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button asChild variant="ghost" size="sm"><Link to="/">View site</Link></Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { icon: Clock, label: "Pending requests", value: pending.length },
            { icon: CheckCircle2, label: "Approved", value: approved.length },
            { icon: CalendarClock, label: "On rent now", value: activeNow },
            { icon: CarIcon, label: "Approved value", value: formatPKR(revenue) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <s.icon className="size-5 text-primary" />
              <p className="mt-3 text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pending" className="mt-8">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="all">All ({list.length})</TabsTrigger>
            <TabsTrigger value="cars">Cars ({cars?.length ?? 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4"><Section items={pending} /></TabsContent>
          <TabsContent value="approved" className="mt-4"><Section items={approved} /></TabsContent>
          <TabsContent value="all" className="mt-4"><Section items={list} /></TabsContent>
          <TabsContent value="cars" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Manage cars</h2>
                  <p className="text-sm text-muted-foreground">Create, edit, or remove cars available in the fleet.</p>
                </div>
                <Button size="sm" onClick={() => openCarDialog("new")}>Add new car</Button>
              </div>
              {cars?.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                  No cars found.
                </p>
              ) : (
                <div className="space-y-4">
                  {cars?.map((car) => (
                    <div key={car.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold">{car.name}</p>
                            <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
                              {car.category}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{car.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Rate / day</p>
                            <p className="font-semibold">{formatPKR(car.rate_per_day)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seats</p>
                            <p className="font-semibold">{car.seats}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transmission</p>
                            <p className="font-semibold">{car.transmission}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openCarDialog("edit", car)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCar(car)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={Boolean(action)} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.type === "approve" ? "Approve booking" : "Reject booking"}
            </DialogTitle>
            <DialogDescription>
              {action?.type === "approve"
                ? "The car will be marked as booked for these dates and nobody else can reserve it."
                : "The customer will see this booking as rejected when they track it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="note">Message for the customer (optional)</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Please bring your original CNIC" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              disabled={busy}
              variant={action?.type === "approve" ? "success" : "destructive"}
              onClick={() =>
                action && updateStatus(action.booking, action.type === "approve" ? "approved" : "rejected", note)
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(carAction)} onOpenChange={(open) => !open && closeCarDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{carAction === "edit" ? "Edit car" : "Create new car"}</DialogTitle>
            <DialogDescription>
              {carAction === "edit"
                ? "Update the car details and save changes."
                : "Add a new vehicle to the fleet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="car-name">Name</Label>
                <Input
                  id="car-name"
                  value={carForm?.name ?? ""}
                  onChange={(e) => updateCarField("name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-slug">Slug</Label>
                <Input
                  id="car-slug"
                  value={carForm?.slug ?? ""}
                  onChange={(e) => updateCarField("slug", slugify(e.target.value))}
                  placeholder="toyota-corolla-gli"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-category">Category</Label>
                <Input
                  id="car-category"
                  value={carForm?.category ?? ""}
                  onChange={(e) => updateCarField("category", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-rate">Rate per day</Label>
                <Input
                  id="car-rate"
                  type="number"
                  min={0}
                  step={100}
                  value={carForm?.rate_per_day ?? 0}
                  onChange={(e) => updateCarField("rate_per_day", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="car-seats">Seats</Label>
                <Input
                  id="car-seats"
                  type="number"
                  min={1}
                  max={12}
                  value={carForm?.seats ?? 4}
                  onChange={(e) => updateCarField("seats", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-transmission">Transmission</Label>
                <Input
                  id="car-transmission"
                  value={carForm?.transmission ?? ""}
                  onChange={(e) => updateCarField("transmission", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-fuel">Fuel</Label>
                <Input
                  id="car-fuel"
                  value={carForm?.fuel ?? ""}
                  onChange={(e) => updateCarField("fuel", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-image">Image key</Label>
                <Input
                  id="car-image"
                  value={carForm?.image_key ?? ""}
                  onChange={(e) => updateCarField("image_key", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="car-sort">Sort order</Label>
                <Input
                  id="car-sort"
                  type="number"
                  step={1}
                  value={carForm?.sort_order ?? 0}
                  onChange={(e) => updateCarField("sort_order", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="car-active">Active</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="car-active"
                    checked={carForm?.is_active ?? true}
                    onCheckedChange={(checked) => updateCarField("is_active", Boolean(checked))}
                  />
                  <Label htmlFor="car-active" className="font-normal">
                    Visible in the fleet
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="car-description">Description</Label>
              <Textarea
                id="car-description"
                rows={4}
                value={carForm?.description ?? ""}
                onChange={(e) => updateCarField("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCarDialog}>Cancel</Button>
            <Button disabled={carBusy} onClick={saveCar}>
              {carAction === "edit" ? "Save changes" : "Create car"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
