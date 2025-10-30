"use client";
import ChatWindowOverlay from "@/components/game-ui/ChatWindow";
import { Button } from "@/components/ui/button";
import { FieldSet, FieldGroup, Field } from "@/components/ui/field";
import Connect from "@/lib/colyseus/client";
import { ChatMessage } from "@/types/chat-message";
import { Room } from "colyseus.js";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export default function Test() {
  const [message, setMessage] = useState("");
  const msg = useRef(message);
  const [room, setRoom] = useState<Room<ChatMessage> | null>(null);

  const joinHandler = async () => {
    const joinedRoom = await Connect<ChatMessage>();
    joinedRoom.onMessage("chat", (data: ChatMessage) => {
      console.log("received chat:", data.text, "from", data.sender);
    });
    setRoom(joinedRoom);
  };

  const messageHandler = () => {
    if (!room) return console.warn("Not connected yet");
    const payload: ChatMessage = { text: message };
    room.send("chat", payload);
    setMessage("");
  };

  return (
    <>
      <section className="w-full h-full flex items-center justify-center bg-blue-400">
        <div className="flex flex-col w-full h-full items-center justify-center gap-6">
          <div className="w-full flex justify-center">
            <Button onClick={() => joinHandler()}>Join</Button>
          </div>
          <div className="w-full flex justify-center gap-6">
            <FieldSet className="w-[25%]">
              <FieldGroup>
                <Field>
                  <Input
                    id="chat-box"
                    type="text"
                    required
                    placeholder="type message here"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className=""
                    autoComplete="off"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Button onClick={() => messageHandler()}>Send</Button>
          </div>
        </div>
      </section>
    </>
  );
}
