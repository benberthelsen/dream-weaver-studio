import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Wrench } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl tracking-tight text-primary">
            <span className="font-extrabold">BOWER</span>{" "}
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
                  "text-sm font-medium text-primary/70 hover:text-primary hover:bg-secondary",
                  isActive(link.path) && "text-primary font-semibold"
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="hidden sm:flex border-primary/25 text-primary hover:bg-secondary font-semibold text-sm">
                <Wrench className="mr-1.5 h-3.5 w-3.5" /> Pro Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/collections">Collections</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/board">Board Builder</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin">Admin</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card text-primary border-border w-72">
              <nav className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-medium text-primary/70 hover:text-primary hover:bg-secondary",
                        isActive(link.path) && "text-primary font-semibold"
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="mt-4 rounded-lg border border-border p-2 space-y-1">
                  <p className="px-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">Pro Tools</p>
                  <Link to="/collections" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">Collections</Button></Link>
                  <Link to="/board" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">Board Builder</Button></Link>
                  <Link to="/admin" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">Admin</Button></Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
