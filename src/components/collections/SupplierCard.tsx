import { ExternalLink } from "lucide-react";
import { Supplier } from "@/types/board";
import { cn } from "@/lib/utils";

interface SupplierCardProps {
  supplier: Supplier & { productCount?: number };
  isSelected: boolean;
  onClick: () => void;
}

export function SupplierCard({ supplier, isSelected, onClick }: SupplierCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {/* Logo */}
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        {supplier.logo_url ? (
          <img
            src={supplier.logo_url}
            alt={supplier.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">
            {supplier.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <h3 className="font-semibold text-sm">{supplier.name}</h3>
        {supplier.productCount !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {supplier.productCount} products
          </p>
        )}
      </div>

      {/* Website Link */}
      {supplier.website_url && (
        <a
          href={supplier.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Website
        </a>
      )}
    </button>
  );
}
