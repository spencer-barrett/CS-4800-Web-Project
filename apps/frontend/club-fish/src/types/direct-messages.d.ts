import { Timestamp } from "firebase/firestore";
export type DirectMessage = {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    createdAt: Timestamp;
};