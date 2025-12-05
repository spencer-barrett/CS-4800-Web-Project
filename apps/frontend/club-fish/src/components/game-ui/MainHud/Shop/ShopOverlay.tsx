import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/playerContext";
import Image from "next/image";
import ShopPanel from "./ShopPanel";

type PanelComponentProps = { onClose: () => void };

export default function ShopOverlay({ onClose }: PanelComponentProps) {
  const { playerData } = usePlayer();

  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ pointerEvents: "auto" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-[50%] h-[65%]
          hud-frame
          !rounded-3xl
          bg-[#0f403c]
          p-4 text-white backdrop-blur
          overflow-hidden
        "
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex w-full h-full flex-col">
          <div className="flex shrink-0 justify-between items-center mb-2">
            <h2 className="text-xl font-[800]">Shop</h2>
            <Button
              className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs overflow-hidden"
              onClick={onClose}
            >
              X
            </Button>
          </div>

          <div className="flex justify-center py-2 shrink-0">
            <div className="flex gap-2 bg-[#0C322E] p-3 !rounded-4xl hud-frame">
              <Image
                src="/shell-currency.svg"
                width={24}
                height={24}
                alt="shell"
              />
              <div className="w-full">
                Your shells: {playerData?.currency ?? 0}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ShopPanel />
          </div>
        </div>
      </div>
    </div>
  );
}