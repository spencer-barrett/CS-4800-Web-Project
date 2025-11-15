"use client";

import { usePlayer } from "@/context/playerContext";
import { ChatWindow } from "@/components/chat/ChatWindow";
import MenuBar from "./MenuBar";
import { useState } from "react";

export default function MainHudOverlay() {
  const [showMessage, setShowMessage] = useState<boolean>(false);

    const handleToggleChat = () => {
    setShowMessage(prev => !prev);
  };


  return (
    <>
      <ChatWindow showMessage={showMessage}/>
      <MenuBar showMessage={showMessage} onToggleChat={handleToggleChat}/>
    </>
  );
}
