import { Button } from "@/components/ui/button";

type PanelComponentProps = { onClose: () => void };

let toggleCounter = 0;

const MinigamesOverlay: React.FC<PanelComponentProps> = ({ onClose }) => {
  const showMemoryMatch = toggleCounter % 2 === 0;

  const goToBattle = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;

    const main = game.scene.getScene("MainScene");
    const privateScene = game.scene.getScene("PrivateScene");

    if (main?.scene?.isActive()) {
      console.log("[Minigames] Stopping MainScene for RPS");
      game.scene.stop("MainScene");
    }
    if (privateScene?.scene?.isActive()) {
      console.log("[Minigames] Stopping PrivateScene for RPS");
      game.scene.stop("PrivateScene");
    }

    game.scene.start("rps-helper");
    onClose();
  };

  const goToMemoryMatch = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;

    // Disconnect from current room
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
    game.scene.stop("PrivateScene");
    game.scene.start("memoryMatch");
    toggleCounter += 1;
    onClose();
  };

  const goToLobby = () => {
    const game = (window as any).PhaserGame;
    if (!game) return;

    game.scene.stop("memoryMatch");
    game.scene.start("MainScene");
    toggleCounter += 1;
    onClose();
  };

  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ pointerEvents: "auto" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-[30%] h-[55%]
          hud-frame
          !rounded-3xl
          bg-[#0f403c]
          p-6 text-white backdrop-blur
          overflow-hidden
        "
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex w-full h-full flex-col">
          <div className="flex shrink-0 justify-between items-center mb-4">
            <h2 className="text-2xl font-[800]">Mini Games</h2>
            <Button
              className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs overflow-hidden"
              onClick={onClose}
            >
              X
            </Button>
          </div>

          <p className="text-sm text-white/70 mb-6 shrink-0">
            Challenge your friends or test your skills solo!
          </p>

          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="bg-[#1B746C] rounded-xl border-[3px] border-[#0C322E] p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Rock Paper Scissors</h3>
                  <p className="text-xs text-white/60">2 Players • Claw, Kelp, or Coral</p>
                </div>
                <Button
                  onClick={goToBattle}
                  className="bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                >
                  Battle
                </Button>
              </div>
            </div>

            <div className="bg-[#1B746C] rounded-xl border-[3px] border-[#0C322E] p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Memory Match</h3>
                  <p className="text-xs text-white/60">Solo • Match the fish pairs</p>
                </div>
                {showMemoryMatch ? (
                  <Button
                    onClick={goToMemoryMatch}
                    className="bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                  >
                    Play
                  </Button>
                ) : (
                  <Button
                    onClick={goToLobby}
                    className="bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                  >
                    Return
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinigamesOverlay;