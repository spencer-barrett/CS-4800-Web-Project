import { ShopItem } from './shop-item';
import { InventoryItem } from './inventory-item';

export type CosmeticSlot = 'hat' | 'accessory' | 'background';

export interface CosmeticShopItem extends ShopItem {
    slot: CosmeticSlot;
    variant?: string;
    colorHex?: string;
    firestorePath: string;
}

export interface CosmeticInventoryItem extends InventoryItem {
    slot: CosmeticSlot;
    isEquipped: boolean;
    variant?: string;
    colorHex?: string;
}

export interface EquippedCosmetics {
    hat?: string;
    bracelet?: string;
    accessory?: string;
    background?: string;
}