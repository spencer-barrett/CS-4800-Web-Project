import { CharacterForward } from "@/components/svg/char-forward";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/playerContext";
import { Users } from "lucide-react";
import { sendFriendRequest } from "@/lib/friends/friendService";
import { BaseballHat } from "@/components/svg/baseball-hat";
import { TopHat } from "@/components/svg/top-hat";
import { getHatColorFromId, getHatVariantFromId } from "@/lib/cosmetics/cosmeticHelpers";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";

type PlayerProfileOverlayProps = {
  sessionId: string;
  onClose: () => void;
  userId: string;
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
  const [equippedHat, setEquippedHat] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerCosmetics = async () => {
      try {
        const playerDoc = await getDoc(doc(db, "users", userId));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          setEquippedHat(data?.equippedCosmetics?.hat || null);
        }
      } catch (error) {
        console.error("Error fetching player cosmetics:", error);
      }
    };

    fetchPlayerCosmetics();
  }, [userId]);

  const renderHatPreview = (itemId: string, size: number = 85) => {
    const variant = getHatVariantFromId(itemId);
    const color = getHatColorFromId(itemId);

    switch (variant) {
      case 'tophat':
        return <TopHat hatColor={color} size={size} />;
      case 'baseball':
        return <BaseballHat hatColor={color} size={size} />;
      case 'cowboy':
        return <BaseballHat hatColor={color} size={size} />;
      default:
        return <BaseballHat hatColor={color} size={size} />;
    }
  };

  const handleSendFriendRequest = async () => {
    if (!playerData?.userId || !playerData?.displayName) return;

    const result = await sendFriendRequest(
      playerData.userId,
      playerData.displayName,
      userId
    );

    if (result.success) {
      console.log("Friend request sent!");
    } else {
      console.error(result.error);
    }
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

              <div className="flex flex-1 w-full rounded-xl items-center justify-center bg-gradient-to-b from-[#1B746C] to-[#17645C] relative">
                <CharacterForward bodyColor={bodyColor} size={175} />
                {equippedHat && (
                  <div className="absolute" style={{ top: '-1%', left: '50%', transform: 'translateX(-50%)' }}>
                    {renderHatPreview(equippedHat, 100)}
                  </div>
                )}
              </div>

              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <div className="flex gap-2">
                  <Button
                    className="!rounded-full hud-frame p-2 bg-[#0c2d30] shadow-sm cursor-pointer hover:bg-[#144D52] text-white !h-10 !w-10"
                    onClick={handleSendFriendRequest}
                  >
                    <Users size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}