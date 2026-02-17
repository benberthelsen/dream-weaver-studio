import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/how-it-works", label: "How It Works" },
  { path: "/pricing", label: "Pricing" },
  { path: "/gallery", label: "Gallery" },
  { path: "/room-planner", label: "Room Planner" },
  { path: "/faq", label: "FAQ" },
  { path: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl tracking-tight">
            <span className="font-extrabold text-primary">BOWER</span>{" "}
            <span className="font-semibold text-accent">CABINETS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary",
                  isActive(link.path) && "text-primary font-semibold"
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/board" className="hidden sm:block">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm">
              Pro Tools <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card text-foreground border-border w-72">
              <nav className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary",
                        isActive(link.path) && "text-primary font-semibold"
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/board" onClick={() => setOpen(false)}>
                  <Button className="w-full mt-4 bg-primary text-primary-foreground font-semibold">
                    Pro Tools <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
