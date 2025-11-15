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

  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
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
    const handler = (e: any) => {
      const clickedId = e.detail.sessionId;
      const myId = playerData?.sessionId;

      if (clickedId === myId) {
        console.log("Clicked my own penguin → open profile");
        setOpenOtherProfile(false);
        setOpenSelfProfile(true);
      } else {
        setSelectedPlayer(clickedId);
        setOpenSelfProfile(false);
        setOpenOtherProfile(true);
        setPlayerDisplayName(e.detail.playerData.displayName);
        setPlayerBodyColor(e.detail.playerData.bodyColor);
      }
    };

    window.addEventListener("game:playerClick", handler);
    return () => window.removeEventListener("game:playerClick", handler);
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
          sessionId={selectedPlayer}
          onClose={() => setOpenOtherProfile(false)}
          playerBodyColor={playerBodyColor}
          playerDisplayName={playerDisplayName}
        />
      )}
    </>
  );
}
