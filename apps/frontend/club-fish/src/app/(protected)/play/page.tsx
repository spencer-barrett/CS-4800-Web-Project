"use client";

import { withAuth } from "@/components/auth/authReq";
import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";


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

            PLay Page

            <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
    );
}

export default withAuth(PlayPage)