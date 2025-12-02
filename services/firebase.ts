
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// NOTE: In a real deployment, these values come from process.env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let app: any;
let db: any;
let storage: any;
let auth: any;

try {
    // CRASH PREVENTION: Check if keys exist before initializing
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "demo-key" || !firebaseConfig.projectId) {
        console.warn("⚠️ FIREBASE CONFIG MISSING: Initializing in MOCK/OFFLINE MODE.");
        throw new Error("Missing Firebase Keys");
    }

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
} catch (error) {
    // MOCK OBJECTS to satisfy imports without crashing the app
    // This allows the frontend to run using LocalStorage logic (AuthService)
    app = { name: '[MOCK_APP]' };
    db = { type: 'firestore-mock' };
    storage = { type: 'storage-mock' };
    auth = { type: 'auth-mock' };
}

export { db, storage, auth };
export default app;
