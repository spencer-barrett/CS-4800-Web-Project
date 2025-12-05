// import { networkManager } from "@/lib/colyseus/networkController";
// import { auth, db } from "@/lib/firebase/clientApp";
// import { ChatMessage } from "@/types/chat-message";
// import { UserProfile } from "@/types/user-profile";
// import { getDoc, doc } from "firebase/firestore";
// import { useEffect, useRef, useState } from "react";
// import { MainRoom } from "@/types/myroomstate";
// //export let room_ = networkManager.getMainroom_();

// export default function useChatMessages() {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function attach(room: MainRoom) {
//       const handleIncoming = (msg: ChatMessage) => {
//         setMessages((prev) => [...prev, msg]);
//       };
//       room.onMessage("chat", handleIncoming);
//       return () => room.removeAllListeners();
//     }

//     const existing = networkManager.getMainRoom();
//     if (existing) {
//       // already connected
//       return attach(existing);
//     }

//     // wait for MainScene to signal it's ready
//     const onReady = () => {
//       const r = networkManager.getMainRoom();
//       if (!r) return;
//       cleanup = attach(r);
//       window.removeEventListener("colyseus:room-ready", onReady);
//     };

//     let cleanup: (() => void) | undefined;
//     window.addEventListener("colyseus:room-ready", onReady);

//     return () => {
//       window.removeEventListener("colyseus:room-ready", onReady);
//       cleanup?.();
//     };
//   }, []);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTo({
//         top: scrollRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages]);

//   const sendMessage = async (text: string) => {
//     if (!text.trim()) return;
//     if (!auth.currentUser) return;
//     const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
//     const profile = snap.data() as UserProfile | undefined;

//     const sender = profile?.displayName ?? "Anonymous";

//     const message: ChatMessage = { text, sender };

//     const room_ = networkManager.getMainRoom();
//     if (!room_) {
//       console.warn("Chat hook: tried to send before room_ was ready");
//       return;
//     }

//     room_.send("chat", message);
//     // setMessages((prev) => [...prev, message]);
//   };
//   return {
//     messages,
//     sendMessage,
//     scrollRef,
//   };
// }



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

  // track current room and cleanup function
  const roomRef = useRef<MainRoom | null>(networkManager.getMainRoom());
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  // attach listener to a room
  const attachListener = (room: MainRoom) => {
    const handler = (msg: ChatMessage) => {
      // Append locally if this message is new
      setMessages(prev => {
        // prevent duplicates: check text + sender
        const exists = prev.some(m => m.text === msg.text && m.sender === msg.sender);
        if (exists) return prev;
        return [...prev, msg];
      });

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    };

    room.onMessage("chat", handler);

    // store cleanup
    cleanupRef.current = () => {
      room.removeAllListeners();
    };
  };

  // Effect to attach listener on mount and handle reconnects
  useEffect(() => {
    const currentRoom = networkManager.getMainRoom();
    if (currentRoom) {
      roomRef.current = currentRoom;
      attachListener(currentRoom);
    }

    const handleRoomReady = () => {
      const r = networkManager.getMainRoom();
      if (r && r !== roomRef.current) {
        // cleanup old listener
        cleanupRef.current?.();

        // attach new listener
        roomRef.current = r;
        attachListener(r);
      }
    };

    window.addEventListener("colyseus:room-ready", handleRoomReady);

    return () => {
      window.removeEventListener("colyseus:room-ready", handleRoomReady);
      cleanupRef.current?.();
    };
  }, []);

  // send a chat message
  const sendMessage = async (text: string) => {
    if (!text.trim() || !auth.currentUser) return;

    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const profile = snap.data() as UserProfile | undefined;
    const sender = profile?.displayName ?? "Anonymous";

    const message: ChatMessage = { text, sender };

    const room = networkManager.getMainRoom();
    if (!room) {
      console.warn("Chat hook: tried to send before main room was ready");
      return;
    }

    // send to server
    room.send("chat", message);

    // append locally immediately
    setMessages(prev => [...prev, message]);
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  return { messages, sendMessage, scrollRef };
}