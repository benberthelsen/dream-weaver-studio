import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wand2, Trash2, Download, Share2 } from "lucide-react";
import type { BackgroundPreset, StylePreset } from "@/types/board";

const backgroundPresets: BackgroundPreset[] = [
  { id: "white-marble", name: "White Marble", value: "clean white marble surface", preview: "#f5f5f5" },
  { id: "dark-wood", name: "Dark Wood", value: "dark walnut wood surface", preview: "#3d2914" },
  { id: "light-oak", name: "Light Oak", value: "natural light oak wood surface", preview: "#d4a574" },
  { id: "concrete", name: "Concrete", value: "polished concrete surface", preview: "#9ca3af" },
  { id: "slate", name: "Slate", value: "dark slate stone surface", preview: "#475569" },
  { id: "linen", name: "Linen", value: "neutral linen fabric background", preview: "#e8e4df" },
];

const stylePresets: StylePreset[] = [
  { id: "natural", name: "Natural Light", description: "Soft daylight", background: "", style: "soft natural daylight with gentle shadows" },
  { id: "studio", name: "Studio", description: "Professional", background: "", style: "professional studio lighting with crisp shadows" },
  { id: "warm", name: "Warm", description: "Cozy feel", background: "", style: "warm ambient lighting with golden tones" },
  { id: "minimal", name: "Minimal", description: "Clean & simple", background: "", style: "bright even lighting with minimal shadows" },
  { id: "dramatic", name: "Dramatic", description: "Bold shadows", background: "", style: "dramatic directional lighting with strong contrast" },
];

interface ControlPanelProps {
  background: string;
  style: string;
  onBackgroundChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  hasItems: boolean;
  generatedImage?: string;
}

export function ControlPanel({
  background,
  style,
  onBackgroundChange,
  onStyleChange,
  onGenerate,
  onClear,
  isGenerating,
  hasItems,
  generatedImage,
}: ControlPanelProps) {
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `flatlay-moodboard-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your flat-lay</p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-3">
          <Label>Background Surface</Label>
          <Select
            value={backgroundPresets.find((p) => p.value === background)?.id || "white-marble"}
            onValueChange={(id) => {
              const preset = backgroundPresets.find((p) => p.id === id);
              if (preset) onBackgroundChange(preset.value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select background" />
            </SelectTrigger>
            <SelectContent>
              {backgroundPresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: preset.preview }}
                    />
                    {preset.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Lighting Style</Label>
          <Select
            value={stylePresets.find((p) => p.style === style)?.id || "natural"}
            onValueChange={(id) => {
              const preset = stylePresets.find((p) => p.id === id);
              if (preset) onStyleChange(preset.style);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {stylePresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex flex-col">
                    <span>{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Kitchen Modern", bg: "white-marble", style: "studio" },
              { name: "Rustic Warm", bg: "dark-wood", style: "warm" },
              { name: "Minimal Clean", bg: "concrete", style: "minimal" },
              { name: "Bold Statement", bg: "slate", style: "dramatic" },
            ].map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-2"
                onClick={() => {
                  const bgPreset = backgroundPresets.find((p) => p.id === preset.bg);
                  const stylePreset = stylePresets.find((p) => p.id === preset.style);
                  if (bgPreset) onBackgroundChange(bgPreset.value);
                  if (stylePreset) onStyleChange(stylePreset.style);
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t space-y-3">
        <Button
          onClick={onGenerate}
          disabled={!hasItems || isGenerating}
          className="w-full"
          size="lg"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Flat-Lay"}
        </Button>

        {generatedImage && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onClear}
          disabled={!hasItems}
          className="w-full text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Board
        </Button>
      </div>
    </div>
  );
}
