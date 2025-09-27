import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK configuration
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

// Initialize Firebase Admin
const app =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export const admin = {
  auth: () => getAuth(app),
};

export default app;
