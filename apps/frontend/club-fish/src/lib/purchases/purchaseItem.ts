
import { auth, db } from "@/lib/firebase/clientApp";
import {
    doc,
    collection,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";


export type PurchaseResult =
    | { success: true }
    | { success: false; reason: "not-authenticated" | "not-found" | "insufficient-funds" | "unknown" };

export async function purchaseItem(itemId: string): Promise<PurchaseResult> {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, reason: "not-authenticated" };
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.uid);
            const itemRef = doc(db, "items", "accessories", "hats", itemId);

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
            } | undefined;

            const userCurrency = userData?.currency ?? 0;
            const itemPrice = itemData?.price ?? 0;

            if (userCurrency < itemPrice) {
                throw new Error("insufficient-funds");
            }

            // Deduct item price from user's currency
            transaction.update(userRef, {
                currency: userCurrency - itemPrice,

            });

            const inventoryRef = collection(db, "users", user.uid, "inventory");
            const newItemRef = doc(inventoryRef);
            transaction.set(newItemRef, {
                itemId,
                itemPrice,
                acquiredAt: serverTimestamp(),
            });
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

