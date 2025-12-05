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
  const currentRoomRef = useRef<MainRoom | null>(null);

  useEffect(() => {
    function attach(room: MainRoom, roomType: 'main' | 'private') {
      console.log(`[Chat] Attaching to ${roomType} room`);
      
      const handleIncoming = (msg: ChatMessage) => {
        console.log(`[Chat] Received message in ${roomType} room:`, msg);
        setMessages((prev) => [...prev, msg]);
      };
      
      room.onMessage("chat", handleIncoming);
      currentRoomRef.current = room;
      
      return () => {
        console.log(`[Chat] Cleaning up ${roomType} room listener`);
        room.removeAllListeners();
        currentRoomRef.current = null;
      };
    }

    const getActiveRoom = (): { room: MainRoom; type: 'main' | 'private' } | null => {
      const privateRoom = networkManager.getPrivateRoom();
      if (privateRoom && privateRoom.connection.isOpen) {
        return { room: privateRoom, type: 'private' };
      }
      const mainRoom = networkManager.getMainRoom();
      if (mainRoom && mainRoom.connection.isOpen) {
        return { room: mainRoom, type: 'main' };
      }
      return null;
    };

    const checkAndAttach = () => {
      const activeRoom = getActiveRoom();
      
      if (activeRoom && activeRoom.room !== currentRoomRef.current) {
        console.log(`[Chat] Room changed, reattaching to ${activeRoom.type} room`);
        if (cleanup) cleanup();
        cleanup = attach(activeRoom.room, activeRoom.type);
      }
    };

    // Initial attachment
    const activeRoom = getActiveRoom();
    let cleanup: (() => void) | undefined;
    
    if (activeRoom) {
      cleanup = attach(activeRoom.room, activeRoom.type);
    }

    const onReady = () => {
      checkAndAttach();
    };

    window.addEventListener("colyseus:room-ready", onReady);
    window.addEventListener("phaser:ready", checkAndAttach);

    const pollInterval = setInterval(checkAndAttach, 2000);

    return () => {
      window.removeEventListener("colyseus:room-ready", onReady);
      window.removeEventListener("phaser:ready", checkAndAttach);
      clearInterval(pollInterval);
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!auth.currentUser) return;

    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const profile = snap.data() as UserProfile | undefined;
    const sender = profile?.displayName ?? "Anonymous";
    const message: ChatMessage = { text, sender };

    const privateRoom = networkManager.getPrivateRoom();
    const mainRoom = networkManager.getMainRoom();

    if (privateRoom && privateRoom.connection.isOpen) {
      console.log("[Chat] Sending to private room");
      privateRoom.send("chat", message);
    } else if (mainRoom && mainRoom.connection.isOpen) {
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