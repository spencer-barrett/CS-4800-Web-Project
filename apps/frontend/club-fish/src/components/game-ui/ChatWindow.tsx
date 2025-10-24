"use client";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { FieldSet, FieldGroup, Field } from "../ui/field";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { auth, db } from "@/lib/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "@/types/user-profile";


type ChatMessage = {
    text: string;
    sender: string;
};

export default function ChatWindowOverlay() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!message.trim()) return;
        if (!auth.currentUser) return;
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const profile = snap.data() as UserProfile | undefined;

        const sender = profile?.displayName ?? "Anonymous";

        setMessages((prev) => [...prev, { text: message, sender }]);
        setMessage("");
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <div className="w-[450px] h-[220px] bg-white/90 rounded-xl absolute bottom-3 left-3 flex flex-col shadow-lg" style={{ pointerEvents: "auto" }}>

            <div className="flex-grow overflow-hidden p-2">
                <ScrollArea className="h-full w-full">
                    <div
                        ref={scrollRef}
                        className="flex flex-col gap-1 text-black overflow-y-auto max-h-[160px]"
                    >
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className="rounded bg-gray-100 px-2 py-1 w-fit max-w-[90%]"
                            >
                                <span className="font-semibold mr-2">{m.sender}:</span>
                                {m.text}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>


            <form
                onSubmit={handleMessage}
                className="flex items-center justify-center w-full pb-2 px-2 gap-2"
            >
                <FieldSet className="w-full">
                    <FieldGroup>
                        <Field>
                            <Input
                                id="chat-box"
                                type="text"
                                required
                                placeholder="type message here"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="text-black"
                                autoComplete="off"
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
}
