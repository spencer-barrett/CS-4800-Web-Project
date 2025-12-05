"use client";
import { useState } from "react";
import { CharacterForward } from "../../svg/char-forward";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { db, auth } from "@/lib/firebase/clientApp";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";


export default function CharacterCreateOverlay({ game }: { game: Phaser.Game | null }) {
    const [bodyColor, setBodyColor] = useState("#fcb360ff");
    const router = useRouter();

    const updateColor = async () => {
        if (!auth.currentUser) return;
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            console.log("here")
            await updateDoc(userRef, { "bodyColor": bodyColor, hasCharacter: true });
            router.replace("/play");
        } catch (e) {
            console.error("Failed to update color", e);
        }
    }

    return (
        <div className="absolute inset-0 grid place-items-center">
            <Card className="w-[45%] h-[90%] bg-white text-black flex flex-col" style={{ pointerEvents: "auto" }}>
                <CardHeader>
                    <CardTitle>Create Your Fish!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col w-full grow">
                    <div className="flex flex-col bg-[#d6d6d6] grow items-center justify-center w-full">
                        <CharacterForward bodyColor={bodyColor} size={300}/>

                    </div>
                    <div className="mt-4 flex flex-col">
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <Button onClick={() => setBodyColor("#fcb360ff")}>Orange</Button>
                            <Button onClick={() => setBodyColor("#60cbfcff")}>Blue</Button>
                            <Button onClick={() => setBodyColor("#60fc75ff")}>Green</Button>
                            <Button onClick={() => setBodyColor("#FBEC5D")}>Yellow</Button>
                        </div>
                        <div className="flex w-full items-center justify-center">
                            <Button className="w-[25%]" onClick={() => updateColor()}>Submit</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}