import { Link } from "react-router-dom";
import { LayoutGrid, Phone, Mail, MapPin } from "lucide-react";
import { FooterCapture } from "./FooterCapture";

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border text-muted-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-primary flex items-center justify-center">
                <LayoutGrid className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground uppercase tracking-wide">Bower Building</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Custom flat-pack cabinetry made to your exact specifications. You design, we create.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Navigate</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/gallery" className="hover:text-foreground transition-colors">Gallery</Link>
              <Link to="/room-planner" className="hover:text-foreground transition-colors">Room Planner</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="tel:+61437732286" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> 0437 732 286
              </a>
              <a href="mailto:info@bowerbuilding.net" className="flex items-center gap-2 hover:text-foreground transition-colors">
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

        <div className="border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bower Building. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
