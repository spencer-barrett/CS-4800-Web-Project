import { db } from "@/lib/firebase/clientApp";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { DirectMessage } from "@/types/direct-messages";


function getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join("_");
}

export async function sendDM(
    senderId: string,
    senderName: string,
    receiverId: string,
    text: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const conversationId = getConversationId(senderId, receiverId);

        await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderId,
            senderName,
            receiverId,
            text,
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending DM:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export function subscribeToDMs(
    userId: string,
    friendId: string,
    callback: (messages: DirectMessage[]) => void
) {
    const conversationId = getConversationId(userId, friendId);
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(q, (snapshot) => {
        const messages: DirectMessage[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as DirectMessage[];

        callback(messages);
    });
}