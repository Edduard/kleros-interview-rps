// Import the functions you need from the SDKs you need
import {initializeApp, getApps} from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.REACT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log("firebase_app", firebase_app);

export default firebase_app;
