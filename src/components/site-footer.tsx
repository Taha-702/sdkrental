import { Link } from "@tanstack/react-router";
import { Car, Phone, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="size-4" />
            </span>
            <span className="font-bold">New Sadiqabad Rent a Car</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Self-drive and with-driver car rentals. Transparent 24-hour rates, verified
            vehicles and instant booking confirmation.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/fleet" className="hover:text-primary">Our Fleet</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track Booking</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Reach us</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4 text-primary" /> 0300 1234567</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-primary" /> booking@rental.com</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Main Boulevard, Lahore</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Rental terms</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>All rates are for 24 hours</li>
            <li>Valid CNIC required</li>
            <li>Fuel not included</li>
            <li>Booking confirmed after approval</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} New Sadiqabad Rent a Car. All rights reserved. ·{" "}
          <Link to="/auth" className="hover:text-primary">Admin</Link>
        </p>
      </div>
    </footer>
  );
}
