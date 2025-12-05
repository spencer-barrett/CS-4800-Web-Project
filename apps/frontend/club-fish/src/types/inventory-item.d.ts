export type InventoryItem = {
  id: string;
  itemId: string;
  name: string;
  itemPrice?: number;
  acquiredAt?: any; 
  category?: 'hat' | 'color' | 'bracelet';
  colorHex?: string; 
};