import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayer } from "@/context/playerContext";
import Image from "next/image";
import ShopPanel from "./ShopPanel";
type PanelComponentProps = { onClose: () => void };

export default function ShopOverlay({ onClose }: PanelComponentProps) {
  const { playerData } = usePlayer();
  return (
    <div className="w-[420px] rounded-xl border border-white/10 bg-[#0f403c] p-6 text-white backdrop-blur">
      <h2 className="mb-3 text-xl font-bold">Shop Menu</h2>
      <div className="mb-4">
        <div className="flex justify-end">
          <div className="p-2 bg-black/60 rounded-md text-sm font-[800] flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Image src="/shell-currency.svg" width={24} height={24} alt="shell"/>
              </TooltipTrigger>
              <TooltipContent>
                <p>Currency</p>
              </TooltipContent>
            </Tooltip>
            <span>:</span>
            <span>{playerData?.currency}</span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <ShopPanel onClose={onClose} />
      </div>
    </div>
  );
}
