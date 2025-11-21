import { CharacterForward } from "@/components/svg/char-forward";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/playerContext";
import { Users, Send } from "lucide-react";

type PlayerProfileOverlayProps = {
  sessionId: string;
  onClose: () => void;
  userId: string; // ADD THIS
  playerBodyColor: string;
  playerDisplayName: string;
};

export default function PlayerProfileOverlay({
  sessionId,
  userId,
  onClose,
  playerBodyColor,
  playerDisplayName,
}: PlayerProfileOverlayProps) {
  const bodyColor = playerBodyColor.substring(5);
  const { playerData } = usePlayer();

  const handleJoinTheirRoom = () => {
    // Join the clicked player's private room using THEIR sessionId
    const game = window.PhaserGame;

    if (game) {
      game.scene.stop("MainScene");
      game.scene.start("PrivateScene", { playerData, targetSessionId: userId });
    }
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
        w-[30%] h-[65%]
        hud-frame
        !rounded-3xl
        bg-[#0f403c]
        p-4 text-white backdrop-blur
        overflow-hidden
      "
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex w-full h-full flex-col">
          <div className="flex shrink-0">
            <Button
              className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs overflow-hidden"
              onClick={onClose}
            >
              X
            </Button>
          </div>

          <div className="flex grow gap-4 min-h-0">
            <div className="flex flex-col w-full min-h-0">
              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <h2 className="font-[800]">{playerDisplayName}</h2>
              </div>

              <div className="flex flex-1 w-full rounded-xl items-center justify-center bg-gradient-to-b from-[#1B746C] to-[#17645C]">
                <CharacterForward bodyColor={bodyColor} size={175} />
              </div>

              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <div className="flex gap-2">
                  <Button className="!rounded-full hud-frame p-2 bg-[#0c2d30] shadow-sm  cursor-pointer hover:bg-[#144D52] text-white !h-10 !w-10">
                    <Users size={16} />
                  </Button>
                  <Button
                    className="!rounded-full hud-frame p-2 bg-[#0c2d30] shadow-sm  cursor-pointer hover:bg-[#144D52] text-white !h-10 !w-10"
                    onClick={handleJoinTheirRoom}
                  >
                    {" "}
                    <Send size={16} />
                  </Button>
                </div>
                {/* <div className="flex gap-2 bg-[#0C322E] p-3 !rounded-4xl hud-frame">
                  <Image
                    src="/shell-currency.svg"
                    width={24}
                    height={24}
                    alt="shell"
                  />
                  <div className="w-full">Your shells :</div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
