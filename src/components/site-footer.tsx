import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import rentalLogo from "../assets/rentalsdk.jpeg";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={rentalLogo} alt="New Sadiqabad Rent a Car" className="h-full w-full object-cover" />
            </div>
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
            <li>
              <a href="tel:03000290285" className="flex items-center gap-2 hover:text-primary">
                <Phone className="size-4 text-primary" /> 0300 0290285
              </a>
            </li>
            <li>
              <a href="mailto:newsadiqabadrentacar@gmail.com" className="flex items-center gap-2 hover:text-primary">
                <Mail className="size-4 text-primary" /> newsadiqabadrentacar@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://maps.google.com/?q=84M7+9W+Sadiqabad,+Pakistan"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <MapPin className="size-5 text-primary" /> Al-hameed commercial market, JDW road, near Shera colony, Sadiqabad
              </a>
            </li>
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
