"use client";

import { usePlayer } from "@/context/playerContext";
import { ChatWindow } from "@/components/chat/ChatWindow";
import MenuBar from "./MenuBar";

export default function MainHudOverlay() {
  const { playerData } = usePlayer();

  return (
    <>
      <ChatWindow />
      <MenuBar currency={playerData?.currency} />
    </>
  );
}
