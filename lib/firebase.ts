import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { config } from "./config";

const firebaseConfig = config.firebase;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;