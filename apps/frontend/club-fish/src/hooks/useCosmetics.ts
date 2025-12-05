import { useState, useEffect } from 'react';
import { usePlayer } from '@/context/playerContext';
import {
  fetchPlayerCosmeticInventory,
  equipCosmetic,
  unequipCosmetic,
} from '@/lib/cosmetics/cosmeticService';
import { networkManager } from '@/lib/colyseus/networkController';
import { CosmeticInventoryItem } from '@/types/cosmetic-items';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';

export function useCosmetics() {
  const { playerData, refreshPlayerData } = usePlayer();
  const [inventory, setInventory] = useState<CosmeticInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerData?.userId) return;

    const loadInventory = async () => {
      setLoading(true);
      const items = await fetchPlayerCosmeticInventory(playerData.userId!);
      setInventory(items);
      setLoading(false);
    };

    loadInventory();
  }, [playerData?.userId]);

  const equipItem = async (slot: 'hat' | 'accessory' | 'background' | 'bodyColor' | 'bracelet', itemId: string) => {
    if (!playerData?.userId) return { success: false, error: 'No user ID' };

    if (slot === 'bodyColor') {
      try {
        const userRef = doc(db, "users", playerData.userId);
        await updateDoc(userRef, {
          bodyColor: itemId, // itemId is the hex color
        });

        networkManager.sendColorChange(itemId);

        await refreshPlayerData?.();

        return { success: true };
      } catch (error) {
        console.error("Error equipping body color:", error);
        return { success: false, error: String(error) };
      }
    }

    const result = await equipCosmetic(playerData.userId, slot, itemId);
    
    if (result.success) {
      setInventory(prev => prev.map(item => ({
        ...item,
        isEquipped: item.slot === slot ? item.itemId === itemId : item.isEquipped,
      })));

      networkManager.equipCosmeticInRoom(slot, itemId);

      await refreshPlayerData?.();
    }

    return result;
  };

  const unequipItem = async (slot: 'hat' | 'accessory' | 'background' | 'bodyColor' | 'bracelet') => {
    if (!playerData?.userId) return { success: false, error: 'No user ID' };

    // don't allow unequipping body color
    if (slot === 'bodyColor') {
      console.log("Cannot unequip body color");
      return { success: false, error: "Cannot unequip body color" };
    }

    const result = await unequipCosmetic(playerData.userId, slot);
    
    if (result.success) {
      setInventory(prev => prev.map(item => ({
        ...item,
        isEquipped: item.slot === slot ? false : item.isEquipped,
      })));

      networkManager.unequipCosmeticInRoom(slot);

      await refreshPlayerData?.();
    }

    return result;
  };

  const getEquippedItem = (slot: 'hat' | 'accessory' | 'background' | 'bodyColor' | 'bracelet') => {
    if (slot === 'bodyColor') {
      return playerData?.bodyColor || "";
    }
    return inventory.find(item => item.slot === slot && item.isEquipped);
  };

  return {
    inventory,
    loading,
    equipItem,
    unequipItem,
    getEquippedItem,
    equippedCosmetics: playerData?.equippedCosmetics,
  };
}