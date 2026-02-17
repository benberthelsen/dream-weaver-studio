import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Pricing", path: "/pricing" },
  { label: "Gallery", path: "/gallery" },
  { label: "Room Planner", path: "/room-planner" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
  { label: "Privacy", path: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-xl tracking-tight">
                <span className="font-extrabold">BOWER</span> <span className="font-semibold text-accent">CABINETS</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/75 leading-relaxed">
              DIY flat-pack cabinetry cut to size and delivered. Design online, then build with confidence.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-primary-foreground/90">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-primary-foreground/75">
              {footerLinks.map((link) => (
                <Link key={link.path} to={link.path} className="hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm text-primary-foreground/75">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-primary-foreground/90">Contact & Service Area</h4>
            <a href="tel:+61437732286" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" /> 0437 732 286
            </a>
            <a href="mailto:info@bowerbuilding.net" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" /> info@bowerbuilding.net
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              2/50 Owen St, Craiglie QLD 4877
            </p>
            <p className="text-xs text-primary-foreground/60">Servicing Far North Queensland and surrounding regions.</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-xs text-primary-foreground/55 text-center">
          © {new Date().getFullYear()} Bower Building. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
