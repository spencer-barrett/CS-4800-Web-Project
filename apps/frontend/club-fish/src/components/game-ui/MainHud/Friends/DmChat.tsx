"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/context/playerContext";
import { CharacterForward } from "@/components/svg/char-forward";
import { X, Send } from "lucide-react";
import {
    sendDM,
    subscribeToDMs,
} from "@/lib/friends/dmService";
import { Friend } from "@/types/friends-data";
import { DirectMessage } from "@/types/direct-messages";

type DMChatProps = {
    friend: Friend;
    onClose: () => void;
};

export default function DMChat({ friend, onClose }: DMChatProps) {
    const { playerData } = usePlayer();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!playerData?.userId) return;

        const unsub = subscribeToDMs(playerData.userId, friend.userId, (msgs) => {
            setMessages(msgs);
        });

        return () => unsub();
    }, [playerData?.userId, friend.userId]);

    useEffect(() => {
        
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !playerData?.userId || sending) return;

        setSending(true);
        const result = await sendDM(
            playerData.userId,
            playerData.displayName || "Unknown",
            friend.userId,
            newMessage.trim()
        );

        if (result.success) {
            setNewMessage("");
        } else {
            console.error(result.error);
        }
        setSending(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-[350px] h-[500px] rounded-xl border border-white/10 bg-[#0f403c] p-4 text-white backdrop-blur hud-frame flex flex-col">

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="w-10 h-10 flex items-center justify-center">
                    <CharacterForward bodyColor={friend.bodyColor} size={40} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{friend.displayName}</p>
                </div>
                <Button
                    onClick={onClose}
                    className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2"
                >
                    <X size={16} />
                </Button>
            </div>

            <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                <div className="space-y-3 pr-2">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-white/60 text-sm">No messages yet. Say hi!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${
                                    msg.senderId === playerData?.userId
                                        ? "items-end"
                                        : "items-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                                        msg.senderId === playerData?.userId
                                            ? "bg-[#27A59B]"
                                            : "bg-[#0c2d30]"
                                    }`}
                                >
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>
                                <span className="text-xs text-white/40 mt-1">
                                    {msg.createdAt?.toDate?.()?.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }) || ""}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#0c2d30] border-none text-white placeholder:text-white/40"
                />
                <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="bg-[#27A59B] hover:bg-[#2ab8ad] px-3"
                >
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
}