import React from "react";
import { Button } from "@/components/ui/button";
import type { ShopItem, SHOP_ITEMS as _ } from "./shopData";
import { SHOP_ITEMS } from "./shopData";

export default function ShopPanel({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div className="mb-4 grid gap-3">
        {SHOP_ITEMS.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between rounded-md border border-white/6 bg-black/60 p-3"
          >
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs opacity-80">{it.description}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono">{it.price}</div>
              <Button size="sm">Buy</Button>
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
