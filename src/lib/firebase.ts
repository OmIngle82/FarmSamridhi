
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore }from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: In a real production app, use environment variables for this sensitive data.
const firebaseConfig = {
  apiKey: "AIzaSyA52WkINXHmYaren-_F3ufmxeCK6FnRFgw",
  authDomain: "studio-9085381587-ec905.firebaseapp.com",
  projectId: "studio-9085381587-ec905",
  storageBucket: "studio-9085381587-ec905.appspot.com",
  messagingSenderId: "22587601604",
  appId: "1:22587601604:web:5b7b182b2e3afd67be4f91"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
