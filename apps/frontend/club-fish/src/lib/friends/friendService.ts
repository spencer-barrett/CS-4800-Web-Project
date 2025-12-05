import { db } from "@/lib/firebase/clientApp";
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    collection,
    onSnapshot,
    serverTimestamp,
    getDocs,
} from "firebase/firestore";

export async function sendFriendRequest(
    fromUserId: string,
    fromDisplayName: string,
    toUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (fromUserId === toUserId) {
            return { success: false, error: "Cannot send request to yourself" };
        }

        const friendDoc = await getDoc(
            doc(db, "users", fromUserId, "friends", toUserId)
        );
        if (friendDoc.exists()) {
            return { success: false, error: "Already friends" };
        }

        const existingRequest = await getDoc(
            doc(db, "users", toUserId, "friendRequests", fromUserId)
        );
        if (existingRequest.exists()) {
            return { success: false, error: "Request already sent" };
        }

        const incomingRequest = await getDoc(
            doc(db, "users", fromUserId, "friendRequests", toUserId)
        );
        if (incomingRequest.exists()) {
            return await acceptFriendRequest(fromUserId, toUserId);
        }

        await setDoc(doc(db, "users", toUserId, "friendRequests", fromUserId), {
            fromUserId,
            displayName: fromDisplayName,
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending friend request:", error);
        return { success: false, error: "Failed to send request" };
    }
}

export async function acceptFriendRequest(
    currentUserId: string,
    fromUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const requestDoc = await getDoc(
            doc(db, "users", currentUserId, "friendRequests", fromUserId)
        );

        if (!requestDoc.exists()) {
            return { success: false, error: "Request not found" };
        }

        const requestData = requestDoc.data();

        const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
        const currentUserData = currentUserDoc.data();

        await setDoc(doc(db, "users", currentUserId, "friends", fromUserId), {
            displayName: requestData.displayName,
            createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, "users", fromUserId, "friends", currentUserId), {
            displayName: currentUserData?.displayName || "Unknown",
            createdAt: serverTimestamp(),
        });

        await deleteDoc(
            doc(db, "users", currentUserId, "friendRequests", fromUserId)
        );

        return { success: true };
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return { success: false, error: "Failed to accept request" };
    }
}

export async function removeFriend(
    currentUserId: string,
    friendUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, "users", currentUserId, "friends", friendUserId));
        await deleteDoc(doc(db, "users", friendUserId, "friends", currentUserId));

        return { success: true };
    } catch (error) {
        console.error("Error removing friend:", error);
        return { success: false, error: "Failed to remove friend" };
    }
}

export async function getFriends(userId: string) {
    const friendsRef = collection(db, "users", userId, "friends");
    const snapshot = await getDocs(friendsRef);

    const friends = await Promise.all(
        snapshot.docs.map(async (friendDoc) => {
            const friendUserId = friendDoc.id;
            const friendData = friendDoc.data();
            
            let displayName = friendData.displayName;
            let bodyColor = "#60cbfcff";
            
            if (!displayName) {
                const userDoc = await getDoc(doc(db, "users", friendUserId));
                const userData = userDoc.data();
                displayName = userData?.displayName || "Unknown";
                bodyColor = userData?.bodyColor || "#60cbfcff";
            } else {
                const userDoc = await getDoc(doc(db, "users", friendUserId));
                const userData = userDoc.data();
                bodyColor = userData?.bodyColor || "#60cbfcff";
            }

            return {
                userId: friendUserId,
                displayName,
                bodyColor,
                createdAt: friendData.createdAt,
            };
        })
    );

    return friends;
}

export async function getFriendRequests(userId: string) {
    const requestsRef = collection(db, "users", userId, "friendRequests");
    const snapshot = await getDocs(requestsRef);

    const requests = await Promise.all(
        snapshot.docs.map(async (requestDoc) => {
            const fromUserId = requestDoc.id;
            const requestData = requestDoc.data();
            
            let displayName = requestData.displayName;
            let bodyColor = "#60cbfcff";
            
            if (!displayName) {
                const userDoc = await getDoc(doc(db, "users", fromUserId));
                const userData = userDoc.data();
                displayName = userData?.displayName || "Unknown";
                bodyColor = userData?.bodyColor || "#60cbfcff";
            } else {
                const userDoc = await getDoc(doc(db, "users", fromUserId));
                const userData = userDoc.data();
                bodyColor = userData?.bodyColor || "#60cbfcff";
            }

            return {
                userId: fromUserId,
                displayName,
                bodyColor,
                createdAt: requestData.createdAt,
            };
        })
    );

    return requests;
}

export function subscribeFriends(
    userId: string,
    callback: (friends: any[]) => void
) {
    const friendsRef = collection(db, "users", userId, "friends");

    return onSnapshot(friendsRef, async (snapshot) => {
        const friends = await Promise.all(
            snapshot.docs.map(async (friendDoc) => {
                const friendUserId = friendDoc.id;
                const friendData = friendDoc.data();
                
                const userDoc = await getDoc(doc(db, "users", friendUserId));
                const userData = userDoc.data();

                return {
                    userId: friendUserId,
                    displayName: friendData.displayName || userData?.displayName || "Unknown",
                    bodyColor: userData?.bodyColor || "#60cbfcff",
                    createdAt: friendData.createdAt,
                };
            })
        );
        callback(friends);
    });
}

export function subscribeFriendRequests(
    userId: string,
    callback: (requests: any[]) => void
) {
    const requestsRef = collection(db, "users", userId, "friendRequests");

    return onSnapshot(requestsRef, async (snapshot) => {
        const requests = await Promise.all(
            snapshot.docs.map(async (requestDoc) => {
                const fromUserId = requestDoc.id;
                const requestData = requestDoc.data();
                
                const userDoc = await getDoc(doc(db, "users", fromUserId));
                const userData = userDoc.data();

                return {
                    userId: fromUserId,
                    displayName: requestData.displayName || userData?.displayName || "Unknown",
                    bodyColor: userData?.bodyColor || "#60cbfcff",
                    createdAt: requestData.createdAt,
                };
            })
        );
        callback(requests);
    });
}

export async function declineFriendRequest(
    currentUserId: string,
    fromUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(
            doc(db, "users", currentUserId, "friendRequests", fromUserId)
        );
        return { success: true };
    } catch (error) {
        console.error("Error declining friend request:", error);
        return { success: false, error: "Failed to decline request" };
    }
}

export async function checkFriendship(
    userId1: string,
    userId2: string
): Promise<boolean> {
    const friendDoc = await getDoc(doc(db, "users", userId1, "friends", userId2));
    return friendDoc.exists();
}

export async function checkPendingRequest(
    fromUserId: string,
    toUserId: string
): Promise<boolean> {
    const requestDoc = await getDoc(
        doc(db, "users", toUserId, "friendRequests", fromUserId)
    );
    return requestDoc.exists();
}