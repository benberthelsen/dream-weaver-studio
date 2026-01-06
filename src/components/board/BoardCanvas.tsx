import { useRef, useState, useCallback } from "react";
import type { BoardItem } from "@/types/board";
import { cn } from "@/lib/utils";
import { X, RotateCw } from "lucide-react";

interface BoardCanvasProps {
  items: BoardItem[];
  selectedId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<BoardItem>) => void;
  onRemoveItem: (id: string) => void;
  onBringToFront: (id: string) => void;
  generatedImage?: string;
}

export function BoardCanvas({
  items,
  selectedId,
  onSelectItem,
  onUpdateItem,
  onRemoveItem,
  onBringToFront,
  generatedImage,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    itemStartX: number;
    itemStartY: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, item: BoardItem) => {
      e.preventDefault();
      e.stopPropagation();
      onSelectItem(item.id);
      onBringToFront(item.id);
      setDragState({
        id: item.id,
        startX: e.clientX,
        startY: e.clientY,
        itemStartX: item.x,
        itemStartY: item.y,
      });
    },
    [onSelectItem, onBringToFront]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState) return;
      
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      onUpdateItem(dragState.id, {
        x: dragState.itemStartX + deltaX,
        y: dragState.itemStartY + deltaY,
      });
    },
    [dragState, onUpdateItem]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelectItem(null);
      }
    },
    [onSelectItem]
  );

  const handleRotate = useCallback(
    (id: string, currentRotation: number) => {
      onUpdateItem(id, { rotation: (currentRotation + 15) % 360 });
    },
    [onUpdateItem]
  );

  if (generatedImage) {
    return (
      <div className="relative w-full h-full bg-muted flex items-center justify-center">
        <img
          src={generatedImage}
          alt="Generated flat-lay"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Your mood board is empty</p>
            <p className="text-sm">Select items from the catalog to get started</p>
          </div>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "absolute cursor-move select-none transition-shadow group",
            selectedId === item.id && "ring-2 ring-primary ring-offset-2"
          )}
          style={{
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            transform: `rotate(${item.rotation}deg)`,
            zIndex: item.zIndex,
          }}
          onMouseDown={(e) => handleMouseDown(e, item)}
        >
          <img
            src={item.catalogItem.image_url}
            alt={item.catalogItem.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            draggable={false}
          />
          
          {selectedId === item.id && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotate(item.id, item.rotation);
                }}
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
              >
                <RotateCw className="h-3 w-3" />
              </button>
            </>
          )}
          
          <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate text-center">
            {item.catalogItem.name}
          </div>
        </div>
      ))}
    </div>
  );
}
