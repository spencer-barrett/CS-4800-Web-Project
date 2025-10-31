import { auth, db } from "@/lib/firebase/clientApp";
import { ChatMessage } from "@/types/chat-message";
import { UserProfile } from "@/types/user-profile";
import { getDoc, doc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";


export default function useChatMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

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

        setMessages((prev) => [...prev, { text, sender }]);
    };

    return {
        messages,
        sendMessage,
        scrollRef,
    };
}