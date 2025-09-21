
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore }from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-9085381587-ec905",
  "appId": "1:22587601604:web:5b7b182b2e3afd67be4f91",
  "apiKey": "AIzaSyA52WkINXHmYaren-_F3ufmxeCK6FnRFgw",
  "authDomain": "studio-9085381587-ec905.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "22587601604"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
