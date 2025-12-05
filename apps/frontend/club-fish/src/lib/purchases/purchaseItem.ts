import { auth, db } from "@/lib/firebase/clientApp";
import {
    doc,
    collection,
    runTransaction,
    serverTimestamp,
    query,
    where,
    getDocs,
} from "firebase/firestore";


export type PurchaseResult =
    | { success: true }
    | { success: false; reason: "not-authenticated" | "not-found" | "insufficient-funds" | "unknown" | "already-owned" };

export async function addCurrency(amount: number): Promise<PurchaseResult> {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, reason: "not-authenticated" };
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.uid);

            const userDoc = await transaction.get(userRef);


            const userData = userDoc.data() as {
                currency: number;
            } | undefined;

            const userCurrency = userData?.currency ?? 0;

            // add the reward currency
            transaction.update(userRef, {
                currency: userCurrency + amount,

            });
        });

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {

        }
        console.error("adding currency failed:", error);
        return { success: false, reason: "unknown" };
    }

}

export async function purchaseItem(
    itemId: string,
    category: 'hat' | 'bracelet' | 'color' = 'hat'
): Promise<PurchaseResult> {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, reason: "not-authenticated" };
    }

    try {
        // Check if already owned 
        const inventoryRef = collection(db, "users", user.uid, "inventory");
        const q = query(inventoryRef, where("itemId", "==", itemId));
        const existingItems = await getDocs(q);

        if (!existingItems.empty) {
            return { success: false, reason: "already-owned" };
        }

        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.uid);

            let itemRef;
            if (category === 'hat') {
                itemRef = doc(db, "items", "accessories", "hats", itemId);
            } else if (category === 'color') {
                itemRef = doc(db, "items", "colors", "bodyColors", itemId);
            } else if (category === 'bracelet') {
                itemRef = doc(db, "items", "accessories", "bracelets", itemId);
            } else {
                throw new Error("invalid-category");
            }

            const userDoc = await transaction.get(userRef);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists()) {
                throw new Error("item-not-found");
            }

            const userData = userDoc.data() as {
                currency: number;
            } | undefined;

            const itemData = itemDoc.data() as {
                price: number;
                name: string;
                colorHex?: string;
            };

            const userCurrency = userData?.currency ?? 0;
            const itemPrice = itemData?.price ?? 0;

            if (userCurrency < itemPrice) {
                throw new Error("insufficient-funds");
            }

            transaction.update(userRef, {
                currency: userCurrency - itemPrice,
            });

            const newItemRef = doc(inventoryRef);
            const inventoryItem: any = {
                itemId,
                itemPrice,
                name: itemData.name,
                category,
                acquiredAt: serverTimestamp(),
            };

            if (category === 'color' && itemData.colorHex) {
                inventoryItem.colorHex = itemData.colorHex;
            }

            transaction.set(newItemRef, inventoryItem);
        });

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "item-not-found") {
                return { success: false, reason: "not-found" };
            } else if (error.message === "insufficient-funds") {
                return { success: false, reason: "insufficient-funds" };
            }
        }
        console.error("Transaction failed:", error);
        return { success: false, reason: "unknown" };
    }
}