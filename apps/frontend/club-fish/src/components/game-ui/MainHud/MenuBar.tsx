import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  StoreIcon,
  Swords,
  BedSingle,
  Users,
  Settings,
  MessageSquareText,
  CircleUserRound,
} from "lucide-react";
import { ComponentType, useEffect, useState } from "react";
import ShopOverlay from "./Shop/ShopOverlay";
import ProfileOverlay from "./Profile/ProfileOverlay";
import { usePlayer } from "@/context/playerContext";
import FriendsList from "./Friends/FriendsList";
import { MusicManager } from "@/components/phaser/MusicManager";
import MinigamesOverlay from "./MiniGames/MiniGamesOverlay";
import PrivateRoomOverlay from "./PrivateRoom-Menu/PrivateRoomOverlayMenu";

type MenuBarProps = {
  showMessage?: boolean;
  onToggleChat?: () => void;
};

type PanelKey =
  | "shop"
  | "profile"
  | "minigames"
  | "privateRoom"
  | "friends"
type ButtonConfig = {
  key: PanelKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

type PanelComponentProps = { onClose: () => void };

const goToBattle = () => {
  const game = (window as any).PhaserGame;
  if (!game) return;

  // Leave MainScene room if active
  const main = game.scene.getScene("MainScene");
  if (main?.room) {
    console.log("Leaving MainRoom before RPS minigame");
    main.room.leave();
    (window as any).networkManager?.clearMainRoom?.();
    main.room = undefined;
  }

  // Leave PrivateScene room if minigame is launched from there
  const priv = game.scene.getScene("PrivateScene");
  if (priv?.room) {
    console.log("Leaving PrivateRoom before RPS minigame");
    priv.room.leave();
    (window as any).networkManager?.clearPrivateRoom?.();
    priv.room = undefined;
  }

  // Stop whichever is running
  game.scene.stop("MainScene");
  game.scene.stop("PrivateScene");

  game.scene.start("rps-helper");
};

const BUTTONS: ButtonConfig[] = [
  { key: "shop", label: "Shop", Icon: StoreIcon },
  { key: "profile", label: "Profile", Icon: CircleUserRound },
  { key: "minigames", label: "Minigames", Icon: Swords },
  { key: "privateRoom", label: "Private Room", Icon: BedSingle },
  { key: "friends", label: "Friends", Icon: Users },
  // { key: "menu", label: "Settings", Icon: Settings },
];

const PANEL_COMPONENTS: Record<PanelKey, React.FC<PanelComponentProps>> = {
  shop: ShopOverlay,
  profile: ProfileOverlay,
  minigames: MinigamesOverlay,
  privateRoom: PrivateRoomOverlay,
  friends: FriendsList,
  // menu: SettingsOverlay,
};

export default function MenuBar({ showMessage, onToggleChat }: MenuBarProps) {
  const [activeItem, setActiveItem] = useState<PanelKey | null>(null);
  const [muted, setMuted] = useState(MusicManager.muted);

  const handleClick = () => {
    onToggleChat?.();
    console.log("clicked!!: ", showMessage);
  };

  useEffect(() => {
    (window as any).__overlayOpen = activeItem !== null;
  }, [activeItem]);

  const toggle = (key: PanelKey) =>
    setActiveItem((current) => (current === key ? null : key));
  const ActivePanel = activeItem ? PANEL_COMPONENTS[activeItem] : null;

  const handleMute = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;
    const newMuted = MusicManager.toggleMute(game.scene.getScene("MainScene"));
    setMuted(newMuted);
  };

  return (
    <>
      <div
        className="absolute bottom-3 flex gap-0  w-full items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="bg-[#0f403c] w-[50%] h-full px-6 py-2 shadow-sm flex items-center gap-4 hud-frame !rounded-4xl"
          style={{ pointerEvents: "auto" }}
        >

          <div className="cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <MessageSquareText
                  onClick={() => handleClick()}
                  style={{ pointerEvents: "auto" }}
                />
              </TooltipTrigger>
              <TooltipContent className="mb-4">
                <p>Show/Hide Messages</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {BUTTONS.map(({ key, label, Icon }, i) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggle(key)}
                  style={{ pointerEvents: "auto" }}
                  className="!rounded-md px-3 py-1 text-sm grow bg-[#0c2d30] shadow-md  cursor-pointer hover:bg-[#144D52] hud-frame"
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-3">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMute}
                style={{ pointerEvents: "auto" }}
                className="!rounded-md px-3 py-1 text-sm bg-[#0c2d30] shadow-md cursor-pointer hover:bg-[#144D52] hud-frame"
              >
                {muted ? "🔇" : "🔊"}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-3">
              <p>{muted ? "Unmute Music" : "Mute Music"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {ActivePanel && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ pointerEvents: "auto" }}
          role="dialog"
          aria-modal="true"
        >
          <ActivePanel onClose={() => setActiveItem(null)} />
        </div>
      )}
    </>
  );
}
