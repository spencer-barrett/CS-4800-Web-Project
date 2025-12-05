"use client";

import { useEffect, useRef, useState } from "react";
import { networkManager } from "@/lib/colyseus/networkController";
import { auth, db } from "@/lib/firebase/clientApp";
import { ChatMessage } from "@/types/chat-message";
import { UserProfile } from "@/types/user-profile";
import { getDoc, doc } from "firebase/firestore";
import { MainRoom } from "@/types/myroomstate";

export default function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function attach(room: MainRoom, roomType: 'main' | 'private') {
      const handleIncoming = (msg: ChatMessage) => {
        console.log(`[${roomType}] Received chat message:`, msg);
        setMessages((prev) => [...prev, msg]);
      };
      room.onMessage("chat", handleIncoming);
      return () => room.removeAllListeners();
    }

    const getActiveRoom = (): { room: MainRoom; type: 'main' | 'private' } | null => {
      const privateRoom = networkManager.getPrivateRoom();
      if (privateRoom) {
        return { room: privateRoom, type: 'private' };
      }

      const mainRoom = networkManager.getMainRoom();
      if (mainRoom) {
        return { room: mainRoom, type: 'main' };
      }

      return null;
    };

    const activeRoom = getActiveRoom();
    if (activeRoom) {
      console.log(`[Chat] Attaching to ${activeRoom.type} room`);
      return attach(activeRoom.room, activeRoom.type);
    }

    const onReady = () => {
      const activeRoom = getActiveRoom();
      if (!activeRoom) return;

      console.log(`[Chat] Room ready, attaching to ${activeRoom.type} room`);
      cleanup = attach(activeRoom.room, activeRoom.type);
      window.removeEventListener("colyseus:room-ready", onReady);
    };

    window.addEventListener("colyseus:room-ready", handleRoomReady);

    return () => {
      window.removeEventListener("colyseus:room-ready", handleRoomReady);
      cleanupRef.current?.();
    };
  }, []);

  // send a chat message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!auth.currentUser) return;

    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const profile = snap.data() as UserProfile | undefined;
    const sender = profile?.displayName ?? "Anonymous";
    const message: ChatMessage = { text, sender };

    const privateRoom = networkManager.getPrivateRoom();
    const mainRoom = networkManager.getMainRoom();

    if (privateRoom) {
      console.log("[Chat] Sending to private room");
      privateRoom.send("chat", message);
    } else if (mainRoom) {
      console.log("[Chat] Sending to main room");
      mainRoom.send("chat", message);
    } else {
      console.warn("Chat hook: no active room to send message");
      return;
    }
  };

  return {
    messages,
    sendMessage,
    scrollRef,
  };
}