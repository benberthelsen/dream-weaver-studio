import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { path: "/", label: "HOME" },
  { path: "/how-it-works", label: "HOW IT WORKS" },
  { path: "/pricing", label: "PRICING" },
  { path: "/gallery", label: "GALLERY" },
  { path: "/room-planner", label: "ROOM PLANNER" },
  { path: "/faq", label: "FAQ" },
  { path: "/contact", label: "CONTACT" },
];

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-foreground text-primary-foreground">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary flex items-center justify-center">
            <LayoutGrid className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-wide uppercase">Bower Building</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs font-semibold tracking-wider text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10",
                  isActive(link.path) && "text-primary-foreground bg-white/10"
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/board" className="hidden sm:block">
            <Button variant="outline" size="sm" className="text-xs border-primary-foreground/30 text-primary-foreground hover:bg-white/10">
              PRO TOOLS
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-foreground text-primary-foreground border-border/20 w-64">
              <nav className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-semibold tracking-wider text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10",
                        isActive(link.path) && "text-primary-foreground bg-white/10"
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/board" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full mt-4 border-primary-foreground/30 text-primary-foreground hover:bg-white/10">
                    PRO TOOLS
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
