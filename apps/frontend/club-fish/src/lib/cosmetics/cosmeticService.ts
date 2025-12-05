import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/clientApp";
import {
    CosmeticShopItem,
    CosmeticInventoryItem,
} from "@/types/cosmetic-items";
import { InventoryItem } from "@/types/inventory-item";

export function firestoreHatToShopItem(
    docId: string,
    data: any
): CosmeticShopItem {
    const variant = docId.split('-')[0] || 'baseball';
    const colorName = docId.split('-')[1] || 'red';

    const colorMap: Record<string, string> = {
        blue: '#4169E1',
        red: '#DC143C',
        black: '#2C2C2C',
        white: '#F5F5F5',
        green: '#228B22',
        yellow: '#FFD700',
    };

    return {
        id: docId,
        name: data.name,
        price: data.price,
        description: data.description,
        slot: 'hat',
        variant,
        colorHex: colorMap[colorName] || '#FF0000',
        firestorePath: 'items/accessories/hats',
    };
}

// fetch all hats from shop
export async function fetchAllHats(): Promise<CosmeticShopItem[]> {
    try {
        const hatsCollection = collection(db, "items", "accessories", "hats");
        const snapshot = await getDocs(hatsCollection);

        return snapshot.docs.map(doc =>
            firestoreHatToShopItem(doc.id, doc.data())
        );
    } catch (error) {
        console.error("Error fetching hats:", error);
        return [];
    }
}

// fetch player's  inventory
export async function fetchPlayerCosmeticInventory(
    userId: string
): Promise<CosmeticInventoryItem[]> {
    try {
        const inventoryRef = collection(db, "users", userId, "inventory");

        const snapshot = await getDocs(inventoryRef);

        const playerDoc = await getDoc(doc(db, "users", userId));
        const equippedCosmetics = playerDoc.data()?.equippedCosmetics || {};

        console.log("Equipped cosmetics from DB:", equippedCosmetics);

        // filter and map only hat items
        return snapshot.docs
            .filter(doc => {
                const itemId = doc.data().itemId;
                return itemId.includes('baseball') || itemId.includes('hat') || itemId.includes('tophat') || itemId.includes('cowboy');
            })
            .map(doc => {
                const data = doc.data() as InventoryItem;
                const itemId = data.itemId;
                const variant = itemId.split('-')[0];
                const colorName = itemId.split('-')[1];

                const colorMap: Record<string, string> = {
                    blue: '#4169E1',
                    red: '#DC143C',
                    black: '#2C2C2C',
                };

                return {
                    ...data,
                    id: doc.id,
                    slot: 'hat' as const,
                    isEquipped: equippedCosmetics.hat === data.itemId,
                    variant,
                    colorHex: colorMap[colorName] || '#FF0000',
                };
            });
    } catch (error) {
        console.error("Error fetching cosmetic inventory:", error);
        return [];
    }
}

// purchase a cosmetic item
export async function purchaseCosmetic(
    userId: string,
    item: CosmeticShopItem
): Promise<{ success: boolean; error?: string }> {
    try {
        const playerRef = doc(db, "users", userId);
        const playerDoc = await getDoc(playerRef);

        if (!playerDoc.exists()) {
            return { success: false, error: "Player not found" };
        }

        const currentCurrency = playerDoc.data().currency || 0;

        if (currentCurrency < item.price) {
            return { success: false, error: "Insufficient currency" };
        }

        // check if already owned
        const inventoryRef = collection(db, "users", userId, "inventory");
        const q = query(inventoryRef, where("itemId", "==", item.id));
        const existingItems = await getDocs(q);

        if (!existingItems.empty) {
            return { success: false, error: "Already owned" };
        }

        // add to inventory
        await addDoc(inventoryRef, {
            itemId: item.id,
            itemPrice: item.price,
            name: item.name,
            acquiredAt: serverTimestamp(),
        });

        // deduct currency
        await updateDoc(playerRef, {
            currency: currentCurrency - item.price,
        });

        return { success: true };
    } catch (error) {
        console.error("Error purchasing cosmetic:", error);
        return { success: false, error: String(error) };
    }
}

// equip a cosmetic item
export async function equipCosmetic(
    userId: string,
    slot: 'hat' | 'accessory' | 'background' | 'bracelet',
    itemId: string
): Promise<{ success: boolean; error?: string }> {
    try {

        const playerRef = doc(db, "users", userId);

        console.log(`Equipping ${itemId} in slot ${slot} for user ${userId}`);


        const inventoryRef = collection(db, "users", userId, "inventory");
        const q = query(inventoryRef, where("itemId", "==", itemId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error(`Item ${itemId} not found in inventory`);
            return { success: false, error: "Item not owned" };
        }

        await updateDoc(playerRef, {
            [`equippedCosmetics.${slot}`]: itemId,
        });

        console.log(`Successfully equipped ${itemId}`);

        return { success: true };
    } catch (error) {
        console.error("Error equipping cosmetic:", error);
        return { success: false, error: String(error) };
    }
}

// unequip a item
export async function unequipCosmetic(
    userId: string,
    slot: 'hat' | 'accessory' | 'background' | 'bracelet'
): Promise<{ success: boolean; error?: string }> {
    try {
        const playerRef = doc(db, "users", userId);

        await updateDoc(playerRef, {
            [`equippedCosmetics.${slot}`]: null,
        });

        console.log(`Unequipped ${slot}`);

        return { success: true };
    } catch (error) {
        console.error("Error unequipping cosmetic:", error);
        return { success: false, error: String(error) };
    }
}