import { CharacterForward } from "@/components/svg/char-forward";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/context/playerContext";
import Image from "next/image";

type PanelComponentProps = { onClose: () => void; fromPlayerClick?: boolean };

export default function ProfileOverlay({
  onClose,
  fromPlayerClick,
}: PanelComponentProps) {
  const { playerData } = usePlayer();

  const Wrapper = fromPlayerClick
    ? ({ children }: any) => (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ pointerEvents: "auto" }}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      )
    : ({ children }: any) => <>{children}</>;

  return (
    <Wrapper>
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
          <div className="flex shrink-0">
            <Button
              className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs overflow-hidden"
              onClick={onClose}
            >
              X
            </Button>
          </div>

          <div className="flex grow gap-4 min-h-0">
            <div
              className="flex flex-col w-1/2 min-h-0"
              style={{ pointerEvents: "auto" }}
            >
              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <h2 className="font-[800]">{playerData?.displayName}</h2>
              </div>

              <div className="flex flex-1 w-full rounded-xl items-center justify-center bg-gradient-to-b from-[#1B746C] to-[#17645C]">
                <CharacterForward
                  bodyColor={playerData?.bodyColor}
                  size={175}
                />
              </div>

              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <div className="flex gap-2 bg-[#0C322E] p-3 !rounded-4xl hud-frame">
                  <Image
                    src="/shell-currency.svg"
                    width={24}
                    height={24}
                    alt="shell"
                  />
                  <div className="w-full">
                    Your shells : {playerData?.currency}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col w-1/2 min-h-0"
              style={{ pointerEvents: "auto" }}
            >
              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <h2 className="font-[800]">Inventory</h2>
              </div>
              <ScrollArea className="flex-1 w-full pr-2" type="always">
                <div className="px-2 pb-2 grid grid-cols-3 gap-2 auto-rows-fr">
                  {playerData?.inventory && playerData.inventory.length > 0 ? (
                    playerData.inventory.map((i) => (
                      <div
                        key={i.id}
                        className="bg-[#1B746C] rounded-sm border-[3px] border-[#0C322E] flex items-center justify-center text-xs text-center px-1 py-2 aspect-square"
                      >
                        {i.itemId}
                      </div>
                    ))
                  ) : (
                    <>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <div
                          key={n}
                          className="bg-[#1B746C] rounded-sm border-[3px] border-[#0C322E] flex items-center justify-center text-xs text-center px-1 py-2 aspect-square overflow-hidden"
                        ></div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <div className="flex gap-2 bg-[#0C322E] p-3 !rounded-4xl hud-frame">
                  <div className="w-full">
                    Items in inventory : {playerData?.inventory?.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
