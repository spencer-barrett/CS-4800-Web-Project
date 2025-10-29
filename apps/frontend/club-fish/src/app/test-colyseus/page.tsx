"use client";
import ChatWindowOverlay from "@/components/game-ui/ChatWindow";
import { Button } from "@/components/ui/button";
import Connect from "@/lib/colyseus/client";
import { Room } from "colyseus.js";
import { useRef, useState } from "react";

export default function Test() {
    // const roomRef = useRef<Room>(null);

    const [message, setMessage] = useState("");

    // const [ isConnecting, setIsConnecting ] = useState(true);

const buttonHandler = () => {
    Connect();
}



    return (
        <>
        <div className="w-full h-full flex items-center justify-center">
            <ChatWindowOverlay />

<Button onClick={() => buttonHandler()}>Test</Button>
        </div>
        </>
    )
}