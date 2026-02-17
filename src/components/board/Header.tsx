import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Save, FolderOpen, Sparkles, Layers, Settings, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenShowroom?: () => void;
  onSaveBoard?: () => void;
  onLoadBoard?: () => void;
}

export function Header({ onOpenShowroom, onSaveBoard, onLoadBoard }: HeaderProps) {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Inspiration", icon: Sparkles },
    { path: "/collections", label: "Collections", icon: Layers },
    { path: "/board", label: "Board Builder", icon: LayoutGrid },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight">Cabinet Board Builder</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Flat-Lay Generator</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  (location.pathname === link.path || (link.path === "/" && location.pathname === "/inspiration")) && "bg-muted"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {onOpenShowroom && (
          <Button variant="outline" size="sm" onClick={onOpenShowroom}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Virtual Studio
          </Button>
        )}
        {onLoadBoard && (
          <Button variant="outline" size="sm" onClick={onLoadBoard}>
            <Upload className="mr-2 h-4 w-4" />
            Load Board
          </Button>
        )}
        {onSaveBoard && (
          <Button variant="outline" size="sm" onClick={onSaveBoard}>
            <Save className="mr-2 h-4 w-4" />
            Save Board
          </Button>
        )}
      </div>
    </header>
  );
}
