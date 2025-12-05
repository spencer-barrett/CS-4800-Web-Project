"use client";

import { X, Palette, DoorOpen } from "lucide-react";
import { usePlayer } from "@/context/playerContext";
import { networkManager } from "@/lib/colyseus/networkController";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";

const DecorateOverlay = ({ onClose }: { onClose: () => void }) => (
  <div className="w-[450px] rounded-xl border border-white/10 bg-[#0f403c] p-6 text-white backdrop-blur hud-frame">
    <div className="flex items-center justify-between mb-4">
      <Button
        onClick={onClose}
        className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs"
      >
        <X size={16} />
      </Button>
      <h2 className="text-xl font-bold">Decorate</h2>
      <div className="w-8"></div>
    </div>
    <p className="text-sm opacity-80 mb-4">
      Customize your private bowl with decorations and themes.
    </p>
    <div className="flex gap-2">

    </div>
  </div>
);

export default function PrivateRoomOverlay({ game }: { game: Phaser.Game | null }) {
  const { playerData } = usePlayer();
  const userId = playerData?.userId;
  const [showDecorateModal, setShowDecorateModal] = useState(false);
  const [ownerDisplayName, setOwnerDisplayName] = useState<string>("Loading...");

  // Track the owner of the bowl we're currently in
  const [bowlOwnerId, setBowlOwnerId] = useState<string | null>(
    (window as any).__bowlOwnerId || null
  );

  // Only show decorate if the player is the owner
  const isOwner = bowlOwnerId === userId;

  useEffect(() => {
    const fetchOwnerName = async () => {
      if (!bowlOwnerId) {
        setOwnerDisplayName("Unknown");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", bowlOwnerId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setOwnerDisplayName(data?.displayName || "Unknown");
        } else {
          setOwnerDisplayName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching owner name:", error);
        setOwnerDisplayName("Unknown");
      }
    };

    fetchOwnerName();
  }, [bowlOwnerId]);

  useEffect(() => {
    (window as any).__overlayOpen = showDecorateModal;
  }, [showDecorateModal]);

  const handleLeavePrivateRoom = async () => {
    if (!game) return;

    const userId = playerData?.userId;

    const privateScene = game.scene.getScene("PrivateScene") as any;
    if (privateScene?.room) {
      console.log("Leaving PrivateRoom via overlay button");
      await privateScene.room.leave();
      networkManager.clearPrivateRoom();
      privateScene.room = undefined;
    }

    (window as any).__bowlOwnerId = null;

    game.scene.stop("PrivateScene");
    game.scene.start("LoadingScene", {
      targetScene: "MainScene",
      targetData: { playerData, targetSessionId: userId },
    });
  };

  return (
    <>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="border border-white/10 bg-[#0f403c] p-3 rounded-lg shadow-lg pointer-events-auto flex flex-col gap-3 hud-frame items-center">
          <div className="text-center">
            <div className="text-[10px] text-white/70 tracking-wide mb-0.5">
              {isOwner ? "Your Bowl" : "Visiting"}
            </div>
            <div className="text-sm font-semibold">
              {ownerDisplayName}
            </div>
          </div>
          {/* {isOwner && (
            <button
              className="cursor-pointer flex items-center justify-center w-12 h-12 !p-0 bg-[#0c2d30] hover:bg-[#144D52] text-white rounded-lg transition-colors hud-frame"
              onClick={() => setShowDecorateModal(true)}
              title="Decorate"
            >
              <Palette size={22} />
            </button>

          )} */}


          <button
            className="cursor-pointer flex items-center justify-center w-12 h-12 bg-[#0c2d30] hover:bg-[#144D52] text-white rounded-lg transition-colors hud-frame"
            onClick={handleLeavePrivateRoom}
            title="Leave Private Room"
          >
            <DoorOpen size={22} />
          </button>
        </div>
      </div>

      {showDecorateModal && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ pointerEvents: "auto" }}
          role="dialog"
          aria-modal="true"
        >
          <DecorateOverlay onClose={() => setShowDecorateModal(false)} />
        </div>
      )}
    </>
  );
}