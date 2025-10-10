"use client";

import { withAuth } from "@/components/auth/authReq";
import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";

import dynamic from "next/dynamic";

const PhaserCanvas = dynamic(
    () => import("@/components/phaser/PhaserCanvas"),
    { ssr: false }
);
function PlayPage() {

    const handleSignOut = async () => {
        try {
            await auth.signOut();

        } catch (error) {
            console.error("Error signing out:", error);
        }
    }
    return (
        <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-purple-300">
            <div className="flex flex-col w-full h-full items-center justify-center">


                <div className="w-[960px] h-[540px] bg-black mb-6">
                    {/*This is the phaser canvas window!!*/}
                    <PhaserCanvas width={960} height={540} /> 
                </div>
                <Button onClick={handleSignOut}>Sign Out!</Button>
            </div>

        </div>
    );
}

export default withAuth(PlayPage)