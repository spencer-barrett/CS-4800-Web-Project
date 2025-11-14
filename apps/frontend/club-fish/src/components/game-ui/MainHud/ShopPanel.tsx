import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ShopItem } from "@/types/shop-item";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { purchaseItem } from "@/lib/purchases/purchaseItem";

type ShopPanelProps = {
  onClose: () => void;
  currency?: number;
};

export default function ShopPanel({ onClose, currency }: ShopPanelProps) {
  const [hats, setHats] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const hatsRef = collection(db, "items", "accessories", "hats");

    const unsub = onSnapshot(
      hatsRef,
      (snapshot) => {
        const next: ShopItem[] = snapshot.docs.map((doc) => {
          const data = doc.data() as {
            name?: string;
            price?: number;
            description?: string;
          };

          return {
            id: doc.id,
            name: data.name ?? "Unnamed item",
            price: data.price ?? 0,
            description: data.description ?? "",
          };
        });

        setHats(next);
        setLoading(false);
        console.log("Fetched hats from Firestore:", next);
      },
      (error) => {
        console.error("Error fetching hats:", error);
        setLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, []);



  const handleBuy = async (itemId: string) => {
    setErrorMsg(null);
    try {
      const result = await purchaseItem(itemId);
      if (!result.success) {
        if (result.reason === "insufficient-funds") {
          setErrorMsg("You do not have enough currency to buy this item.");
        } else {
          setErrorMsg("Purchase failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  }



  if (loading) {
    return (
      <div className="text-sm opacity-80">
        Loading shop…
      </div>
    );
  }



  return (
    <div>
      {errorMsg && (
        <div className="mb-2 text-xs text-red-500">{errorMsg}</div>
      )}
      <div className="mb-4 grid gap-3">
        {hats.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between rounded-md border border-white/6 bg-black/60 p-3"
          >
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs opacity-80">{it.description}</div>
            </div>
            <div className="flex items-center gap-3">
              {(currency ?? 0) < it.price ? (
                <>
                  <div className="font-mono text-red-500">{it.price}</div>
                  <Button size="sm" disabled>Buy</Button>
                </>
              ) : (
                <>
                  <div className="font-mono">{it.price}</div>
                  <Button size="sm" onClick={() => handleBuy(it.id)}>Buy</Button>
                </>

              )}


            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
