import { useState } from "react";
import { useBoard } from "@/hooks/useBoard";
import { useCatalogItems } from "@/hooks/useCatalog";
import { Header } from "@/components/board/Header";
import { CatalogPanel } from "@/components/board/CatalogPanel";
import { BoardCanvas } from "@/components/board/BoardCanvas";
import { ControlPanel } from "@/components/board/ControlPanel";
import { GalleryShowroom } from "@/components/board/GalleryShowroom";

const BoardPage = () => {
  const [showroomOpen, setShowroomOpen] = useState(false);
  const { data: allItems } = useCatalogItems({});

  const {
    items,
    selectedId,
    setSelectedId,
    background,
    setBackground,
    style,
    setStyle,
    addItem,
    updateItem,
    removeItem,
    clearBoard,
    bringToFront,
    saveBoard,
    loadBoard,
    generateFlatlay,
    isGenerating,
    generatedImage,
  } = useBoard();

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onOpenShowroom={() => setShowroomOpen(true)} onSaveBoard={saveBoard} onLoadBoard={loadBoard} />

      <div className="border-b bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
        Workflow: 1) Add products from Catalog or Virtual Studio → 2) Arrange on canvas → 3) Pick background + style → 4) Generate and download.
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r flex-shrink-0">
          <CatalogPanel onAddItem={addItem} />
        </aside>

        <main className="flex-1 p-4">
          <div className="h-full rounded-xl border-2 border-dashed border-border overflow-hidden">
            <BoardCanvas
              items={items}
              selectedId={selectedId}
              onSelectItem={setSelectedId}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onBringToFront={bringToFront}
              generatedImage={generatedImage}
            />
          </div>
        </main>

        <aside className="w-72 border-l flex-shrink-0">
          <ControlPanel
            background={background}
            style={style}
            onBackgroundChange={setBackground}
            onStyleChange={setStyle}
            onGenerate={generateFlatlay}
            onClear={clearBoard}
            isGenerating={isGenerating}
            hasItems={items.length > 0}
            generatedImage={generatedImage}
          />
        </aside>
      </div>

      <GalleryShowroom
        open={showroomOpen}
        onOpenChange={setShowroomOpen}
        items={allItems || []}
        onAddItem={(item) => {
          addItem(item);
          setShowroomOpen(false);
        }}
      />
    </div>
  );
};

export default BoardPage;
