import { Button } from "@/components/ui/button";
import { LayoutGrid, Save, FolderOpen } from "lucide-react";

interface HeaderProps {
  onOpenShowroom: () => void;
}

export function Header({ onOpenShowroom }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Cabinet Board Builder</h1>
          <p className="text-xs text-muted-foreground">AI-Powered Flat-Lay Generator</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenShowroom}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Showroom
        </Button>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Board
        </Button>
      </div>
    </header>
  );
}
