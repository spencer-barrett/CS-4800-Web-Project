"use client";
import { ScrollArea } from "@/components/ui/scroll-area";

import ChatInput from "./ChatInput";
import  MessageBubble  from "./MessageBubble";
import  useChatMessages  from "@/hooks/useChatMessages";

export function ChatWindow() {
  const { messages, sendMessage, scrollRef } = useChatMessages();

  return (
    <div className="w-[450px] h-[220px] bg-white/90 rounded-xl absolute bottom-3 left-3 flex flex-col shadow-lg"
    style={{ pointerEvents: "auto" }}>
      <div className="flex-grow overflow-hidden p-2">
        <ScrollArea className="h-full w-full">
          <div
            ref={scrollRef}
            className="flex flex-col gap-1 text-black overflow-y-auto max-h-[160px]"
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} sender={m.sender ?? ""} text={m.text ?? ""} />
            ))}
          </div>
        </ScrollArea>
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
