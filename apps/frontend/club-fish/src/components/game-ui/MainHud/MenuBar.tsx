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
  | "menu";
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
  { key: "menu", label: "Settings", Icon: Settings },
];

let toggleCounter = 0;
const MinigamesOverlay: React.FC<PanelComponentProps> = ({ onClose }) => {
  const showMemoryMatch = toggleCounter % 2 === 0;


  const goToMemoryMatch = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;

    // --- DISCONNECT FROM CURRENT ROOM ---
    const main = game.scene.getScene("MainScene");
    const privateScene = game.scene.getScene("PrivateScene");

    // Main room
    if (main?.room) {
      console.log("Leaving MainRoom");
      main.room.leave();
      (window as any).networkManager?.clearMainRoom?.();
      main.room = undefined;
    }

    // Private room
    if (privateScene?.room) {
      console.log("Leaving PrivateRoom");
      privateScene.room.leave();
      (window as any).networkManager?.clearPrivateRoom?.();
      privateScene.room = undefined;
    }
  

    game.scene.stop("MainScene");
    game.scene.stop("PrivateScene")
    game.scene.start("memoryMatch");
    toggleCounter += 1;
    //game.scene.pause("MainScene");
  }
  const goToLobby = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;

    game.scene.stop("memoryMatch");
    game.scene.start("MainScene");
    toggleCounter += 1;
  }

  return (
    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
      <h2 className="mb-3 text-xl font-bold">MiniGames</h2>
      <p className="text-sm opacity-80 mb-4">
        Play a fish themed game of Rock Paper Scissors with a friend or foe, or a game of Memory Match solo!
      </p>
      <div className="flex gap-2">
        <Button onClick={goToBattle}>Battle</Button>
        <div>
          {showMemoryMatch ? (
            <Button onClick={goToMemoryMatch}>Memory</Button>
          ) : (
            <Button onClick={goToLobby}>Return</Button>
          )}
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const PrivateRoomOverlay: React.FC<PanelComponentProps> = ({ onClose }) => {
  const { playerData } = usePlayer();
  const userId = playerData?.userId;

  // Track the owner of the bowl we're currently in
  const [bowlOwnerId, setBowlOwnerId] = useState<string | null>(
    (window as any).__bowlOwnerId || null
  );

  // Only show decorate if the player is the owner
  const isOwner = bowlOwnerId === userId;

  const handleJoinMyOwnRoom = () => {
    if (!userId) {
      console.error("User ID not found!");
      return;
    }

    const game = window.PhaserGame;
    if (!game) return;

    // Set global bowl owner
    (window as any).__bowlOwnerId = userId;
    setBowlOwnerId(userId);

    // Start PrivateScene
    game.scene.stop("MainScene");
    game.scene.start("LoadingScene", {
      targetScene: "PrivateScene",
      targetData: { playerData, targetSessionId: userId },
    });
  };

  const handleReturnToMain = () => {
    const game = window.PhaserGame;
    if (!game) return;

    // Clear global bowl owner
    (window as any).__bowlOwnerId = null;
    setBowlOwnerId(null);

    // Go back to MainScene
    game.scene.stop("PrivateScene");
    game.scene.start("LoadingScene", {
      targetScene: "MainScene",
      targetData: { playerData, targetSessionId: userId },
    });

    onClose(); // Close overlay
  };

  const [showDecorateOverlay, setShowDecorateOverlay] = useState(false);
  const handleDecorate = () => {
    console.log("Entering decorate mode...");
    // TODO: Add decorate logic here
    setShowDecorateOverlay(prev => !prev);
  };

  return (
    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
      <h2 className="mb-3 text-xl font-bold">Private Rooms</h2>
      <p className="text-sm opacity-80 mb-4">
        Create your own private room for others to join
      </p>
      <div className="flex gap-2">
        {!isOwner ? (
          <Button onClick={handleJoinMyOwnRoom}>Go to my Bowl</Button>
        ) : (
          <Button onClick={handleDecorate}>Decorate</Button>
        )}
        <Button onClick={handleReturnToMain}>Return to Hub</Button>
        <Button onClick={onClose}>Close</Button>
      </div>

      {/* Overlay */}
      {showDecorateOverlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[400px] relative">
            <h3 className="text-lg font-bold mb-4">Decorate Your Bowl</h3>
            <p className="mb-4">Here you can choose decorations for your private room!</p>

            {/* Example decoration options */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button className="border p-2 rounded">Coral</button>
              <button className="border p-2 rounded">Seaweed</button>
              <button className="border p-2 rounded">Rock</button>
            </div>

            <button
              className="absolute top-2 right-2 text-red-500 font-bold"
              onClick={() => setShowDecorateOverlay(false)}
            >
              X
            </button>

            <Button onClick={() => setShowDecorateOverlay(false)}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
};
// const PrivateRoomOverlay: React.FC<PanelComponentProps> = ({ onClose }) => {
//   const { playerData } = usePlayer();
//   const userId = playerData?.userId;

//   const handleJoinMyOwnRoom = () => {
//     if (!userId) {
//       console.error("User ID not found!");
//       return;
//     }
//     const game = window.PhaserGame;

//     if (game) {
//       game.scene.stop("MainScene");
//       // game.scene.start("PrivateScene", { playerData, targetSessionId: userId });
//        game.scene.start("LoadingScene", {
//   targetScene: "PrivateScene",
//   targetData: { playerData, targetSessionId: userId },
// });
//     }
//     onClose();
//   };

//   const handleReturnToMain = () => {
//     const game = window.PhaserGame;

//     if (game) {
//       game.scene.stop("PrivateScene");
//       // game.scene.start("MainScene", { playerData });
//        game.scene.start("LoadingScene", {
//   targetScene: "MainScene",
//   targetData: { playerData, targetSessionId: userId },
// });
//     }
    
//     onClose();
//   };

//   return (
//     <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
//       <h2 className="mb-3 text-xl font-bold">Private Rooms</h2>
//       <p className="text-sm opacity-80 mb-4">
//         Create your own private room for others to join
//       </p>
//       <div className="flex gap-2">
//         <Button onClick={handleJoinMyOwnRoom}>Go to my Bowl</Button>
//         <Button onClick={handleReturnToMain}>Return to Hub</Button>
//         <Button onClick={onClose}>Close</Button>
//       </div>
//     </div>
//   );
// };

const FriendsOverlay: React.FC<PanelComponentProps> = ({ onClose }) => (
  <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
    <h2 className="mb-3 text-xl font-bold">Friends List</h2>
    <p className="text-sm opacity-80 mb-4">Friends list UI goes here.</p>
    <div className="flex gap-2">
      <Button onClick={onClose}>Close</Button>
    </div>
  </div>
);

const SettingsOverlay: React.FC<PanelComponentProps> = ({ onClose }) => (
  <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
    <h2 className="mb-3 text-xl font-bold">Game Menu</h2>
    <p className="text-sm opacity-80 mb-4">Change settings or exit to lobby.</p>
    <div className="flex gap-2">
      <Button onClick={onClose}>Resume</Button>
    </div>
  </div>
);

const PANEL_COMPONENTS: Record<PanelKey, React.FC<PanelComponentProps>> = {
  shop: ShopOverlay,
  profile: ProfileOverlay,
  minigames: MinigamesOverlay,
  privateRoom: PrivateRoomOverlay,
  friends: FriendsList,
  menu: SettingsOverlay,
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
      {/* Block-style bar: rectangular, subtle border and shado w */}
      <div
        className="absolute bottom-3 flex gap-0  w-full items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="bg-[#0f403c] w-[50%] h-full px-6 py-2 shadow-sm flex items-center gap-4 hud-frame !rounded-4xl"
          style={{ pointerEvents: "auto" }}
        >
          {/* <div className="w-[40%] bg-white/60 h-full mr-auto">

        </div> */}
          <div className="cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <MessageSquareText
                  onClick={() => handleClick()}
                  style={{ pointerEvents: "auto" }}
                />
              </TooltipTrigger>
              <TooltipContent className="mb-1">
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
              <TooltipContent>
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
            <TooltipContent>
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
