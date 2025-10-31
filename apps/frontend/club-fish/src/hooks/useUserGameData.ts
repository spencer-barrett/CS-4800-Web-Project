"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import type { UseUserGameDataResult } from "@/types/user-game-data";
import type { SceneKey } from "@/types/user-game-data";


export function useUserGameData(onboardingParam?: string | null): UseUserGameDataResult {
    const [loading, setLoading] = useState(true);
    const [initialScene, setInitialScene] = useState<SceneKey | null>(null);
    const [bodyColor, setBodyColor] = useState("#60cbfcff");
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (onboardingParam) {
                    setInitialScene("CharacterCreate");
                    return;
                }
                if (!user) {
                    setInitialScene("CharacterCreate");
                    return;
                }

                // Fetch user document from Firestore to check character status
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                const hasCharacter = !!snap.data()?.hasCharacter;
                setBodyColor(snap.data()?.bodyColor ?? "#60cbfcff");

                // Route to main scene if character exists, otherwise to character creation
                setInitialScene(hasCharacter ? "MainScene" : "CharacterCreate");
            } catch (e) {
                console.error("onboarding check failed:", e);
                setInitialScene("CharacterCreate");
            }finally{
                setLoading(false);
            }
        });

        return () => unsub();
    }, [onboardingParam]);

    return { loading, initialScene, bodyColor };
}