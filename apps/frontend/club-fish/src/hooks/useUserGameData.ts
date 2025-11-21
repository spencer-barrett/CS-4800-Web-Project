"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/clientApp";
import {
  collection,
  doc,
  onSnapshot,
  onSnapshot as onSnapCollection,
} from "firebase/firestore";
import type { UseUserGameDataResult } from "@/types/user-game-data";
import type { SceneKey } from "@/types/user-game-data";
import { PlayerData } from "@/types/player-data";
import { InventoryItem } from "@/types/inventory-item";

export function useUserGameData(
  onboardingParam?: string | null
): UseUserGameDataResult {
  const [loading, setLoading] = useState(true);
  const [initialScene, setInitialScene] = useState<SceneKey | null>(null);
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
      const inventoryRef = collection(db, "users", user.uid, "inventory");
      const unsubDoc = onSnapshot(
        ref,
        (snap) => {
          const data = snap.data();

          if (!data) return;

          setPlayerData((prev) => ({
            ...prev,
            bodyColor: data.bodyColor ?? "#60cbfcff",
            displayName: data.displayName ?? "anonymous",
            currency: data.currency ?? 0,
            userId: user.uid,
          }));

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

      const unsubInv = onSnapCollection(inventoryRef, (snap) => {
        const items: InventoryItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InventoryItem, "id">),
        }));

        setPlayerData((prev) => ({
          ...(prev ?? {}),
          inventory: items,
        }));
      });

      return () => {
        unsubDoc();
        unsubInv();
      };
    });

    return () => unsub();
  }, [onboardingParam]);

  return { loading, initialScene, playerData, setPlayerData };
}
