import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { FooterCapture } from "./FooterCapture";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl tracking-tight">
                <span className="font-extrabold">BOWER</span>{" "}
                <span className="font-semibold text-accent">CABINETS</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Custom flat-pack cabinetry made to your exact specifications. You design, we create.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Navigate</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</Link>
              <Link to="/pricing" className="hover:text-primary-foreground transition-colors">Pricing</Link>
              <Link to="/gallery" className="hover:text-primary-foreground transition-colors">Gallery</Link>
              <Link to="/room-planner" className="hover:text-primary-foreground transition-colors">Room Planner</Link>
              <Link to="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link>
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              <a href="tel:+61437732286" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" /> 0437 732 286
              </a>
              <a href="mailto:info@bowerbuilding.net" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" /> info@bowerbuilding.net
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" /> 2/50 Owen St, Craglie 4877<br />QLD, Australia
              </span>
            </div>
          </div>

          {/* Quick Enquiry */}
          <div>
            <FooterCapture />
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Bower Building. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
