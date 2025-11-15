import { InventoryItem } from "./inventory-item";

export type PlayerData = {
    bodyColor?: string;
    displayName?: string;
    currency?: number;
    inventory?: InventoryItem[];
    sessionId: string;
}