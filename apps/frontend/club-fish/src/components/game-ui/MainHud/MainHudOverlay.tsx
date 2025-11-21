"use client";

import { usePlayer } from "@/context/playerContext";
import { ChatWindow } from "@/components/chat/ChatWindow";
import MenuBar from "./MenuBar";
import { useEffect, useState } from "react";
import PlayerProfileOverlay from "./Profile/PlayerProfileOverlay";
import ProfileOverlay from "./Profile/ProfileOverlay";

export default function MainHudOverlay() {
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const { playerData } = usePlayer();

  const [selectedPlayer, setSelectedPlayer] = useState<
    | {
        sessionId: string;
        userId: string;
      }
    | undefined
  >();
  const [openSelfProfile, setOpenSelfProfile] = useState(false);
  const [openOtherProfile, setOpenOtherProfile] = useState(false);
  const [playerDisplayName, setPlayerDisplayName] = useState<string>("");
  const [playerBodyColor, setPlayerBodyColor] = useState<string>("");

  useEffect(() => {
    const isAnyOverlayOpen = openSelfProfile || openOtherProfile;
    (window as any).__overlayOpen = isAnyOverlayOpen;
    console.log("Overlay flag:", isAnyOverlayOpen);
  }, [openSelfProfile, openOtherProfile]);

  // listen for phaser events
  useEffect(() => {
    window.onPhaserPlayerClick = (payload) => {
      const myId = playerData?.sessionId;

      if (payload.sessionId === myId) {
        // clicked yourself
        setOpenOtherProfile(false);
        setOpenSelfProfile(true);
        return;
      }

      // clicked someone else
      setSelectedPlayer({
        sessionId: payload.sessionId,
        userId: payload.userId,
      });

      setPlayerDisplayName(payload.displayName);
      setPlayerBodyColor(payload.bodyColor);

      setOpenSelfProfile(false);
      setOpenOtherProfile(true);
    };

    return () => {
      window.onPhaserPlayerClick = undefined;
    };
  }, [playerData]);

  const handleToggleChat = () => {
    setShowMessage((prev) => !prev);
  };

  return (
    <>
      <ChatWindow showMessage={showMessage} />
      <MenuBar showMessage={showMessage} onToggleChat={handleToggleChat} />
      {openSelfProfile && (
        <ProfileOverlay
          onClose={() => setOpenSelfProfile(false)}
          fromPlayerClick
        />
      )}

      {openOtherProfile && selectedPlayer && (
        <PlayerProfileOverlay
          sessionId={selectedPlayer.sessionId}
          userId={selectedPlayer.userId}
          onClose={() => setOpenOtherProfile(false)}
          playerBodyColor={playerBodyColor}
          playerDisplayName={playerDisplayName}
        />
      )}
    </>
  );
}