import { CharacterForward } from "@/components/svg/char-forward";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayer } from "@/context/playerContext";
import Image from "next/image";
import { BaseballHat } from "@/components/svg/baseball-hat";
import { TopHat } from "@/components/svg/top-hat";
import { ColorChange } from "@/components/svg/color-change";
import { Bracelet } from "@/components/svg/bracelet";
import { getHatColorFromId, getHatVariantFromId, isHatItem, getBraceletColorFromId, isBraceletItem } from "@/lib/cosmetics/cosmeticHelpers";
import { useCosmetics } from "@/hooks/useCosmetics";

type PanelComponentProps = { onClose: () => void; fromPlayerClick?: boolean };

export default function ProfileOverlay({
  onClose,
  fromPlayerClick,
}: PanelComponentProps) {
  const { playerData } = usePlayer();
  const { equipItem, unequipItem, getEquippedItem } = useCosmetics();

  const handleHatClick = async (itemId: string) => {
    if (playerData?.equippedCosmetics?.hat === itemId) {
      await unequipItem('hat');
    } else {
      await equipItem('hat', itemId);
    }
  };

  const handleColorClick = async (colorHex: string) => {
    // equip the body color
    await equipItem('bodyColor', colorHex);
  };

  const handleBraceletClick = async (itemId: string) => {
    if (playerData?.equippedCosmetics?.bracelet === itemId) {
      await unequipItem('bracelet');
    } else {
      await equipItem('bracelet', itemId);
    }
  };

  const renderHatPreview = (itemId: string, size: number = 60) => {
    const variant = getHatVariantFromId(itemId);
    const color = getHatColorFromId(itemId);

    switch (variant) {
      case 'tophat':
        return <TopHat hatColor={color} size={size} />;
      case 'baseball':
        return <BaseballHat hatColor={color} size={size} />;
      case 'cowboy':
        // TODO: Add cowboy hat 
        return <BaseballHat hatColor={color} size={size} />;
      default:
        return <BaseballHat hatColor={color} size={size} />;
    }
  };

  const renderBraceletPreview = (itemId: string, size: number = 45) => {
    const color = getBraceletColorFromId(itemId);
    return <Bracelet braceletColor={color} size={size} />;
  };

  const getColorHexFromId = (itemId: string): string => {
    const colorMap: Record<string, string> = {
      orange: '#fcb360ff',
      blue: '#60cbfcff',
      green: '#60fc75ff',
      yellow: '#FBEC5D',
      red: '#ff3650',
      purple: '#9370DB',
      pink: '#FFB6C1',
    };

    const colorName = itemId.toLowerCase()
      .replace('colors-', '')
      .replace('color-', '');

    return colorMap[colorName] || '#00662f';
  };

  // filter inventory by category
  const hatItems = playerData?.inventory?.filter(item => isHatItem(item.itemId)) || [];
  const colorItems = playerData?.inventory?.filter(item => item.category === 'color') || [];
  const braceletItems = playerData?.inventory?.filter(item => isBraceletItem(item.itemId)) || [];

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

              <div className="flex flex-1 w-full rounded-xl items-center justify-center bg-gradient-to-b from-[#1B746C] to-[#17645C] relative">
                <CharacterForward
                  bodyColor={playerData?.bodyColor}
                  size={175}
                />
                {playerData?.equippedCosmetics?.hat && (
                  <div className="absolute" style={{ top: '-3%', left: '50.5%', transform: 'translateX(-50%)' }}>
                    {renderHatPreview(playerData.equippedCosmetics.hat, 100)}
                  </div>
                )}
                {playerData?.equippedCosmetics?.bracelet && (
                  <div className="absolute" style={{ top: '52%', left: '72%' }}>
                    {renderBraceletPreview(playerData.equippedCosmetics.bracelet, 25)}
                  </div>
                )}
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

              <Tabs defaultValue="hats" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-[#0C322E] mb-2 shrink-0">
                  <TabsTrigger value="hats" className="data-[state=active]:bg-[#27A59B]">
                    Hats
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="data-[state=active]:bg-[#27A59B]">
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="bracelets" className="data-[state=active]:bg-[#27A59B]">
                    Bracelets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hats" className="flex-1 mt-0">
                  <ScrollArea className="h-full w-full pr-2" type="always">
                    <div className="px-2 pb-2 grid grid-cols-3 gap-2 auto-rows-fr">
                      {hatItems.length > 0 ? (
                        hatItems.map((i) => {
                          const isEquipped = playerData?.equippedCosmetics?.hat === i.itemId;

                          return (
                            <div
                              key={i.id}
                              className={`bg-[#1B746C] rounded-sm border-[3px] ${isEquipped ? 'border-[#27A59B]' : 'border-[#0C322E]'
                                } flex items-center justify-center text-xs text-center px-1 py-2 aspect-square overflow-hidden cursor-pointer hover:border-[#27A59B] transition-colors`}
                              onClick={() => handleHatClick(i.itemId)}
                            >
                              {renderHatPreview(i.itemId)}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-center text-sm opacity-70 py-4">
                          No hats yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="colors" className="flex-1 mt-0">
                  <ScrollArea className="h-full w-full pr-2" type="always">
                    <div className="px-2 pb-2 grid grid-cols-3 gap-2 auto-rows-fr">
                      {colorItems.length > 0 ? (
                        colorItems.map((i) => {
                          const colorHex = getColorHexFromId(i.itemId);
                          const isEquipped = playerData?.bodyColor === colorHex;

                          return (
                            <div
                              key={i.id}
                              className={`bg-[#1B746C] rounded-sm border-[3px] ${isEquipped ? 'border-[#27A59B]' : 'border-[#0C322E]'
                                } flex items-center justify-center text-xs text-center px-1 py-2 aspect-square overflow-hidden cursor-pointer hover:border-[#27A59B] transition-colors`}
                              onClick={() => handleColorClick(colorHex)}
                            >
                              <ColorChange targetColor={colorHex} size={60} />
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-center text-sm opacity-70 py-4">
                          No colors yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="bracelets" className="flex-1 mt-0">
                  <ScrollArea className="h-full w-full pr-2" type="always">
                    <div className="px-2 pb-2 grid grid-cols-3 gap-2 auto-rows-fr">
                      {braceletItems.length > 0 ? (
                        braceletItems.map((i) => {
                          const isEquipped = playerData?.equippedCosmetics?.bracelet === i.itemId;

                          return (
                            <div
                              key={i.id}
                              className={`bg-[#1B746C] rounded-sm border-[3px] ${isEquipped ? 'border-[#27A59B]' : 'border-[#0C322E]'
                                } flex items-center justify-center text-xs text-center px-1 py-2 aspect-square overflow-hidden cursor-pointer hover:border-[#27A59B] transition-colors`}
                              onClick={() => handleBraceletClick(i.itemId)}
                            >
                              {renderBraceletPreview(i.itemId)}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-center text-sm opacity-70 py-4">
                          No bracelets yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="flex w-full items-center justify-center py-2 shrink-0">
                <div className="flex gap-2 bg-[#0C322E] p-3 !rounded-4xl hud-frame">
                  <div className="w-full">
                    Items in inventory : {playerData?.inventory?.length || 0}
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