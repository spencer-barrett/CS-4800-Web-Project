import "server-only";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");


  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });


export const db = getFirestore();    
export const adminApp = admin.app();
