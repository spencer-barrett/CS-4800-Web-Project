import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/playerContext";
import { useState } from "react";

type PanelComponentProps = { onClose: () => void };


const PrivateRoomOverlay: React.FC<PanelComponentProps> = ({ onClose }) => {
  const { playerData } = usePlayer();
  const userId = playerData?.userId;
  
  // Track the owner of the bowl we're currently in
  const [bowlOwnerId, setBowlOwnerId] = useState<string | null>(
    (window as any).__bowlOwnerId || null
  );
  
  // Only show decorate if the player is the owner
  const isOwner = bowlOwnerId === userId;
  const [showDecorateOverlay, setShowDecorateOverlay] = useState(false);
  
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
    onClose();
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
    onClose();
  };
  
  const handleDecorate = () => {
    console.log("Entering decorate mode...");
    setShowDecorateOverlay(prev => !prev);
  };

  return (
    <>
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ pointerEvents: "auto" }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="
            w-[30%] h-[50%]
            hud-frame
            !rounded-3xl
            bg-[#0f403c]
            p-6 text-white backdrop-blur
            overflow-hidden
          "
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex w-full h-full flex-col">
            {/* Header with close button */}
            <div className="flex shrink-0 justify-between items-center mb-4">
              <h2 className="text-2xl font-[800]">Private Bowl</h2>
              <Button
                className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs overflow-hidden"
                onClick={onClose}
              >
                X
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-white/70 mb-6 shrink-0">
              Create your own private bowl for friends to visit and hang out in.
            </p>

            {/* Action Cards */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              {/* Go to Bowl / Decorate */}
              <div className="bg-[#1B746C] rounded-xl border-[3px] border-[#0C322E] p-4 hover:border-[#27A59B] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {!isOwner ? (
                      <>
                        <h3 className="font-semibold text-lg mb-1">My Bowl</h3>
                        <p className="text-xs text-white/60">Enter your personal space</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg mb-1">Decorate</h3>
                        <p className="text-xs text-white/60">Customize your bowl</p>
                      </>
                    )}
                  </div>
                  {!isOwner ? (
                    <Button
                      onClick={handleJoinMyOwnRoom}
                    className=" bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                    >
                      Enter
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDecorate}
                    className=" bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                    >
                      Decorate
                    </Button>
                  )}
                </div>
              </div>

              {/* Return to Hub */}
              <div className="bg-[#1B746C] rounded-xl border-[3px] border-[#0C322E] p-4 hover:border-[#27A59B] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Main Hub</h3>
                    <p className="text-xs text-white/60">Return to the ocean world</p>
                  </div>
                  <Button
                    onClick={handleReturnToMain}
                    className=" bg-[#0f403c] hover:bg-[#144D52] hud-frame !rounded-xl px-4 text-white"
                  >
                    Return
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </>
  );
};

export default PrivateRoomOverlay;