"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/clientApp";
import { doc, onSnapshot } from "firebase/firestore";
import type { UseUserGameDataResult } from "@/types/user-game-data";
import type { SceneKey } from "@/types/user-game-data";
import { PlayerData } from "@/types/player-data";


export function useUserGameData(onboardingParam?: string | null): UseUserGameDataResult {
    const [loading, setLoading] = useState(true);
    const [initialScene, setInitialScene] = useState<SceneKey | null>(null);
    // const [bodyColor, setBodyColor] = useState("#60cbfcff");
    // const [displayName, setDisplayName] = useState("anonymous");
    // const [currency, setCurrency] = useState(0);
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user || onboardingParam) {
                setInitialScene("CharacterCreate");
                setLoading(false);
                return;
            }


            // Fetch user document from Firestore to check character status
            const ref = doc(db, "users", user.uid);
            const unsubDoc = onSnapshot(
                ref,
                (snap) => {
                    const data = snap.data();

                    if (!data) return;

                    setPlayerData({
                        bodyColor: data.bodyColor ?? "#60cbfcff",
                        displayName: data.displayName ?? "anonymous",
                        currency: data.currency ?? 0,
                    });

                    const hasCharacter = !!data.hasCharacter;
                    setInitialScene(hasCharacter ? "MainScene" : "CharacterCreate");

                    setLoading(false);
                },
                (error) => {
                    console.error("Failed fetching user data:", error);
                    setInitialScene("CharacterCreate");
                    setLoading(false);
                }
            );

            return () => unsubDoc();
        });



        return () => unsub();
    }, [onboardingParam]);

    return { loading, initialScene, playerData, setPlayerData };
}