import { Link } from "@tanstack/react-router";
import { Users, Fuel, Cog, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carImage, formatPKR, type Availability, type Car, carStatus, formatDate } from "@/lib/rental";

export function CarCard({ car }: { car: Car; slots?: Availability[] | undefined }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={carImage(car.image_key)}
          alt={car.name}
          loading="lazy"
          width={1024}
          height={700}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          {car.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{car.name}</h3>
          <div className="text-right">
            <div className="font-bold text-primary">{formatPKR(car.rate_per_day)}</div>
            <div className="text-xs text-muted-foreground">/ 24 hours</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="size-3.5" />{car.seats} seats</span>
          <span className="flex items-center gap-1"><Cog className="size-3.5" />{car.transmission}</span>
          <span className="flex items-center gap-1"><Fuel className="size-3.5" />{car.fuel}</span>
        </div>

        <Button asChild className="w-full">
          <Link to="/cars/$slug" params={{ slug: car.slug }}>
            View & Book
          </Link>
        </Button>
      </div>
    </article>
  );
}
