import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import type { ShopItem } from "@/types/shop-item";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { purchaseItem } from "@/lib/purchases/purchaseItem";
import { usePlayer } from "@/context/playerContext";
import { BaseballHat } from "@/components/svg/baseball-hat";
import { TopHat } from "@/components/svg/top-hat";
import { ColorChange } from "@/components/svg/color-change";
import { Bracelet } from "@/components/svg/bracelet";
import { getHatColorFromId, getHatVariantFromId, isHatItem, getBraceletColorFromId, isBraceletItem } from "@/lib/cosmetics/cosmeticHelpers";

export default function ShopPanel() {
  const [hats, setHats] = useState<ShopItem[]>([]);
  const [colors, setColors] = useState<ShopItem[]>([]);
  const [bracelets, setBracelets] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { playerData } = usePlayer();

  useEffect(() => {
    const hatsRef = collection(db, "items", "accessories", "hats");
    const unsubHats = onSnapshot(
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
      },
      (error) => {
        console.error("Error fetching hats:", error);
      }
    );

    const colorsRef = collection(db, "items", "colors", "bodyColors");
    const unsubColors = onSnapshot(
      colorsRef,
      (snapshot) => {
        const next: ShopItem[] = snapshot.docs.map((doc) => {
          const data = doc.data() as {
            name?: string;
            price?: number;
            description?: string;
            colorHex?: string;
          };

          return {
            id: doc.id,
            name: data.name ?? "Unnamed color",
            price: data.price ?? 0,
            description: data.description ?? "",
          };
        });

        setColors(next);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching colors:", error);
        setLoading(false);
      }
    );

    const braceletsRef = collection(db, "items", "accessories", "bracelets");
    const unsubBracelets = onSnapshot(
      braceletsRef,
      (snapshot) => {
        const next: ShopItem[] = snapshot.docs.map((doc) => {
          const data = doc.data() as {
            name?: string;
            price?: number;
            description?: string;
          };

          return {
            id: doc.id,
            name: data.name ?? "Unnamed bracelet",
            price: data.price ?? 0,
            description: data.description ?? "",
          };
        });

        setBracelets(next);
      },
      (error) => {
        console.error("Error fetching bracelets:", error);
      }
    );

    return () => {
      unsubHats();
      unsubColors();
      unsubBracelets();
    };
  }, []);

  const handleBuy = async (itemId: string, category: 'hat' | 'color' | 'bracelet') => {
    setErrorMsg(null);
    try {
      const result = await purchaseItem(itemId, category);
      if (!result.success) {
        if (result.reason === "insufficient-funds") {
          setErrorMsg("You do not have enough currency to buy this item.");
        } else if (result.reason === "already-owned") {
          setErrorMsg("You already own this item.");
        } else {
          setErrorMsg("Purchase failed. Please try again.");
        }
      } else {
        setErrorMsg(null);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  const renderHatPreview = (itemId: string) => {
    const variant = getHatVariantFromId(itemId);
    const color = getHatColorFromId(itemId);

    switch (variant) {
      case 'tophat':
        return <TopHat hatColor={color} size={70} />;
      case 'baseball':
        return <BaseballHat hatColor={color} size={70} />;
      case 'cowboy':
        return <BaseballHat hatColor={color} size={70} />;
      default:
        return <BaseballHat hatColor={color} size={70} />;
    }
  };

  const renderBraceletPreview = (itemId: string) => {
    const color = getBraceletColorFromId(itemId);
    return <Bracelet braceletColor={color} size={50} />;
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

    const colorName = itemId.toLowerCase().replace('color-', '');
    return colorMap[colorName] || '#00662f';
  };

  const isItemOwned = (itemId: string): boolean => {
    return playerData?.inventory?.some(item => item.itemId === itemId) ?? false;
  };

  const canAfford = (price: number): boolean => {
    return (playerData?.currency ?? 0) >= price;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm opacity-80">
        Loading shop…
      </div>
    );
  }

  const renderShopGrid = (items: ShopItem[], category: 'hat' | 'color' | 'bracelet') => (
    <ScrollArea className="flex-1 w-full pr-2" type="always">
      <div className="px-2 pb-2 grid grid-cols-4 gap-3 auto-rows-fr">
        {items.map((item) => {
          const owned = isItemOwned(item.id);
          const affordable = canAfford(item.price);

          return (
            <div
              key={item.id}
              className={`
                bg-[#1B746C] rounded-lg border-[3px] 
                ${owned ? 'border-[#808080] opacity-50' : 'border-[#0C322E]'}
                flex flex-col items-center justify-between p-2 transition-all
                aspect-square
                ${!owned && 'hover:border-[#27A59B]'}
              `}
            >
              <div className="flex items-center justify-center flex-1 w-full">
                {category === 'hat' && isHatItem(item.id) ? (
                  renderHatPreview(item.id)
                ) : category === 'color' ? (
                  <ColorChange targetColor={getColorHexFromId(item.id)} size={70} />
                ) : category === 'bracelet' && isBraceletItem(item.id) ? (
                  renderBraceletPreview(item.id)
                ) : (
                  <span className="text-xs">{item.name}</span>
                )}
              </div>

              <div className="w-full text-center space-y-1">
                <div className="font-semibold text-xs line-clamp-1">{item.name}</div>

                <div className="flex items-center justify-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <Image
                      src="/shell-currency.svg"
                      width={12}
                      height={12}
                      alt="shell"
                    />
                    <span className={`font-mono text-[10px] ${!affordable && !owned ? 'text-red-400' : ''}`}>
                      {item.price}
                    </span>
                  </div>

                  {owned ? (
                    <Button
                      size="sm"
                      disabled
                      className="text-[10px] h-5 px-1.5 bg-gray-600 cursor-not-allowed"
                    >
                      Own
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!affordable}
                      onClick={() => handleBuy(item.id, category)}
                      className={`text-[10px] h-5 px-1.5 ${!affordable
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-[#27A59B] hover:bg-[#1f8f87]'
                        }`}
                    >
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex flex-col h-full">
      {errorMsg && (
        <div className="mb-2 p-2 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-500/30">
          {errorMsg}
        </div>
      )}

      <Tabs defaultValue="hats" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-[#0C322E] mb-2">
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
          {renderShopGrid(hats, 'hat')}
        </TabsContent>

        <TabsContent value="colors" className="flex-1 mt-0">
          {renderShopGrid(colors, 'color')}
        </TabsContent>

        <TabsContent value="bracelets" className="flex-1 mt-0">
          {renderShopGrid(bracelets, 'bracelet')}
        </TabsContent>
      </Tabs>
    </div>
  );
}