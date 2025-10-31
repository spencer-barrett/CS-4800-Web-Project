import { networkManager } from "@/lib/colyseus/networkController";
import { auth, db } from "@/lib/firebase/clientApp";
import { ChatMessage } from "@/types/chat-message";
import { UserProfile } from "@/types/user-profile";
import { getDoc, doc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { room } from "@/components/phaser/scenes/BootScene";
//export let room = networkManager.getMainRoom();

export default function useChatMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const room = networkManager.getMainRoom();
        if (!room) {
            console.warn("Chat hook: no main room connected yet");
            return;
        }

        const handleIncoming = (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        };

        room.onMessage("chat", handleIncoming);

        return () => {
            room.removeAllListeners();
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

        const room = networkManager.getMainRoom();
        if (!room) {
            console.warn("Chat hook: tried to send before room was ready");
            return;
        }

        room.send("chat", message);
        // setMessages((prev) => [...prev, message]);
    };
    return {
        messages,
        sendMessage,
        scrollRef,
    };
}