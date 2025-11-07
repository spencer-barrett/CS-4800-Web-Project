import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoreIcon, Swords, BedSingle, Users, Settings } from "lucide-react";
import { ComponentType, useState } from "react";

type PanelKey = "shop" | "minigames" | "privateRoom" | "friends" | "menu";
type ButtonConfig = {
  key: PanelKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const BUTTONS: ButtonConfig[] = [
  { key: "shop", label: "Shop", Icon: StoreIcon },
  { key: "minigames", label: "Minigames", Icon: Swords },
  { key: "privateRoom", label: "Private Rooms", Icon: BedSingle },
  { key: "friends", label: "Friends", Icon: Users },
  { key: "menu", label: "Settings", Icon: Settings },
];

const ITEM_CONTENT: Record<PanelKey, { title: string; description: string }> = {
  shop: { title: "Shop Menu", description: "Open shop" },
  minigames: { title: "MiniGames", description: "Open MiniGames" },
  privateRoom: { title: "Private Rooms", description: "Open Private Rooms" },
  friends: { title: "Friends List", description: "Open Friends List" },
  menu: {
    title: "Game Menu",
    description: "Change settings or exit to lobby.",
  },
};

export default function MenuBar() {
  const [activeItem, setActiveItem] = useState<PanelKey | null>(null);

  const toggle = (key: PanelKey) =>
    setActiveItem((current) => (current === key ? null : key));
  const active = activeItem ? ITEM_CONTENT[activeItem] : null;

  return (
    <>
      {/* Block-style bar: rectangular, subtle border and shado w */}
      <div
        className="absolute bottom-3 right-3 flex items-stretch gap-0 bg-black/75 rounded-md px-1 py-1 border border-white/10 shadow-sm"
        style={{ pointerEvents: "none" }}
      >
        {BUTTONS.map(({ key, label, Icon }, i) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toggle(key)}
                style={{ pointerEvents: "auto" }}
                className={`rounded-none px-3 py-1 text-sm ${
                  i > 0 ? "border-l border-white/10" : ""
                }`}
              >
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {active && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ pointerEvents: "auto" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-title"
        >
          <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
            <h2 id="panel-title" className="mb-3 text-xl font-bold">
              {active.title}
            </h2>
            <p className="mb-4 text-sm opacity-80">{active.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => setActiveItem(null)}>Resume</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
